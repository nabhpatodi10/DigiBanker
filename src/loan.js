import React, { useRef, useState } from 'react';
import video1 from "./videos/v1.mp4";
import video2 from "./videos/v2.mp4";
import video3 from "./videos/v3.mp4";
import video4 from "./videos/v4.mp4";
import video5 from "./videos/v5.mp4"
import video6 from "./videos/v6.mp4"
import video7 from "./videos/v7.mp4"
import video8 from "./videos/v8.mp4"




const data = [
  {
    id: 1,
    question: "What is the loan amount you are looking for?",
    type: "input",
    placeholder: "Enter loan amount",
    video: video1
  },
  {
    id: 2,
    question: "What is the purpose of the loan?",
    type: "select",
    options: [
      "Personal",
      "Business",
      "Education",
      "Others",
    ],
    video: video2
  },
  {
    id: 3,
    question: "What is your monthly income?",
    type: "input",
    placeholder: "Enter monthly income",
    video: video3
  },
  {
    id: 4,
    question: "What is your monthly expense?",
    type: "input",
    placeholder: "Enter monthly expense",
    video: video4
  },
  {
    id: 5,
    question: "What is your credit score?",
    type: "input",
    placeholder: "Enter credit score",
    video: video5
  },
  {
    id: 6,
    question: "What is your employment status?",
    type: "select",
    options: [
      "Employed",
      "Self-Employed",
      "Unemployed",
    ],
    video: video6
  },
  {
    id: 7,
    question: "What is your age?",
    type: "input",
    placeholder: "Enter age",
    video: video7
  },
  {
    id: 8,
    question: "Submit your bank statement for the last 6 months",
    type: "upload",
    video: video8
  }
];


function Loan() {
  const [stage, setStage] = useState(1);
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState(null);
  const [videoMode, setVideoMode] = useState(false);

  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null); // Add a ref to hold the stream

  const currentQuestion = data.find(item => item.id === stage);

  const handleNext = () => {
    if (stage < data.length) {
      setStage(stage + 1);
      setVideoMode(false);
      setRecordedVideo(null);
    } else {
      setIsSubmitting(true);
      console.log("Form submission:", formData);
      setTimeout(() => {
        setIsSubmitting(false);
        alert("Loan application submitted successfully!");
      }, 1500);
    }
  };

  const handlePrevious = () => {
    if (stage > 1) {
      setStage(stage - 1);
      setVideoMode(false);
      setRecordedVideo(null);
    }
  };

  const handleChange = (value) => {
    setFormData({
      ...formData,
      [stage]: value || ""
    });
  };

  const startVideoMode = async () => {
    setVideoMode(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true,
        audio: true
      });

      streamRef.current = stream; // Store the stream in a ref

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access your camera and microphone. Please allow access or try a different browser.");
      setVideoMode(false);
    }
  };

  const startRecording = () => {
    if (!streamRef.current) {
      console.error("No stream available to record.");
      return;
    }

    chunksRef.current = [];
    setIsRecording(true);

    const mediaRecorder = new MediaRecorder(streamRef.current); // Use the stored stream

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const videoURL = URL.createObjectURL(blob);
      setRecordedVideo(videoURL);
      handleChange(`Video Response for Question ${stage}`);

      // Stop all tracks from the stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null; // Clear the stream ref
      }

      if (videoRef.current) {
        videoRef.current.srcObject = null; // Clear the video element
      }
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
  };

  const cancelRecording = () => {
    if (isRecording && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }

    // Stop and release camera stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setVideoMode(false);
    setIsRecording(false);
    setRecordedVideo(null);
  };

  const resetRecording = () => {
    setRecordedVideo(null);
    startVideoMode(); // Reinitialize the stream
  };

  const renderInput = () => {
    if (videoMode) {
      return (
        <div className="mt-4">
          {!recordedVideo ? (
            <div className="flex flex-col items-center">
              <div className="w-full max-w-md rounded-lg overflow-hidden border-2 border-gray-300 mb-4">
                <video
                  ref={videoRef} 
                  className="w-full h-auto" 
                  muted
                />
              </div>
              <div className="flex gap-3">
                {!isRecording ? (
                  <button 
                    onClick={startRecording}
                    className="px-4 py-2 rounded-full bg-red-500 text-white hover:bg-red-600 flex items-center"
                  >
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                      <circle cx="12" cy="12" r="4" fill="currentColor"/>
                    </svg>
                    Start Recording
                  </button>
                ) : (
                  <button 
                    onClick={stopRecording}
                    className="px-4 py-2 rounded-full bg-gray-500 text-white hover:bg-gray-600 flex items-center"
                  >
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <rect x="6" y="6" width="12" height="12" strokeWidth="2"/>
                    </svg>
                    Stop Recording
                  </button>
                )}
                <button 
                  onClick={cancelRecording}
                  className="px-4 py-2 rounded-full bg-gray-200 text-gray-800 hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-full max-w-md rounded-lg overflow-hidden border-2 border-gray-300 mb-4">
                <video 
                  src={recordedVideo} 
                  className="w-full h-auto" 
                  controls
                />
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={resetRecording}
                  className="px-4 py-2 rounded-full bg-gray-200 text-gray-800 hover:bg-gray-300"
                >
                  Record Again
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

    switch (currentQuestion.type) {
      case "input":
        return (
          <div>
            <input
              type="text"
              className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={currentQuestion.placeholder}
              value={formData[stage] || ""}
              onChange={(e) => handleChange(e.target.value)}
            />
            <div className="mt-4 flex justify-center">
              <button 
                onClick={startVideoMode}
                className="px-4 py-2 rounded-lg bg-blue-50 text-blue-500 border border-blue-200 hover:bg-blue-100 flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Answer with Video Instead
              </button>
            </div>
          </div>
        );

      case "select":
        return (
          <div>
            <select
              className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData[stage] || ""}
              onChange={(e) => handleChange(e.target.value)}
            >
              <option value="" disabled>Select an option</option>
              {currentQuestion.options.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <div className="mt-4 flex justify-center">
              <button 
                onClick={startVideoMode}
                className="px-4 py-2 rounded-lg bg-blue-50 text-blue-500 border border-blue-200 hover:bg-blue-100 flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Answer with Video Instead
              </button>
            </div>
          </div>
        );

      case "upload":
        return (
          <div>
            <div className="mt-2">
              <label className="flex flex-col items-center px-4 py-6 bg-white text-blue-500 rounded-lg border border-blue-500 border-dashed cursor-pointer hover:bg-blue-50">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M16.88 9.1A4 4 0 0 1 16 17H5a5 5 0 0 1-1-9.9V7a3 3 0 0 1 4.52-2.59A4.98 4.98 0 0 1 17 8c0 .38-.04.74-.12 1.1z" />
                  <path d="M11 11h3l-4-4-4 4h3v3h2v-3z" />
                </svg>
                <span className="mt-2 text-base">Upload your bank statement</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => handleChange(e.target.files[0]?.name || "File selected")}
                />
              </label>
              {formData[stage] && <p className="mt-2 text-sm text-gray-500">{formData[stage]}</p>}
            </div>
            <div className="mt-4 flex justify-center">
              <button 
                onClick={startVideoMode}
                className="px-4 py-2 rounded-lg bg-blue-50 text-blue-500 border border-blue-200 hover:bg-blue-100 flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Answer with Video Instead
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className='w-full min-h-screen bg-white flex flex-col items-center justify-center p-4'>
      <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden p-6">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold text-gray-800">Loan Application</h2>
            <span className="text-sm text-gray-500">Step {stage} of {data.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(stage / data.length) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex justify-center w-full pb-10">
            {currentQuestion.video && <video src={currentQuestion.video} className="max-w-full" controls autoPlay />}
          
          </div>
          <h3 className="text-xl font-medium text-gray-700 mb-4 text-center">
            {currentQuestion.question}
          </h3>
          {renderInput()}
        </div>

        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={stage === 1}
            className={`px-4 py-2 rounded-lg ${stage === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
          >
            Back
          </button>

          <button
            onClick={handleNext}
            disabled={isSubmitting || !formData[stage]}
            className={`px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed`}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting
              </span>
            ) : stage === data.length ? "Submit" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Loan;
