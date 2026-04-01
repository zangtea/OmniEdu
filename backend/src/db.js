// src/db.js
const { createClient } = require('@supabase/supabase-js');

// Lấy thông tin từ file .env
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; 
// Khởi tạo client kết nối với database bằng Service Key
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = { supabase };