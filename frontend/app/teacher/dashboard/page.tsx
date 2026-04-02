"use client";

import { Users, TrendingUp, AlertTriangle, BookOpen, Bell } from "lucide-react";

export default function TeacherDashboard() {
  return (
    <div className="min-h-screen bg-base font-sans pb-10">
      
      {/* Header khu vực Giáo viên */}
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 text-white p-2 rounded-xl">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-main">OmniEdu Teacher</h1>
            <p className="text-sm text-sub">Lớp Toán 12A1 · Học kỳ II</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="relative p-2 text-sub hover:bg-gray-100 rounded-full transition-colors">
            <Bell className="w-6 h-6" />
            <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <div className="w-10 h-10 rounded-full bg-indigo-100 border-2 border-indigo-200 flex items-center justify-center font-bold text-indigo-700">
            GV
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 pt-8 space-y-8">
        
        {/* Lời chào */}
        <div>
          <h2 className="text-h2 text-main mb-1">Chào buổi chiều, Cô giáo! 👋</h2>
          <p className="text-sub">Đây là tổng quan tình hình học tập của lớp hôm nay.</p>
        </div>

        {/* 3 Thẻ Thống Kê Tổng Quan */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-sub mb-1">Tổng học sinh</p>
              <h3 className="text-3xl font-bold text-main">42</h3>
              <p className="text-sm text-green-600 mt-2 font-medium">Đang hoạt động: 38</p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-sub mb-1">Năng lực trung bình (θ)</p>
              <h3 className="text-3xl font-bold text-main">0.65</h3>
              <p className="text-sm text-green-600 mt-2 font-medium">↑ 0.12 so với tuần trước</p>
            </div>
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-sub mb-1">Cần hỗ trợ khẩn cấp</p>
              <h3 className="text-3xl font-bold text-red-600">5</h3>
              <p className="text-sm text-red-500 mt-2 font-medium">Phát hiện bởi AI Tracker</p>
            </div>
            <div className="p-3 bg-red-50 text-red-600 rounded-xl">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Khu vực nội dung chính: Bảng Nhiệt và Danh sách Cảnh báo */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cột trái (Chiếm 2/3): Bảng nhiệt năng lực */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-main">Biểu đồ nhiệt năng lực lớp (Skill Heatmap)</h3>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500"></span> Khá/Giỏi</div>
                <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-400"></span> Trung bình</div>
                <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500"></span> Yếu</div>
              </div>
            </div>

            {/* Khung Heatmap */}
            <div className="space-y-4">
              {[
                { topic: "Khảo sát hàm số", skills: ["green", "green", "green", "amber", "green"] },
                { topic: "Phương trình Logarit", skills: ["green", "amber", "amber", "red", "amber"] },
                { topic: "Tích phân & Ứng dụng", skills: ["amber", "red", "red", "red", "amber"] },
                { topic: "Khối đa diện", skills: ["green", "green", "amber", "green", "green"] },
              ].map((row, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="w-40 text-sm font-medium text-sub truncate" title={row.topic}>
                    {row.topic}
                  </div>
                  <div className="flex-1 grid grid-cols-5 gap-2">
                    {row.skills.map((color, sIdx) => (
                      <div 
                        key={sIdx} 
                        className={`h-10 rounded-lg transition-all hover:scale-105 cursor-pointer ${
                          color === 'green' ? 'bg-green-500 hover:bg-green-600' : 
                          color === 'amber' ? 'bg-amber-400 hover:bg-amber-500' : 
                          'bg-red-500 hover:bg-red-600'
                        }`}
                        title="Click để xem chi tiết"
                      ></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-indigo-50 text-indigo-700 rounded-xl text-sm flex items-start gap-2">
              <span className="font-bold">💡 Gợi ý từ AI:</span>
              <p>Lớp đang gặp khó khăn nghiêm trọng ở chuyên đề <b>Tích phân & Ứng dụng</b>. Cô giáo nên tổ chức một buổi ôn tập chuyên đề này vào tiết học tới.</p>
            </div>
          </div>

          {/* Cột phải (Chiếm 1/3): Cảnh báo AI */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-main flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Cần hỗ trợ (5)
              </h3>
              <span className="px-2 py-1 bg-red-50 text-red-600 rounded-md text-xs font-bold">Khẩn cấp</span>
            </div>

            {/* Danh sách học sinh */}
            <div className="space-y-3 flex-1">
              {[
                { name: "Nguyễn Văn A", issue: "Tích phân & Ứng dụng", avatar: "A", color: "bg-blue-100 text-blue-700" },
                { name: "Trần Thị B", issue: "Tích phân & Ứng dụng", avatar: "B", color: "bg-pink-100 text-pink-700" },
                { name: "Lê Hoàng C", issue: "Phương trình Logarit", avatar: "C", color: "bg-amber-100 text-amber-700" },
                { name: "Phạm Văn D", issue: "Tích phân & Ứng dụng", avatar: "D", color: "bg-green-100 text-green-700" },
              ].map((student, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-xl border border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer group">
                  {/* Avatar chữ cái */}
                  <div className={`w-10 h-10 rounded-full font-bold flex items-center justify-center shrink-0 ${student.color}`}>
                    {student.avatar}
                  </div>
                  
                  {/* Thông tin */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-main truncate group-hover:text-indigo-600 transition-colors">
                      {student.name}
                    </h4>
                    <p className="text-xs text-red-500 truncate mt-0.5">
                      Hổng: {student.issue}
                    </p>
                  </div>
                  
                  {/* Nút thao tác */}
                  <button className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold whitespace-nowrap bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors">
                    Hỗ trợ
                  </button>
                </div>
              ))}
            </div>

            {/* Nút xem thêm */}
            <button className="w-full mt-4 py-2.5 border-2 border-dashed border-gray-200 text-sub rounded-xl hover:bg-gray-50 hover:text-main transition-colors font-semibold text-sm">
              Xem tất cả học sinh
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}