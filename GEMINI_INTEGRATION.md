# Gemini API Integration for MediXAI

## Overview
This document describes the integration of Google's Gemini AI API into the MediXAI health assistant application.

## Features Added

### 1. Enhanced AI Responses
- **Gemini 1.5 Flash Model**: Uses the latest Gemini model for more accurate and comprehensive health advice
- **Context-Aware Responses**: Considers user's health data when providing recommendations
- **Fallback System**: Automatically falls back to free health APIs if Gemini is unavailable

### 2. Advanced File Analysis
- **Medical Report Analysis**: AI-powered analysis of uploaded medical reports
- **Prescription Analysis**: Intelligent analysis of prescription documents
- **Comprehensive Recommendations**: Detailed dietary, lifestyle, and medication guidance

### 3. API Status Monitoring
- **Real-time Status**: Visual indicator showing Gemini API connection status
- **Connection Testing**: Built-in test functionality to verify API connectivity
- **Error Handling**: Graceful error handling with fallback mechanisms

## Configuration

### API Key Setup
The Gemini API key is configured in `src/config/geminiConfig.js`:

```javascript
export const GEMINI_CONFIG = {
  API_KEY: 'your-api-key-here',
  MODEL: 'gemini-1.5-flash',
  MAX_TOKENS: 4096,
  TEMPERATURE: 0.7
};
```

### Environment Variables (Recommended for Production)
For production deployment, use environment variables:

1. Create a `.env` file in the root directory:
```
VITE_GEMINI_API_KEY=your-api-key-here
```

2. The application will automatically use the environment variable if available.

## API Service Architecture

### Core Components

1. **GeminiAPIService** (`src/components/ChatInterface/GeminiAPIService.js`)
   - Main service class for Gemini API interactions
   - Handles health advice generation
   - Manages medical report and prescription analysis
   - Includes comprehensive prompt engineering

2. **APIKeyManager** (`src/components/ChatInterface/APIKeyManager.jsx`)
   - Visual status indicator for API connectivity
   - Connection testing functionality
   - Real-time status updates

3. **Configuration** (`src/config/geminiConfig.js`)
   - Centralized API configuration
   - Environment variable support
   - Model and generation parameters

### Integration Points

1. **ChatInterface** (`src/components/ChatInterface/ChatInterface.jsx`)
   - Primary integration point for health queries
   - Automatic fallback to free APIs
   - Enhanced file analysis capabilities

2. **FreeHealthAPIs** (`src/components/ChatInterface/FreeHealthAPIs.js`)
   - Maintained as fallback system
   - Ensures application functionality even without Gemini API

## Usage Examples

### Health Query Processing
```javascript
// The system automatically tries Gemini first, then falls back to free APIs
const response = await geminiAPIService.getHealthAdvice(userQuery, healthData);
```

### File Analysis
```javascript
// Medical report analysis
const analysis = await geminiAPIService.analyzeMedicalReport(fileContent, fileName);

// Prescription analysis
const prescriptionAnalysis = await geminiAPIService.analyzePrescription(fileContent, fileName);
```

## Safety and Medical Disclaimers

The Gemini API integration includes comprehensive safety measures:

1. **Medical Disclaimers**: All responses include appropriate medical disclaimers
2. **Professional Consultation**: Always recommends consulting healthcare professionals
3. **Emergency Guidelines**: Includes emergency warning signs and when to seek immediate care
4. **Conservative Approach**: Takes a conservative approach to medication recommendations

## Error Handling

The integration includes robust error handling:

1. **API Failures**: Automatic fallback to free health APIs
2. **Connection Issues**: Visual status indicators and retry mechanisms
3. **Rate Limiting**: Graceful handling of API rate limits
4. **Invalid Responses**: Validation and formatting of AI responses

## Performance Considerations

1. **Response Time**: Gemini API typically responds within 2-5 seconds
2. **Fallback Speed**: Free APIs provide instant responses as backup
3. **Caching**: Consider implementing response caching for common queries
4. **Rate Limits**: Monitor API usage to stay within Google's rate limits

## Security Best Practices

1. **API Key Protection**: Never expose API keys in client-side code in production
2. **Environment Variables**: Use environment variables for sensitive configuration
3. **Input Validation**: All user inputs are validated before sending to API
4. **Error Logging**: Sensitive information is not logged in error messages

## Troubleshooting

### Common Issues

1. **API Key Invalid**
   - Verify the API key is correct
   - Check if the key has proper permissions
   - Ensure the key is enabled for Gemini API

2. **Connection Failures**
   - Check internet connectivity
   - Verify API quotas and rate limits
   - Test with the built-in connection test

3. **Response Errors**
   - Check browser console for detailed error messages
   - Verify the prompt format is correct
   - Ensure the model name is valid

### Debug Mode
Enable debug logging by checking the browser console for detailed API interaction logs.

## Future Enhancements

1. **Response Caching**: Implement caching for common health queries
2. **Multi-language Support**: Extend Gemini prompts for multiple languages
3. **Image Analysis**: Add support for medical image analysis
4. **Conversation Memory**: Implement conversation context for better responses
5. **Custom Models**: Fine-tune models for specific medical domains

## Support

For issues related to the Gemini API integration:
1. Check the browser console for error messages
2. Verify API key configuration
3. Test API connectivity using the status indicator
4. Review this documentation for troubleshooting steps
