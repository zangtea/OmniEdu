"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { TrendingUp, Flame, Target } from "lucide-react";

// Dữ liệu giả lập biểu đồ Theta theo tuần
const chartData = [
  { day: "T2", theta: 0.2 },
  { day: "T3", theta: 0.35 },
  { day: "T4", theta: 0.3 },
  { day: "T5", theta: 0.5 },
  { day: "T6", theta: 0.65 },
  { day: "T7", theta: 0.82 },
  { day: "CN", theta: 0.95 },
];

// Dữ liệu đánh giá chủ đề (Skill Heatmap phong cách list)
const topics = [
  { name: "Hàm số & Đồ thị", theta: 0.95, level: "Giỏi", color: "bg-green-500", text: "text-green-700", bg: "bg-green-50" },
  { name: "Đạo hàm", theta: 0.45, level: "Trung bình", color: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50" },
  { name: "Tích phân", theta: -0.15, level: "Cần ôn tập", color: "bg-red-500", text: "text-red-700", bg: "bg-red-50" },
  { name: "Lượng giác", theta: 0.82, level: "Khá", color: "bg-indigo-500", text: "text-indigo-700", bg: "bg-indigo-50" },
];

export default function ProgressPage() {
  return (
    <div className="min-h-screen bg-base pb-10">
      {/* Header */}
      <div className="bg-indigo-500 text-white pt-12 pb-20 px-6 rounded-b-[40px] shadow-sm">
        <h1 className="text-h1 mb-2">Tiến trình học tập</h1>
        <p className="opacity-90">Theo dõi năng lực của bạn qua từng ngày nhé!</p>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-12 space-y-6">
        
        {/* Thẻ Thống kê tổng quan */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
            <Flame className="w-8 h-8 text-amber-500 mb-2" />
            <div className="text-2xl font-bold text-main">7 ngày</div>
            <div className="text-sm text-sub">Streak học tập</div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
            <Target className="w-8 h-8 text-indigo-500 mb-2" />
            <div className="text-2xl font-bold text-main">0.95</div>
            <div className="text-sm text-sub">Năng lực (Theta)</div>
          </div>
        </div>

        {/* Biểu đồ Theta (Line Chart) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-h2 text-main flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-500" />
              Sự tiến bộ tuần này
            </h2>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6B7280" }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6B7280" }} domain={[-1, 2]} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [`θ = ${value}`, 'Năng lực']}
                />
                <Line 
                  type="monotone" 
                  dataKey="theta" 
                  stroke="#4B6FD4" 
                  strokeWidth={4} 
                  dot={{ r: 4, fill: "#4B6FD4", strokeWidth: 2, stroke: "#fff" }} 
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bản đồ nhiệt kỹ năng (Skill Heatmap list) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-h2 text-main mb-4">Mức độ thông thạo</h2>
          <div className="space-y-4">
            {topics.map((topic, index) => (
              <div key={index} className="flex flex-col gap-2">
                <div className="flex justify-between items-end">
                  <span className="font-semibold text-main">{topic.name}</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded-md ${topic.bg} ${topic.text}`}>
                    {topic.level} (θ {topic.theta})
                  </span>
                </div>
                {/* Progress bar tùy chỉnh */}
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${topic.color}`}
                    style={{ width: `${Math.max(10, (topic.theta + 1.5) / 3.5 * 100)}%` }} // Chuyển đổi dải theta [-1.5, 2] sang %
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}