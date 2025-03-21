import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import "./camera.css";

const Camera = () => {
  const webcamRef = useRef(null);
  const [image, setImage] = useState(null);
  const [isCapturing, setIsCapturing] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // Check system preference for dark mode on component mount
  useEffect(() => {
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDarkMode);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

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
      const blob = dataURItoBlob(image);
      formData.append("selfie", blob, "selfie.jpg"); // Match the backend's expected field name
      formData.append("user_id", "123"); // Replace "123" with the actual user ID
  
      console.log("FormData:", formData); // Debugging log
  
      const response = await axios.post("http://127.0.0.1:5000/kyc/selfie", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      console.log("API Response:", response.data); // Debugging log
      alert(response.data.message);
      window.location.href = "/ocr"; // Redirect to OCR upload page
    } catch (err) {
      console.error("Error uploading image:", err); // Debugging log
      alert("Error uploading image. Please try again.");
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

  // Dynamic classes based on dark mode state
  const containerClass = darkMode 
    ? "min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center" 
    : "min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center";
  
  const cardClass = darkMode 
    ? "max-w-md w-full bg-gray-800 shadow-lg rounded-xl p-8 space-y-8" 
    : "max-w-md w-full bg-white shadow-lg rounded-xl p-8 space-y-8";
  
  const headingClass = darkMode 
    ? "text-2xl font-bold text-white" 
    : "text-2xl font-bold text-gray-900";
  
  const descriptionClass = darkMode 
    ? "mt-2 text-sm text-gray-300" 
    : "mt-2 text-sm text-gray-600";
  
  const borderClass = darkMode 
    ? "overflow-hidden rounded-lg border-2 border-gray-700" 
    : "overflow-hidden rounded-lg border-2 border-gray-200";
  
  const outlineClass = darkMode 
    ? "w-48 h-48 rounded-full border-2 border-dashed border-gray-500 opacity-50" 
    : "w-48 h-48 rounded-full border-2 border-dashed border-gray-400 opacity-50";
  
  const primaryButtonClass = darkMode 
    ? "inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500" 
    : "inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500";
  
  const secondaryButtonClass = darkMode 
    ? "inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-gray-500" 
    : "inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500";
  
  const footerTextClass = darkMode 
    ? "text-center text-sm text-gray-400 mt-4" 
    : "text-center text-sm text-gray-500 mt-4";

  return (
    <div className={containerClass}>
      <div className={cardClass}>
        <div className="flex justify-between items-center">
          <div className="text-center flex-1">
            <h1 className={headingClass}>Capture Your Selfie</h1>
            <p className={descriptionClass}>Position your face within the frame</p>
          </div>
          <button 
            onClick={toggleDarkMode} 
            className="p-2 rounded-full focus:outline-none"
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? (
              <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
        </div>

        <div className={borderClass}>
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
                <div className={outlineClass}></div>
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
              className={primaryButtonClass}
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
                className={secondaryButtonClass}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Retake
              </button>
              <button
                onClick={uploadPhoto}
                className={primaryButtonClass}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                </svg>
                Upload
              </button>
            </>
          )}
        </div>

        <div className={footerTextClass}>
          <p>After capturing a clear selfie, click Upload to continue to the next step.</p>
        </div>
      </div>
    </div>
  );
};

export default Camera;