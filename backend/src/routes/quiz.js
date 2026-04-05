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
    let question = questionRes.data;

    // --- BYPASS DATA GIẢ ĐỂ TEST NỐI API ---
    if (!question) {
      console.log(`⚠️ Không thấy câu hỏi [${questionId}] trong DB, tự tạo data giả để test AI Python...`);
      question = {
        id: questionId,
        difficulty_level: 0.5,       // Độ khó trung bình
        discrimination_index: 1.0,   // Độ phân biệt tốt
        guessing_param: 0.25         // Xác suất đoán mò (4 đáp án)
      };
    }
    // ---------------------------------------

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
// API lấy câu hỏi thật từ Supabase (GET)
router.get('/:topicId', async (req, res) => {
  const { topicId } = req.params;

  try {
    // 1. Dùng Supabase kéo câu hỏi lên dựa theo topicId
    const { data: questions, error } = await supabase
      .from('questions')
      .select('*')
      .eq('topic_id', topicId)
      // Tạm thời lấy ngẫu nhiên/câu đầu tiên. 
      // (Bản nâng cấp sau này sẽ gọi AI Python để chọn câu có độ khó khớp với Theta của học sinh)
      .limit(1); 

    if (error) throw error;

    if (!questions || questions.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy câu hỏi nào cho chủ đề này trong Database" });
    }

    const question = questions[0];

    // 2. Chế biến lại dữ liệu từ Database cho khớp với "khẩu vị" của Frontend
    res.json({
      id: question.id,
      content: question.content,          
      correctKey: question.correct_answer,  
      options: question.options           
    });

  } catch (error) {
    console.error("Lỗi lấy câu hỏi từ DB:", error);
    res.status(500).json({ error: "Lỗi hệ thống khi lấy câu hỏi từ Database" });
  }
});
module.exports = router;
// API nhận cục dữ liệu tracking hành vi và gửi sang AI Python
router.post('/behavior', async (req, res) => {
  const { studentId, events } = req.body;

  try {
    // Gọi sang file irtService.js để bắn data qua Python
    const aiResult = await irtService.analyzeBehavior(studentId, events);

    // 🚧 TƯƠNG LAI: Lưu aiResult.profile vào Supabase ở đây để theo dõi sự tiến bộ

    // Trả kết quả AI phân tích được về cho Frontend log ra xem chơi
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