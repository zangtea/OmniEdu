// frontend/hooks/useBehaviorTracker.ts
import { useRef, useCallback } from 'react';

export function useBehaviorTracker(sessionId: string, studentId: string) {
  const questionStartRef = useRef<number>(0);
  const chosenRef = useRef<string | null>(null);

  const trackEvent = useCallback(async (eventType: string, payload: object) => {
    // Vẫn giữ log ở Console để bạn dễ theo dõi quá trình
    console.log(`🎯 [Behavior Event] ${eventType}:`, {
      ...payload,
      hour_of_day: new Date().getHours()
    });

    // MỞ KHÓA: Bắn dữ liệu thẳng về Backend Node.js
    try {
      const response = await fetch(`http://localhost:5000/quiz/behavior`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: studentId,
          // Gói sự kiện hiện tại vào trong 1 mảng (Array) để đúng ý Python
          events: [{
            event_type: eventType,
            payload: { ...payload, hour_of_day: new Date().getHours() },
            clientTs: new Date().toISOString(),
            sessionId: sessionId
          }]
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // In luôn kết quả AI phân tích được ra cho nóng!
        console.log("🧠 [AI Profile Updated]:", data.profile);
      }
    } catch (error) {
      console.error("Lỗi khi gửi tracking hành vi:", error);
    }
  }, [sessionId, studentId]);

  const onQuestionView = useCallback((questionId: string) => {
    questionStartRef.current = Date.now();
    trackEvent('question_view', { questionId });
  }, [trackEvent]);

  const onOptionSelect = useCallback((key: string, questionId: string) => {
    const prevChosen = chosenRef.current;
    
    // Nếu trước đó đã chọn đáp án khác -> Tracking hành vi "Đổi ý định"
    if (prevChosen && prevChosen !== key) {
      trackEvent('option_change', {
        questionId,
        from_key: prevChosen,
        to_key: key,
        time_before_change_ms: Date.now() - questionStartRef.current,
      });
    }
    chosenRef.current = key;
  }, [trackEvent]);

  const onSubmit = useCallback(
    (questionId: string, chosenKey: string, isCorrect: boolean, hintUsed: boolean) => {
      trackEvent('answer_submit', {
        questionId, 
        chosenKey, 
        isCorrect, 
        hintUsed,
        total_time_ms: Date.now() - questionStartRef.current,
      });
      chosenRef.current = null;
    }
  , [trackEvent]);

  return { onQuestionView, onOptionSelect, onSubmit, trackEvent };
}