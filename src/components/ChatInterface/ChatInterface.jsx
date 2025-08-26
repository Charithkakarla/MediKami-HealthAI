import React, { useState, useEffect, useRef } from 'react';
import './ChatInterface.css';
import freeHealthAPIs from './FreeHealthAPIs.js';
import geminiAPIService from './GeminiAPIService.js';
import ShinyText from '../ShinyText.jsx';
import ProfileEditModal from '../Dashboard/ProfileEditModal';


// Shared formatter for rendering markdown-like text safely via dangerouslySetInnerHTML
const formatMessage = (text) => {
  const formattedText = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/- (.*)/g, '<div class="message-bullet"><span class="bullet-point">•</span><span class="bullet-content">$1</span></div>')
    .replace(/\n/g, '<br>');

  return { __html: formattedText };
};

const TypewriterText = ({ text, speed = 30, onComplete, onCopy }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else if (!isComplete) {
      setIsComplete(true);
      if (onComplete) onComplete();
    }
  }, [currentIndex, text, speed, isComplete, onComplete]);


  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
    setIsComplete(false);
  }, [text]);

  return (
    <div className="message-content-wrapper">
      <div 
        className="message-text typewriter-text"
        dangerouslySetInnerHTML={formatMessage(displayedText)}
      />
      {isComplete && onCopy && (
        <button 
          className="copy-button" 
          onClick={() => onCopy(displayedText)}
          title="Copy to clipboard"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        </button>
      )}
    </div>
  );
};


const MessageActions = ({ messageId, text, onReadAloud, onSave, isSpeaking }) => {
  return (
    <div className="message-actions">
      <button 
        className={`action-btn ${isSpeaking ? 'speaking' : ''}`}
        onClick={() => onReadAloud(messageId, text)}
        title={isSpeaking ? "Stop reading" : "Read aloud"}
      >
        {isSpeaking ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" fill="currentColor"/>
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 5v14l11-7z" fill="currentColor"/>
          </svg>
        )}
      </button>
    </div>
  );
};

const ChatInterface = ({ healthData, isAuthenticated = false, onLoginRequest, onLogout }) => {
  const [profileImage, setProfileImage] = useState('/3.jpg');
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [questionCount, setQuestionCount] = useState(0);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [hasShownPopup, setHasShownPopup] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  const [hasShownLoginPrompt, setHasShownLoginPrompt] = useState(false);
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showProfileEditModal, setShowProfileEditModal] = useState(false);
  const [user, setUser] = useState({
    name: 'User Name',
    email: 'user@example.com'
  });
  const messagesEndRef = useRef(null);

  const handleDeleteHistory = () => {
    setMessages([]);
          localStorage.removeItem('chat_history');
  };

  const handleNameChange = (newName) => {
    setUser((prevUser) => ({ ...prevUser, name: newName }));
  };

  const handleEmailChange = (newEmail) => {
    setUser((prevUser) => ({ ...prevUser, email: newEmail }));
  };
  const recognitionRef = useRef(null);


  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const t = {
    title: 'AI Health Assistant',
    subtitle: 'Ask me anything about your health',
    placeholder: 'Describe your symptoms or ask a health question...', 
    newChat: 'New Chat',
    welcome: "Hi! I am Medikami, your health assistant. How can I help you today?"
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!isAuthenticated) {
              setProfileImage('/3.jpg');
    }
  }, [isAuthenticated]);

  





  const handleCopy = async (text, messageId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      
      
      setTimeout(() => {
        setCopiedMessageId(null);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      setCopiedMessageId(messageId);
      setTimeout(() => {
        setCopiedMessageId(null);
      }, 2000);
    }
  };

  useEffect(() => {
  
    if (messages.length === 0) {
      setMessages([
        {
          id: 1,
          text: t.welcome,
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString(),
          isTyping: false
        }
      ]);
    }
    try {
      const success = geminiAPIService.initialize();
      if (success) {
        console.log('✅ Gemini API initialized successfully in ChatInterface');
      } else {

      }
    } catch (error) {
      console.error('❌ Failed to initialize Gemini API:', error);
    }

  
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [t.welcome]);

  const startVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.start();
    } else {
      alert('Speech recognition is not supported in this browser.');
    }
  };

  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };



  const handleLogin = () => {
    if (onLoginRequest) {
      onLoginRequest();
    }
    setShowLoginPrompt(false);
  };

  const handleContinueWithoutLogin = () => {
    setShowLoginPrompt(false);
    setQuestionCount(0);
  };


  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const handleProfileEdit = () => {
    setShowProfileEditModal(true);
    setShowProfileDropdown(false);
  };

  const closeProfileEditModal = () => {
    setShowProfileEditModal(false);
  };


  const handleChatHistory = () => {
    setShowProfileDropdown(false);
  };

  const handleHelp = () => {
    setShowProfileDropdown(false);
  };

  const handleSettings = () => {
    setShowProfileDropdown(false);
  };


  const showMedikamiPopup = () => {
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
  };


  const openEmergencyModal = () => {
    setShowEmergencyModal(true);
  };

  const closeEmergencyModal = () => {
    setShowEmergencyModal(false);
  };



  const handleReadAloud = (messageId, text) => {
    if ('speechSynthesis' in window) {
      
      if (isSpeaking && speakingMessageId === messageId) {
        speechSynthesis.cancel();
        setIsSpeaking(false);
        setSpeakingMessageId(null);
        return;
      }
      
      
      if (isSpeaking) {
        speechSynthesis.cancel();
      }
      
     
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      utterance.onend = () => {
        setIsSpeaking(false);
        setSpeakingMessageId(null);
      };
      
      utterance.onerror = () => {
        setIsSpeaking(false);
        setSpeakingMessageId(null);
      };
      
      speechSynthesis.speak(utterance);
      setIsSpeaking(true);
      setSpeakingMessageId(messageId);
    } else {
      console.log('Text-to-speech is not available in your browser.');
    }
  };



  const handleSaveToLibrary = (messageId, text) => {
    
    console.log('Message saved to library:', messageId);
  };



  const checkQuestionLimit = () => {
    if (isAuthenticated) return;
    const userMessages = messages.filter(msg => msg.sender === 'user');
    if (userMessages.length >= 2 && !showLoginPrompt && !hasShownLoginPrompt) {
      setShowLoginPrompt(true);
      setHasShownLoginPrompt(true);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isGeneratingResponse) return;

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString(),
      isTyping: false
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    setIsGeneratingResponse(true);
    
    
    setTimeout(() => {
      checkQuestionLimit();
    }, 100);

    try {
      let aiResponse;

      
      try {
        if (geminiAPIService.isReady()) {
          aiResponse = await geminiAPIService.getHealthAdvice(inputValue, healthData);
        } else {
          

          
          aiResponse = await freeHealthAPIs.getHealthAdvice(inputValue);
        }
      } catch (error) {
        console.error('Gemini API error, falling back to free APIs:', error);
        
        aiResponse = await freeHealthAPIs.getHealthAdvice(inputValue);
      }

      const botMessage = {
        id: Date.now() + 1,
        text: aiResponse,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString(),
        isTyping: true
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString(),
        isTyping: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      setIsGeneratingResponse(false);
      
      
      if (messages.length === 2 && !hasShownPopup) {
        setTimeout(() => {
          showMedikamiPopup();
          setHasShownPopup(true);
        }, 1000); 
      }
    }
  };

  const handleTypingComplete = (messageId) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, isTyping: false } : msg
    ));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleNewChat = () => {
    setMessages([
      {
        id: Date.now(),
        text: t.welcome,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString(),
        isTyping: false
      }
    ]);
  };

  const quickActions = [
    { text: 'I have fever', action: 'I have fever, what should I do?' },
    { text: 'I have a cold', action: 'I have a cold, what should I do?' },
    { text: 'I have headache', action: 'I have a headache, what should I do?' },
    { text: 'Stomach problems', action: 'I have stomach problems, what should I do?' }
  ];

  const handleQuickAction = (action) => {
    setInputValue(action);
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      
      // Add a message about the uploaded file
      const newMessage = {
        id: Date.now(),
        sender: 'user',
        text: `📎 Uploaded file: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`,
        timestamp: new Date().toLocaleTimeString(),
        file: file
      };
      
      setMessages(prev => [...prev, newMessage]);
      
      // Automatically analyze the file and provide recommendations
      setTimeout(() => {
        analyzeUploadedFile(file);
      }, 1000);
      
      // Clear the input value
      e.target.value = '';
    }
  };

  const readFileContent = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        resolve(e.target.result);
      };
      
      reader.onerror = (error) => {
        reject(error);
      };
      
      if (file.type.includes('text') || file.type.includes('pdf')) {
        reader.readAsText(file);
      } else {
        // For images, we'll use a placeholder since OCR would require additional libraries
        resolve('Image file detected - analyzing visual content...');
      }
    });
  };

  const analyzeUploadedFile = async (file) => {
    setIsTyping(true);
    
    try {
      // Read and analyze the actual file content
      const fileContent = await readFileContent(file);
      let analysisResult = '';
      
      if (file.type.includes('image') || file.name.toLowerCase().includes('report') || file.name.toLowerCase().includes('lab')) {
        analysisResult = await analyzeMedicalReport(file, fileContent);
      } else if (file.type.includes('pdf') || file.name.toLowerCase().includes('prescription')) {
        analysisResult = await analyzePrescription(file, fileContent);
      } else {
        analysisResult = await analyzeGeneralFile(file, fileContent);
      }
      
      const botMessage = {
        id: Date.now() + 1,
        text: analysisResult,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString(),
        isTyping: false
      };
      
      setMessages(prev => [...prev, botMessage]);
      
    } catch (error) {
      console.error('Error analyzing file:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "I'm sorry, I couldn't analyze your file properly. Please try uploading a different file or ask me a specific question about your health.",
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString(),
        isTyping: false
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };
  const extractValues = (text, keywords) => {
    const values = [];
    keywords.forEach(keyword => {  
      const regex = new RegExp(`${keyword}\\s*[:=]?\\s*(\\d+(?:\\.\\d+)?)\\s*(\\w+)?\\s*(?:mg/dl|mg/dL|mg/dl|mmol/l|mmol/L|ng/ml|ng/mL|pg/ml|pg/mL|u/l|U/L|mIU/L|mmHg|%|kg|lbs|cm|inches)?`, 'gi');
      let match;
      while ((match = regex.exec(text)) !== null) {
        
        let unit = match[2] || '';
        if (!unit) { 
          const unitMatch = match[0].match(/(mg\/dl|mg\/dL|mmol\/l|mmol\/L|ng\/ml|ng\/mL|pg\/ml|pg\/mL|u\/l|U\/L|mIU\/L|mmHg|%|kg|lbs|cm|inches)/i);
          unit = unitMatch ? unitMatch[1] : '';
        }
        
        values.push({
          value: parseFloat(match[1]),
          unit: unit,
          keyword: keyword,
          fullMatch: match[0]
        });
      }
    });
    return values;
  };
  const interpretValue = (value, unit, testType) => {
    const ranges = {
      glucose: { normal: [70, 100], unit: 'mg/dL', condition: 'diabetes' },
      hba1c: { normal: [4, 5.7], unit: '%', condition: 'diabetes' },
      cholesterol: { normal: [0, 200], unit: 'mg/dL', condition: 'high cholesterol' },
      hdl: { normal: [40, 60], unit: 'mg/dL', condition: 'low hdl' },
      ldl: { normal: [0, 100], unit: 'mg/dL', condition: 'high ldl' },
      triglycerides: { normal: [0, 150], unit: 'mg/dL', condition: 'high triglycerides' },
      systolic: { normal: [90, 120], unit: 'mmHg', condition: 'hypertension' },
      diastolic: { normal: [60, 80], unit: 'mmHg', condition: 'hypertension' },
      hemoglobin: { normal: [12, 16], unit: 'g/dL', condition: 'anemia' },
      ferritin: { normal: [20, 300], unit: 'ng/mL', condition: 'iron deficiency' },
      vitaminD: { normal: [30, 100], unit: 'ng/mL', condition: 'vitamin d deficiency' },
      vitaminB12: { normal: [200, 900], unit: 'pg/mL', condition: 'vitamin b12 deficiency' },
      creatinine: { normal: [0.6, 1.2], unit: 'mg/dL', condition: 'kidney function' },
      alt: { normal: [7, 55], unit: 'U/L', condition: 'liver function' },
      ast: { normal: [8, 48], unit: 'U/L', condition: 'liver function' },
      tsh: { normal: [0.4, 4.0], unit: 'mIU/L', condition: 'thyroid function' },
      bun: { normal: [7, 20], unit: 'mg/dL', condition: 'kidney function' },
      egfr: { normal: [90, 120], unit: 'mL/min/1.73m²', condition: 'kidney function' },
      bilirubin: { normal: [0.3, 1.2], unit: 'mg/dL', condition: 'liver function' },
      t3: { normal: [80, 200], unit: 'ng/dL', condition: 'thyroid function' },
      t4: { normal: [0.8, 1.8], unit: 'ng/dL', condition: 'thyroid function' },
      hematocrit: { normal: [36, 46], unit: '%', condition: 'anemia' },
      wbc: { normal: [4.5, 11.0], unit: 'K/µL', condition: 'infection' },
      rbc: { normal: [4.5, 5.9], unit: 'M/µL', condition: 'anemia' },
      platelets: { normal: [150, 450], unit: 'K/µL', condition: 'bleeding disorder' },
      folate: { normal: [2.0, 20.0], unit: 'ng/mL', condition: 'folate deficiency' },
      iron: { normal: [60, 170], unit: 'µg/dL', condition: 'iron deficiency' },
      calcium: { normal: [8.5, 10.5], unit: 'mg/dL', condition: 'calcium imbalance' },
      magnesium: { normal: [1.7, 2.2], unit: 'mg/dL', condition: 'magnesium deficiency' },
      temperature: { normal: [97, 99], unit: '°F', condition: 'fever' },
      heartRate: { normal: [60, 100], unit: 'bpm', condition: 'heart rate abnormality' },
      oxygenSaturation: { normal: [95, 100], unit: '%', condition: 'oxygen deficiency' }
    };

    const range = ranges[testType];
    if (!range) return { status: 'unknown', condition: 'unknown' };

    if (value < range.normal[0]) {
      return { status: 'low', condition: range.condition, severity: 'moderate' };
    } else if (value > range.normal[1]) {
      return { status: 'high', condition: range.condition, severity: 'moderate' };
    } else {
      return { status: 'normal', condition: 'normal' };
    }
  };

  const analyzeMedicalReport = async (file, fileContent) => {
    try {
      if (geminiAPIService.isReady()) {
        return await geminiAPIService.analyzeMedicalReport(fileContent, file.name);
      }
    } catch (error) {
      console.error('Gemini API error for medical report analysis:', error);
    }

    const content = fileContent.toLowerCase();
    
    const medicalValues = {
      glucose: extractValues(content, ['glucose', 'blood sugar', 'fasting glucose', 'random glucose']),
      hba1c: extractValues(content, ['hba1c', 'a1c', 'glycated hemoglobin']),
      cholesterol: extractValues(content, ['total cholesterol', 'cholesterol total']),
      hdl: extractValues(content, ['hdl', 'high density lipoprotein', 'good cholesterol']),
      ldl: extractValues(content, ['ldl', 'low density lipoprotein', 'bad cholesterol']),
      triglycerides: extractValues(content, ['triglycerides', 'trig']),
      systolic: extractValues(content, ['systolic', 'systolic bp', 'systolic blood pressure']),
      diastolic: extractValues(content, ['diastolic', 'diastolic bp', 'diastolic blood pressure']),
      hemoglobin: extractValues(content, ['hemoglobin', 'hgb', 'hb']),
      ferritin: extractValues(content, ['ferritin', 'serum ferritin']),
      vitaminD: extractValues(content, ['vitamin d', '25-oh vitamin d', '25-hydroxyvitamin d']),
      vitaminB12: extractValues(content, ['vitamin b12', 'b12', 'cobalamin']),
      creatinine: extractValues(content, ['creatinine', 'serum creatinine']),
      alt: extractValues(content, ['alt', 'alanine aminotransferase', 'sgot']),
      ast: extractValues(content, ['ast', 'aspartate aminotransferase', 'sgpt']),
      tsh: extractValues(content, ['tsh', 'thyroid stimulating hormone']),
      bmi: extractValues(content, ['bmi', 'body mass index']),
      weight: extractValues(content, ['weight', 'body weight', 'kg', 'lbs']),
      height: extractValues(content, ['height', 'body height', 'cm', 'inches']),
      bun: extractValues(content, ['bun', 'blood urea nitrogen', 'urea nitrogen']),
      egfr: extractValues(content, ['egfr', 'gfr', 'estimated glomerular filtration rate']),
      bilirubin: extractValues(content, ['bilirubin', 'total bilirubin']),
      t3: extractValues(content, ['t3', 'triiodothyronine']),
      t4: extractValues(content, ['t4', 'thyroxine']),
      hematocrit: extractValues(content, ['hematocrit', 'hct']),
      wbc: extractValues(content, ['wbc', 'white blood cells', 'leukocytes']),
      rbc: extractValues(content, ['rbc', 'red blood cells', 'erythrocytes']),
      platelets: extractValues(content, ['platelets', 'thrombocytes']),
      folate: extractValues(content, ['folate', 'folic acid', 'vitamin b9']),
      iron: extractValues(content, ['iron', 'serum iron']),
      calcium: extractValues(content, ['calcium', 'serum calcium']),
      magnesium: extractValues(content, ['magnesium', 'serum magnesium']),
      temperature: extractValues(content, ['temperature', 'temp', 'fever']),
      heartRate: extractValues(content, ['heart rate', 'pulse', 'hr', 'bpm']),
      oxygenSaturation: extractValues(content, ['oxygen saturation', 'o2 sat', 'spo2'])
    };

    const analysis = {};
    const detectedConditions = [];
    const abnormalValues = [];

    Object.keys(medicalValues).forEach(testType => {
      if (medicalValues[testType].length > 0) {
        const value = medicalValues[testType][0];
        const interpretation = interpretValue(value.value, value.unit, testType);
        
        analysis[testType] = {
          value: value.value,
          unit: value.unit,
          status: interpretation.status,
          condition: interpretation.condition,
          severity: interpretation.severity
        };

        if (interpretation.status !== 'normal') {
          abnormalValues.push({
            test: testType,
            value: value.value,
            unit: value.unit,
            status: interpretation.status,
            condition: interpretation.condition
          });
          
          if (!detectedConditions.includes(interpretation.condition)) {
            detectedConditions.push(interpretation.condition);
          }
        }
      }
    });

    if (detectedConditions.length === 0) {
      detectedConditions.push('general health');
    }
    const generateValueSpecificDiet = (testType, value, status) => {
      const diets = {
        glucose: {
          high: ['🍎 **Low Glycemic Index Foods**: Whole grains, legumes, vegetables', '🥗 **High Fiber Diet**: 25-30g daily', '🐟 **Lean Proteins**: Fish, chicken, legumes', '🚫 **Avoid**: Refined sugars, white bread, sugary beverages'],
          low: ['🍯 **Complex Carbohydrates**: Whole grains, sweet potatoes, quinoa', '🥛 **Protein-Rich Foods**: Greek yogurt, eggs, lean meats', '⏰ **Frequent Small Meals**: Eat every 2-3 hours', '🚫 **Avoid**: Skipping meals, excessive alcohol']
        },
        hba1c: {
          high: ['🍎 **Low Glycemic Index Foods**: Whole grains, legumes, vegetables', '🥗 **High Fiber Diet**: 25-30g daily', '🐟 **Lean Proteins**: Fish, chicken, legumes', '🚫 **Avoid**: Refined sugars, white bread, sugary beverages']
        },
        cholesterol: {
          high: ['🌾 **Soluble Fiber**: Oats, barley, beans, apples (10-25g daily)', '🐟 **Omega-3 Rich Fish**: Salmon, mackerel, sardines', '🥑 **Monounsaturated Fats**: Olive oil, avocados, nuts', '🚫 **Avoid**: Trans fats, saturated fats, fried foods']
        },
        hdl: {
          low: ['🐟 **Omega-3 Fatty Acids**: Fatty fish, walnuts, flaxseeds', '🥜 **Monounsaturated Fats**: Olive oil, avocados, nuts', '🏃‍♂️ **Exercise**: Regular cardio exercise to raise HDL', '🚫 **Avoid**: Trans fats, excessive alcohol']
        },
        ldl: {
          high: ['🌾 **Soluble Fiber**: Oats, barley, beans, apples (10-25g daily)', '🐟 **Omega-3 Rich Fish**: Salmon, mackerel, sardines', '🚫 **Avoid**: Trans fats, saturated fats, fried foods']
        },
        triglycerides: {
          high: ['🚫 **Limit Simple Sugars**: Avoid sugary drinks, candies, desserts', '🌾 **Choose Complex Carbs**: Whole grains, legumes, vegetables', '🐟 **Omega-3 Fatty Acids**: Fatty fish, walnuts, flaxseeds', '🏃‍♂️ **Exercise**: Regular cardio exercise to lower triglycerides']
        },
        systolic: {
          high: ['🧂 **Low Sodium Diet**: Limit salt to 1,500-2,300mg daily', '🥬 **DASH Diet**: Fruits, vegetables, low-fat dairy', '🍌 **Potassium-Rich Foods**: Bananas, spinach, sweet potatoes', '🚫 **Avoid**: Processed foods, salty snacks']
        },
        diastolic: {
          high: ['🧂 **Low Sodium Diet**: Limit salt to 1,500-2,300mg daily', '🥬 **DASH Diet**: Fruits, vegetables, low-fat dairy', '🍌 **Potassium-Rich Foods**: Bananas, spinach, sweet potatoes', '🚫 **Avoid**: Processed foods, salty snacks']
        },
        hemoglobin: {
          low: ['🥩 **Heme Iron Sources**: Red meat, poultry, fish (2-3 servings weekly)', '🥬 **Non-Heme Iron**: Spinach, lentils, beans, fortified cereals', '🍊 **Vitamin C**: Citrus fruits, bell peppers (enhances iron absorption)', '🚫 **Avoid**: Coffee/tea with meals (inhibits iron absorption)']
        },
        ferritin: {
          low: ['🥩 **Heme Iron Sources**: Red meat, poultry, fish (2-3 servings weekly)', '🥬 **Non-Heme Iron**: Spinach, lentils, beans, fortified cereals', '🍊 **Vitamin C**: Citrus fruits, bell peppers (enhances iron absorption)', '🚫 **Avoid**: Coffee/tea with meals (inhibits iron absorption)']
        },
        vitaminD: {
          low: ['🌞 **Vitamin D Foods**: Fatty fish, egg yolks, fortified dairy', '☀️ **Sunlight Exposure**: 10-30 minutes daily (with sunscreen)', '🥛 **Fortified Foods**: Milk, orange juice, cereals', '💊 **Consider**: Vitamin D supplements as recommended']
        },
        vitaminB12: {
          low: ['🥩 **Animal Sources**: Meat, fish, dairy, eggs', '🥛 **Fortified Foods**: Plant milks, cereals, nutritional yeast', '💊 **Consider**: B12 supplements or injections', '🏥 **Medical Evaluation**: Check for absorption issues']
        }
      };

      return diets[testType]?.[status] || [
        '🥗 **Balanced Diet**: Eat a variety of fruits, vegetables, whole grains, and lean proteins',
        '💧 **Hydration**: Drink 8-10 glasses of water daily',
        '🏃‍♂️ **Exercise**: Regular physical activity',
        '😴 **Sleep**: 7-9 hours nightly'
      ];
    };

    const comprehensiveRecommendations = {
      diabetes: {
        condition: 'Diabetes',
        description: '🔬 **Medical Report Analysis: Diabetes Indicators Detected**\n\nBased on your medical report, I can see indicators of diabetes. Here\'s comprehensive management advice:',
        diet: [
          '🍎 **Low Glycemic Index Foods**: Choose whole grains, legumes, and non-starchy vegetables',
          '🥗 **High Fiber Diet**: Include 25-30g of fiber daily from vegetables, fruits, and whole grains',
          '🐟 **Lean Proteins**: Fish, chicken, tofu, and legumes (2-3 servings daily)',
          '🥑 **Healthy Fats**: Avocados, nuts, olive oil (limit saturated fats)',
          '🚫 **Avoid**: Refined sugars, white bread, sugary beverages, processed foods',
          '⏰ **Meal Timing**: Eat at regular intervals, don\'t skip meals',
          '💧 **Hydration**: Drink 8-10 glasses of water daily'
        ],
        medications: [
          '💊 **Prescription Medications**: Metformin, Sulfonylureas (as prescribed by doctor)',
          '🩸 **Blood Glucose Monitoring**: Check levels regularly as recommended',
          '📊 **HbA1c Testing**: Regular monitoring every 3-6 months'
        ],
        lifestyle: [
          '🏃‍♂️ **Exercise**: 30 minutes daily, mix cardio and strength training',
          '😴 **Sleep**: 7-9 hours nightly for blood sugar regulation',
          '🧘‍♀️ **Stress Management**: Meditation, yoga, deep breathing',
          '👣 **Foot Care**: Daily inspection, proper footwear, regular checkups'
        ],
        warningSigns: [
          '🚨 **Very high or very low blood sugar**',
          '🚨 **Ketones in urine**',
          '🚨 **Severe dehydration**',
          '🚨 **Confusion or altered mental status**'
        ]
      },
      hypertension: {
        condition: 'Hypertension (High Blood Pressure)',
        description: '🔬 **Medical Report Analysis: High Blood Pressure Detected**\n\nYour medical report indicates high blood pressure. Here\'s comprehensive management advice:',
        diet: [
          '🧂 **Low Sodium Diet**: Limit salt to 1,500-2,300mg daily',
          '🥬 **DASH Diet**: Fruits, vegetables, low-fat dairy',
          '🍌 **Potassium-Rich Foods**: Bananas, spinach, sweet potatoes',
          '🐟 **Omega-3 Fatty Acids**: Fatty fish 2-3 times per week',
          '🚫 **Avoid**: Processed foods, salty snacks'
        ],
        medications: [
          '💊 **Prescription Medications**: As prescribed by your doctor',
          '📊 **Regular Monitoring**: Blood pressure checks as recommended'
        ],
        lifestyle: [
          '🏃‍♂️ **Exercise**: 150 minutes moderate exercise weekly',
          '🧘‍♀️ **Stress Reduction**: Meditation, deep breathing, yoga',
          '🚭 **Quit Smoking**: Essential for blood pressure control'
        ],
        warningSigns: [
          '🚨 **Blood pressure above 180/120**',
          '🚨 **Severe headache with high BP**',
          '🚨 **Chest pain or shortness of breath**'
        ]
      },
      'high cholesterol': {
        condition: 'High Cholesterol',
        description: '🔬 **Medical Report Analysis: Elevated Cholesterol Detected**\n\nYour cholesterol levels are elevated. Here\'s comprehensive management advice:',
        diet: [
          '🌾 **Soluble Fiber**: Oats, barley, beans, apples (10-25g daily)',
          '🐟 **Omega-3 Rich Fish**: Salmon, mackerel, sardines (2-3 servings/week)',
          '🥑 **Monounsaturated Fats**: Olive oil, avocados, nuts',
          '🚫 **Avoid**: Trans fats, saturated fats, fried foods'
        ],
        medications: [
          '💊 **Prescription Medications**: As prescribed by your doctor',
          '📊 **Regular Monitoring**: Lipid panel every 3-6 months'
        ],
        lifestyle: [
          '🏃‍♂️ **Cardio Exercise**: 150 minutes weekly',
          '💪 **Strength Training**: 2-3 sessions weekly',
          '🚭 **Quit Smoking**: Improves cholesterol profile'
        ],
        warningSigns: [
          '🚨 **Chest pain or angina**',
          '🚨 **Shortness of breath**',
          '🚨 **Pain in arms, neck, jaw**'
        ]
      },

    };
    
    // Generate personalized recommendations based on detected conditions and values
    let analysisResult = `🔬 **Medical Report Analysis Complete**

**📋 Detected Health Indicators:**
${detectedConditions.map(condition => `• ${condition.charAt(0).toUpperCase() + condition.slice(1)}`).join('\n')}

**📊 Abnormal Test Results:**
${abnormalValues.length > 0 ? abnormalValues.map(item => 
  `• ${item.test.toUpperCase()}: ${item.value} ${item.unit} (${item.status.toUpperCase()})`
).join('\n') : '• All detected values are within normal ranges'}

**📄 File Analysis Summary:**
I've analyzed your medical report and identified the following health indicators. Here's personalized advice based on your specific results:`;

    // Add value-specific recommendations
    if (abnormalValues.length > 0) {
      analysisResult += `\n\n**🥗 Value-Specific Dietary Recommendations:**

${abnormalValues.map(item => {
  const dietRecommendations = generateValueSpecificDiet(item.test, item.value, item.status);
  return `**${item.test.toUpperCase()} (${item.value} ${item.unit} - ${item.status.toUpperCase()}):**
${dietRecommendations.map(rec => `• ${rec}`).join('\n')}`;
}).join('\n\n')}`;
    }

    // Add general condition recommendations
    detectedConditions.forEach(condition => {
      if (comprehensiveRecommendations[condition]) {
        const recommendation = comprehensiveRecommendations[condition];
        analysisResult += `\n\n**🏥 ${recommendation.condition} Management:**

**🥗 Dietary Recommendations:**
${recommendation.diet.map(item => `• ${item}`).join('\n')}

**💊 Medication & Supplement Guidance:**
${recommendation.medications.map(item => `• ${item}`).join('\n')}

**🏃‍♂️ Lifestyle & Exercise Recommendations:**
${recommendation.lifestyle.map(item => `• ${item}`).join('\n')}

**🚨 When to Seek Immediate Medical Attention:**
${recommendation.warningSigns.map(item => `• ${item}`).join('\n')}`;
      }
    });

    // Add general recommendations if no specific conditions detected
    if (detectedConditions.includes('general health')) {
      analysisResult += `\n\n**🏥 General Health Recommendations:**

**🥗 Balanced Diet:**
• Eat a variety of fruits and vegetables (5-9 servings daily)
• Choose whole grains over refined grains
• Include lean proteins and healthy fats
• Stay hydrated with 8-10 glasses of water daily

**💊 General Supplements:**
• Consider a daily multivitamin
• Omega-3 supplements for heart health
• Vitamin D if limited sun exposure

**🏃‍♂️ Lifestyle:**
• Exercise 150 minutes weekly
• Get 7-9 hours of sleep nightly
• Manage stress through meditation or yoga
• Regular health checkups`;
    }

    analysisResult += `\n\n**📋 Next Steps:**
• Schedule follow-up with your healthcare provider
• Consider consultation with a registered dietitian
• Monitor your progress regularly
• Keep a health journal to track improvements

**⚠️ Important Note:** These recommendations are based on your specific medical report analysis. Always consult with your healthcare provider for personalized advice tailored to your specific health needs and medical history.`;

    return analysisResult;
  };

  const analyzePrescription = async (file, fileContent) => {
    // Try to use Gemini API first for prescription analysis
    try {
      if (geminiAPIService.isReady()) {
        return await geminiAPIService.analyzePrescription(fileContent, file.name);
      }
    } catch (error) {
      console.error('Gemini API error for prescription analysis:', error);
    }

    // Fallback to manual analysis if Gemini fails
    const content = fileContent.toLowerCase();
    
    // Detect medications and conditions from prescription
    const detectedMedications = [];
    const detectedConditions = [];
    
    // Common medication detection
    if (content.includes('metformin') || content.includes('glucophage')) {
      detectedMedications.push('Metformin (Diabetes medication)');
      detectedConditions.push('diabetes');
    }
    if (content.includes('lisinopril') || content.includes('enalapril') || content.includes('ramipril')) {
      detectedMedications.push('ACE Inhibitor (Blood pressure medication)');
      detectedConditions.push('hypertension');
    }
    if (content.includes('atorvastatin') || content.includes('simvastatin') || content.includes('rosuvastatin')) {
      detectedMedications.push('Statin (Cholesterol medication)');
      detectedConditions.push('high cholesterol');
    }
    if (content.includes('amlodipine') || content.includes('nifedipine') || content.includes('diltiazem')) {
      detectedMedications.push('Calcium Channel Blocker (Blood pressure medication)');
      detectedConditions.push('hypertension');
    }
    if (content.includes('hydrochlorothiazide') || content.includes('furosemide') || content.includes('spironolactone')) {
      detectedMedications.push('Diuretic (Water pill)');
      detectedConditions.push('hypertension');
    }
    if (content.includes('ferrous') || content.includes('iron')) {
      detectedMedications.push('Iron Supplement');
      detectedConditions.push('anemia');
    }
    if (content.includes('vitamin d') || content.includes('vitamin b12')) {
      detectedMedications.push('Vitamin Supplement');
      detectedConditions.push('vitamin deficiency');
    }
    
    // If no specific medications detected, provide general guidance
    if (detectedMedications.length === 0) {
      detectedMedications.push('Prescribed medications (specific names not detected)');
    }
    
    return `💊 **Prescription Analysis Complete**

**📋 Detected Medications:**
${detectedMedications.map(med => `• ${med}`).join('\n')}

**🏥 Associated Health Conditions:**
${detectedConditions.length > 0 ? detectedConditions.map(condition => `• ${condition.charAt(0).toUpperCase() + condition.slice(1)}`).join('\n') : '• General health management'}

**💊 Medication Management Guidelines:**
• **Take medications exactly as prescribed** - follow dosage and timing instructions
• **Don't skip doses** - set reminders if needed
• **Store properly** - keep in cool, dry place away from children
• **Check expiration dates** - discard expired medications safely
• **Don't share medications** - they're prescribed specifically for you

**🍽️ Dietary Considerations:**
• **Take with food** unless specifically instructed otherwise
• **Avoid grapefruit and grapefruit juice** (interacts with many medications)
• **Stay hydrated** with plenty of water (8-10 glasses daily)
• **Maintain balanced diet** rich in fruits, vegetables, and whole grains
• **Limit alcohol** - can interact with many medications
• **Avoid high-fat meals** with certain medications (check with pharmacist)

**🚨 Common Drug-Food Interactions:**
• **Blood thinners**: Limit vitamin K foods (leafy greens)
• **Blood pressure meds**: Avoid high-sodium foods
• **Diabetes medications**: Monitor carbohydrate intake
• **Antibiotics**: Take on empty stomach unless directed otherwise
• **Iron supplements**: Take with vitamin C, avoid dairy

**⚠️ Warning Signs to Watch For:**
• **Allergic reactions**: Rash, swelling, difficulty breathing
• **Side effects**: Nausea, dizziness, unusual fatigue
• **Drug interactions**: New symptoms after starting medication
• **Overdose symptoms**: Confusion, severe drowsiness, irregular heartbeat

**📋 Next Steps:**
• **Consult your pharmacist** about specific drug-food interactions
• **Schedule follow-up** with your healthcare provider
• **Keep a medication diary** to track side effects
• **Ask about generic alternatives** to reduce costs
• **Review medications annually** with your doctor

**📞 Important Contacts:**
• **Your Doctor**: For medical questions and dosage adjustments
• **Your Pharmacist**: For drug interactions and side effects
• **Emergency**: 911 for severe allergic reactions or overdose

**⚠️ Important:** Always follow your doctor's specific instructions. This analysis is based on your prescription content. Consult healthcare professionals for personalized advice.`;
  };

  const analyzeGeneralFile = async (file, fileContent) => {
    return `📄 **File Analysis Complete**

I've received your file: "${file.name}"

**🔍 What I can help you with:**
• Medical report analysis and dietary recommendations
• Health question answers
• Lifestyle and nutrition advice

**💬 How to get the most from our conversation:**
• Ask specific questions about your health concerns
• Upload medical reports, lab results, or prescriptions
• Request personalized diet plans

Feel free to ask me any health-related questions, and I'll provide detailed, personalized recommendations!`;
  };

  return (
    <div className="chat-interface premium-dark">
      <div className="chat-header">
        <div className="header-left">
          <button 
            className="emergency-btn" 
            onClick={openEmergencyModal}
            title="Emergency Help"
          >
            🚨 Emergency
          </button>
          <span className="medikami-mobile mobile-only"></span>
        </div>
        <div className="chat-title">
          <h2>Medikami</h2>
          <p>{t.subtitle}</p>
        </div>
        <div className="header-actions">
          {isAuthenticated ? (
            <div className="user-profile">
              <div className="profile-icon-container" onClick={toggleProfileDropdown}>
                <img src={profileImage} alt="Profile" className="profile-icon" />
              </div>
              {showProfileDropdown && (
                <div className="profile-dropdown">
                  <div className="dropdown-header">
                    <div className="user-info">
                      <img src={profileImage} alt="Profile" className="dropdown-profile-img" />
                      <div className="user-details">
                        <div className="user-name">{user.name}</div>
                        <div className="user-email">{user.email}</div>
                      </div>
                    </div>
                  </div>
                  <div className="dropdown-menu">
                    {/* Edit Profile option removed */}
                    <button className="dropdown-item" onClick={handleChatHistory}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                      </svg>
                      Chat History
                    </button>
                    <button className="dropdown-item" onClick={handleHelp}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                      </svg>
                      Help & Support
                    </button>
                    <button className="dropdown-item" onClick={handleSettings}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                      </svg>
                      Settings
                    </button>
                    <div className="dropdown-divider"></div>
                    <button className="dropdown-item logout-item" onClick={onLogout}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16,17 21,12 16,7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                      </svg>
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button 
              className="sign-in-btn"
              onClick={handleLogin}
              title="Sign In"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              Sign In
            </button>
          )}
        </div>
      </div>



      <div className="chat-container">
        <div className="chat-messages">
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.sender}`}>
              {message.sender === 'user' && (
                <div className="message-avatar">
                  <div className="user-avatar">👤</div>
                </div>
              )}
              
              {message.sender === 'bot' ? (
              
                <div className="message-content">

                  <div className="ai-profile">
                    <img src="/4.jpg" alt="Medikami AI" className="ai-logo" />
                  </div>
                  
                  {message.isTyping ? (
                    <TypewriterText 
                      text={message.text}
                      speed={10}
                      onComplete={() => handleTypingComplete(message.id)}
                      onCopy={(text) => handleCopy(text, message.id)}
                    />
                  ) : (
                    <>
                      <div className="message-content-wrapper">
                        <div 
                          className="message-text"
                          dangerouslySetInnerHTML={formatMessage(message.text)}
                        />
                      </div>
                      
    
                      {message.sender === 'bot' && !message.isTyping && message.text && message.text.trim().length > 0 && messages.some((msg, index) => msg.sender === 'user' && index < messages.findIndex(m => m.id === message.id)) && (
                        <MessageActions
                          messageId={message.id}
                          text={message.text}
                          onReadAloud={handleReadAloud}
                          onSave={handleSaveToLibrary}
                          isSpeaking={isSpeaking && speakingMessageId === message.id}
                        />
                      )}
                    </>
                  )}
                  
                  <div className="message-time">{message.timestamp}</div>
                </div>
              ) : (
                
                <div className="message-content">
                  <div 
                    className="message-text"
                    dangerouslySetInnerHTML={formatMessage(message.text)}
                  />
                  <div className="message-time">{message.timestamp}</div>
                </div>
              )}
            </div>
          ))}
          
          {isTyping && (
            <div className="message bot">
              <div className="message-content">
                <div className="typing-indicator">
                  <div className="pulse-heart">💓</div>
                  <span>Analyzing your health query...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Login Prompt */}
        {showLoginPrompt && (
          <>
            <div className="login-overlay"></div>
            <div className="login-prompt">
              <h3>Thanks for trying Medikami</h3>
              <p className="login-subtitle">Log in or Sign up to get smarter responses, upload files and images, and more.</p>
              
              <div className="login-buttons">
                <button className="login-btn-primary" onClick={handleLogin}>
                  <ShinyText text="Log in" />
                </button>
                <button className="signup-btn" onClick={handleLogin}>
                  Sign up for free
                </button>
                <button className="stay-logged-out-btn" onClick={handleContinueWithoutLogin}>
                  Stay logged out
                </button>
              </div>
            </div>
          </>
        )}

        
        {showEmergencyModal && (
          <>
            <div className="emergency-overlay" onClick={closeEmergencyModal}></div>
            <div className="emergency-modal" role="dialog" aria-modal="true">
              <div className="emergency-header">
                <h3 className="emergency-title">Medical Emergency</h3>
                <button className="emergency-close" onClick={closeEmergencyModal} aria-label="Close emergency dialog">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              <div className="emergency-content">
                <div className="emergency-number">Ambulance - 108</div>
                <p className="emergency-subtitle">Tap the button below to call an ambulance immediately.</p>
              </div>
              <div className="emergency-actions">
                <a className="call-btn" href="tel:108">
                  Call 108 Now
                </a>
              </div>
            </div>
          </>
        )}

        
        {showPopup && (
          <>
            <div className="popup-overlay" onClick={closePopup}></div>
            <div className="popup-modal">
              <div className="popup-header">
                <h3 className="popup-title">Thanks for using Medikami</h3>
                <button className="popup-close" onClick={closePopup}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              <div className="popup-content">
                <p>Log in or sign up to get smarter responses, upload files and images, and more.</p>
              </div>
              <div className="popup-footer">
                <button className="popup-btn popup-btn-primary" onClick={handleLogin}>
                  Log in
                </button>
                <button className="popup-btn popup-btn-secondary" onClick={handleLogin}>
                  Sign up for free
                </button>
                <button className="popup-btn popup-btn-tertiary" onClick={closePopup}>
                  Stay logged out
                </button>
              </div>
            </div>
          </>
        )}


      </div>

      {messages.length === 1 && (
        <div className="quick-actions">
          {quickActions.map((action, index) => (
            <button
              key={index}
              className="quick-action-btn"
              onClick={() => handleQuickAction(action.action)}
            >
              {action.text}
            </button>
          ))}
        </div>
      )}

      <div className="chat-input">
        <div className="input-container">
          <button 
            className="attach-btn" 
            onClick={() => document.getElementById('file-input').click()}
            disabled={isGeneratingResponse}
          >
            <img src="/1.jpg" alt="Attach" className="attach-btn-icon" />
          </button>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isGeneratingResponse ? "Generating response..." : "Ask anything"}
            className="chat-input-field"
            disabled={isGeneratingResponse}
          />
          <button 
            className={`voice-btn ${isListening ? 'listening' : ''}`}
            onClick={isListening ? stopVoiceInput : startVoiceInput}
            title="Click to speak"
            disabled={isGeneratingResponse}
          >
            <img src="/2.jpg" alt="Voice" className="voice-btn-icon" />
          </button>
          <button 
            className="send-btn"
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isGeneratingResponse}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <input
          id="file-input"
          type="file"
          accept="*/*"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />
      </div>

      
      {showProfileEditModal && (
        <ProfileEditModal
          isOpen={showProfileEditModal}
          user={user}
          onNameChange={handleNameChange}
          onEmailChange={handleEmailChange}
          onLogout={onLogout}
          onDeleteHistory={handleDeleteHistory}
          onClose={closeProfileEditModal}
          onImageChange={handleImageChange}
          profileImage={profileImage}
        />
      )}
    </div>
  );
};

export default ChatInterface; 