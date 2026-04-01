// src/routes/quiz.js
const express = require('express');
const router = express.Router();
const { supabase } = require('../db');
const auth = require('../middleware/auth');
const irtService = require('../services/irtService');

// API nhận câu trả lời và cập nhật điểm theta
router.post('/submit-answer', auth, async (req, res) => {
  const { questionId, isCorrect, topicId } = req.body;
  const studentId = req.studentId;

  try {
    // 1. Lấy dữ liệu năng lực hiện tại và thông số câu hỏi từ Supabase
    const [skillRes, questionRes] = await Promise.all([
      supabase.from('skill_levels').select('*').eq('student_id', studentId).eq('topic_id', topicId).single(),
      supabase.from('questions').select('*').eq('id', questionId).single()
    ]);

    // Nếu chưa có record năng lực môn này, tạo data mặc định
    const currentSkill = skillRes.data || { theta: 0, confidence: 1, responses: 0 };
    const question = questionRes.data;

    if (!question) return res.status(404).json({ error: "Không tìm thấy câu hỏi" });

    // 2. Gọi sang Python IRT Engine để tính toán
    const updatedIrt = await irtService.updateStudentAbility(currentSkill, question, isCorrect);

    // 3. Lưu điểm theta mới vào Database
    const { error: updateErr } = await supabase.from('skill_levels').upsert({
      student_id: studentId,
      topic_id: topicId,
      theta: updatedIrt.theta,
      confidence: updatedIrt.confidence,
      responses: updatedIrt.responses,
      updated_at: new Date()
    }, { onConflict: 'student_id, topic_id' });

    if (updateErr) throw updateErr;

    // 4. Trả kết quả về cho Next.js hiển thị
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

module.exports = router;