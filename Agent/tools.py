import joblib
import pandas as pd
from typing import Literal
from pydantic import BaseModel, Field
from langchain_core.tools import tool, BaseTool

from database import Database

class LoanSchema(BaseModel):
    age: int = Field(description="Age of the person")
    gender: Literal["Male", "Female"] = Field(description="Gender of the person, which can either be male or female")
    highest_education: Literal["High School", "Associate", "Bachelors", "Masters", "Doctorate"] = Field(description="Highest education of the person")
    income: float = Field(description="Annual Income of the person")
    exployment_years: int = Field(description="Number of years the person has been employed")
    home_owner: Literal["Own", "Mortgage", "Rent", "Other"] = Field(description="Whether the person owns a home or not or he or she has rented the house, mortgaged or something else")
    loan_amount: float = Field(description="Amount of loan the person is applying for")
    loan_purpose: Literal["Education", "Venture", "Personal", "Debt Consolidation", "Home Improvement", "Medical"] = Field(description="Purpose of the loan")
    interest_rate: float = Field(description="Interest rate of the loan")
    credit_history_years: float = Field(description="Number of years the person has had a credit history")
    credit_score: int = Field(description="Credit score of the person")
    loan_defaults: Literal["Yes", "No"] = Field(description="Whether the person has defaulted on a loan in the past or not")

    @property
    def df_format(self):
        __gender_list = ["Female", "Male"]
        __education_list = ["Associate", "Bachelors", "Doctorate", "High School", "Masters"]
        __ownership_list = ["Mortgage", "Other", "Own", "Rent"]
        __purpose_list = ["Debt Consolidation", "Education", "Home Improvement", "Medical", "Personal", "Venture"]
        __defaults_list = ["No", "Yes"]
        return pd.DataFrame({
            "person_age" : self.age,
            "person_gender" : __gender_list.index(self.gender),
            "person_education" : __education_list.index(self.highest_education),
            "person_income" : self.income,
            "person_emp_exp" : self.exployment_years,
            "person_home_ownership" : __ownership_list.index(self.home_owner),
            "loan_amnt" : self.loan_amount,
            "loan_intent" : __purpose_list.index(self.loan_purpose),
            "loan_int_rate" : self.interest_rate,
            "loan_percent_income" : self.loan_amount / self.income if self.income != 0 else 0,
            "cb_person_cred_hist_length" : self.credit_history_years,
            "credit_score" : self.credit_score,
            "previous_loan_defaults_on_file" : __defaults_list.index(self.loan_defaults)
        }, index=[0])
    
    @property
    def dict_format(self):
        __education_list = ["Associate", "Bachelors", "Doctorate", "High School", "Masters"]
        __ownership_list = ["Mortgage", "Other", "Own", "Rent"]
        __purpose_list = ["Debt Consolidation", "Education", "Home Improvement", "Medical", "Personal", "Venture"]
        __defaults_list = ["No", "Yes"]
        return {
            "person_education" : __education_list.index(self.highest_education),
            "person_income" : self.income,
            "person_emp_exp" : self.exployment_years,
            "person_home_ownership" : __ownership_list.index(self.home_owner),
            "loan_amnt" : self.loan_amount,
            "loan_intent" : __purpose_list.index(self.loan_purpose),
            "loan_int_rate" : self.interest_rate,
            "cb_person_cred_hist_length" : self.credit_history_years,
            "credit_score" : self.credit_score,
            "previous_loan_defaults_on_file" : __defaults_list.index(self.loan_defaults)
        }

class Tools:

    def __init__(self, database: Database):
        self.__database = database
        self.__xgb = joblib.load('Models/XGBoost.pkl')
        self.__lr = joblib.load('Models/Logistic Regression.pkl')
        self.__rf = joblib.load('Models/Random Forest.pkl')
        self.__svc = joblib.load('Models/SVC.pkl')

    def loan_approval(self, data: LoanSchema) -> bool:
        """Tool to predict whether the loan should be approved or not."""
        __result = bool(sum([
            self.__xgb.predict(data.df_format)[0],
            self.__lr.predict(data.df_format)[0],
            self.__rf.predict(data.df_format)[0],
            self.__svc.predict(data.df_format)[0]
        ]) >= 3)
        __update = data.dict_format
        __update["loan_status"] = "Approved" if __result else "Rejected"
        __update = self.__database.update_loan_application(__update)
        if not __update:
            return False
        return __result        
    
    def return_tools(self) -> list[BaseTool]:
        return [tool(self.loan_approval)]