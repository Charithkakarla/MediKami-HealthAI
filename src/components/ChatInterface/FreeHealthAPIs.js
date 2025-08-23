export const freeHealthAPIs = {
  config: {
    infermedica: {
      baseUrl: 'https://api.infermedica.com/v3',
      appId: 'your-app-id',
      appKey: 'your-app-key'
    },
    nutritionix: {
      baseUrl: 'https://trackapi.nutritionix.com/v2',
      appId: 'your-nutritionix-app-id',
      appKey: 'your-nutritionix-app-key'
    }
  },

  otcMedications: {
    fever: [
      {
        name: 'Paracetamol (Acetaminophen)',
        dosage: '500-1000mg every 4-6 hours',
        timing: 'Take with or without food, every 4-6 hours as needed',
        maxDaily: '4g/day',
        brandNames: ['Tylenol', 'Panadol'],
        warnings: 'Do not exceed recommended dose'
      },
      {
        name: 'Ibuprofen',
        dosage: '200-400mg every 4-6 hours',
        timing: 'Take with food or milk, every 4-6 hours as needed',
        maxDaily: '1200mg/day',
        brandNames: ['Advil', 'Motrin'],
        warnings: 'Take with food, avoid if stomach issues'
      }
    ],
    cold: [
      {
        name: 'Pseudoephedrine',
        dosage: '30-60mg every 4-6 hours',
        timing: 'Take in morning and afternoon, avoid in evening',
        maxDaily: '240mg/day',
        brandNames: ['Sudafed'],
        warnings: 'May cause insomnia, avoid in evening'
      },
      {
        name: 'Dextromethorphan',
        dosage: '15-30mg every 4-6 hours',
        timing: 'Take every 4-6 hours as needed for cough',
        maxDaily: '120mg/day',
        brandNames: ['Robitussin DM'],
        warnings: 'Do not use with MAO inhibitors'
      }
    ],
    headache: [
      {
        name: 'Paracetamol',
        dosage: '500-1000mg every 4-6 hours',
        timing: 'Take as soon as headache starts, every 4-6 hours',
        maxDaily: '4g/day',
        brandNames: ['Tylenol'],
        warnings: 'Safe for most people'
      },
      {
        name: 'Ibuprofen',
        dosage: '400-600mg every 4-6 hours',
        timing: 'Take with food, every 4-6 hours as needed',
        maxDaily: '1200mg/day',
        brandNames: ['Advil'],
        warnings: 'Take with food'
      }
    ],
    stomach: [
      {
        name: 'Antacids',
        dosage: 'As directed on package',
        timing: 'Take 1-2 hours after meals or when symptoms occur',
        brandNames: ['Tums', 'Rolaids'],
        warnings: 'May interact with other medications'
      },
      {
        name: 'Loperamide',
        dosage: '2mg after each loose stool',
        timing: 'Take after each loose bowel movement',
        maxDaily: '8mg/day',
        brandNames: ['Imodium'],
        warnings: 'Stop if symptoms persist beyond 48 hours'
      }
    ]
  },

  healthConditions: {
    anemia: {
      symptoms: ['fatigue', 'weakness', 'pale skin', 'shortness of breath', 'dizziness'],
      diet: [
        'Iron-rich foods: red meat, spinach, lentils, beans, fortified cereals',
        'Vitamin C foods: citrus fruits, tomatoes, bell peppers, strawberries',
        'B12 foods: fish, meat, eggs, dairy, fortified plant milk',
        'Folic acid foods: leafy greens, beans, nuts, fortified grains',
        'Avoid: coffee/tea with meals (reduces iron absorption)'
      ],
      supplements: [
        'Iron supplements: Ferrous sulfate 325mg 1-3 times daily (take on empty stomach)',
        'Vitamin B12: 1000mcg daily (if B12 deficiency)',
        'Folic acid: 400-800mcg daily'
      ],
      homeRemedies: [
        'Cook in cast iron pans',
        'Eat iron-rich foods with Vitamin C',
        'Get adequate rest and sleep'
      ],
      warningSigns: [
        'Severe fatigue affecting daily activities',
        'Chest pain or irregular heartbeat',
        'Severe shortness of breath',
        'Fainting or severe dizziness'
      ]
    },
    diabetes: {
      symptoms: ['frequent urination', 'excessive thirst', 'increased hunger', 'weight loss', 'fatigue'],
      diet: [
        'Low glycemic index foods: whole grains, legumes, non-starchy vegetables',
        'Complex carbohydrates: brown rice, quinoa, whole wheat bread, oats',
        'Lean proteins: fish, chicken, turkey, beans, lentils, tofu',
        'Healthy fats: nuts, olive oil, avocado, fatty fish',
        'Fiber-rich foods: vegetables, fruits, whole grains, beans',
        'Avoid: sugary foods, refined carbs, processed foods, sweetened beverages'
      ],
      lifestyle: [
        'Regular exercise (30 minutes daily)',
        'Blood sugar monitoring',
        'Stress management techniques',
        'Adequate sleep (7-9 hours)',
        'Foot care and regular checkups'
      ],
      warningSigns: [
        'Very high or very low blood sugar',
        'Ketones in urine',
        'Severe dehydration',
        'Confusion or altered mental status'
      ]
    },
    hypertension: {
      symptoms: ['headaches', 'shortness of breath', 'nosebleeds', 'chest pain', 'dizziness'],
      diet: [
        'DASH diet: fruits, vegetables, whole grains, lean proteins',
        'Low sodium: less than 2,300mg daily, avoid processed foods',
        'Potassium-rich foods: bananas, potatoes, spinach, tomatoes, avocados',
        'Calcium-rich foods: low-fat dairy, leafy greens, fortified foods',
        'Magnesium foods: nuts, seeds, whole grains, dark chocolate',
        'Avoid: high-sodium foods, processed foods, alcohol, excessive caffeine'
      ],
      lifestyle: [
        'Regular exercise (150 minutes/week)',
        'Stress reduction techniques',
        'Limit alcohol and caffeine',
        'Quit smoking',
        'Maintain healthy weight'
      ],
      warningSigns: [
        'Blood pressure above 180/120',
        'Severe headache with high BP',
        'Chest pain or shortness of breath',
        'Vision changes or confusion'
      ]
    }
  },

  getHealthAdvice: async function(userQuery) {
    const lowerQuery = userQuery.toLowerCase();
    
    for (const [condition, data] of Object.entries(this.healthConditions)) {
      if (lowerQuery.includes(condition)) {
        return this.formatConditionResponse(condition, data);
      }
    }

    for (const [symptom, medications] of Object.entries(this.otcMedications)) {
      if (lowerQuery.includes(symptom)) {
        return this.formatMedicationResponse(symptom, medications);
      }
    }

    if (lowerQuery.includes('fever') || lowerQuery.includes('temperature')) {
      return this.formatMedicationResponse('fever', this.otcMedications.fever);
    }

    if (lowerQuery.includes('cold') || lowerQuery.includes('cough')) {
      return this.formatMedicationResponse('cold', this.otcMedications.cold);
    }

    if (lowerQuery.includes('headache') || lowerQuery.includes('head pain')) {
      return this.formatMedicationResponse('headache', this.otcMedications.headache);
    }

    if (lowerQuery.includes('stomach') || lowerQuery.includes('nausea')) {
      return this.formatMedicationResponse('stomach', this.otcMedications.stomach);
    }

    return this.getGeneralHealthAdvice(lowerQuery);
  },

  formatMedicationResponse: function(symptom, medications) {
    const symptomName = symptom.charAt(0).toUpperCase() + symptom.slice(1);
    
    const symptomFoods = this.getSymptomSpecificFoods(symptom);
    
  return `**${symptomName}**

**💊 Medications:**
${medications.map(med => `• ${med.name}: ${med.dosage} (${med.brandNames.join(', ')})
  Timing: ${med.timing}`).join('\n')}

**🥗 Recommended Foods:**
${symptomFoods.map(food => `• ${food}`).join('\n')}

**⚠️ Note:** These are over-the-counter medications. It's best to consult a doctor for proper diagnosis and treatment.`;
  },

  formatConditionResponse: function(condition, data) {
    const conditionName = condition.charAt(0).toUpperCase() + condition.slice(1);
    
    return `**${conditionName}** • Management Guide

**💊 Supplements:**
${data.supplements.map(supp => `• ${supp}`).join('\n')}

**🥗 Recommended Foods:**
${data.diet.map(food => `• ${food}`).join('\n')}

**⚠️ Note:** This is general information only. It's best to consult a doctor for proper diagnosis and treatment.`;
  },

  getGeneralHealthAdvice: function(query) {
    if (query.includes('diet') || query.includes('nutrition')) {
      return `**Nutrition** • Diet Guidelines

**🥗 Balanced Diet:**
• Fruits & Vegetables: 5-9 servings daily
• Whole Grains: Brown rice, quinoa, whole wheat
• Lean Proteins: Fish, chicken, beans
• Healthy Fats: Nuts, olive oil, avocado
• Dairy: Low-fat milk, yogurt, cheese

**💧 Hydration:**
• Drink 8-10 glasses of water daily
• Include herbal teas and coconut water

**⚠️ Note:** This is general nutrition advice. It's best to consult a doctor for personalized dietary recommendations.`;
    }

    if (query.includes('exercise') || query.includes('workout')) {
      return `**Exercise** • Fitness Guide

**💪 Weekly Goals:**
• Cardio: 150 minutes moderate or 75 minutes vigorous
• Strength Training: 2-3 sessions per week
• Flexibility: Daily stretching

**🏃‍♂️ Activities:**
• Walking, jogging, cycling, swimming
• Sports: tennis, basketball, soccer
• Bodyweight exercises: push-ups, squats

**⚠️ Note:** Start slowly and consult a doctor before beginning a new exercise program.`;
    }

    return `**Health Assistant** • What I Can Help With

**💊 OTC Medications:** Fever, cold, headache, stomach problems
**🏥 Health Conditions:** Anemia, diabetes, hypertension
**🥗 Nutrition & Exercise:** Diet guidelines, workout plans

**📝 Ask:** "I have fever, what medicine should I take?" or "What diet for diabetes?"

**⚠️ Note:** I provide general health information only. Always consult healthcare professionals for medical advice.`;
  },

  getNutritionInfo: async function(foodItem) {
    return `Nutrition information for ${foodItem} would be available here.`;
  },

  getSymptomAnalysis: async function(symptoms) {
    return `Symptom analysis for ${symptoms} would be available here.`;
  },

  getSymptomSpecificFoods: function(symptom) {
    const foodRecommendations = {
      fever: [
        'Clear broths and soups (chicken soup, vegetable broth)',
        'Hydrating foods: watermelon, cucumber, oranges',
        'Light foods: toast, rice, bananas, applesauce',
        'Herbal teas: chamomile, peppermint, ginger tea',
        'Avoid: heavy, oily, or spicy foods'
      ],
      cold: [
        'Warm liquids: chicken soup, herbal teas, warm water with honey',
        'Vitamin C foods: citrus fruits, bell peppers, strawberries',
        'Zinc-rich foods: nuts, seeds, whole grains, legumes',
        'Garlic and onions (natural antimicrobial properties)',
        'Avoid: dairy products (may increase mucus production)'
      ],
      headache: [
        'Hydrating foods: water, coconut water, herbal teas',
        'Magnesium foods: nuts, seeds, dark chocolate, leafy greens',
        'Caffeine (in moderation): coffee, tea (may help some headaches)',
        'Ginger: ginger tea or fresh ginger (anti-inflammatory)',
        'Avoid: processed foods, excessive caffeine, alcohol'
      ],
      stomach: [
        'BRAT diet: Bananas, Rice, Applesauce, Toast',
        'Ginger: ginger tea, fresh ginger (nausea relief)',
        'Probiotic foods: yogurt, kefir, sauerkraut',
        'Bland foods: boiled potatoes, steamed vegetables',
        'Avoid: spicy, fatty, or acidic foods, dairy if intolerant'
      ]
    };
    
    return foodRecommendations[symptom] || [
      'Stay hydrated with water and clear broths',
      'Eat light, easily digestible foods',
      'Avoid heavy, oily, or spicy foods'
    ];
  }
};

export default freeHealthAPIs;
