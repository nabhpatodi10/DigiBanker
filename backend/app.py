from flask import Flask, request, jsonify
from flask_cors import CORS  # Import CORS extension
import google.generativeai as genai
import pandas as pd
import json
import os

app = Flask(__name__)

CORS(app)

genai.configure(api_key="GEMINI")


STORAGE_DIR = "storage"
DATA_FILE = os.path.join(STORAGE_DIR, "users.csv")
IMAGE_DIR = os.path.join(STORAGE_DIR, "images")


def ensure_storage_setup():
    if not os.path.exists(STORAGE_DIR):
        os.makedirs(STORAGE_DIR)
    if not os.path.exists(IMAGE_DIR):
        os.makedirs(IMAGE_DIR)
    # Create empty CSV if it doesn't exist
    if not os.path.exists(DATA_FILE):
        columns = ["name", "email", "password", "gender", "phone", "dob", "aadhar_number", "address", "pan_number"]
        pd.DataFrame(columns=columns).to_csv(DATA_FILE, index=False)
        print(f"Created new CSV file at {DATA_FILE}")


ensure_storage_setup()


def load_users():
    ensure_storage_setup() 
    return pd.read_csv(DATA_FILE)

# Save user data
def save_users(data):
    ensure_storage_setup()  
    data.to_csv(DATA_FILE, index=False)

# SIGNUP
@app.route("/signup", methods=["POST", "OPTIONS"])
def signup():
    # Handle preflight requests
    if request.method == "OPTIONS":
        return jsonify({}), 200
        
    try:
        users = load_users()
        data = request.json
        
        if data is None:
            return jsonify({"error": "No JSON data provided"}), 400
            
        print("Received signup data:", data)  # Debug log
        
        required_fields = ["email", "password"]
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({"error": f"Missing required field: {field}"}), 400

        # Check if user already exists
        if not users.empty and (users["email"] == data["email"]).any():
            return jsonify({"error": "User already exists!"}), 400

        # Ensure all expected columns are present in the data
        for col in users.columns:
            if col not in data:
                data[col] = ""  # Add empty value for missing columns

        # Append new user
        new_user = pd.DataFrame([data])
        users = pd.concat([users, new_user], ignore_index=True)

        save_users(users)
        print(f"User {data['email']} added successfully")
        return jsonify({"message": "Signup successful!"}), 200
        
    except Exception as e:
        print(f"Signup error: {str(e)}")
        return jsonify({"error": f"Failed to process signup: {str(e)}"}), 500

# LOGIN
@app.route("/login", methods=["POST", "OPTIONS"])
def login():
    # Handle preflight requests
    if request.method == "OPTIONS":
        return jsonify({}), 200
        
    try:
        users = load_users()
        data = request.json
        
        if data is None:
            return jsonify({"error": "No JSON data provided"}), 400

        print("Received login data:", data)

        # Ensure required fields
        if "email" not in data or "password" not in data:
            return jsonify({"error": "Email and password are required"}), 400

        # Ensure email exists
        user = users[(users["email"] == data["email"]) & (users["password"] == data["password"])]
        if user.empty:
            return jsonify({"error": "Invalid email or password"}), 401

        # Convert to dict and return user info
        user_dict = user.iloc[0].to_dict()
        # Remove password from response for security
        if "password" in user_dict:
            user_dict["password"] = ""
            
        print("User found:", user_dict)
        return jsonify({
            "message": "Login successful!",
            "user": user_dict
        }), 200

    except Exception as e:
        print("Login Error:", str(e))
        return jsonify({"error": f"Internal Server Error: {str(e)}"}), 500

# CAMERA UPLOAD
@app.route("/upload-selfie", methods=["POST", "OPTIONS"])
def upload_selfie():
    # Handle preflight requests
    if request.method == "OPTIONS":
        return jsonify({}), 200
        
    try:
        ensure_storage_setup()  # Make sure directories exist
        
        print("Request files:", list(request.files.keys()))
        print("Request form:", list(request.form.keys()))
        
        # Check if any files were uploaded
        if not request.files:
            return jsonify({"error": "No files were uploaded"}), 400
            
        # Different frontends might use different file input names
        file_key = None
        for possible_key in ["image", "selfie", "file", "photo"]:
            if possible_key in request.files:
                file_key = possible_key
                break
                
        if not file_key:
            return jsonify({"error": "No image file found in the request"}), 400
            
        file = request.files[file_key]
        
        # Check if the file has a name
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400
            
        # Get email from form data or query parameter
        email = request.form.get("email") or request.args.get("email")
        
        if not email:
            return jsonify({"error": "Email is required"}), 400
        
        # Create unique filename using email
        filename = f"{email}_selfie.jpg"
        file_path = os.path.join(IMAGE_DIR, filename)
        
        # Ensure the directory exists
        if not os.path.exists(IMAGE_DIR):
            os.makedirs(IMAGE_DIR)
            
        # Save the file
        file.save(file_path)
        
        print(f"Selfie saved for {email} at {file_path}")
        
        return jsonify({
            "message": "Selfie uploaded successfully!",
            "file_path": filename
        }), 200
        
    except Exception as e:
        print(f"Selfie upload error: {str(e)}")
        import traceback
        traceback.print_exc()  # Print the full error traceback
        return jsonify({"error": f"Failed to upload selfie: {str(e)}"}), 500

# DOCUMENT EXTRACTION
@app.route("/extract-text", methods=["POST", "OPTIONS"])
def extract_text():
    # Handle preflight requests
    if request.method == "OPTIONS":
        return jsonify({}), 200
        
    try:
        ensure_storage_setup()  # Make sure directories exist
        
        received_files = request.files.keys()
        print("✅ Received files:", list(received_files))
        
        email = request.form.get("email")
        if not email:
            return jsonify({"error": "Email is required"}), 400

        required_files = ["aadharFront", "aadharBack", "pan"]
        missing_files = [f for f in required_files if f not in received_files]
        
        if missing_files:
            return jsonify({
                "error": f"Missing required files: {missing_files}. Got {list(received_files)}"
            }), 400

        # Process each document
        extracted_data = {}
        
        for doc_type in required_files:
            file = request.files[doc_type]
            
            # Save file for processing
            filename = f"{email}_{doc_type}.jpg"
            file_path = os.path.join(IMAGE_DIR, filename)
            file.save(file_path)
            print(f"Saved {doc_type} for {email} at {file_path}")
            
            # Process with Gemini
            file.seek(0)  # Reset file pointer
            result = process_image(file, doc_type)
            extracted_data.update(result)

        # Update user data with extracted information
        update_user_data(email, extracted_data)

        return jsonify({
            "message": "Documents processed successfully!",
            "extracted_data": extracted_data
        }), 200
        
    except Exception as e:
        print(f"Document extraction error: {str(e)}")
        return jsonify({"error": f"Failed to process documents: {str(e)}"}), 500

def process_image(file, doc_type):
    """
    Extracts relevant data based on the document type using Gemini API.
    """
    try:
        print(f"Processing {doc_type}...")
        # Use the correct model name
        model = genai.GenerativeModel("gemini-1.5-latest")
        
        # Reset file pointer and read data
        file.seek(0)
        file_data = file.read()

        # Prepare prompt based on document type
        if doc_type == "aadharFront":
            prompt = "Extract the following information from this Aadhar card front: name, date of birth (dob), and Aadhar number (identifier). Return as JSON."
        elif doc_type == "aadharBack":
            prompt = "Extract the complete address from this Aadhar card back. Return as JSON with an 'address' field."
        elif doc_type == "pan":
            prompt = "Extract the PAN number (identifier) from this PAN card. Return as JSON."
        else:
            prompt = "Extract all visible text and return as JSON."

        # Send image and prompt to Gemini
        response = model.generate_content([
            prompt,
            {
                "mime_type": file.mimetype,
                "data": file_data
            }
        ])

        # Extract text from response
        extracted_text = response.text.strip() if response else None
        print(f"{doc_type} Raw Response:", extracted_text)
        
        if not extracted_text:
            return {doc_type: "Not Found"}

        # Clean up the extracted text to ensure it's valid JSON
        # Find JSON portion (between first { and last })
        json_start = extracted_text.find('{')
        json_end = extracted_text.rfind('}') + 1
        
        if json_start >= 0 and json_end > json_start:
            json_text = extracted_text[json_start:json_end]
            try:
                json_data = json.loads(json_text)
            except json.JSONDecodeError:
                print(f"JSON decode error for {doc_type}. Raw text: {json_text}")
                return {f"{doc_type}_raw": extracted_text}
        else:
            print(f"No JSON found in {doc_type} response")
            return {f"{doc_type}_raw": extracted_text}

        # Extract relevant details
        extracted_info = {}
        if doc_type == "aadharFront":
            extracted_info["name"] = json_data.get("name", "Not Found")
            extracted_info["dob"] = json_data.get("dob", "Not Found")
            extracted_info["aadhar_number"] = json_data.get("identifier", "Not Found")
        
        elif doc_type == "aadharBack":
            extracted_info["address"] = json_data.get("address", "Not Found")

        elif doc_type == "pan":
            extracted_info["pan_number"] = json_data.get("identifier", "Not Found")

        return extracted_info

    except Exception as e:
        print(f"Error processing {doc_type}: {str(e)}")
        return {f"{doc_type}_error": str(e)}

def update_user_data(email, extracted_data):
    """
    Update user data with extracted information.
    """
    try:
        users = load_users()

        if email in users["email"].values:
            for field in ["name", "dob", "aadhar_number", "address", "pan_number"]:
                if field in extracted_data and extracted_data[field] != "Not Found":
                    users.loc[users["email"] == email, field] = extracted_data[field]
        else:
            # Create new entry if user doesn't exist
            new_row = {
                "email": email,
                "name": extracted_data.get("name", ""),
                "dob": extracted_data.get("dob", ""),
                "aadhar_number": extracted_data.get("aadhar_number", ""),
                "address": extracted_data.get("address", ""),
                "pan_number": extracted_data.get("pan_number", ""),
                "password": "",  # Empty password for now
                "gender": "",
                "phone": ""
            }
            users = pd.concat([users, pd.DataFrame([new_row])], ignore_index=True)

        save_users(users)
        print("User data updated successfully!")
        return True

    except Exception as e:
        print("Error updating user data:", str(e))
        return False

if __name__ == "__main__":
    # Make sure we have our storage set up before starting
    ensure_storage_setup()
    app.run(debug=True)