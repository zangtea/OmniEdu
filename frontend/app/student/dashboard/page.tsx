"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, Trophy, Loader2, ArrowRight } from "lucide-react";
import { createBrowserClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";

interface ProgressData {
  id: string;
  topic_id: string;
  current_theta: number;
}

interface QuizHistoryItem {
  id: string;
  question_id: string;
  is_correct: boolean;
  created_at: string;
}

interface StatsData {
  totalTopics: number;
  totalResponses: number;
  averageTheta: number;
}

export default function DashboardPage() {
  const [progressList, setProgressList] = useState<ProgressData[]>([]);
  const [quizHistory, setQuizHistory] = useState<QuizHistoryItem[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  );
  const [studentId, setStudentId] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Wrapper fetch để tự động đính kèm JWT
  const fetchWithAuth = async (input: RequestInfo, init: RequestInit = {}) => {
    try {
      const headers = { ...(init.headers || {}) } as Record<string, any>;
      if (!headers['Content-Type']) headers['Content-Type'] = 'application/json';
      if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
      const res = await fetch(input, { ...init, headers });
      return res;
    } catch (err) {
      console.error('fetchWithAuth error (dashboard):', err);
      throw err;
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const session = data?.session ?? null;
        const id = session?.user?.id ?? null;
        setStudentId(id);
        setAccessToken(session?.access_token ?? null);

        if (!id) {
          setIsLoading(false);
          return;
        }

        // Fetch progress
        const progressRes = await fetchWithAuth(`http://localhost:5000/quiz/student-progress/${id}`);
        if (progressRes.ok) {
          const data = await progressRes.json();
          if (data.success && data.progress) setProgressList(data.progress);
        }

        // Fetch history
        const historyRes = await fetchWithAuth(`http://localhost:5000/quiz/history/${id}`);
        if (historyRes.ok) {
          const data = await historyRes.json();
          if (data.success) setQuizHistory(data.history || []);
        }

        // Fetch stats
        const statsRes = await fetchWithAuth(`http://localhost:5000/quiz/stats/${id}`);
        if (statsRes.ok) {
          const data = await statsRes.json();
          if (data.success) setStats(data);
        }
      } catch (error) {
        console.error("Lỗi gọi API Dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <h1 className="text-4xl font-bold text-main">Chào mừng trở lại! 👋</h1>
          <p className="text-sub">Tiếp tục hành trình chinh phục kiến thức của bạn hôm nay nhé.</p>
        </motion.div>

        {/* Stats Cards */}
        {stats && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {/* Card 1: Topics */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200 flex items-center gap-4">
              <div className="p-3 bg-blue-600 text-white rounded-xl">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-blue-700 font-semibold">Số môn học</p>
                <p className="text-3xl font-bold text-blue-900">{stats.totalTopics}</p>
              </div>
            </div>

            {/* Card 2: Total Answers */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200 flex items-center gap-4">
              <div className="p-3 bg-purple-600 text-white rounded-xl">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-purple-700 font-semibold">Câu đã làm</p>
                <p className="text-3xl font-bold text-purple-900">{stats.totalResponses}</p>
              </div>
            </div>

            {/* Card 3: Average Theta */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200 flex items-center gap-4">
              <div className="p-3 bg-green-600 text-white rounded-xl">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-green-700 font-semibold">Năng lực TBình</p>
                <p className="text-3xl font-bold text-green-900">{stats.averageTheta.toFixed(2)}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Topics Grid */}
        <div>
          <h2 className="text-2xl font-bold text-main mb-4">Các môn học của bạn</h2>
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
                      
                      {/* Progress Bar */}
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
                            className="h-full bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full"
                          ></motion.div>
                        </div>
                      </div>
                    </div>

                    {/* Button */}
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

        {/* Quiz History */}
        {quizHistory.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-main mb-4">Lịch sử làm bài gần đây</h2>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Thời gian</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Câu hỏi ID</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Kết quả</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {quizHistory.slice(0, 10).map((item, idx) => (
                      <motion.tr 
                        key={item.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm text-gray-800">
                          {new Date(item.created_at).toLocaleDateString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 font-mono">{item.question_id}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            item.is_correct 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {item.is_correct ? '✓ Đúng' : '✗ Sai'}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}