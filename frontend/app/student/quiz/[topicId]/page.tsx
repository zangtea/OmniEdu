"use client";

import { useState, useEffect, use, useCallback } from "react";
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

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export default function QuizPage({ params }: { params: Promise<{ topicId: string }> }) {
  const { topicId } = use(params);

  const [theta, setTheta] = useState<number>(0.35); 
  const [answeredIds, setAnsweredIds] = useState<string[]>([]);
  
  const [question, setQuestion] = useState<QuestionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // State cho Chatbot AI
  const [isHintOpen, setIsHintOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]); 
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const [isFinished, setIsFinished] = useState(false); 
  const { onQuestionView, onOptionSelect, onSubmit, trackEvent } = useBehaviorTracker("session-123", "student-456");

  const fetchQuestion = useCallback(async (currentAnswered: string[], currentThetaVal: number) => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        theta: String(currentThetaVal),
        answered: currentAnswered.join(',')
      }).toString();

      const response = await fetch(`http://localhost:5000/quiz/${topicId}?${queryParams}`);
      
      if (!response.ok) {
          if (response.status === 404) {
             setIsFinished(true); 
             try {
                fetch(`http://localhost:5000/quiz/save-progress`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    studentId: "student-456", 
                    topicId: decodeURIComponent(topicId),
                    finalTheta: currentThetaVal 
                  })
                }).then(() => console.log("💾 Đã lưu điểm Theta vào Database an toàn!"));
             } catch (err) {
                console.error("Lỗi gọi API lưu điểm:", err);
             }
             return; 
          }
          throw new Error('Không thể kết nối đến Backend');
        }
      const data = await response.json();
      setQuestion(data);
    } catch (error) {
      console.warn("⚠️ Lỗi tải dữ liệu", error);
    } finally {
      setIsLoading(false);
    }
  }, [topicId]);

  useEffect(() => {
    fetchQuestion(answeredIds, theta);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          if (data.newTheta !== undefined) {
            setTheta(Number(data.newTheta.toFixed(2)));
          }
        }
      } catch (error) {
        console.error("Lỗi kết nối khi nộp bài:", error);
      }
    }
  };

  const handleNext = () => {
    if (!question) return;
    const newAnsweredIds = [...answeredIds, question.id];
    setAnsweredIds(newAnsweredIds);
    setSelectedKey(null);
    setIsSubmitted(false);
    setIsHintOpen(false); // Đóng khung chat khi qua câu mới
    setChatHistory([]); // Xóa lịch sử chat cũ
    fetchQuestion(newAnsweredIds, theta);
  };

  const getOptionState = (key: string) => {
    if (!isSubmitted || !question) return selectedKey === key ? "selected" : "default";
    const safeCorrectKey = String(question.correctKey).trim().toUpperCase();
    const safeKey = String(key).trim().toUpperCase();
    if (safeKey === safeCorrectKey) return "correct";
    if (selectedKey === key && safeKey !== safeCorrectKey) return "incorrect";
    return "default";
  };

  const openAndFetchHint = async () => {
    setIsHintOpen(true);
    const initialMessage: ChatMessage = { role: "user", content: question?.content || "" };
    const newHistory = [initialMessage];
    setChatHistory(newHistory);
    setIsTyping(true);

    try {
      const response = await fetch(`http://localhost:5000/quiz/get-hint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatHistory: newHistory }) 
      });

      const data = await response.json();
      if (data.success) {
        setChatHistory(prev => [...prev, { role: "assistant", content: data.hint }]);
      }
    } catch (err) {
      console.error("Lỗi gọi AI lần đầu:", err);
      setChatHistory(prev => [...prev, { 
        role: "assistant", 
        content: "⚠️ Gia sư đang bận hoặc mất kết nối mạng. Bạn hãy thử tải lại trang hoặc kiểm tra lại đường hầm nhé!" 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    
    const newUserMsg: ChatMessage = { role: "user", content: chatInput };
    const updatedHistory = [...chatHistory, newUserMsg];
    setChatHistory(updatedHistory);
    setChatInput(""); 
    setIsTyping(true);

    try {
      const response = await fetch(`http://localhost:5000/quiz/get-hint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatHistory: updatedHistory }) 
      });

      const data = await response.json();
      if (data.success) {
        setChatHistory(prev => [...prev, { role: "assistant", content: data.hint }]);
      }
    } catch (err) {
      console.error("Lỗi khi chat với AI:", err);
      setChatHistory(prev => [...prev, { 
        role: "assistant", 
        content: "⚠️ Ái chà, đường truyền bị đứt đoạn rồi. Mình chưa nhận được câu hỏi của bạn, hãy gửi lại nhé!" 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (isFinished) {
    return (
      <div className="min-h-screen bg-base flex flex-col items-center justify-center p-4 font-sans">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center space-y-6 max-w-md w-full"
        >
          <div className="text-6xl">🎓</div>
          <div>
            <h2 className="text-2xl font-bold text-main mb-2">Hoàn thành xuất sắc!</h2>
            <p className="text-sub">Bạn đã chinh phục toàn bộ ngân hàng câu hỏi của chủ đề này.</p>
          </div>
          <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
            <p className="text-sm text-indigo-600 font-semibold mb-2">NĂNG LỰC (THETA) CUỐI CÙNG</p>
            <p className="text-5xl font-extrabold text-indigo-700">{theta}</p>
          </div>
          <Button variant="primary" className="w-full" onClick={() => window.location.href = '/'}>
            Về trang chủ
          </Button>
        </motion.div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-base flex flex-col items-center py-6 px-4 font-sans">
        <div className="w-full max-w-lg space-y-6 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            <div className="flex-1 mx-4 h-2 bg-gray-200 rounded-full"></div>
            <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-28 flex flex-col justify-center">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="space-y-[10px]">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-[68px] bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4">
                <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 pt-4">
            <div className="w-28 h-12 bg-gray-200 rounded-xl"></div>
            <div className="flex-1 h-12 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

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
          <Button variant="ai" className="gap-2 px-4" onClick={openAndFetchHint} disabled={isHintOpen || isTyping}>
            <Sparkles className="w-4 h-4" /> Gợi ý AI
          </Button>
                      
          <Button variant={isSubmitted ? "success" : "primary"} className="flex-1" disabled={!selectedKey && !isSubmitted} onClick={isSubmitted ? handleNext : handleConfirm}>
            {isSubmitted ? "Câu tiếp theo" : "Xác nhận"}
          </Button>
        </div>

        {/* Khu vực Giao diện Chat */}
        <AnimatePresence>
          {isHintOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-6 p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex flex-col space-y-4 max-h-96"
            >
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {chatHistory.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                      msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-br-sm' 
                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm whitespace-pre-line'
                    }`}>
                      {msg.role === 'user' && idx === 0 ? "Gia sư ơi, gợi ý giúp em câu này với!" : msg.content}
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-bl-sm text-gray-500 italic text-sm animate-pulse">
                      🤖 Gia sư đang suy nghĩ...
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2 border-t border-indigo-100/50">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                  placeholder="Hỏi thêm gia sư về bước giải..."
                  className="flex-1 px-4 py-2 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <button 
                  onClick={handleSendChat}
                  disabled={isTyping || !chatInput.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  Gửi
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
      </div>
    </div>
  );
}