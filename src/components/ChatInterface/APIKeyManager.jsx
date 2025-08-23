import React, { useState, useEffect } from 'react';
import geminiAPIService from './GeminiAPIService.js';

const APIKeyManager = ({ onStatusChange }) => {
  const [apiStatus, setApiStatus] = useState('checking');
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    checkAPIStatus();
  }, []);

  const checkAPIStatus = async () => {
    try {
      if (geminiAPIService.isReady()) {
        setApiStatus('ready');
        onStatusChange && onStatusChange('ready');
      } else {
        setApiStatus('not-ready');
        onStatusChange && onStatusChange('not-ready');
      }
    } catch (error) {
      console.error('Error checking API status:', error);
      setApiStatus('error');
      onStatusChange && onStatusChange('error');
    }
  };

  const testConnection = async () => {
    setIsTesting(true);
    try {
      const isConnected = await geminiAPIService.testConnection();
      if (isConnected) {
        setApiStatus('ready');
        onStatusChange && onStatusChange('ready');
      } else {
        setApiStatus('error');
        onStatusChange && onStatusChange('error');
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      setApiStatus('error');
      onStatusChange && onStatusChange('error');
    } finally {
      setIsTesting(false);
    }
  };

  const getStatusDisplay = () => {
    switch (apiStatus) {
      case 'ready':
        return {
          text: 'Gemini AI Ready',
          color: '#10b981',
          icon: '✅'
        };
      case 'not-ready':
        return {
          text: 'Gemini AI Not Ready',
          color: '#f59e0b',
          icon: '⚠️'
        };
      case 'error':
        return {
          text: 'Gemini AI Error',
          color: '#ef4444',
          icon: '❌'
        };
      default:
        return {
          text: 'Checking Gemini AI...',
          color: '#6b7280',
          icon: '⏳'
        };
    }
  };

  const status = getStatusDisplay();

  return (
    <div className="api-key-manager" style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '8px 12px',
      borderRadius: '6px',
      fontSize: '12px',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }}>
      <span>{status.icon}</span>
      <span style={{ color: status.color }}>{status.text}</span>
      {apiStatus === 'not-ready' && (
        <button
          onClick={testConnection}
          disabled={isTesting}
          style={{
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '4px 8px',
            fontSize: '10px',
            cursor: 'pointer'
          }}
        >
          {isTesting ? 'Testing...' : 'Test'}
        </button>
      )}
    </div>
  );
};

export default APIKeyManager; 