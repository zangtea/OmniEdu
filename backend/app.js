// app.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Cho phép frontend gọi API mà không bị chặn lỗi CORS
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

// Một API mặc định để kiểm tra xem server có đang "sống" không
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'OmniEdu Backend is running!' });
});
// Import cái supabase từ file db.js bạn vừa tạo
const { supabase } = require('./src/db');

// API test kết nối Supabase
app.get('/test-db', async (req, res) => {
  try {
    // Thử lấy dữ liệu từ bảng student_profiles (dù hiện tại nó đang trống rỗng)
    const { data, error } = await supabase.from('student_profiles').select('*').limit(5);

    if (error) {
      throw error; // Nếu có lỗi thì ném ra để block catch xử lý
    }

    res.json({
      status: 'success',
      message: 'Kết nối Supabase bằng Service Key THÀNH CÔNG! 🎉',
      data: data // Sẽ trả về mảng rỗng [] nếu chưa có dữ liệu
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Lỗi kết nối rồi: ' + err.message
    });
  }
});
// Nơi gắn các thư mục routes sau này (sẽ tạo sau)
 app.use('/quiz', require('./src/routes/quiz'));
 app.use('/events', require('./src/routes/events'));
// app.use('/analytics', require('./src/routes/analytics'));
// app.use('/ai', require('./src/routes/ai'));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 API đang chạy tại http://localhost:${PORT}`);
});