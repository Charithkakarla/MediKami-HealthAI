import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import ChatInterface from '../ChatInterface/ChatInterface';
import HealthMetrics from '../HealthMetrics/HealthMetrics';
import DietPlan from '../DietPlan/DietPlan';
import AuthModal from './AuthModal';
import ProfileEditModal from './ProfileEditModal';
import ShinyText from '../ShinyText.jsx';

const Dashboard = () => {
  const [healthData, setHealthData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState('chat');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showProfileEditModal, setShowProfileEditModal] = useState(false);
  const [profileImage, setProfileImage] = useState('/3.jpg');

  useEffect(() => {
    document.body.className = 'premium-dark-theme';
    
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('user');
      }
    }

    const savedProfileImage = localStorage.getItem('profile_image');
    if (savedProfileImage) {
      setProfileImage(savedProfileImage);
    } else {
      setProfileImage('/3.jpg');
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileDropdown && !event.target.closest('.user-profile')) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileDropdown]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    setShowAuthModal(false);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
  };

  const handleSignup = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    setShowAuthModal(false);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const closeProfileDropdown = () => {
    setShowProfileDropdown(false);
  };

  const handleContactClick = () => {
        alert('Contact Medikami support at: medikamisupport@gmail.com');
    closeProfileDropdown();
  };

  const handleHistoryClick = () => {
    alert('Chat history feature coming soon!');
    closeProfileDropdown();
  };

  const handleProfileEdit = () => {
    setShowProfileEditModal(true);
    closeProfileDropdown();
  };

  const handleDeleteHistory = () => {
    if (window.confirm('Are you sure you want to delete all chat history? This action cannot be undone.')) {
      localStorage.removeItem('chat_history');
      alert('Chat history has been deleted successfully!');
      closeProfileDropdown();
    }
  };

  const handleProfileImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target.result);
        localStorage.setItem('profile_image', e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNameChange = (newName) => {
    setUser(prev => ({ ...prev, name: newName }));
    localStorage.setItem('user', JSON.stringify({ ...user, name: newName }));
  };

  const handleEmailChange = (newEmail) => {
    setUser(prev => ({ ...prev, email: newEmail }));
    localStorage.setItem('user', JSON.stringify({ ...user, email: newEmail }));
  };

  return (
    <div className="dashboard premium-dark">

      <div className="dashboard-main">
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-content">
            {healthData && (
              <>
                <div className="sidebar-section">
                  <h3>Quick Actions</h3>
                  <div className="action-buttons">
                    <button 
                      className={`action-btn ${activeView === 'chat' ? 'active' : ''}`}
                      onClick={() => setActiveView('chat')}
                    >
                      💬 Chat Assistant
                    </button>
                    <button 
                      className={`action-btn ${activeView === 'analysis' ? 'active' : ''}`}
                      onClick={() => setActiveView('analysis')}
                    >
                      📊 Health Analysis
                    </button>
                    <button 
                      className={`action-btn ${activeView === 'diet' ? 'active' : ''}`}
                      onClick={() => setActiveView('diet')}
                    >
                      🥗 Diet Plan
                    </button>
                  </div>
                </div>

                <div className="sidebar-section">
                  <h3>Detected Conditions</h3>
                  <div className="conditions-list">
                    {healthData.conditions.map((condition, index) => (
                      <div key={index} className="condition-tag">
                        {condition}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </aside>

        <main className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
          {activeView === 'chat' && (
            <ChatInterface 
              healthData={healthData}
              isAuthenticated={isAuthenticated}
              onLoginRequest={() => setShowAuthModal(true)}
              onLogout={handleLogout}
            />
          )}
          
          {activeView === 'analysis' && healthData && (
            <div className="analysis-view">
              <HealthMetrics 
                data={healthData} 
              />
            </div>
          )}
          
          {activeView === 'diet' && healthData && (
            <div className="diet-view">
              <DietPlan 
                conditions={healthData.conditions}
              />
            </div>
          )}
        </main>
      </div>

      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}

      {showAuthModal && (
        <AuthModal 
          onLogin={handleLogin}
          onSignup={handleSignup}
          onClose={() => setShowAuthModal(false)}
        />
      )}

      {showProfileEditModal && (
        <ProfileEditModal 
          user={user}
          profileImage={profileImage}
          onImageChange={handleProfileImageChange}
          onNameChange={handleNameChange}
          onEmailChange={handleEmailChange}
          onLogout={handleLogout}
          onDeleteHistory={handleDeleteHistory}
          onClose={() => setShowProfileEditModal(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
