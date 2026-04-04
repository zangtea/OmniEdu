const axios = require('axios');

const IRT_ENGINE_URL = process.env.IRT_ENGINE_URL || 'http://localhost:8001';

async function updateStudentAbility(studentData, questionData, isCorrect) {
  try {
    const response = await axios.post(`${IRT_ENGINE_URL}/update`, {
      // Dùng ?? (Nullish coalescing) để lấy giá trị mặc định nếu bị thiếu
      theta: studentData.theta ?? 0,
      confidence: studentData.confidence ?? 1,
      responses: studentData.responses ?? 0,
      // Thêm fallback cực mạnh cho cả 2 trường hợp tên biến
      difficulty: questionData.difficulty ?? questionData.difficulty_level ?? 0.5,
      discrimination: questionData.discrimination ?? questionData.discrimination_index ?? 1.2,
      guessing: questionData.guessing ?? questionData.guessing_param ?? 0.25,
      is_correct: isCorrect
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi IRT Engine:", error.message);
    throw error;
  }
}

async function analyzeBehavior(studentId, events) {
  try {
    const response = await axios.post(`${IRT_ENGINE_URL}/analyze-behavior`, {
      studentId: studentId,
      events: events || [] // Gửi mảng rỗng nếu không có event nào để chống lỗi
    });
    return response.data; // Trả về cái BehaviorProfile từ Python
  } catch (error) {
    console.error("Lỗi khi gọi AI Behavior Analyzer:", error.message);
    throw error;
  }
}


module.exports = { updateStudentAbility };
module.exports = { updateStudentAbility, analyzeBehavior };