"use client";

import { useState, useRef, useEffect } from "react";
import sampleVideo from "../videos/sample.mp4";
import sampleImage from "../videos/sample.png";

import { 
  Send, 
  Mic, 
  MicOff, 
  Camera, 
  CameraOff, 
  MessageSquare,
  FileText,
  CreditCard,
  PiggyBank,
  Pause,
  Play,
  ChevronRight,
  Calendar,
  Video,
  VideoOff
} from "lucide-react";
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
  const [cameraActive, setCameraActive] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(true);
  const [userVideoActive, setUserVideoActive] = useState(false);

  const [stream, setStream] = useState(null);
  const [suggestedActions, setSuggestedActions] = useState([
    { id: 1, text: "Check account balance", icon: <CreditCard size={16} /> },
    { id: 2, text: "Apply for a loan", icon: <FileText size={16} /> },
    { id: 3, text: "Set up savings goal", icon: <PiggyBank size={16} /> },
    { id: 4, text: "Schedule appointment", icon: <Calendar size={16} /> },
  ]);

  // Refs
  const messagesEndRef = useRef(null);
  const videoRef = useRef(null);
  const userVideoRef = useRef(null);

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

  // Start user video
  const startUserVideo = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user"
        }
      });
      
      setStream(mediaStream);
      if (userVideoRef.current) {
        userVideoRef.current.srcObject = mediaStream;
      }
      setUserVideoActive(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access your camera. Please check your permissions.");
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

  // Toggle camera
  const toggleCamera = () => {
    if (userVideoActive) {
      stopUserVideo();
    } else {
      startUserVideo();
    }
    setCameraActive(!cameraActive);
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

  // Handle sending a message
  const handleSendMessage = () => {
    if (input.trim() === "") return;

    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");

    // Simulate assistant response
    setTimeout(() => {
      getAssistantResponse(input);
    }, 1000);
  };

  // Get assistant response based on user input
  const getAssistantResponse = (userInput) => {
    let response = "I understand you're asking about that. Let me help you with this request.";
    
    // Simple keyword matching for demo purposes
    const lowerInput = userInput.toLowerCase();
    
    if (lowerInput.includes("loan") || lowerInput.includes("borrow")) {
      response = "Based on your profile, you're pre-approved for a personal loan of up to $25,000 with an interest rate starting at 7.5%. Would you like to proceed with an application?";
    } else if (lowerInput.includes("balance") || lowerInput.includes("account")) {
      response = "Your current account balance is $4,328.57. Your savings account has $12,150.89. Would you like to see your recent transactions?";
    } else if (lowerInput.includes("transfer") || lowerInput.includes("send money")) {
      response = "I can help you transfer funds. Please provide the recipient's details and the amount you'd like to transfer.";
    } else if (lowerInput.includes("hello") || lowerInput.includes("hi")) {
      response = "Hello! I'm your DigiBanker assistant. How can I help with your banking needs today?";
    } else if (lowerInput.includes("video")) {
      response = "I see you're interested in video communication. You can enable your camera using the camera button below to have a more personal interaction.";
    }
    
    handleAssistantResponse(response);
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
      {/* Sidebar */}
      <div className="digibanker-sidebar">
        <div className="digibanker-logo">
          <h2>DigiBanker</h2>
        </div>
        
        <nav className="digibanker-nav">
          <button className="nav-item active">
            <MessageSquare size={20} />
            <span>Assistant</span>
          </button>
          <button className="nav-item">
            <CreditCard size={20} />
            <span>Accounts</span>
          </button>
          <button className="nav-item">
            <FileText size={20} />
            <span>Loans</span>
          </button>
          <button className="nav-item">
            <PiggyBank size={20} />
            <span>Savings</span>
          </button>
        </nav>
        
        <div className="user-profile">
          <div className="avatar">JD</div>
          <div className="user-info">
            <h4>John Doe</h4>
            <p>Premium Member</p>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="digibanker-main">
        <div className="digibanker-header">
          <h1>Virtual Banking Assistant</h1>
          <p>Get help with your banking needs instantly</p>
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
                <button 
                  className={`action-icon ${isRecording ? 'recording' : ''}`}
                  onClick={toggleRecording}
                >
                  {isRecording ? <MicOff /> : <Mic />}
                </button>
                <button 
                  className={`action-icon ${userVideoActive ? 'active' : ''}`}
                  onClick={toggleCamera}
                >
                  {userVideoActive ? <VideoOff /> : <Video />}
                </button>
                <button 
                  className="send-button"
                  onClick={handleSendMessage}
                  disabled={input.trim() === ""}
                >
                  <Send />
                </button>
              </div>
            </div>
          </div>
          
          {/* Video section */}
          <div className="video-container">
            <div className="video-sections">
              {/* Bank Manager Video */}
              <div className="manager-video-wrapper">
                <h3 className="video-title">Banking Assistant</h3>
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
                  >
                    {videoPlaying ? <Pause size={16} /> : <Play size={16} />}
                  </button>
                </div>
              </div>
              
              {/* User Video */}
              <div className="user-video-wrapper">
                <h3 className="video-title">Your Camera</h3>
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
                      <p>Click the camera button to start your video</p>
                      <button 
                        className="start-video-btn"
                        onClick={startUserVideo}
                      >
                        <Camera size={24} />
                        <span>Start Camera</span>
                      </button>
                    </div>
                  )}
                  {userVideoActive && (
                    <button 
                      className="video-control red" 
                      onClick={stopUserVideo}
                      title="Stop camera"
                    >
                      <CameraOff size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            <div className="assistant-info">
              <h3>Financial Advisor</h3>
              <p>DigiBank Virtual Assistant</p>
              <div className="assistant-status">
                <span className="status-indicator online"></span>
                <span>Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}