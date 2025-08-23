import React from 'react';
import './HealthMetrics.css';

const HealthMetrics = ({ data, language }) => {
  const translations = {
    en: {
      title: 'Health Analysis',
      subtitle: 'AI-detected health metrics and conditions',
      normal: 'Normal',
      low: 'Low',
      high: 'High',
      critical: 'Critical',
      conditions: 'Detected Conditions',
      recommendations: 'Recommendations'
    },
    hi: {
      title: 'स्वास्थ्य विश्लेषण',
      subtitle: 'AI द्वारा पता लगाए गए स्वास्थ्य मापदंड और स्थितियां',
      normal: 'सामान्य',
      low: 'कम',
      high: 'उच्च',
      critical: 'गंभीर',
      conditions: 'पता लगाई गई स्थितियां',
      recommendations: 'सिफारिशें'
    },
    ta: {
      title: 'சுகாதார பகுப்பாய்வு',
      subtitle: 'AI மூலம் கண்டறியப்பட்ட சுகாதார அளவீடுகள் மற்றும் நிலைமைகள்',
      normal: 'சாதாரணம்',
      low: 'குறைவு',
      high: 'அதிகம்',
      critical: 'முக்கியமானது',
      conditions: 'கண்டறியப்பட்ட நிலைமைகள்',
      recommendations: 'பரிந்துரைகள்'
    }
  };

  const t = translations[language] || translations.en;

  const getStatusColor = (status) => {
    switch (status) {
      case 'normal': return '#27ae60';
      case 'low': return '#f39c12';
      case 'high': return '#e74c3c';
      case 'critical': return '#c0392b';
      default: return '#7f8c8d';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'normal': return '✅';
      case 'low': return '⚠️';
      case 'high': return '🔴';
      case 'critical': return '🚨';
      default: return '❓';
    }
  };

  const getRecommendations = (conditions) => {
    const recommendations = {
      'Vitamin D Deficiency': {
        en: 'Increase sun exposure, consume vitamin D rich foods like fish, eggs, and fortified dairy products.',
        hi: 'धूप में अधिक समय बिताएं, मछली, अंडे और फोर्टिफाइड डेयरी उत्पाद जैसे विटामिन डी युक्त खाद्य पदार्थों का सेवन करें।',
        ta: 'சூரிய ஒளிக்கு அதிக நேரம் வெளிப்படுத்துங்கள், மீன், முட்டைகள் மற்றும் வலுவூட்டப்பட்ட பால் பொருட்கள் போன்ற வைட்டமின் டி நிறைந்த உணவுகளை உட்கொள்ளுங்கள்.'
      },
      'High Cholesterol': {
        en: 'Reduce saturated fats, increase fiber intake, exercise regularly, and consider omega-3 supplements.',
        hi: 'संतृप्त वसा कम करें, फाइबर का सेवन बढ़ाएं, नियमित व्यायाम करें और ओमेगा-3 सप्लीमेंट्स पर विचार करें।',
        ta: 'நிறைவுற்ற கொழுப்புகளைக் குறைக்கவும், நார்ச்சத்து உட்கொள்ளலை அதிகரிக்கவும், வழக்கமாக உடற்பயிற்சி செய்யவும், ஓமேகா-3 சப்ளிமென்ட்களைக் கருத்தில் கொள்ளவும்.'
      }
    };

    return conditions.map(condition => recommendations[condition]?.[language] || recommendations[condition]?.en || 'Consult with your healthcare provider.');
  };

  if (!data) return null;

  return (
    <div className="health-metrics-container">
      <div className="metrics-header">
        <h2>{t.title}</h2>
        <p>{t.subtitle}</p>
      </div>

      <div className="metrics-content">
        <div className="metrics-section">
          <h3>📊 {t.title}</h3>
          <div className="metrics-grid">
            {data.metrics.map((metric, index) => (
              <div key={index} className="metric-card">
                <div className="metric-header">
                  <span className="metric-name">{metric.name}</span>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(metric.status) }}
                  >
                    {getStatusIcon(metric.status)} {t[metric.status]}
                  </span>
                </div>
                <div className="metric-value">
                  {metric.value} {metric.unit}
                </div>
                <div className="metric-range">
                  Normal Range: {getNormalRange(metric.name)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {data.conditions && data.conditions.length > 0 && (
          <div className="conditions-section">
            <h3>🔍 {t.conditions}</h3>
            <div className="conditions-list">
              {data.conditions.map((condition, index) => (
                <div key={index} className="condition-item">
                  <span className="condition-name">{condition}</span>
                  <span className="condition-severity">Moderate</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="recommendations-section">
          <h3>💡 {t.recommendations}</h3>
          <div className="recommendations-list">
            {getRecommendations(data.conditions || []).map((rec, index) => (
              <div key={index} className="recommendation-item">
                <span className="recommendation-icon">💊</span>
                <p>{rec}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const getNormalRange = (metricName) => {
  const ranges = {
    'Hemoglobin': '12-16 g/dL (Women), 14-18 g/dL (Men)',
    'Vitamin D': '30-100 ng/mL',
    'Cholesterol': '< 200 mg/dL',
    'Blood Sugar': '70-100 mg/dL (Fasting)',
    'Blood Pressure': '< 120/80 mmHg'
  };
  return ranges[metricName] || 'Consult your doctor';
};

export default HealthMetrics; 