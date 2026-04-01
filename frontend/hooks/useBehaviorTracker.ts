// frontend/hooks/useBehaviorTracker.ts
import { useRef, useCallback } from 'react';

export function useBehaviorTracker(sessionId: string, studentId: string) {
  const questionStartRef = useRef<number>(0);
  const chosenRef = useRef<string | null>(null);

  const trackEvent = useCallback(async (eventType: string, payload: object) => {
    // Tạm thời log ra Console để test Frontend
    console.log(`🎯 [Behavior Event] ${eventType}:`, {
      ...payload,
      hour_of_day: new Date().getHours()
    });

    // Tuần 5 chúng ta sẽ mở comment đoạn này để gửi về Node.js API
    /*
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId, sessionId, eventType,
        payload: { ...payload, hour_of_day: new Date().getHours() },
        clientTs: new Date().toISOString(),
      }),
    });
    */
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