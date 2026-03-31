// src/middleware/auth.js
module.exports = (req, res, next) => {
  // TODO: Sau này sẽ thêm logic verify token JWT của Supabase ở đây
  // Hiện tại giả lập ID của một học sinh để test API (chú ý: phải là UUID chuẩn)
  req.studentId = '00000000-0000-0000-0000-000000000000'; 
  next();
};