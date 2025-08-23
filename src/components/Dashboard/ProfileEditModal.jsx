import React, { useState, useEffect } from 'react';
import './ProfileEditModal.css';

const ProfileEditModal = ({ user, profileImage, onImageChange, onNameChange, onEmailChange, onLogout, onDeleteHistory, onClose }) => {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    // Load chat history from localStorage
    const history = localStorage.getItem('chat_history');
    if (history) {
      try {
        setChatHistory(JSON.parse(history));
      } catch {
        setChatHistory([]);
      }
    }
  }, []);

  const handleSaveName = () => {
    if (name.trim()) {
      onNameChange(name.trim());
      setIsEditingName(false);
    }
  };

  const handleSaveEmail = () => {
    if (email.trim() && /\S+@\S+\.\S+/.test(email.trim())) {
      onEmailChange(email.trim());
      setIsEditingEmail(false);
    }
  };

  const handleCancelName = () => {
    setName(user?.name || '');
    setIsEditingName(false);
  };

  const handleCancelEmail = () => {
    setEmail(user?.email || '');
    setIsEditingEmail(false);
  };

  return (
    <div className="profile-edit-modal-overlay" onClick={onClose}>
      <div className="profile-edit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="profile-edit-modal-header">
          <h2>Edit Profile</h2>
          <button className="close-btn" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="profile-edit-content">
          <div className="profile-basic-info">
            <h3>Basic Info</h3>
            <div><strong>Name:</strong> {user?.name || 'No name set'}</div>
            <div><strong>Email:</strong> {user?.email || 'No email set'}</div>
          </div>
          <div className="profile-chat-history-section">
            <h3>Chat History</h3>
            {chatHistory.length > 0 ? (
              <ul className="chat-history-list">
                {chatHistory.map((msg, idx) => (
                  <li key={idx} className="chat-history-item">
                    <span className="chat-history-time">{msg.timestamp}</span>
                    <span className="chat-history-text">{msg.text}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="no-history">No chat history found.</div>
            )}
            <button className="delete-history-btn" onClick={onDeleteHistory}>Delete Chat History</button>
          </div>
          <div className="profile-image-section">
            <h3>Profile Picture</h3>
            <div className="profile-image-container">
                              <img 
                  src={profileImage} 
                  alt="Profile" 
                  className="profile-preview"
                  onError={(e) => {
                    e.target.src = '/3.jpg';
                  }}
                />
              <div className="image-upload-overlay">
                <input
                  type="file"
                  accept="image/*"
                  onChange={onImageChange}
                  id="profile-image-input"
                  style={{ display: 'none' }}
                />
                <label htmlFor="profile-image-input" className="upload-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7,10 12,15 17,10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  Change Photo
                </label>
              </div>
            </div>
            <p className="image-hint">Click to upload a new profile picture</p>
          </div>

          <div className="profile-name-section">
            <h3>Display Name</h3>
            {isEditingName ? (
              <div className="name-edit-container">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="name-input"
                  autoFocus
                />
                <div className="name-edit-buttons">
                  <button className="save-btn" onClick={handleSaveName}>
                    Save
                  </button>
                  <button className="cancel-btn" onClick={handleCancelName}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="name-display-container">
                <span className="current-name">{user?.name || 'No name set'}</span>
                <button className="edit-name-btn" onClick={() => setIsEditingName(true)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  Edit
                </button>
              </div>
            )}
          </div>

          <div className="profile-email-section">
            <h3>Email</h3>
            {isEditingEmail ? (
              <div className="email-edit-container">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="email-input"
                  autoFocus
                />
                <div className="email-edit-buttons">
                  <button className="save-btn" onClick={handleSaveEmail}>
                    Save
                  </button>
                  <button className="cancel-btn" onClick={handleCancelEmail}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="email-display-container">
                <span className="current-email">{user?.email || 'No email set'}</span>
                <button className="edit-email-btn" onClick={() => setIsEditingEmail(true)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  Edit
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="profile-edit-footer">
          <button className="logout-btn" onClick={onLogout}>Logout</button>
          <button className="done-btn" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditModal; 