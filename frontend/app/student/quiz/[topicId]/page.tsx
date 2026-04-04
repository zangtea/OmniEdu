"use client";

import { useState, useEffect, use } from "react";
import { Button } from "../../../../components/ui/Button";
import { OptionCard } from "../../../../components/ui/OptionCard";
import { X, Sparkles, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useBehaviorTracker } from "../../../../hooks/useBehaviorTracker";

interface QuestionData {
  id: string;
  content: string;
  correctKey: string;
  options: { key: string; text: string }[];
}

export default function QuizPage({ params }: { params: Promise<{ topicId: string }> }) {
  const { topicId } = use(params);

  const [question, setQuestion] = useState<QuestionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Thêm state để quản lý điểm Theta hiện thị trên UI (Mặc định là 0.35)
  const [theta, setTheta] = useState<number>(0.35);

  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isHintOpen, setIsHintOpen] = useState(false);
  const [hintText, setHintText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const { onQuestionView, onOptionSelect, onSubmit, trackEvent } = useBehaviorTracker("session-123", "student-456");

  // Lấy câu hỏi từ Backend (Giữ nguyên)
  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`http://localhost:5000/quiz/${topicId}`);
        if (!response.ok) throw new Error('Không thể kết nối đến Backend');
        const data = await response.json();
        setQuestion(data);
      } catch (error) {
        console.warn("⚠️ Đang dùng dữ liệu giả", error);
        setQuestion({
          id: "question-math-01",
          content: "Tìm m để hàm số y = x^3 - 3mx^2 đồng biến trên R",
          correctKey: "A",
          options: [
            { key: "A", text: "m = 0" }, { key: "B", text: "m > 0" },
            { key: "C", text: "m < 0" }, { key: "D", text: "m = 1" }
          ]
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestion();
  }, [topicId]);

  useEffect(() => {
    if (question?.id) onQuestionView(question.id);
  }, [question?.id, onQuestionView]);

  const handleSelect = (key: string) => {
    if (!isSubmitted && question) {
      setSelectedKey(key);
      onOptionSelect(key, question.id);
    }
  };

  // NỐI API: Gửi kết quả về Backend khi nộp bài
  const handleConfirm = async () => {
    if (selectedKey && question) {
      setIsSubmitted(true);
      const isCorrect = String(selectedKey).trim().toUpperCase() === String(question.correctKey).trim().toUpperCase();
      onSubmit(question.id, selectedKey, isCorrect, isHintOpen);

      try {
        const response = await fetch(`http://localhost:5000/quiz/submit-answer`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            // Vì Backend của bạn có dùng middleware auth, ta tạm truyền 1 token giả
            'Authorization': 'Bearer test_student_token_123' 
          },
          body: JSON.stringify({
            questionId: question.id,
            isCorrect: isCorrect,
            topicId: decodeURIComponent(topicId)
          })
        });

        if (response.ok) {
          const data = await response.json();
          console.log("🎯 Cập nhật Theta từ Backend:", data);
          // Cập nhật điểm Theta mới lên góc phải màn hình
          if (data.newTheta !== undefined) {
            setTheta(Number(data.newTheta.toFixed(2))); 
          }
        } else {
          console.error("Lỗi từ Backend:", await response.text());
        }
      } catch (error) {
        console.error("Lỗi kết nối khi nộp bài:", error);
      }
    }
  };

  const getOptionState = (key: string) => {
    if (!isSubmitted || !question) return selectedKey === key ? "selected" : "default";
    
    // Chuẩn hóa cả 2 bên trước khi vẽ màu UI
    const safeCorrectKey = String(question.correctKey).trim().toUpperCase();
    const safeKey = String(key).trim().toUpperCase();

    if (safeKey === safeCorrectKey) return "correct"; // Màu xanh cho đáp án đúng
    if (selectedKey === key && safeKey !== safeCorrectKey) return "incorrect"; // Màu đỏ nếu chọn sai
    
    return "default";
  };
  const openAndSimulateHint = () => {
    setIsHintOpen(true);
    if (question) trackEvent('hint_request', { questionId: question.id });
    setIsTyping(true);
    setHintText("");
    
    const fullText = "Chào bạn! Hãy bình tĩnh nháp thử nhé, bạn làm được mà! ✌️";
    let i = 0;
    const interval = setInterval(() => {
      setHintText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) { clearInterval(interval); setIsTyping(false); }
    }, 20);
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!question) return null;

  return (
    <div className="min-h-screen bg-base flex flex-col items-center py-6 px-4 font-sans relative overflow-hidden">
      <div className="w-full max-w-lg space-y-6">
        
        {/* Top Bar */}
        <div className="flex items-center justify-between">
          <button className="p-2 text-sub hover:bg-gray-200 rounded-full transition-colors"><X className="w-5 h-5" /></button>
          <div className="flex-1 mx-4">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 w-2/5 rounded-full"></div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Hiển thị điểm Theta lấy từ State */}
            <span className="text-sm font-semibold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full transition-all duration-500">
              θ {theta}
            </span>
          </div>
        </div>

        {/* Question Zone */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-[18px] font-semibold text-main leading-relaxed">{question.content}</h2>
        </div>

        {/* Options Zone */}
        <div className="space-y-[10px]">
          {question.options.map((opt) => (
            <OptionCard key={opt.key} letter={opt.key} state={getOptionState(opt.key)} onClick={() => handleSelect(opt.key)} disabled={isSubmitted}>
              {opt.text}
            </OptionCard>
          ))}
        </div>

        {/* Bottom Action Bar */}
        <div className="flex items-center gap-3 pt-4">
          <Button variant="ai" className="gap-2 px-4" onClick={openAndSimulateHint}><Sparkles className="w-4 h-4" /> Gợi ý AI</Button>
          <Button variant={isSubmitted ? "success" : "primary"} className="flex-1" disabled={!selectedKey && !isSubmitted} onClick={isSubmitted ? () => window.location.reload() : handleConfirm}>
            {isSubmitted ? "Câu tiếp theo" : "Xác nhận"}
          </Button>
        </div>
      </div>
    </div>
  );
}