"use client";

import { useState, useRef, useEffect } from "react";
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
import sampleVideo from "../videos/v1.mp4";
import sampleImage from "../videos/sample.png";
import "./manager.css";

export default function DigiBankerManager() {
  const hardcodedResponses = [
    "Understood. Can you please mention your highest education?",
    "Got it. Now provide your current annual income and years of work experience.",
    "Please further inform me whether you currently own a house?",
    "Mention the loan amount you are looking for and the purpose of the loan.",
    "I see you have a credit card payment due in 3 days. Would you like me to schedule a payment?",
    "Based on your spending patterns, I notice you could save about $120 per month by adjusting your subscription services.",
    "I've analyzed your accounts and you appear to be on track for your retirement goals. Would you like a detailed report?",
    "For international transfers, we charge a flat fee of $25 plus 1% of the transfer amount. Would you like to proceed?",
    "I can help you set up automatic savings. How much would you like to transfer to savings each month?",
    "Your credit score has improved by 15 points since last month. Congratulations!",
  ];

  const [responseIndex, setResponseIndex] = useState(0);
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
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('digibanker-theme');
      if (!savedTheme) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return savedTheme;
    }
    return 'light';
  });

  const messagesEndRef = useRef(null);
  const videoRef = useRef(null);
  const userVideoRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('digibanker-theme', theme);
    }
  }, [theme]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [stream]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    setAttachments([...attachments, ...files]);
  };

  const getNextResponse = () => {
    const response = hardcodedResponses[responseIndex % hardcodedResponses.length];
    setResponseIndex(prevIndex => prevIndex + 1);
    return response;
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = speechSynthesis.getVoices().find(voice => voice.name === "Google US English");
      utterance.rate = 1;
      utterance.pitch = 1;

      utterance.onstart = () => {
        if (videoRef.current) {
          videoRef.current.play();
        }
      };

      utterance.onend = () => {
        if (videoRef.current) {
          videoRef.current.pause();
        }
      };

      speechSynthesis.speak(utterance);
    } else {
      console.error("Text-to-speech is not supported in this browser.");
    }
  };

  const handleSendMessage = () => {
    if (input.trim() === "" && attachments.length === 0 && !stream) return;

    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input || "Sent attachments",
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    setInput("");
    setAttachments([]);
    
    setTimeout(() => {
      const assistantMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: getNextResponse(),
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);

      speakText(assistantMessage.content);
    }, 1000);
  };

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

  const startUserVideo = async () => {
    try {
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

  const stopUserVideo = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setUserVideoActive(false);
  };

  const toggleRecording = () => {
    if (!isRecording) {
      startSpeechRecognition();
    } else {
      stopSpeechRecognition();
    }
    setIsRecording(!isRecording);
  };

  const startSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = "en-US";

    recognitionRef.current.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join("");
      setInput(transcript);
    };

    recognitionRef.current.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
    };

    recognitionRef.current.start();
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const toggleBankManagerVideo = () => {
    setVideoPlaying(!videoPlaying);
  };

  const handleSuggestedAction = (action) => {
    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: action.text,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);

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
          response = getNextResponse();
      }
      
      const assistantMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      speakText(response);
    }, 1000);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="digibanker-container">
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
          
          <div className="video-container">
            <div className="assistant-video-container">
              <h3 className="video-title">Financial Assistant</h3>
              <div className="video-frame">
                {videoPlaying ? (
                  <video 
                    ref={videoRef}
                    src={sampleVideo} 
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