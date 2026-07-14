// src/routes/ai.js
const router = require('express').Router();
const { supabase } = require('../db');

router.post('/hint', async (req, res) => {
  try {
    const { studentId, questionId } = req.body;

    // 1. Gom toàn bộ Context (Bối cảnh) của học sinh
    const [skill, behavior, question] = await Promise.all([
      supabase.from('skill_levels').select('theta').eq('student_id', studentId).single(),
      supabase.from('behavior_profiles').select('learning_style').eq('student_id', studentId).single(),
      supabase.from('questions').select('content').eq('id', questionId).single(),
    ]);

    // 2. Chuyển hóa tâm lý thành Lệnh cho AI (System Prompt phụ)
    const style = behavior?.data?.learning_style || "steady";
    const styleGuide = {
      careful: 'Học sinh rất cẩn thận. Hãy giải thích ngắn gọn, đi thẳng vào bản chất công thức.',
      fast_guesser: 'Học sinh có xu hướng đoán mò và ẩu. Hãy nhắc nhở đọc kỹ đề và chỉ đưa ra 1 gợi ý cực nhỏ để học sinh tự làm tiếp.',
      hesitant: 'Học sinh đang thiếu tự tin. Hãy dùng giọng điệu ấm áp, khen ngợi nỗ lực và chia nhỏ bài toán ra thành 3 bước siêu dễ.',
      steady: 'Hãy cân bằng giữa việc giải thích và đặt câu hỏi gợi mở.'
    }[style];

    // 3. Đóng gói tin nhắn gửi sang Colab (Llama 3.1)
    const userMessage = `
[THÔNG TIN HỌC SINH]
- Năng lực hiện tại: ${skill?.data?.theta?.toFixed(2) || 0}
- Hướng dẫn sư phạm: ${styleGuide}

[CÂU HỎI HỌC SINH ĐANG MẮC KẸT]
${question?.data?.content}

Dựa vào các thông tin trên, hãy đưa ra gợi ý phù hợp nhất (không nói toạc đáp án).`;

    // 4. Gọi sang Ngrok URL của Google Colab
    // LƯU Ý: Phải chèn link Ngrok của bạn vào biến môi trường LLM_NGROK_URL trong file .env
    const ngrokUrl = process.env.LLM_NGROK_URL; 
    
    const aiResponse = await fetch(`${ngrokUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversation: [
          { role: "user", content: userMessage }
        ]
      })
    });

    const aiData = await aiResponse.json();

    // Trả kết quả AI về cho Frontend hiển thị
    res.json({ hint: aiData.reply });

  } catch (error) {
    console.error("Lỗi khi gọi Gia sư AI:", error);
    res.status(500).json({ error: "Lỗi kết nối đến Colab AI" });
  }
});

module.exports = router;