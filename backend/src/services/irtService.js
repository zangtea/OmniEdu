// backend/src/services/irtService.js
const axios = require('axios');

const IRT_ENGINE_URL = process.env.IRT_ENGINE_URL || 'http://localhost:8001';

async function updateStudentAbility(studentData, questionData, isCorrect) {
  try {
    const response = await axios.post(`${IRT_ENGINE_URL}/update`, {
      theta: studentData.theta,
      confidence: studentData.confidence,
      responses: studentData.responses,
      difficulty: questionData.difficulty,
      discrimination: questionData.discrimination || 1.2,
      guessing: questionData.guessing || 0.25,
      is_correct: isCorrect
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi IRT Engine:", error.message);
    throw error;
  }
}

module.exports = { updateStudentAbility };