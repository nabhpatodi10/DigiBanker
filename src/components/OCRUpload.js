import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import "./ocr-upload.css";

const OCRUpload = () => {
  const webcamRef = useRef(null);
  const fileInputsRef = useRef({});
  const [currentDoc, setCurrentDoc] = useState(null);
  const [images, setImages] = useState({ aadharFront: null, aadharBack: null, pan: null });
  const [extractedData, setExtractedData] = useState({});
  const [isCapturing, setIsCapturing] = useState(false);
  const [processing, setProcessing] = useState({ aadharFront: false, aadharBack: false, pan: false });
  const [darkMode, setDarkMode] = useState(false);

  // Check system preference for dark mode on component mount
  useEffect(() => {
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDarkMode);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const startCapture = (documentType) => {
    setCurrentDoc(documentType);
    setIsCapturing(true);
  };

  const capturePhoto = () => {
    if (!webcamRef.current) return;

    const imageSrc = webcamRef.current.getScreenshot();
    setImages((prev) => ({ ...prev, [currentDoc]: imageSrc }));
    setIsCapturing(false);
  };

  const retakePhoto = () => {
    setIsCapturing(true);
  };

  const uploadPhoto = async () => {
    if (!images[currentDoc]) {
      alert(`Please capture or upload ${currentDoc} first.`);
      return;
    }

    setProcessing((prev) => ({ ...prev, [currentDoc]: true }));

    const formData = new FormData();
    formData.append("document", dataURItoBlob(images[currentDoc]));
    formData.append("type", currentDoc);

    try {
      const response = await axios.post("http://127.0.0.1:5000/extract-text", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setExtractedData((prevData) => ({ ...prevData, [currentDoc]: response.data }));
      alert(`${currentDoc} uploaded and processed!`);
      setCurrentDoc(null);
    } catch (err) {
      alert(`Error processing ${currentDoc}: ${err.message}`);
    } finally {
      setProcessing((prev) => ({ ...prev, [currentDoc]: false }));
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

  const getDocName = (docType) => {
    const names = {
      aadharFront: "Aadhar Card (Front)",
      aadharBack: "Aadhar Card (Back)",
      pan: "PAN Card",
    };
    return names[docType] || docType;
  };

  const handleFileUpload = (event, docType) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages((prev) => ({ ...prev, [docType]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Dynamic classes based on dark mode state
  const getThemeClasses = () => {
    return {
      container: darkMode 
        ? "min-h-screen bg-gray-900 text-gray-100" 
        : "min-h-screen bg-gradient-to-r from-purple-100 to-blue-100 text-gray-800",
      
      card: darkMode 
        ? "bg-gray-800 shadow-xl rounded-xl border border-gray-700" 
        : "bg-white/90 backdrop-blur-sm shadow-xl rounded-xl border border-gray-100",
      
      heading: darkMode 
        ? "text-3xl font-bold text-gray-100 text-center" 
        : "text-3xl font-bold text-gray-800 text-center",
      
      subheading: darkMode 
        ? "text-xl font-semibold text-gray-200" 
        : "text-xl font-semibold text-gray-800",
      
      description: darkMode 
        ? "text-gray-300" 
        : "text-gray-600",
      
      docCard: darkMode 
        ? "rounded-xl shadow-lg border border-gray-700 bg-gray-800 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1" 
        : "rounded-xl shadow-lg border border-gray-100 bg-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1",
      
      previewArea: darkMode 
        ? "bg-gray-700 rounded-lg overflow-hidden" 
        : "bg-gray-50 rounded-lg overflow-hidden",
      
      primaryButton: darkMode 
        ? "w-full py-3 px-4 bg-indigo-600 text-white rounded-lg mb-2 hover:bg-indigo-700 transition-colors duration-200" 
        : "w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg mb-2 hover:from-blue-600 hover:to-indigo-700 transition-colors duration-200",
      
      secondaryButton: darkMode 
        ? "w-full py-3 px-4 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors duration-200" 
        : "w-full py-3 px-4 border border-gray-200 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200",
      
      captureButton: darkMode 
        ? "px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors" 
        : "px-5 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-colors",
      
      backButton: darkMode 
        ? "px-5 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors" 
        : "px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors",
      
      submitButton: darkMode 
        ? "px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition duration-200" 
        : "px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg hover:from-emerald-600 hover:to-green-700 transition duration-200 shadow-lg"
    };
  };

  const themeClasses = getThemeClasses();

  const renderDocSelection = () => (
    <div className="py-12 px-8">
      <div className="flex justify-between items-center mb-10">
        <p className={`${themeClasses.description} text-center max-w-3xl mx-auto`}>
          Please capture or upload clear images of your identity documents for verification.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
        {["aadharFront", "aadharBack", "pan"].map((docType) => (
          <div key={docType} className={themeClasses.docCard}>
            <div className="p-6">
              <h3 className={themeClasses.subheading + " mb-4"}>{getDocName(docType)}</h3>

              <div className={`aspect-w-4 aspect-h-3 mb-6 ${themeClasses.previewArea}`}>
                {images[docType] ? (
                  <img src={images[docType]} alt={getDocName(docType)} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-10">
                    <svg className="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <span className="text-center">No image uploaded or captured yet</span>
                  </div>
                )}
              </div>

              <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, docType)} ref={(ref) => (fileInputsRef.current[docType] = ref)} style={{ display: "none" }} />

              <button className={themeClasses.primaryButton} onClick={() => startCapture(docType)}>
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  {images[docType] ? "Recapture Document" : "Capture Document"}
                </div>
              </button>

              <button className={themeClasses.secondaryButton} onClick={() => fileInputsRef.current[docType]?.click()}>
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12"></path>
                  </svg>
                  Upload Document
                </div>
              </button>

              {extractedData[docType] && (
                <div className={`mt-4 p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <p className={`text-sm font-medium ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                    ✓ Processed successfully
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  const renderCameraCapture = () => (
    <div className="p-8 flex flex-col items-center max-w-3xl mx-auto">
      <h2 className={themeClasses.subheading + " mb-2"}>{getDocName(currentDoc)}</h2>
      <p className={`${themeClasses.description} mb-8 text-center`}>Position the document clearly within the frame</p>

      <div className={`w-full ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-xl shadow-md overflow-hidden ${darkMode ? 'border border-gray-700' : 'border border-gray-100'}`}>
        <div className="relative">
          <Webcam 
            audio={false} 
            ref={webcamRef} 
            screenshotFormat="image/jpeg" 
            className="w-full h-full object-cover"
          />
          {/* Document outline guide */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className={`w-5/6 h-3/5 border-2 border-dashed ${darkMode ? 'border-blue-400 opacity-70' : 'border-indigo-500 opacity-50'} rounded-md`}></div>
          </div>
        </div>

        <div className={`flex justify-center gap-4 p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <button onClick={() => setCurrentDoc(null)} className={themeClasses.backButton}>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Back
            </div>
          </button>
          <button onClick={capturePhoto} className={themeClasses.captureButton}>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              Capture
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  const renderImagePreview = () => (
    <div className="p-8 flex flex-col items-center max-w-3xl mx-auto">
      <h2 className={themeClasses.subheading + " mb-2"}>{getDocName(currentDoc)} Preview</h2>
      <p className={`${themeClasses.description} mb-8 text-center`}>Review your document image</p>

      <div className={`w-full ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-xl shadow-md overflow-hidden ${darkMode ? 'border border-gray-700' : 'border border-gray-100'}`}>
        <div className="aspect-w-4 aspect-h-3">
          <img
            src={images[currentDoc]}
            alt="Captured document"
            className="w-full h-full object-contain"
          />
        </div>

        <div className={`flex justify-center gap-4 p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <button onClick={retakePhoto} className={themeClasses.backButton}>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              Retake
            </div>
          </button>
          <button 
            onClick={uploadPhoto} 
            className={themeClasses.captureButton}
            disabled={processing[currentDoc]}
          >
            <div className="flex items-center">
              {processing[currentDoc] ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Confirm & Process
                </>
              )}
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  const handleFinalSubmit = async () => {
    const requiredDocs = ["aadharFront", "aadharBack", "pan"];
  
    // Check if all documents are uploaded
    for (const doc of requiredDocs) {
      if (!images[doc]) {
        alert(`Please upload or capture ${getDocName(doc)} before submitting.`);
        return;
      }
    }
  
    try {
      const formData = new FormData();
      formData.append("aadhaar_front", dataURItoBlob(images.aadharFront), "aadhaar_front.jpg");
      formData.append("aadhaar_back", dataURItoBlob(images.aadharBack), "aadhaar_back.jpg");
      formData.append("pan", dataURItoBlob(images.pan), "pan.jpg");
      formData.append("user_id", "2e52db71-c4a9-4de4-8769-aaee56ce3565"); // Replace with actual user ID
      formData.append("phone_number", "7694072747"); // Replace with actual phone number
  
      console.log("FormData:", formData); // Debugging log
  
      const response = await axios.post("http://127.0.0.1:5000/kyc/documents", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      console.log("API Response:", response.data); // Debugging log
      alert(response.data.message);
      window.location.href = "/loan"; // Redirect to success page
    } catch (error) {
      console.error("Error uploading documents:", error); // Debugging log
      alert("Error uploading documents. Please try again.");
    }
  };

  // Function to render verification progress
  const renderProgress = () => {
    const docs = ["aadharFront", "aadharBack", "pan"];
    const completedCount = docs.filter(doc => images[doc]).length;
    const percentage = Math.floor((completedCount / docs.length) * 100);
    
    return (
      <div className={`w-full max-w-lg mx-auto mb-8 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
        <div className="flex justify-between mb-2 text-sm font-medium">
          <span>Verification Progress</span>
          <span>{percentage}% Complete</span>
        </div>
        <div className={`w-full h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
          <div 
            className={`h-2 rounded-full ${darkMode ? 'bg-indigo-500' : 'bg-gradient-to-r from-blue-500 to-indigo-600'}`} 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <div className={`${themeClasses.container} flex items-center justify-center transition-colors duration-300`}>
      <div className={`max-w-7xl mx-auto px-4 py-6 ${themeClasses.card} m-4`}>
        <div className="flex items-center justify-between px-4">
          <h1 className={`${themeClasses.heading} mb-6`}></h1>
          {!currentDoc && (
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full focus:outline-none"
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? (
                <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
          )}
        </div>

        {!currentDoc && renderProgress()}

        <div className={`${darkMode ? 'bg-gray-800 shadow-sm' : 'bg-white shadow-sm'} rounded-lg overflow-hidden`}>
          {currentDoc 
            ? (isCapturing ? renderCameraCapture() : renderImagePreview()) 
            : renderDocSelection()
          }
        </div>

        {/* Final Submit Button - only show if not in capture mode */}
        {!currentDoc && (
          <div className="text-center mt-8">
            <button
              onClick={handleFinalSubmit}
              className={themeClasses.submitButton}
              disabled={!images.aadharFront || !images.aadharBack || !images.pan}
            >
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Submit Documents for Verification
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OCRUpload;