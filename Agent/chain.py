from langchain.schema.runnable import RunnableParallel, RunnableLambda
from langchain.schema.messages import AnyMessage, HumanMessage, SystemMessage

from face_identification import FaceIdentification
from attachment_preprocessing import AttachmentPreprocessing
from tools import Tools
from agent import Agent
from database import Database

class Chain:

    def __init__(self):
        self.__attachment_preprocessing = AttachmentPreprocessing()

    def kyc_chain(self, aadhaar_front: str, aadhaar_back: str, pan: str, phone_number: str, database: Database, user_id: str) -> bool:
        __result = self.__attachment_preprocessing.generate_documents(aadhaar_front, aadhaar_back, pan)
        if __result["name"] == "None" and __result["gender"] == "None" and __result["date_of_birth"] == "None" and __result["address"] == "None" and __result["aadhaar_number"] == "None" and __result["pan_number"] == "None":
            raise Exception("Invalid documents")
        __result["kyc_status"] = "Approved"
        __result["phone_number"] = phone_number
        return database.update_user_information(user_id, __result)

    def chains(self, attachments: list[str] | None, video_path: str | None, reference_img_path: str | None) -> tuple[bool, list[str]] | list[str] | None:
        __chains = []
        __video_input = {}
        __attachment_input = {}
        __inputs = {}
        if video_path and video_path != "":
            self.__face_identification = FaceIdentification(reference_img_path)
            __chains.append(RunnableLambda(lambda input: self.__face_identification.predict(input["chain0"])))
            __chains.append(RunnableLambda(lambda input: self.__attachment_preprocessing.generate(input["chain1"])))
            __video_input = {"chain0" : video_path, "chain1" : video_path}
            __inputs.update(__video_input)
        if attachments and len(attachments) > 0:
            for i in range(len(attachments)):
                __chains.append(RunnableLambda(lambda input: self.__attachment_preprocessing.generate(input[f"chain{len(__chains)}"])))
                __attachment_input = {f"chain{len(__chains)}" : attachments[i]}
            __inputs.update(__attachment_input)
        if len(__chains) > 0:
            __final_chain = RunnableParallel({f"chain{i}": chain for i, chain in enumerate(__chains)})

            __outputs = __final_chain.invoke(__inputs)

            if video_path and video_path != "" and attachments and len(attachments) > 0:
                return __outputs["chain0"], [__outputs[f"chain{i+1}"] for i in range(len(attachments))]
            elif video_path and video_path != "" and (not attachments or len(attachments) == 0):
                return __outputs["chain0"], [__outputs["chain1"]]
            elif (not video_path or video_path == "") and attachments and len(attachments) > 0:
                return [__outputs[f"chain{i}"] for i in range(len(attachments))]
            else:
                return None
    
    def agent(self, previous_messages: list[AnyMessage], text: str, database: Database) -> str:
        __system_message = [
            SystemMessage(
                content="""You are an AI Bank Manager for the Standard Chartered Bank by Standard Chartered's Global Business Services (GBS), a multinational organization providing \
                operational and technological support to Standard Chartered Bank, with hubs in China, India, Malaysia, and Poland. Your job is to assist customers with their banking \
                needs, especially loan approvals. You have to take all the necessary details from the customer and all the proofs or documents supporting those details. If you think \
                that the proof or document is not valid or is insufficient, you can ask the customer for alternative proofs or documents. Take all the information from the customer \
                sequentially, do not ask for all the information at once. If you think that the customer is not providing the correct information, you can ask the customer to provide \
                the correct information or proof of the information. You have to assist the customer in the best possible way and you always have to be polite and professional. \
                
                You have access to the following tool:
                
                loan_approval: This tool will take the details of the customer and predict whether the loan should be approved or not. The tool will return boolean value True if the \
                loan should be approved and False otherwise. The tool takes the following fields as input:
                
                - age: int = Field(description="Age of the person")
                - gender: Literal["Male", "Female"] = Field(description="Gender of the person, which can either be male or female")
                - highest_education: Literal["High School", "Associate", "Bachelors", "Masters", "Doctorate"] = Field(description="Highest education of the person")
                - income: float = Field(description="Annual Income of the person")
                - exployment_years: int = Field(description="Number of years the person has been employed")
                - home_owner: Literal["Own", "Mortgage", "Rent", "Other"] = Field(description="Whether the person owns a home or not or he or she has rented the house, mortgaged or something else")
                - loan_amount: float = Field(description="Amount of loan the person is applying for")
                - loan_purpose: Literal["Education", "Venture", "Personal", "Debt Consolidation", "Home Improvement", "Medical"] = Field(description="Purpose of the loan")
                - interest_rate: float = Field(description="Interest rate of the loan")
                - credit_history_years: float = Field(description="Number of years the person has had a credit history")
                - credit_score: int = Field(description="Credit score of the person")
                - loan_defaults: Literal["Yes", "No"] = Field(description="Whether the person has defaulted on a loan in the past or not")
                
                You have to use this tool only when you have all the information from the customer, remember to give the tool all these values as a single pydantic BaseModel, else you \
                will not be able to call the tool.
                
                The rate of interest for the loan, the amount of the loan and the time duration of the loan can be negotiated with the customer. You have to provide the best possible \
                rate of interest, the best possible amount of the loan and the best possible time duration of the loan ensuring that the customer should be happy but at the same time \
                the bank should also be in profit.
                
                You can either ask the customer for the details and to upload related documents for those details or if you have all the details of the customer and you have used the \
                tool and have decided whether the loan should be approved or not, you can let the customer know about the decision. If you have decided to approve the loan, you can \
                share the details of the loan with the customer. If you have decided not to approve the loan, you can let the customer know about the decision and the reason for the \
                rejection of the loan."""
            )
        ]
        self.__tools = Tools(database)
        self.__agent = Agent(self.__tools.return_tools(), __system_message, database)
        __messages = previous_messages + [HumanMessage(content=text)]
        database.add_human_message(text)
        __output = self.__agent.graph.invoke({"messages" : __messages})
        return __output["messages"][-1].content