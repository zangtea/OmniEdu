// src/routes/quiz.js
const express = require('express');
const router = express.Router();
const { supabase } = require('../db');
const auth = require('../middleware/auth');
const irtService = require('../services/irtService');

// 1. API nhận câu trả lời và cập nhật điểm theta
router.post('/submit-answer', auth, async (req, res) => {
  const { questionId, isCorrect, topicId } = req.body;
  const studentId = req.studentId;

  try {
    const [skillRes, questionRes] = await Promise.all([
      supabase.from('skill_levels').select('*').eq('student_id', studentId).eq('topic_id', topicId).single(),
      supabase.from('questions').select('*').eq('id', questionId).single()
    ]);

    const currentSkill = skillRes.data || { theta: 0, confidence: 1, responses: 0 };
    let question = questionRes.data;

    if (!question) {
      console.log(`⚠️ Không thấy câu hỏi [${questionId}] trong DB, tự tạo data giả...`);
      question = { id: questionId, difficulty_level: 0.5, discrimination_index: 1.0, guessing_param: 0.25 };
    }

    const updatedIrt = await irtService.updateStudentAbility(currentSkill, question, isCorrect);

    const { error: updateErr } = await supabase.from('skill_levels').upsert({
      student_id: studentId,
      topic_id: topicId,
      theta: updatedIrt.theta,
      confidence: updatedIrt.confidence,
      responses: updatedIrt.responses,
      updated_at: new Date()
    }, { onConflict: 'student_id, topic_id' });

    if (updateErr) throw updateErr;

    res.json({
      success: true,
      newTheta: updatedIrt.theta,
      level: updatedIrt.level,
      isConverged: updatedIrt.converged
    });

  } catch (error) {
    console.error("Lỗi submit-answer:", error);
    res.status(500).json({ error: "Lỗi hệ thống khi cập nhật điểm" });
  }
});

// 2. API nhận cục dữ liệu tracking hành vi và gửi sang AI Python
router.post('/behavior', async (req, res) => {
  const { studentId, events } = req.body;

  try {
    const aiResult = await irtService.analyzeBehavior(studentId, events);

    res.json({
      success: true,
      message: "Phân tích hành vi thành công!",
      profile: aiResult.profile
    });

  } catch (error) {
    console.error("Lỗi API behavior:", error);
    res.status(500).json({ error: "Lỗi hệ thống khi phân tích hành vi" });
  }
});

// 3. API lưu tiến độ học tập của học sinh (POST)
router.post('/save-progress', async (req, res) => {
  const { studentId, topicId, finalTheta } = req.body;

  try {
    const { data, error } = await supabase
      .from('student_progress')
      .upsert({
        student_id: studentId,
        topic_id: topicId,
        current_theta: finalTheta
      }, { onConflict: 'student_id, topic_id' }); 

    if (error) throw error;

    res.json({ success: true, message: "Đã cất điểm Theta vào két sắt thành công!" });

  } catch (error) {
    console.error("Lỗi khi lưu tiến độ vào Supabase:", error);
    res.status(500).json({ error: "Lỗi hệ thống khi lưu tiến độ" });
  }
});

// 4. API lấy câu hỏi thông minh từ Supabase (GET)
// LƯU Ý: Phải đặt API GET /:topicId ở DƯỚI CÙNG để nó không "nuốt" nhầm mấy cái POST ở trên
router.get('/:topicId', async (req, res) => {
  const { topicId } = req.params;
  const currentTheta = parseFloat(req.query.theta) || 0; 
  const answeredIds = req.query.answered ? req.query.answered.split(',') : [];

  try {
    const { data: questions, error } = await supabase
      .from('questions')
      .select('*')
      .eq('topic_id', topicId);

    if (error) throw error;

    const availableQuestions = questions.filter(q => !answeredIds.includes(q.id));

    if (availableQuestions.length === 0) {
      return res.status(404).json({ message: "Hoàn thành", error: "Bạn đã hoàn thành tất cả câu hỏi!" });
    }

    let bestQuestion = availableQuestions[0];
    let minDifference = Math.abs((bestQuestion.difficulty || 0.5) - currentTheta);

    for (let i = 1; i < availableQuestions.length; i++) {
      const qDifficulty = availableQuestions[i].difficulty || 0.5;
      const diff = Math.abs(qDifficulty - currentTheta);
      
      if (diff < minDifference) {
        minDifference = diff;
        bestQuestion = availableQuestions[i];
      }
    }

    res.json({
      id: bestQuestion.id,
      content: bestQuestion.content,
      correctKey: bestQuestion.correct_answer,
      options: bestQuestion.options,
      difficulty: bestQuestion.difficulty 
    });

  } catch (error) {
    console.error("Lỗi lấy câu hỏi từ DB:", error);
    res.status(500).json({ error: "Lỗi hệ thống khi lấy câu hỏi từ Database" });
  }
});

// LUÔN LUÔN ĐỂ DÒNG NÀY Ở CUỐI CÙNG FILE
module.exports = router;