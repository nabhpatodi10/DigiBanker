import React, { useRef, useState } from "react";
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

  const renderDocSelection = () => (
    <div className="py-12 px-8">
      <p className="text-gray-600 text-center max-w-3xl mx-auto mb-10">
        Please capture or upload clear images of your identity documents for verification.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
        {["aadharFront", "aadharBack", "pan"].map((docType) => (
          <div key={docType} className="rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">{getDocName(docType)}</h3>

              <div className="aspect-w-4 aspect-h-3 mb-6 bg-gray-50 rounded-lg overflow-hidden">
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

              <button className="w-full py-3 px-4 bg-gray-800 text-white rounded-lg mb-2 hover:bg-gray-700 transition-colors duration-200" onClick={() => startCapture(docType)}>
                {images[docType] ? "Recapture Document" : "Capture Document"}
              </button>

              <button className="w-full py-3 px-4 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200" onClick={() => fileInputsRef.current[docType]?.click()}>
                Upload Document
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCameraCapture = () => (
    <div className="p-8 flex flex-col items-center max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">{getDocName(currentDoc)}</h2>
      <p className="text-gray-500 mb-8 text-center">Position the document clearly within the frame</p>

      <div className="w-full bg-gray-50 rounded-xl shadow-md overflow-hidden border border-gray-100">
        <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" className="w-full h-full object-cover" />

        <div className="flex justify-center gap-4 p-6 bg-white">
          <button onClick={() => setCurrentDoc(null)} className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
            Back
          </button>
          <button onClick={capturePhoto} className="px-5 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors">
            Capture
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
        formData.append("aadharFront", dataURItoBlob(images.aadharFront));
        formData.append("aadharBack", dataURItoBlob(images.aadharBack));
        formData.append("pan", dataURItoBlob(images.pan));
        formData.append("email", "admin@gmail.com");  // Replace with actual user email

        const response = await axios.post("http://127.0.0.1:5000/extract-text", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        setExtractedData(response.data);  // Store extracted data in state

        alert("All documents processed successfully! Data stored in CSV.");
    } catch (error) {
        alert(`Error processing documents: ${error.message}`);
    }
};

  
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="max-w-7xl mx-auto px-4 py-6 bg-zinc-100 shadow-xl rounded-xl">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-6">Document Verification</h1>
        
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          {currentDoc ? renderCameraCapture() : renderDocSelection()}
        </div>
  
        {/* Final Submit Button */}
        <div className="text-center mt-8">
          <button 
            onClick={handleFinalSubmit} 
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200"
          >
            Final Submit & Process Data
          </button>
        </div>
      </div>
    </div>
  );
  
};

export default OCRUpload;