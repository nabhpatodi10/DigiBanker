from dotenv import load_dotenv
load_dotenv()

import os
import uuid
from cryptography.fernet import Fernet
from pymongo import MongoClient
from langchain_mongodb import MongoDBChatMessageHistory
from langchain.schema.messages import AIMessage, HumanMessage, BaseMessage

class Database:

    def __init__(self, session_id: str):
        self.__session_id = session_id
        self.__chat_history = MongoDBChatMessageHistory(connection_string=os.getenv("MONGODB_URI"), database_name="DigiBanker", collection_name="Chats", session_id=self.__session_id)
        self.__client = MongoClient(os.getenv("MONGODB_URI"))
        self.__user_information = self.__client["DigiBanker"]["User_Information"]
        self.__loan_application = self.__client["DigiBanker"]["Loan_Applications"]
        
    def add_human_message(self, message: str | HumanMessage) -> None:
        try:
            self.__chat_history.add_user_message(message)
        except Exception as error:
            raise error
        
    def add_ai_message(self, message: str | AIMessage) -> None:
        try:
            self.__chat_history.add_ai_message(message)
        except Exception as error:
            raise error
        
    def add_message(self, message: BaseMessage) -> None:
        try:
            self.__chat_history.add_message(message)
        except Exception as error:
            raise error
        
    def get_messages(self) -> list:
        try:
            return self.__chat_history.messages
        except Exception as error:
            raise error
        
    def clear_chat(self) -> None:
        try:
            self.__chat_history.clear()
        except Exception as error:
            raise error
        
    def add_user_information(self, email: str, password: str) -> tuple[bool, str]:
        try:
            with open("key.key", "rb") as __file:
                __key = __file.read()
            __file.close()
            __fernet = Fernet(__key)
            if self.__user_information.find_one({"email": email}):
                return False, "User already exists"
            __user_id = str(uuid.uuid4())
            __result = self.__user_information.insert_one(
                {
                    "user_id": __user_id,
                    "name": "",
                    "email": email,
                    "password": __fernet.encrypt(password.encode()),
                    "gender": "",
                    "phone_number": "",
                    "date_of_birth": "",
                    "address": "",
                    "aadhaar_number": "",
                    "pan_number": "",
                    "image_path": "",
                    "kyc_status": "Pending"
                }
            )
            return __result.acknowledged, __user_id
        except Exception as error:
            raise error
        
    def get_user_information(self, email: str | None = None, user_id: str | None = None) -> dict:
        try:
            with open("key.key", "rb") as __file:
                __key = __file.read()
            __file.close()
            __fernet = Fernet(__key)
            if email:
                __result = self.__user_information.find_one({"email": __fernet.encrypt(email.encode())})
            else:
                __result = self.__user_information.find_one({"user_id": user_id})
            if not __result:
                return {"error" : "User not found"}
            return {
                "user_id": __result["user_id"],
                "name": __result["name"],
                "email": __result["email"],
                "password": __fernet.decrypt(__result["password"]).decode(),
                "gender": __result["gender"],
                "phone_number": __fernet.decrypt(__result["phone_number"]).decode(),
                "date_of_birth": __fernet.decrypt(__result["date_of_birth"]).decode(),
                "address": __fernet.decrypt(__result["address"]).decode(),
                "aadhaar_number": __fernet.decrypt(__result["aadhaar_number"]).decode(),
                "pan_number": __fernet.decrypt(__result["pan_number"]).decode(),
                "image_path": __result["image_path"],
                "kyc_status": __result["kyc_status"]
            }
        except Exception as error:
            raise error
        
    def update_user_information(self, user_id: str, data: dict[str, any]) -> bool:
        try:
            __fetch = self.__user_information.find_one({"user_id": user_id})
            if not __fetch or __fetch is None or __fetch == None:
                return False
            with open("key.key", "rb") as __file:
                __key = __file.read()
            __file.close()
            for key, value in data.items():
                if key in ["phone_number", "date_of_birth", "address", "aadhaar_number", "pan_number"]:
                    __fernet = Fernet(__key)
                    data[key] = __fernet.encrypt(value.encode())
            __result = self.__user_information.update_one({"user_id": user_id}, {"$set": data})
            return __result.acknowledged
        except Exception as error:
            raise error
        
    def authenticate_user(self, email: str, password: str) -> tuple[bool, str | None]:
        try:
            with open("key.key", "rb") as __file:
                __key = __file.read()
            __file.close()
            __fernet = Fernet(__key)
            __result = self.__user_information.find_one({"email": email})
            if not __result:
                return False, "User not found"
            if __fernet.decrypt(__result["password"]).decode() != password:
                return False, "Incorrect Password"
            return True, __result["user_id"] if __result else None
        except Exception as error:
            raise error
        
    def add_loan_application(self, user_id: str) -> bool:
        try:
            if self.__loan_application.find_one({"session_id": self.__session_id}):
                return False
            __result = self.__loan_application.insert_one(
                {
                    "user_id": user_id,
                    "session_id": self.__session_id,
                    "person_education" : "",
                    "person_income" : "",
                    "person_emp_exp" : "",
                    "person_home_ownership" : "",
                    "loan_amnt" : "",
                    "loan_intent" : "",
                    "loan_int_rate" : "",
                    "cb_person_cred_hist_length" : "",
                    "credit_score" : "",
                    "previous_loan_defaults_on_file" : "",
                    "loan_status": "Pending"
                }
            )
            return __result.acknowledged
        except Exception as error:
            raise error
        
    def get_loan_application(self) -> dict:
        try:
            __result = self.__loan_application.find_one({"session_id": self.__session_id})
            if not __result:
                return {"error" : "Loan application not found"}
            return {
                "user_id": __result["user_id"],
                "session_id": __result["session_id"],
                "person_education" : __result["person_education"],
                "person_income" : __result["person_income"],
                "person_emp_exp" : __result["person_emp_exp"],
                "person_home_ownership" : __result["person_home_ownership"],
                "loan_amnt" : __result["loan_amnt"],
                "loan_intent" : __result["loan_intent"],
                "loan_int_rate" : __result["loan_int_rate"],
                "cb_person_cred_hist_length" : __result["cb_person_cred_hist_length"],
                "credit_score" : __result["credit_score"],
                "previous_loan_defaults_on_file" : __result["previous_loan_defaults_on_file"],
                "loan_status": __result["loan_status"]
            }
        except Exception as error:
            raise error
        
    def update_loan_application(self, data: dict[str, any]) -> bool:
        try:
            __result = self.__loan_application.update_one({"session_id": self.__session_id}, {"$set": data})
            return __result.acknowledged
        except Exception as error:
            raise error
        
    def close_connection(self) -> None:
        self.__client.close()
        del self.__client
        del self.__chat_history