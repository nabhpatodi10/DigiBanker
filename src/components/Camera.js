import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import "./camera.css";

const Camera = () => {
  const webcamRef = useRef(null);
  const [image, setImage] = useState(null);
  const [isCapturing, setIsCapturing] = useState(true);

  const capturePhoto = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImage(imageSrc);
    setIsCapturing(false);
  };

  const retakePhoto = () => {
    setImage(null);
    setIsCapturing(true);
  };

  const uploadPhoto = async () => {
    if (!image) {
      alert("Please capture an image first.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("image", dataURItoBlob(image));
      
      const response = await axios.post("http://127.0.0.1:5000/upload-selfie", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      alert(response.data.message);
      window.location.href = "/ocr"; // Move to OCR upload page
    } catch (err) {
      alert("Error uploading image.");
    }
  };

  const dataURItoBlob = (dataURI) => {
    const byteString = atob(dataURI.split(",")[1]);
    const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    
    return new Blob([ab], { type: mimeString });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
    <div className="max-w-md w-full bg-white shadow-lg rounded-xl p-8 space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Capture Your Selfie</h1>
        <p className="mt-2 text-sm text-gray-600">Position your face within the frame</p>
      </div>

      <div className="overflow-hidden rounded-lg border-2 border-gray-200">
        {isCapturing ? (
          <div className="relative">
            <Webcam 
              ref={webcamRef} 
              screenshotFormat="image/jpeg"
              className="w-full h-auto"
              mirrored={true}
            />
            {/* Optional: Add a face outline guide */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 rounded-full border-2 border-dashed border-gray-400 opacity-50"></div>
            </div>
          </div>
        ) : (
          <div className="aspect-w-4 aspect-h-3">
            <img 
              src={image} 
              alt="Captured selfie" 
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      <div className="flex justify-center space-x-4">
        {isCapturing ? (
          <button 
            onClick={capturePhoto}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Capture
          </button>
        ) : (
          <>
            <button 
              onClick={retakePhoto}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Retake
            </button>
            <button 
              onClick={uploadPhoto}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
              </svg>
              Upload
            </button>
          </>
        )}
      </div>

      <div className="text-center text-sm text-gray-500 mt-4">
        <p>After capturing a clear selfie, click Upload to continue to the next step.</p>
      </div>
    </div>
  </div>
  );
};

export default Camera;