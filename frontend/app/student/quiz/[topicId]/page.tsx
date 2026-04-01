"use client";

import { useState, useEffect, use } from "react";
import { Button } from "../../../../components/ui/Button";
import { OptionCard } from "../../../../components/ui/OptionCard";
import { X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useBehaviorTracker } from "../../../../hooks/useBehaviorTracker";

// Cập nhật type của params thành Promise theo chuẩn Next.js mới
export default function QuizPage({ params }: { params: Promise<{ topicId: string }> }) {
  // Dùng React.use() để "mở hộp" Promise lấy topicId
  const { topicId } = use(params);

  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // State cho AI Hint Panel
  const [isHintOpen, setIsHintOpen] = useState(false);
  const [hintText, setHintText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Khởi tạo Behavior Tracker
  const { onQuestionView, onOptionSelect, onSubmit, trackEvent } = useBehaviorTracker(
    "session-123", 
    "student-456"
  );

  const question = {
    id: "question-math-01",
    content: "Tìm m để hàm số y = x^3 - 3mx^2 đồng biến trên R",
    correctKey: "A",
    options: [
      { key: "A", text: "m = 0" },
      { key: "B", text: "m > 0" },
      { key: "C", text: "m < 0" },
      { key: "D", text: "m = 1" }
    ]
  };

  // Tracking khi học sinh bắt đầu nhìn thấy câu hỏi
  useEffect(() => {
    onQuestionView(question.id);
  }, [onQuestionView, question.id]);

  const handleSelect = (key: string) => {
    if (!isSubmitted) {
      setSelectedKey(key);
      onOptionSelect(key, question.id); // Tracking hành vi chọn/đổi đáp án
    }
  };

  const handleConfirm = () => {
    if (selectedKey) {
      setIsSubmitted(true);
      const isCorrect = selectedKey === question.correctKey;
      onSubmit(question.id, selectedKey, isCorrect, isHintOpen); // Tracking kết quả làm bài
    }
  };

  const getOptionState = (key: string) => {
    if (!isSubmitted) return selectedKey === key ? "selected" : "default";
    if (key === question.correctKey) return "correct";
    if (selectedKey === key && key !== question.correctKey) return "incorrect";
    return "default";
  };

  // Hàm mở Gợi ý AI
  const openAndSimulateHint = () => {
    setIsHintOpen(true);
    trackEvent('hint_request', { questionId: question.id }); // Tracking hành vi dùng quyền trợ giúp
    
    setIsTyping(true);
    setHintText("");
    
    const fullText = "Chào bạn! Để hàm số bậc 3 đồng biến trên R, bạn cần nhớ lại điều kiện của đạo hàm bậc nhất. Đầu tiên, hãy thử tính đạo hàm y' xem sao? Sau đó, để y' ≥ 0 với mọi x, thì hệ số a và Δ (Delta) của y' phải thỏa mãn điều kiện gì nhỉ? Cứ bình tĩnh nháp thử nhé! ✌️";
    let i = 0;
    
    const interval = setInterval(() => {
      setHintText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 20);
  };

  return (
    <div className="min-h-screen bg-base flex flex-col items-center py-6 px-4 font-sans relative overflow-hidden">
      <div className="w-full max-w-lg space-y-6">
        
        {/* Top Bar */}
        <div className="flex items-center justify-between">
          <button className="p-2 text-sub hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
          <div className="flex-1 mx-4">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 w-2/5 rounded-full transition-all duration-500"></div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full">
              θ 0.35 · Khá
            </span>
          </div>
        </div>

        {/* Question Zone */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-md">Trung bình</span>
            {/* Sử dụng biến topicId đã được unwrap */}
            <span className="text-xs text-sub">Toán · {decodeURIComponent(topicId)}</span>
          </div>
          <h2 className="text-[18px] font-semibold text-main leading-relaxed">
            {question.content}
          </h2>
        </div>

        {/* Options Zone */}
        <div className="space-y-[10px]">
          {question.options.map((opt) => (
            <OptionCard
              key={opt.key}
              letter={opt.key}
              state={getOptionState(opt.key)}
              onClick={() => handleSelect(opt.key)}
              disabled={isSubmitted}
            >
              {opt.text}
            </OptionCard>
          ))}
        </div>

        {/* Bottom Action Bar */}
        <div className="flex items-center gap-3 pt-4">
          <Button variant="ai" className="gap-2 px-4" onClick={openAndSimulateHint}>
            <Sparkles className="w-4 h-4" /> Gợi ý AI
          </Button>
          <Button
            variant={isSubmitted ? "success" : "primary"}
            className="flex-1"
            disabled={!selectedKey && !isSubmitted}
            onClick={isSubmitted ? () => window.location.reload() : handleConfirm}
          >
            {isSubmitted ? "Câu tiếp theo" : "Xác nhận"}
          </Button>
        </div>
      </div>

      {/* AI Hint Bottom Sheet */}
      <AnimatePresence>
        {isHintOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsHintOpen(false)}
              className="fixed inset-0 bg-main/20 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 h-[60vh] bg-white z-50 rounded-t-3xl shadow-2xl flex flex-col max-w-lg mx-auto"
            >
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <div className="flex items-center gap-2 text-purple-700 font-semibold text-lg">
                  <Sparkles className="w-5 h-5" /> Gợi ý từ AI Tutor
                </div>
                <button 
                  onClick={() => setIsHintOpen(false)} 
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sub transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                <div className="bg-purple-50 border border-purple-100 text-main p-4 rounded-2xl rounded-tl-sm leading-relaxed relative">
                  {hintText}
                  {isTyping && (
                    <span className="inline-block w-2 h-4 bg-purple-500 ml-1 animate-pulse align-middle"></span>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}