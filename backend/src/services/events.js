// src/routes/events.js — nhận behavioral events từ frontend
const router    = require('express').Router();
const auth      = require('../middleware/auth');
const { supabase } = require('../db');

router.post('/', auth, async (req, res) => {
  const { sessionId, eventType, questionId, payload, clientTs } = req.body;

  // 1. Insert event
  const { error } = await supabase.from('behavior_events').insert({
    student_id:  req.studentId,
    session_id:  sessionId,
    event_type:  eventType,
    question_id: questionId || null,
    payload:     payload || {},
    client_ts:   clientTs,
  });

  if (error) return res.status(500).json({ error: error.message });

  // 2. Nếu là 'session_end' → trigger aggregate update (async, không block response)
  if (eventType === 'session_end') {
    updateBehaviorProfile(req.studentId, sessionId).catch(console.error);
  }

  res.json({ ok: true });
});

async function updateBehaviorProfile(studentId, sessionId) {
  // Lấy tất cả events của session này
  const { data: events } = await supabase
    .from('behavior_events')
    .select('*')
    .eq('student_id', studentId)
    .eq('session_id', sessionId);

  // Gọi Python analyzer
  const res = await fetch(`${process.env.IRT_ENGINE_URL}/analyze-behavior`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId, events }),
  });
  const updated = await res.json();

  // Upsert behavior_profiles
  await supabase.from('behavior_profiles').upsert({
    student_id:      studentId,
    ...updated.profile,
    updated_at:      new Date(),
  });
}

module.exports = router;