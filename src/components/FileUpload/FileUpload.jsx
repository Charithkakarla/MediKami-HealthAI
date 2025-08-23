import React, { useState, useRef, useEffect } from 'react';
import './FileUpload.css';

const FileUpload = ({ onFileUpload, isAnalyzing, currentLanguage }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [showHelpDropdown, setShowHelpDropdown] = useState(false);
  const fileInputRef = useRef(null);
  const helpDropdownRef = useRef(null);

  const translations = {
    en: {
      title: 'Upload Your Files',
      subtitle: 'Upload any type of file for analysis and processing',
      dragText: '📁 Click here to upload your file',
      dragTextAlt: 'or drag and drop your file here',
      supportedFormats: 'All file formats supported',
      analyzing: 'Analyzing your file...',
      uploadSuccess: 'File uploaded successfully!',
      uploadError: 'Error uploading file. Please try again.',
      uploadButton: 'Choose File',
      changeFile: 'Change File',
      fileSize: 'File size should be less than 50MB',
      step1: 'Step 1: Click the button below',
      step2: 'Step 2: Select your file',
      step3: 'Step 3: Wait for analysis',
      help: 'Help & Support',
      history: 'Upload History',
      contact: 'Contact Us',
      faq: 'FAQ',
      noHistory: 'No upload history found',
      contactInfo: 'Contact Information',
      email: 'Email: support@fileupload.com',
      phone: 'Phone: +1 (555) 123-4567',
      hours: 'Hours: Mon-Fri 9AM-6PM EST',
      faqTitle: 'Frequently Asked Questions',
      faq1: 'What file types are supported?',
      faq1Answer: 'We support all file formats including documents, images, videos, audio, and more.',
      faq2: 'How long does analysis take?',
      faq2Answer: 'Analysis typically takes 30-60 seconds depending on file size and type.',
      faq3: 'Is my data secure?',
      faq3Answer: 'Yes, we use industry-standard encryption and never store your personal information.'
    },
    hi: {
      title: 'अपनी फ़ाइलें अपलोड करें',
      subtitle: 'विश्लेषण और प्रसंस्करण के लिए किसी भी प्रकार की फ़ाइल अपलोड करें',
      dragText: '📁 अपनी फ़ाइल अपलोड करने के लिए यहाँ क्लिक करें',
      dragTextAlt: 'या अपनी फ़ाइल यहाँ खींचें और छोड़ें',
      supportedFormats: 'सभी फ़ाइल प्रारूप समर्थित',
      analyzing: 'आपकी फ़ाइल का विश्लेषण कर रहा है...',
      uploadSuccess: 'फ़ाइल सफलतापूर्वक अपलोड की गई!',
      uploadError: 'फ़ाइल अपलोड करने में त्रुटि। कृपया पुनः प्रयास करें।',
      uploadButton: 'फ़ाइल चुनें',
      changeFile: 'फ़ाइल बदलें',
      fileSize: 'फ़ाइल का आकार 50MB से कम होना चाहिए',
      step1: 'चरण 1: नीचे दिए गए बटन पर क्लिक करें',
      step2: 'चरण 2: अपनी फ़ाइल चुनें',
      step3: 'चरण 3: विश्लेषण का इंतजार करें',
      help: 'सहायता और समर्थन',
      history: 'अपलोड इतिहास',
      contact: 'संपर्क करें',
      faq: 'सामान्य प्रश्न',
      noHistory: 'कोई अपलोड इतिहास नहीं मिला',
      contactInfo: 'संपर्क जानकारी',
      email: 'ईमेल: support@fileupload.com',
      phone: 'फोन: +1 (555) 123-4567',
      hours: 'समय: सोम-शुक्र सुबह 9 बजे-शाम 6 बजे EST',
      faqTitle: 'अक्सर पूछे जाने वाले प्रश्न',
      faq1: 'कौन सी फ़ाइल प्रकार समर्थित हैं?',
      faq1Answer: 'हम दस्तावेज़, छवियों, वीडियो, ऑडियो और अधिक सहित सभी फ़ाइल प्रारूपों का समर्थन करते हैं।',
      faq2: 'विश्लेषण में कितना समय लगता है?',
      faq2Answer: 'फ़ाइल के आकार और प्रकार के आधार पर विश्लेषण में आमतौर पर 30-60 सेकंड लगते हैं।',
      faq3: 'क्या मेरा डेटा सुरक्षित है?',
      faq3Answer: 'हां, हम उद्योग-मानक एन्क्रिप्शन का उपयोग करते हैं और आपकी व्यक्तिगत जानकारी कभी संग्रहित नहीं करते।'
    },
    ta: {
      title: 'உங்கள் கோப்புகளை பதிவேற்று',
      subtitle: 'பகுப்பாய்வு மற்றும் செயலாக்கத்திற்காக எந்த வகையான கோப்பையும் பதிவேற்று',
      dragText: '📁 உங்கள் கோப்பை பதிவேற்ற கிளிக் செய்யவும்',
      dragTextAlt: 'அல்லது உங்கள் கோப்பை இங்கே இழுத்து விடுங்கள்',
      supportedFormats: 'அனைத்து கோப்பு வடிவங்களும் ஆதரிக்கப்படுகின்றன',
      analyzing: 'உங்கள் கோப்பை பகுப்பாய்வு செய்கிறது...',
      uploadSuccess: 'கோப்பு வெற்றிகரமாக பதிவேற்றப்பட்டது!',
      uploadError: 'கோப்பு பதிவேற்றுவதில் பிழை. மீண்டும் முயற்சிக்கவும்.',
      uploadButton: 'கோப்பைத் தேர்ந்தெடுக்கவும்',
      changeFile: 'கோப்பை மாற்றவும்',
      fileSize: 'கோப்பு அளவு 50MB க்கும் குறைவாக இருக்க வேண்டும்',
      step1: 'படி 1: கீழே உள்ள பொத்தானைக் கிளிக் செய்யவும்',
      step2: 'படி 2: உங்கள் கோப்பைத் தேர்ந்தெடுக்கவும்',
      step3: 'படி 3: பகுப்பாய்வுக்காக காத்திருக்கவும்',
      help: 'உதவி மற்றும் ஆதரவு',
      history: 'பதிவேற்ற வரலாறு',
      contact: 'எங்களை தொடர்பு கொள்ளவும்',
      faq: 'அடிக்கடி கேட்கப்படும் கேள்விகள்',
      noHistory: 'பதிவேற்ற வரலாறு எதுவும் கிடைக்கவில்லை',
      contactInfo: 'தொடர்பு தகவல்',
      email: 'மின்னஞ்சல்: support@fileupload.com',
      phone: 'தொலைபேசி: +1 (555) 123-4567',
      hours: 'நேரம்: திங்கள்-வெள்ளி காலை 9 மணி-மாலை 6 மணி EST',
      faqTitle: 'அடிக்கடி கேட்கப்படும் கேள்விகள்',
      faq1: 'எந்த கோப்பு வகைகள் ஆதரிக்கப்படுகின்றன?',
      faq1Answer: 'நாங்கள் ஆவணங்கள், படங்கள், வீடியோக்கள், ஆடியோ மற்றும் பலவற்றை உள்ளடக்கிய அனைத்து கோப்பு வடிவங்களையும் ஆதரிக்கிறோம்.',
      faq2: 'பகுப்பாய்வுக்கு எவ்வளவு நேரம் எடுக்கும்?',
      faq2Answer: 'கோப்பு அளவு மற்றும் வகையைப் பொறுத்து பகுப்பாய்வு பொதுவாக 30-60 வினாடிகள் எடுக்கும்.',
      faq3: 'எனது தரவு பாதுகாப்பானதா?',
      faq3Answer: 'ஆம், நாங்கள் தொழில்-தர குறியாக்கத்தைப் பயன்படுத்துகிறோம் மற்றும் உங்கள் தனிப்பட்ட தகவல்களை ஒருபோதும் சேமிக்கவில்லை.'
    }
  };

  const t = translations[currentLanguage] || translations.en;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (helpDropdownRef.current && !helpDropdownRef.current.contains(event.target)) {
        setShowHelpDropdown(false);
      }
    };

    if (showHelpDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showHelpDropdown]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    // Accept all file types
    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      alert('File size should be less than 50MB');
      return;
    }

    setUploadedFile(file);
    onFileUpload(file);
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="file-upload-container">
      <div className="upload-header">
        <div className="header-top">
          <h2>{t.title}</h2>
          <div className="help-dropdown" ref={helpDropdownRef}>
            <button 
              className="help-button"
              onClick={() => setShowHelpDropdown(!showHelpDropdown)}
            >
              ❓ {t.help}
            </button>
            {showHelpDropdown && (
              <div className="help-dropdown-content">
                <div className="help-section">
                  <h4>📋 {t.history}</h4>
                  <p className="no-history">{t.noHistory}</p>
                </div>
                <div className="help-section">
                  <h4>📞 {t.contactInfo}</h4>
                  <p>{t.email}</p>
                  <p>{t.phone}</p>
                  <p>{t.hours}</p>
                </div>
                <div className="help-section">
                  <h4>❓ {t.faqTitle}</h4>
                  <div className="faq-item">
                    <strong>{t.faq1}</strong>
                    <p>{t.faq1Answer}</p>
                  </div>
                  <div className="faq-item">
                    <strong>{t.faq2}</strong>
                    <p>{t.faq2Answer}</p>
                  </div>
                  <div className="faq-item">
                    <strong>{t.faq3}</strong>
                    <p>{t.faq3Answer}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <p>{t.subtitle}</p>
      </div>

      <div 
        className={`upload-area ${dragActive ? 'drag-active' : ''} ${uploadedFile ? 'has-file' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="*/*"
          onChange={handleFileInput}
          style={{ display: 'none' }}
        />
        
        {isAnalyzing ? (
          <div className="analyzing">
            <div className="spinner"></div>
            <h3>{t.analyzing}</h3>
            <p>Please wait while we process your file...</p>
          </div>
        ) : uploadedFile ? (
          <div className="file-info">
            <div className="file-icon">
              <img src="/1.jpg" alt="File uploaded" className="file-icon-image" />
            </div>
            <h3>File Uploaded Successfully!</h3>
            <p className="file-name">{uploadedFile.name}</p>
            <p className="file-size">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            <div className="file-status">
              <span className="status-icon">✅</span>
              <span>Ready for analysis</span>
            </div>
          </div>
        ) : (
          <div className="upload-content">
            <div className="upload-icon">
              <img src="/2.jpg" alt="Upload files" className="upload-icon-image" />
            </div>
            <h3>{t.dragText}</h3>
            <p className="drag-text-alt">{t.dragTextAlt}</p>
            <div className="upload-button-large">
              <img src="/2.jpg" alt="Upload" className="button-icon-image" />
              <span>{t.uploadButton}</span>
            </div>
            <p className="supported-formats">{t.supportedFormats}</p>
            <p className="file-size-limit">{t.fileSize}</p>
          </div>
        )}
      </div>

      {uploadedFile && !isAnalyzing && (
        <div className="upload-actions">
          <button 
            className="change-file-btn"
            onClick={() => {
              setUploadedFile(null);
              fileInputRef.current.value = '';
            }}
          >
            🔄 {t.changeFile}
          </button>
        </div>
      )}

      <div className="upload-tips">
        <h4>💡 Tips for better results:</h4>
        <ul>
          <li>Ensure your file is not corrupted or damaged</li>
          <li>For images, make sure they are clear and well-lit</li>
          <li>For documents, ensure they are readable and complete</li>
          <li>Check that your file is not password-protected</li>
        </ul>
      </div>
    </div>
  );
};

export default FileUpload; 