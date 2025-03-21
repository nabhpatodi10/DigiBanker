from dotenv import load_dotenv
load_dotenv()

import os
import json
import time
from google import genai
from google.genai import types

class AttachmentPreprocessing:

    def __init__(self):
        self.__client = genai.Client(
            api_key=os.getenv("GOOGLE_API_KEY"),
        )

    def generate(self, file_path: str) -> str | None:

        __prompt = """If you get an audio or video, transcribe the entire audio line by line in the language the person is speaking in. If there are multiple languages, transcribe \
            each line. Correct the spellings and grammar as needed Only give the transcribed content, nothing else.
            
            If you get an image, give all the details which can be seen in the image point wise."""
        
        __file = self.__client.files.upload(file=file_path)
        while __file.state.name == "PROCESSING":
            time.sleep(1)
            __file = self.__client.files.get(name=__file.name)

        __generate_content_config = types.GenerateContentConfig(
            temperature=0.5,
            top_p=0.95,
            top_k=40,
            max_output_tokens=8192,
            response_mime_type="text/plain",
            system_instruction=__prompt
        )

        __result = self.__client.models.generate_content(
            model="gemini-2.0-flash",
            contents=[__file],
            config=__generate_content_config
        )

        self.__client.files.delete(name=__file.name)

        return __result.text
    
    def generate_documents(self, aadhaar_front: str, aadhaar_back: str, pan: str) -> dict:

        __prompt = """You will get three images, Aadhaar Card Front, Aadhaar Card Back, and PAN Card. You have to verify if they belong to the same person. If they belong to the same \
            person, extract the following details from the cards:
            
            1. Name (str) - name of the person
            2. Gender (Literal['Male', 'Female']) - gender of the person
            3. Date of Birth (date, format = '%Y-%m-%d') - date of birth of the person
            4. Address (str) - address of the person
            5. Aadhaar Number (str) - Aadhaar number of the person
            6. PAN Number (str) - PAN number of the person
            
            If the cards do not belong to the same person, return 'None' for all the values.
            If the images are not clear or the details are not visible, return 'None' for all the values.
            If the images are not of the Aadhaar Card Front, Aadhaar Card Back, and PAN Card, return 'None' for all the values."""
        
        __aadhaar_front = self.__client.files.upload(file=aadhaar_front)
        while __aadhaar_front.state.name == "PROCESSING":
            time.sleep(1)
            __aadhaar_front = self.__client.files.get(name=__aadhaar_front.name)

        __aadhaar_back = self.__client.files.upload(file=aadhaar_back)
        while __aadhaar_back.state.name == "PROCESSING":
            time.sleep(1)
            __aadhaar_back = self.__client.files.get(name=__aadhaar_back.name)

        __pan = self.__client.files.upload(file=pan)
        while __pan.state.name == "PROCESSING":
            time.sleep(1)
            __pan = self.__client.files.get(name=__pan.name)

        __generate_content_config = types.GenerateContentConfig(
            temperature=0.5,
            top_p=0.95,
            top_k=40,
            max_output_tokens=8192,
            response_mime_type="application/json",
            response_schema=types.Schema(
                type = types.Type.OBJECT,
                required = ["name", "gender", "date_of_birth", "address", "aadhaar_number", "pan_number"],
                properties = {
                    "name": types.Schema(
                        type = types.Type.STRING,
                    ),
                    "gender": types.Schema(
                        type = types.Type.STRING,
                    ),
                    "date_of_birth": types.Schema(
                        type = types.Type.STRING,
                    ),
                    "address": types.Schema(
                        type = types.Type.STRING,
                    ),
                    "aadhaar_number": types.Schema(
                        type = types.Type.STRING,
                    ),
                    "pan_number": types.Schema(
                        type = types.Type.STRING,
                    ),
                },
            ),
            system_instruction=__prompt
        )

        __result = self.__client.models.generate_content(
            model="gemini-2.0-flash",
            contents=[__aadhaar_front, __aadhaar_back, __pan],
            config=__generate_content_config
        )

        self.__client.files.delete(name=__aadhaar_front.name)
        self.__client.files.delete(name=__aadhaar_back.name)
        self.__client.files.delete(name=__pan.name)

        return json.loads(__result.text)
    
# result = AttachmentPreprocessing().generate_documents("Images/Agent-Architecture.png", "Images/Agent-Architecture.png", "Images/Agent-Architecture.png")
# print(result)
# result = json.loads(result)
# print(result)
# print(result["name"])
# print(type(result["name"]))