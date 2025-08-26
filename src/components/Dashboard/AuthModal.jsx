import React, { useState, useEffect } from 'react';
import './AuthModal.css';
import ShinyText from '../ShinyText.jsx';

const AuthModal = ({ onLogin, onSignup, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [animationStep, setAnimationStep] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (animationStep < 6) {
        setAnimationStep(prev => prev + 1);
      }
    }, 300); 

    return () => clearTimeout(timer);
  }, [animationStep]);

  
  useEffect(() => {
    setAnimationStep(0);
  }, [isLogin]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!isLogin) {
      if (!formData.name) {
        newErrors.name = 'Name is required';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      if (isLogin) {
        // Simulate login
        onLogin({
          email: formData.email,
          name: formData.email.split('@')[0] 
        });
      } else {
        onSignup({
          name: formData.name,
          email: formData.email
        });
      }
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setErrors({});
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className={`auth-modal typing-animation-${animationStep}`} onClick={(e) => e.stopPropagation()}>
        <div className={`auth-modal-header ${animationStep >= 1 ? 'typing-visible' : 'typing-hidden'}`}>
          <h2>
            <ShinyText 
              text={isLogin ? 'Sign In' : 'Create Account'} 
              speed={3} 
              className="text-xl font-bold" 
            />
          </h2>
          <button className="close-btn" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className={`form-group ${animationStep >= 2 ? 'typing-visible' : 'typing-hidden'}`}>
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>
          )}

          <div className={`form-group ${animationStep >= (isLogin ? 2 : 3) ? 'typing-visible' : 'typing-hidden'}`}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className={`form-group ${animationStep >= (isLogin ? 3 : 4) ? 'typing-visible' : 'typing-hidden'}`}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              className={errors.password ? 'error' : ''}
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          {!isLogin && (
            <div className={`form-group ${animationStep >= 5 ? 'typing-visible' : 'typing-hidden'}`}>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your password"
                className={errors.confirmPassword ? 'error' : ''}
              />
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>
          )}

          <button 
            type="submit" 
            className={`submit-btn ${animationStep >= (isLogin ? 4 : 6) ? 'typing-visible' : 'typing-hidden'}`}
          >
            <ShinyText 
              text={isLogin ? 'Sign In' : 'Create Account'} 
              speed={4} 
              className="font-semibold" 
            />
          </button>
        </form>
        

        <div className={`auth-modal-footer ${animationStep >= (isLogin ? 5 : 7) ? 'typing-visible' : 'typing-hidden'}`}>
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button type="button" className="toggle-btn" onClick={toggleMode}>
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
