import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import video1 from "./videos/v1.mp4";
import video2 from "./videos/v2.mp4";
import video3 from "./videos/v3.mp4";
import video4 from "./videos/v4.mp4";
import video5 from "./videos/v5.mp4";
import video6 from "./videos/v6.mp4";
import video7 from "./videos/v7.mp4";
import video8 from "./videos/v8.mp4";

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
  const [darkMode, setDarkMode] = useState(false);

  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const navigate = useNavigate();

  // Check for user's theme preference on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDarkMode(true);
    }
  }, []);

  // Update theme in localStorage when it changes
  useEffect(() => {
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    // Apply theme to document body
    if (darkMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

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
        navigate("/preview");
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

      streamRef.current = stream;

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

    const mediaRecorder = new MediaRecorder(streamRef.current);

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

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      if (videoRef.current) {
        videoRef.current.srcObject = null;
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
    startVideoMode();
  };

  const renderInput = () => {
    if (videoMode) {
      return (
        <div className="mt-4">
          {!recordedVideo ? (
            <div className="flex flex-col items-center">
              <div className={`w-full max-w-md rounded-xl overflow-hidden ${darkMode ? 'border-2 border-gray-700' : 'border-2 border-gray-200'} mb-4 shadow-lg`}>
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
                    className="px-5 py-2.5 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 flex items-center shadow-md transform transition-transform duration-200 hover:scale-105"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                      <circle cx="12" cy="12" r="4" fill="currentColor"/>
                    </svg>
                    Start Recording
                  </button>
                ) : (
                  <button 
                    onClick={stopRecording}
                    className="px-5 py-2.5 rounded-full bg-gradient-to-r from-gray-500 to-gray-600 text-white hover:from-gray-600 hover:to-gray-700 flex items-center shadow-md transform transition-transform duration-200 hover:scale-105"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <rect x="6" y="6" width="12" height="12" strokeWidth="2"/>
                    </svg>
                    Stop Recording
                  </button>
                )}
                <button 
                  onClick={cancelRecording}
                  className={`px-5 py-2.5 rounded-full ${darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'} shadow-md transform transition-transform duration-200 hover:scale-105`}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className={`w-full max-w-md rounded-xl overflow-hidden ${darkMode ? 'border-2 border-gray-700' : 'border-2 border-gray-200'} mb-4 shadow-lg`}>
                <video 
                  src={recordedVideo} 
                  className="w-full h-auto" 
                  controls
                />
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={resetRecording}
                  className={`px-5 py-2.5 rounded-full ${darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'} shadow-md transform transition-transform duration-200 hover:scale-105`}
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
            <div className={`relative ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <input
                type="text"
                className={`w-full p-4 pl-4 pr-10 mt-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                  darkMode 
                    ? 'bg-gray-800 text-white border border-gray-700 placeholder-gray-400 focus:ring-indigo-400 shadow-lg' 
                    : 'bg-white text-gray-800 border border-gray-200 placeholder-gray-500 focus:ring-indigo-500 shadow-md'
                } transition-all duration-200`}
                placeholder={currentQuestion.placeholder}
                value={formData[stage] || ""}
                onChange={(e) => handleChange(e.target.value)}
              />
              {currentQuestion.question.toLowerCase().includes('amount') && (
                <span className="absolute inset-y-0 right-0 flex items-center pr-3 mt-2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
              )}
            </div>
            <div className="mt-6 flex justify-center">
              <button 
                onClick={startVideoMode}
                className={`px-5 py-2.5 rounded-full flex items-center shadow-md transform transition-transform duration-200 hover:scale-105 ${
                  darkMode 
                    ? 'bg-gradient-to-r from-indigo-800 to-purple-900 text-white hover:from-indigo-700 hover:to-purple-800' 
                    : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700'
                }`}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Answer with Video
              </button>
            </div>
          </div>
        );

      case "select":
        return (
          <div>
            <select
              className={`w-full p-4 mt-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-opacity-50 appearance-none ${
                darkMode 
                  ? 'bg-gray-800 text-white border border-gray-700 focus:ring-indigo-400 shadow-lg' 
                  : 'bg-white text-gray-800 border border-gray-200 focus:ring-indigo-500 shadow-md'
              } transition-all duration-200`}
              value={formData[stage] || ""}
              onChange={(e) => handleChange(e.target.value)}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='${darkMode ? '%23718096' : '%236B7280'}' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: `right 0.5rem center`,
                backgroundRepeat: `no-repeat`,
                backgroundSize: `1.5em 1.5em`,
                paddingRight: `2.5rem`
              }}
            >
              <option value="" disabled>Select an option</option>
              {currentQuestion.options.map((option, index) => (
                <option key={index} value={option} className={darkMode ? 'bg-gray-800' : 'bg-white'}>
                  {option}
                </option>
              ))}
            </select>
            <div className="mt-6 flex justify-center">
              <button 
                onClick={startVideoMode}
                className={`px-5 py-2.5 rounded-full flex items-center shadow-md transform transition-transform duration-200 hover:scale-105 ${
                  darkMode 
                    ? 'bg-gradient-to-r from-indigo-800 to-purple-900 text-white hover:from-indigo-700 hover:to-purple-800' 
                    : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700'
                }`}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Answer with Video
              </button>
            </div>
          </div>
        );

      case "upload":
        return (
          <div>
            <div className="mt-4">
              <label className={`flex flex-col items-center px-4 py-8 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 transform hover:scale-102 ${
                darkMode 
                  ? 'bg-gray-800 text-indigo-400 border-indigo-700 hover:border-indigo-500 hover:bg-gray-750 shadow-lg' 
                  : 'bg-white text-indigo-500 border-indigo-300 hover:border-indigo-400 hover:bg-indigo-50 shadow-md'
              }`}>
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                </svg>
                <span className="mt-3 text-base font-medium">Upload your bank statement</span>
                <span className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>PDF, JPEG, or PNG up to 10MB</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => handleChange(e.target.files[0]?.name || "File selected")}
                />
              </label>
              {formData[stage] && (
                <div className={`mt-3 text-sm flex items-center justify-center ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  {formData[stage]}
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-center">
              <button 
                onClick={startVideoMode}
                className={`px-5 py-2.5 rounded-full flex items-center shadow-md transform transition-transform duration-200 hover:scale-105 ${
                  darkMode 
                    ? 'bg-gradient-to-r from-indigo-800 to-purple-900 text-white hover:from-indigo-700 hover:to-purple-800' 
                    : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700'
                }`}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Answer with Video
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`w-full min-h-screen transition-colors duration-300 flex items-center justify-center p-4 ${darkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-blue-50 to-indigo-50'}`}>
      <div className={`w-full max-w-lg mx-auto rounded-2xl overflow-hidden transition-all duration-300 transform ${
        darkMode 
          ? 'bg-gray-800 shadow-xl shadow-gray-900/30 border border-gray-700' 
          : 'bg-white shadow-xl shadow-blue-900/10 border border-gray-100'
      }`}>
        {/* Header with branding */}
        <div className={`px-8 py-6 ${darkMode ? 'bg-gray-900' : 'bg-indigo-600'}`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <svg className={`w-8 h-8 ${darkMode ? 'text-indigo-400' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <h1 className={`ml-2 text-xl font-bold ${darkMode ? 'text-white' : 'text-white'}`}>QuickLoan</h1>
            </div>
            <button 
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-colors duration-200 ${
                darkMode 
                  ? 'bg-gray-800 text-yellow-300 hover:bg-gray-700' 
                  : 'bg-indigo-500 text-white hover:bg-indigo-400'
              }`}
              aria-label="Toggle theme"
            >
              {darkMode ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="px-8 py-4 border-b border-opacity-20 border-gray-300 bg-opacity-50">
          <div className="flex justify-between items-center mb-2">
            <h2 className={`text-lg font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              Loan Application
            </h2>
            <span className={`text-sm font-medium rounded-full px-3 py-1 ${
              darkMode 
                ? 'bg-indigo-900 text-indigo-200' 
                : 'bg-indigo-100 text-indigo-600'
            }`}>
              Step {stage} of {data.length}
            </span>
          </div>
          <div className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2.5 overflow-hidden`}>
            <div 
              className={`h-2.5 rounded-full transition-all duration-500 ease-out ${
                darkMode ? 'bg-gradient-to-r from-indigo-500 to-purple-600' : 'bg-gradient-to-r from-indigo-500 to-purple-600'
              }`}
              style={{ width: `${(stage / data.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Content area */}
        <div className={`px-8 py-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex justify-center w-full mb-6">
            {currentQuestion.video && (
              <div className={`rounded-xl overflow-hidden ${darkMode ? 'shadow-lg shadow-black/30' : 'shadow-lg shadow-gray-200'} w-full`}>
                <video 
                  src={currentQuestion.video} 
                  className="w-full" 
                  controls 
                  poster="/video-poster.jpg"
                />
              </div>
            )}
          </div>

          <div className="mb-8">
            <h3 className={`text-xl font-medium mb-6 ${darkMode ? 'text-white' : 'text-gray-800'} text-center`}>
              {currentQuestion.question}
            </h3>
            {renderInput()}
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handlePrevious}
              disabled={stage === 1}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                stage === 1 
                  ? `${darkMode ? 'bg-gray-800 text-gray-600' : 'bg-gray-100 text-gray-400'} cursor-not-allowed` 
                  : darkMode 
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 shadow-md hover:shadow-lg transform hover:-translate-y-1' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 shadow-md hover:shadow-lg transform hover:-translate-y-1'
              }`}
            >
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                </svg>
                Back
              </span>
            </button>

          <button
            onClick={handleNext}
            disabled={isSubmitting || !formData[stage]}
            className={`px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 
              ${(isSubmitting || !formData[stage]) ? 'opacity-50 cursor-not-allowed' : ''}`}
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
  </div>
  );
}

export default Loan;