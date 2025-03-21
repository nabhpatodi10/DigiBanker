from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from typing import Optional
import shutil
import os

from database import Database
from chain import Chain

# Initialize FastAPI app
app = FastAPI()

IMAGE_DIR = "Images"
UPLOAD_DIR = "Uploads"
os.makedirs(IMAGE_DIR, exist_ok=True)
os.makedirs(UPLOAD_DIR, exist_ok=True)

IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg"}
VIDEO_EXTENSIONS = {".mp4", ".avi", ".mov"}

@app.post("/signup")
async def signup(email: str, password: str):
    db = Database("signup")
    result, user_id = db.add_user_information(email, password)
    if not result:
        return {"message": user_id}
    db.close_connection()
    return {"message": "User signed up successfully", "data": user_id}

@app.post("/login")
async def login(email: str, password: str):
    db = Database("login")
    result, user_id = db.authenticate_user(email, password)
    if not result:
        return {"message": user_id}
    db.close_connection()
    return {"message": "User logged in successfully", "data": user_id}

@app.post("/kyc/selfie")
async def kyc_selfie(
    user_id: str,
    selfie: UploadFile = File(None)
):
    if not selfie:
        raise HTTPException(status_code=400, detail="No image provided")
    ext = os.path.splitext(selfie.filename)[1].lower()
    if ext not in IMAGE_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Invalid image format. Only PNG, JPG, and JPEG are allowed.")
    
    image_path = f"{IMAGE_DIR}/{selfie.filename}"
    with open(image_path, "wb") as buffer:
        shutil.copyfileobj(selfie.file, buffer)
    
    db = Database("kyc_selfie")
    __result = db.update_user_information(user_id, {"image_path" : image_path})
    db.close_connection()

    if not __result:
        return {"message" : "Error updating user information"}

    return {"message": "Selfie uploaded successfully"}

@app.post("/kyc/documents")
async def kyc_documents(
    user_id: str,
    phone_number: str,
    aadhaar_front: UploadFile = File(None),
    aadhaar_back: UploadFile = File(None),
    pan: UploadFile = File(None)
):
    if not aadhaar_front or not aadhaar_back or not pan:
        raise HTTPException(status_code=400, detail="Please provide all the documents")
    aadhaar_front_path = None
    aadhaar_back_path = None
    pan_path = None

    for doc_type, doc_file in {"aadhaar_front": aadhaar_front, "aadhaar_back": aadhaar_back, "pan": pan}.items():
        if doc_file:
            ext = os.path.splitext(doc_file.filename)[1].lower()
            if ext not in IMAGE_EXTENSIONS:
                raise HTTPException(status_code=400, detail=f"Invalid image format for {doc_file.filename}. Only PNG, JPG, and JPEG are allowed.")
            
            doc_path = f"{IMAGE_DIR}/{doc_file.filename}"
            with open(doc_path, "wb") as buffer:
                shutil.copyfileobj(doc_file.file, buffer)
            
            if doc_type == "aadhaar_front":
                aadhaar_front_path = doc_path
            elif doc_type == "aadhaar_back":
                aadhaar_back_path = doc_path
            elif doc_type == "pan":
                pan_path = doc_path
    
    db = Database("kyc_documents")
    chain_instance = Chain()
    __result = chain_instance.kyc_chain(aadhaar_front_path, aadhaar_back_path, pan_path, phone_number, db, user_id)
    db.close_connection()
    if __result:
        return {"message": "Documents uploaded successfully"}
    else:
        return {"message": "Invalid documents"}

@app.post("/chat")
async def chat(
    session_id: str,
    user_id: str,
    text: Optional[str] = None,
    images: list[UploadFile] = File([]),
    video: Optional[UploadFile] = File(None)
):
    response_data = {
        "session_id": session_id,
        "user_id": user_id,
    }

    video_path = None
    attachments = []
    approved = True
    reference_img = None
    db = Database(session_id)
    __user_information = db.get_user_information(email=None, user_id=user_id)


    # Validate and Save Image
    for image in images:
        ext = os.path.splitext(image.filename)[1].lower()
        if ext not in IMAGE_EXTENSIONS:
            raise HTTPException(status_code=400, detail=f"Invalid image format for {image.filename}. Only PNG, JPG, and JPEG are allowed.")
        
        image_path = f"{UPLOAD_DIR}/{image.filename}"
        with open(image_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        attachments.append(image_path)

    # Validate and Save Video
    if video:
        ext = os.path.splitext(video.filename)[1].lower()
        if ext not in VIDEO_EXTENSIONS:
            raise HTTPException(status_code=400, detail="Invalid video format. Only MP4, AVI, and MOV allowed.")
        
        video_path = f"{UPLOAD_DIR}/{video.filename}"
        with open(video_path, "wb") as buffer:
            shutil.copyfileobj(video.file, buffer)
        reference_img = __user_information["image_path"]

    chain_instance = Chain()
    chain_output = chain_instance.chains(attachments, video_path, reference_img)

    if isinstance(chain_output, tuple):
        approved, attachments = chain_output
        response_data["approved"] = approved
    elif isinstance(chain_output, list):
        attachments = chain_output

    if approved:
        __information = None
        previous_messages = db.get_messages()
        if len(previous_messages) == 0:
            __information = "User Information according to the ID's of the user\n"
            for key, value in __user_information.items():
                __information += f"{key}: {value}\n"
            if not db.add_loan_application(user_id):
                return {"message": "Error adding loan application"}
        attachment_text = "\n-------------\n".join(attachments)
        attachment_text = "Data from Attachments provided by the User:\n\n" + attachment_text if attachment_text else "No Data From Attachments, No Attachments found!\n-------------\n"
        text = text if text else ""
        if __information:
            text = __information + "\n\n" + text
        text += "\n\n" + attachment_text
        agent_response = chain_instance.agent(previous_messages, text, db)
        response_data["agent_response"] = agent_response
        db.close_connection()
    
    else:
        response_data["agent_response"] = "Face Not Matched!"
    

    return {"message": "Chat data received", "data": response_data}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", reload=True)
