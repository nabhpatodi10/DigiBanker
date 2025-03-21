from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, Form
from typing import Optional
import shutil
import os
from fastapi.middleware.cors import CORSMiddleware
from database import Database
from chain import Chain
from pydantic import BaseModel

# Initialize FastAPI app
app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:8080",
    "http://localhost:3000",
    "http://localhost:3001",
    # Add other origins as needed
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allows specified origins
    allow_credentials=True,
    allow_methods=["*"],    # Allows all methods
    allow_headers=["*"],    # Allows all headers
)

IMAGE_DIR = "Images"
UPLOAD_DIR = "Uploads"
os.makedirs(IMAGE_DIR, exist_ok=True)
os.makedirs(UPLOAD_DIR, exist_ok=True)

IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg"}
VIDEO_EXTENSIONS = {".mp4", ".avi", ".mov"}

class SignupRequest(BaseModel):
    email: str
    password: str

@app.post("/signup")
async def signup(request: SignupRequest):
    db = Database("signup")
    result, user_id = db.add_user_information(request.email, request.password)
    if not result:
        return {"message": user_id}
    db.close_connection()
    return {"message": "User signed up successfully", "data": user_id}

class LoginRequest(BaseModel):
    email: str
    password: str

@app.post("/login")
async def login(request: LoginRequest):
    db = Database("login")
    result, user_id = db.authenticate_user(request.email, request.password)
    if not result:
        return {"message": user_id}
    db.close_connection()
    return {"message": "User logged in successfully", "data": user_id}


@app.post("/kyc/selfie")
async def kyc_selfie(
    user_id: str = Form(...),  # Ensure user_id is a form field
    selfie: UploadFile = File(...)  # Ensure selfie is a file upload
):
    if not selfie:
        raise HTTPException(status_code=400, detail="No image provided")
    
    # Validate file extension
    ext = os.path.splitext(selfie.filename)[1].lower()
    if ext not in {".png", ".jpg", ".jpeg"}:
        raise HTTPException(status_code=400, detail="Invalid image format. Only PNG, JPG, and JPEG are allowed.")
    
    # Save the file
    image_path = f"{IMAGE_DIR}/{selfie.filename}"
    with open(image_path, "wb") as buffer:
        shutil.copyfileobj(selfie.file, buffer)
    
    # Update user information in the database
    db = Database("kyc_selfie")
    __result = db.update_user_information(user_id, {"image_path": image_path})
    db.close_connection()

    if not __result:
        return {"message": "Error updating user information"}
    
    return {"message": "Selfie uploaded successfully"}

@app.post("/kyc/documents")
async def kyc_documents(
    user_id: str = Form(...),  # Ensure user_id is a form field
    phone_number: str = Form(...),  # Ensure phone_number is a form field
    aadhaar_front: UploadFile = File(...),  # Ensure aadhaar_front is a file upload
    aadhaar_back: UploadFile = File(...),  # Ensure aadhaar_back is a file upload
    pan: UploadFile = File(...)  # Ensure pan is a file upload
):
    if not aadhaar_front or not aadhaar_back or not pan:
        raise HTTPException(status_code=400, detail="Please provide all the documents")
    
    # Process and save files
    aadhaar_front_path = f"{IMAGE_DIR}/{aadhaar_front.filename}"
    aadhaar_back_path = f"{IMAGE_DIR}/{aadhaar_back.filename}"
    pan_path = f"{IMAGE_DIR}/{pan.filename}"

    with open(aadhaar_front_path, "wb") as buffer:
        shutil.copyfileobj(aadhaar_front.file, buffer)
    with open(aadhaar_back_path, "wb") as buffer:
        shutil.copyfileobj(aadhaar_back.file, buffer)
    with open(pan_path, "wb") as buffer:
        shutil.copyfileobj(pan.file, buffer)
    
    # Process documents using the Chain class
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
    uvicorn.run("api:app", host="127.0.0.1", port=5000, reload=True)