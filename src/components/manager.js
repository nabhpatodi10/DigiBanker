"use client";

import { useState, useRef, useEffect } from "react";
import axios from 'axios';
import { 
  Send, 
  Mic, 
  MicOff, 
  MessageSquare,
  FileText,
  Pause,
  Play,
  ChevronRight,
  Video,
  VideoOff,
  Sun,
  Moon,
  Sparkles
} from "lucide-react";
import sampleVideo from "../videos/sample.mp4";
import sampleImage from "../videos/sample.png";
import "./manager.css";

export default function DigiBankerManager() {
  // State management
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      content: "Welcome to DigiBanker! I'm your virtual banking assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(true);
  const [userVideoActive, setUserVideoActive] = useState(false);
  const [stream, setStream] = useState(null);
  const [suggestedActions, setSuggestedActions] = useState([
    { id: 1, text: "Check account balance", icon: <MessageSquare size={16} /> },
    { id: 2, text: "Apply for a loan", icon: <FileText size={16} /> },
    { id: 3, text: "Set up savings goal", icon: <MessageSquare size={16} /> },
    { id: 4, text: "Schedule appointment", icon: <MessageSquare size={16} /> },
  ]);
  const [sessionId, setSessionId] = useState("session-" + Date.now());
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [theme, setTheme] = useState(() => {
    // Check if user has a preferred theme stored
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('digibanker-theme');
      // Check system preference if no saved theme
      if (!savedTheme) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return savedTheme;
    }
    return 'light'; // Default to light theme
  });

  // Refs
  const messagesEndRef = useRef(null);
  const videoRef = useRef(null);
  const userVideoRef = useRef(null);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('digibanker-theme', theme);
    }
  }, [theme]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Clean up video streams on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Toggle theme
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  // Handle file uploads
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    setAttachments([...attachments, ...files]);
  };

  // Function to connect with the backend API
  const sendMessageToBackend = async () => {
    if (input.trim() === "" && attachments.length === 0 && !stream) return;
  
    // Add user message to chat
    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input || "Sent attachments",
      timestamp: new Date(),
    };
  
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
  
    try {
      const formData = new FormData();
      formData.append("session_id", sessionId);
      formData.append("user_id", userId || "default-user-id"); // Use stored userId or default
  
      if (input.trim() !== "") {
        formData.append("text", input);
      }
  
      // Add any image attachments
      attachments.forEach((file) => {
        if (file.type.startsWith("image/")) {
          formData.append("images", file);
        }
      });
  
      // Log the FormData for debugging
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }
  
      // Add video if camera is active
      if (stream && userVideoRef.current) {
        // Capture frame from video as a blob
        const canvas = document.createElement("canvas");
        canvas.width = userVideoRef.current.videoWidth;
        canvas.height = userVideoRef.current.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(userVideoRef.current, 0, 0);
  
        // Convert canvas to blob
        canvas.toBlob(async (blob) => {
          const videoFile = new File([blob], "video-capture.jpg", {
            type: "image/jpeg",
          });
          formData.append("video", videoFile);
  
          await completeRequest(formData);
        }, "image/jpeg");
      } else {
        await completeRequest(formData);
      }
    } catch (error) {
      console.error("Error communicating with backend:", error);
      handleAssistantResponse(
        "I'm having trouble connecting to the server. Please try again later."
      );
      setIsLoading(false);
    }
  
    // Clear input and attachments after sending
    setInput("");
    setAttachments([]);
  };
  
  // Helper function to complete the API request
  const completeRequest = async (formData) => {
    try {
      const response = await axios.post("http://127.0.0.1:5000/chat", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
  
      // Log the response for debugging
      console.log("Backend Response:", response.data);
  
      // Handle the response
      const data = response.data.data;
  
      // Store userId if returned and not already set
      if (data.user_id && !userId) {
        setUserId(data.user_id);
      }
  
      // Add assistant response to chat
      if (data.agent_response) {
        handleAssistantResponse(data.agent_response);
      } else if (!data.approved) {
        handleAssistantResponse(
          "Face verification failed. Please try again with a clearer image."
        );
      }
  
      // Redirect based on success or failure
      if (data.success) {
        window.location.href = "/success"; // Redirect to success page
      } else {
        window.location.href = "/failure"; // Redirect to failure page
      }
    } catch (error) {
      console.error("Error in API request:", error);
      handleAssistantResponse(
        "I encountered an error processing your request. Please try again."
      );
      window.location.href = "/failure"; // Redirect to failure page on error
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle sending a message
  const handleSendMessage = () => {
    sendMessageToBackend();
  };

  // Render file upload button
  const renderFileUploadButton = () => (
    <div className="file-upload">
      <input
        type="file"
        id="file-upload"
        multiple
        accept="image/*,.pdf,.doc,.docx"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />
      <label htmlFor="file-upload" className="action-icon">
        <FileText />
      </label>
      {attachments.length > 0 && (
        <span className="attachment-count">{attachments.length}</span>
      )}
    </div>
  );

  // Start user video
  const startUserVideo = async () => {
    try {
      // Stop any existing stream first
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user"
        }
      });
      
      setStream(mediaStream);
      
      // Use a timeout to ensure the ref is available
      setTimeout(() => {
        if (userVideoRef.current) {
          userVideoRef.current.srcObject = mediaStream;
          userVideoRef.current.play().catch(e => console.error("Video play error:", e));
        }
      }, 100);
      
      setUserVideoActive(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access your camera. Please check your permissions.");
      setUserVideoActive(false);
    }
  };

  // Stop user video
  const stopUserVideo = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setUserVideoActive(false);
  };

  // Toggle recording
  const toggleRecording = () => {
    setIsRecording(!isRecording);
    
    // Simulate receiving a response after recording stops
    if (isRecording) {
      setTimeout(() => {
        handleAssistantResponse("I've processed your audio message. How else can I assist you today?");
      }, 1500);
    }
  };

  // Toggle bank manager video
  const toggleBankManagerVideo = () => {
    setVideoPlaying(!videoPlaying);
  };

  // Add assistant message to the chat
  const handleAssistantResponse = (content) => {
    const assistantMessage = {
      id: Date.now().toString(),
      role: "assistant",
      content: content,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, assistantMessage]);
  };

  // Handle suggested action click
  const handleSuggestedAction = (action) => {
    // Add user message with the clicked suggestion
    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: action.text,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);

    // Simulate assistant response based on action
    setTimeout(() => {
      let response = "";
      
      switch(action.id) {
        case 1:
          response = "Your current account balance is $4,328.57. Your savings account has $12,150.89. Would you like to see your recent transactions?";
          break;
        case 2:
          response = "Great! I can help you apply for a loan. We offer personal loans, home loans, and auto loans. Which type are you interested in?";
          break;
        case 3:
          response = "Setting up a savings goal is a great way to build your financial future. What are you saving for, and how much would you like to save?";
          break;
        case 4:
          response = "I can help you schedule an appointment with one of our financial advisors. Would you prefer an in-person meeting or a video call?";
          break;
        default:
          response = "I'd be happy to help with that request.";
      }
      
      handleAssistantResponse(response);
    }, 1000);
  };

  // Format timestamp
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="digibanker-container">
      {/* Main content */}
      <div className="digibanker-main">
        <div className="digibanker-header">
          <div className="logo-container">
            <Sparkles className="logo-icon" />
            <h1>DigiBanker Assistant</h1>
          </div>
          <div className="header-controls">
            <p>Your intelligent financial companion</p>
            <button 
              className="theme-toggle" 
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
        </div>
        
        <div className="digibanker-content">
          {/* Chat section */}
          <div className="chat-container">
            <div className="chat-messages">
              {messages.map((message) => (
                <div 
                  key={message.id}
                  className={`message ${message.role === "user" ? "user-message" : "assistant-message"}`}
                >
                  <div className="message-content">
                    <p>{message.content}</p>
                    <span className="timestamp">{formatTime(message.timestamp)}</span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Suggested actions */}
            {messages.length < 3 && (
              <div className="suggested-actions">
                <h3>I can help you with:</h3>
                <div className="actions-list">
                  {suggestedActions.map((action) => (
                    <button 
                      key={action.id} 
                      className="action-btn"
                      onClick={() => handleSuggestedAction(action)}
                    >
                      {action.icon}
                      <span>{action.text}</span>
                      <ChevronRight size={16} />
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Input area */}
            <div className="chat-input">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <div className="input-actions">
                {renderFileUploadButton()}
                <button 
                  className={`action-icon ${isRecording ? 'recording' : ''}`}
                  onClick={toggleRecording}
                  aria-label={isRecording ? "Stop recording" : "Start recording"}
                >
                  {isRecording ? <MicOff /> : <Mic />}
                </button>
                <button 
                  className={`action-icon ${userVideoActive ? 'active' : ''}`}
                  onClick={userVideoActive ? stopUserVideo : startUserVideo}
                  aria-label={userVideoActive ? "Stop video" : "Start video"}
                >
                  {userVideoActive ? <VideoOff /> : <Video />}
                </button>
                <button 
                  className="send-button"
                  onClick={handleSendMessage}
                  disabled={isLoading || (input.trim() === "" && attachments.length === 0)}
                  aria-label="Send message"
                >
                  {isLoading ? <div className="loading-spinner"></div> : <Send />}
                </button>
              </div>
            </div>
          </div>
          
          {/* Video section */}
          <div className="video-container">
            <div className="assistant-video-container">
              <h3 className="video-title">Financial Assistant</h3>
              <div className="video-frame">
                {videoPlaying ? (
                  <video 
                    ref={videoRef}
                    src={sampleVideo} 
                    autoPlay 
                    loop 
                    muted 
                    className="assistant-video"
                  />
                ) : (
                  <div className="video-placeholder">
                    <img src={sampleImage} alt="Assistant" /> 
                  </div>
                )}
                <button 
                  className="video-control" 
                  onClick={toggleBankManagerVideo}
                  title={videoPlaying ? "Pause video" : "Play video"}
                  aria-label={videoPlaying ? "Pause video" : "Play video"}
                >
                  {videoPlaying ? <Pause size={16} /> : <Play size={16} />}
                </button>
              </div>
              
              <div className="assistant-info">
                <div className="assistant-status">
                  <span className="status-indicator online"></span>
                  <span>Available Now</span>
                </div>
              </div>
            </div>
            
            {/* User Video */}
            <div className="user-video-container">
              <h3 className="video-title">Your Video</h3>
              <div className="video-frame">
                {userVideoActive ? (
                  <video
                    ref={userVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="user-video"
                  />
                ) : (
                  <div className="video-placeholder">
                    <button 
                      className="start-video-btn"
                      onClick={startUserVideo}
                      aria-label="Start video"
                    >
                      <Video size={24} />
                      <span>Start Video</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}