"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, Trophy, Target, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link"; // Để chuyển hướng sang trang làm bài

interface ProgressData {
  id: string;
  topic_id: string;
  current_theta: number;
}

export default function DashboardPage() {
  const [progressList, setProgressList] = useState<ProgressData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Hardcode studentId để test, sau này sẽ lấy từ Token đăng nhập
  const studentId = "student-456";

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await fetch(`http://localhost:5000/quiz/student-progress/${studentId}`);
        if (!response.ok) throw new Error("Lỗi khi tải dữ liệu");
        
        const data = await response.json();
        if (data.success && data.progress) {
          setProgressList(data.progress);
        }
      } catch (error) {
        console.error("Lỗi gọi API Dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgress();
  }, []);

  // Hàm chuyển đổi Theta (thường từ -3 đến +3) sang phần trăm (0% - 100%) để vẽ thanh tiến trình
  const thetaToPercentage = (theta: number) => {
    const normalized = ((theta + 3) / 6) * 100;
    return Math.max(0, Math.min(100, Math.round(normalized)));
  };

  // Hàm map topic_id thành Tên môn học cho đẹp
  const getTopicName = (id: string) => {
    if (id === "toan-12") return "Toán Học 12";
    if (id === "tieng-anh") return "Ngữ Pháp Tiếng Anh";
    return id;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-base flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header (Lời chào) */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <h1 className="text-3xl font-bold text-main">Chào mừng trở lại! 👋</h1>
          <p className="text-sub">Tiếp tục hành trình chinh phục kiến thức của bạn hôm nay nhé.</p>
        </motion.div>

        {/* Lưới các môn học */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {progressList.length === 0 ? (
            <div className="col-span-full p-8 bg-white rounded-2xl border border-gray-100 text-center text-sub">
              Bạn chưa học môn nào cả. Bắt đầu ngay thôi!
            </div>
          ) : (
            progressList.map((item, index) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group"
              >
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-0 opacity-50 group-hover:scale-110 transition-transform"></div>
                
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-sub">Năng lực (Theta)</p>
                      <p className="text-2xl font-bold text-main">{item.current_theta}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-main mb-1">{getTopicName(item.topic_id)}</h3>
                    
                    {/* Thanh Progress Bar */}
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-xs font-semibold text-sub">
                        <span>Sơ cấp</span>
                        <span>Cao thủ</span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${thetaToPercentage(item.current_theta)}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full bg-indigo-500 rounded-full"
                        ></motion.div>
                      </div>
                    </div>
                  </div>

                  {/* Nút Học tiếp */}
                  <div className="pt-4 border-t border-gray-50">
                    <Link href={`/student/quiz/${item.topic_id}`}>
                      <button className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-50 text-indigo-700 font-semibold rounded-xl hover:bg-indigo-600 hover:text-white transition-colors">
                        Học tiếp ngay <ArrowRight className="w-4 h-4" />
                      </button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}