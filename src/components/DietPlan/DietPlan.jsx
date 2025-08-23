import React, { useState } from 'react';
import './DietPlan.css';

const DietPlan = ({ conditions }) => {
  const [selectedDay, setSelectedDay] = useState(1);

  const t = {
    title: 'Personalized Diet Plan',
    subtitle: 'AI-generated recommendations based on your health conditions',
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    snacks: 'Snacks',
    download: 'Download PDF',
    day: 'Day',
    calories: 'Calories',
    protein: 'Protein',
    carbs: 'Carbs',
    fats: 'Fats'
  };

  const generateDietPlan = (conditions) => {
    const basePlan = {
      1: {
        breakfast: 'Oatmeal with nuts and berries',
        lunch: 'Grilled salmon with quinoa and vegetables',
        dinner: 'Lentil soup with brown rice',
        snacks: 'Greek yogurt with almonds',
        nutrition: { calories: 1850, protein: 85, carbs: 180, fats: 65 }
      },
      2: {
        breakfast: 'Greek yogurt parfait with granola',
        lunch: 'Chicken breast with sweet potato',
        dinner: 'Vegetable stir-fry with tofu',
        snacks: 'Apple with peanut butter',
        nutrition: { calories: 1750, protein: 90, carbs: 160, fats: 70 }
      },
      3: {
        breakfast: 'Smoothie bowl with chia seeds',
        lunch: 'Tuna salad with whole grain bread',
        dinner: 'Baked cod with roasted vegetables',
        snacks: 'Mixed nuts and dried fruits',
        nutrition: { calories: 1900, protein: 95, carbs: 170, fats: 75 }
      }
    };

    // Customize based on conditions
    if (conditions.includes('Vitamin D Deficiency')) {
      basePlan[1].breakfast = 'Fortified cereal with milk and egg yolk';
    }
    if (conditions.includes('High Cholesterol')) {
      basePlan[1].lunch = 'Grilled chicken with steamed vegetables';
    }

    return basePlan;
  };

  const dietPlan = generateDietPlan(conditions);

  const handleDownload = () => {
    // Simulate PDF download
    alert('PDF download feature will be implemented with backend integration');
  };

  const getMealContent = (meal, day) => {
    return dietPlan[day][meal];
  };

  return (
    <div className="diet-plan-container">
      <div className="diet-header">
        <h2>{t.title}</h2>
        <p>{t.subtitle}</p>
        <button className="download-btn" onClick={handleDownload}>
          📄 {t.download}
        </button>
      </div>

      <div className="diet-content">
        <div className="day-selector">
          {[1, 2, 3].map(day => (
            <button
              key={day}
              className={`day-btn ${selectedDay === day ? 'active' : ''}`}
              onClick={() => setSelectedDay(day)}
            >
              {t.day} {day}
            </button>
          ))}
        </div>

        <div className="meal-plan">
          <div className="meal-section">
            <h3>🌅 {t.breakfast}</h3>
            <p>{getMealContent('breakfast', selectedDay)}</p>
          </div>

          <div className="meal-section">
            <h3>☀️ {t.lunch}</h3>
            <p>{getMealContent('lunch', selectedDay)}</p>
          </div>

          <div className="meal-section">
            <h3>🌙 {t.dinner}</h3>
            <p>{getMealContent('dinner', selectedDay)}</p>
          </div>

          <div className="meal-section">
            <h3>🍎 {t.snacks}</h3>
            <p>{getMealContent('snacks', selectedDay)}</p>
          </div>
        </div>

        <div className="nutrition-info">
          <h3>📊 {t.title} - {t.day} {selectedDay}</h3>
          <div className="nutrition-grid">
            <div className="nutrition-item">
              <span className="nutrition-label">{t.calories}</span>
              <span className="nutrition-value">{dietPlan[selectedDay].nutrition.calories}</span>
            </div>
            <div className="nutrition-item">
              <span className="nutrition-label">{t.protein}</span>
              <span className="nutrition-value">{dietPlan[selectedDay].nutrition.protein}g</span>
            </div>
            <div className="nutrition-item">
              <span className="nutrition-label">{t.carbs}</span>
              <span className="nutrition-value">{dietPlan[selectedDay].nutrition.carbs}g</span>
            </div>
            <div className="nutrition-item">
              <span className="nutrition-label">{t.fats}</span>
              <span className="nutrition-value">{dietPlan[selectedDay].nutrition.fats}g</span>
            </div>
          </div>
        </div>

        <div className="diet-tips">
          <h3>💡 {t.title} Tips</h3>
          <ul>
            <li>Drink 8-10 glasses of water daily</li>
            <li>Eat slowly and mindfully</li>
            <li>Include protein with every meal</li>
            <li>Choose whole grains over refined grains</li>
            <li>Limit processed foods and added sugars</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DietPlan; 