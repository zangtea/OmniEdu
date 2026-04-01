# api_engine.py
from fastapi import FastAPI
from pydantic import BaseModel
from irt_engine import IRTEngine, StudentAbility, Question
from typing import List, Dict, Any
from behavior_analyzer import BehaviorProfile, update_profile

app    = FastAPI()
engine = IRTEngine()

class UpdateRequest(BaseModel):
    theta:          float
    confidence:     float
    responses:      int
    difficulty:     float
    discrimination: float
    guessing:       float
    is_correct:     bool

@app.post("/update")
def update(req: UpdateRequest):
    student  = StudentAbility(req.theta, req.confidence, req.responses)
    # Đã sửa lỗi thêm id="q" ở đây nhé:
    question = Question(id="q", difficulty=req.difficulty, discrimination=req.discrimination, guessing=req.guessing)
    
    updated  = engine.update_ability(student, question, req.is_correct)
    level    = engine.describe_level(updated.theta)
    
    return {
        "theta":      updated.theta,
        "confidence": updated.confidence,
        "responses":  updated.responses,
        "level":      level,
        "converged":  engine.is_converged(updated)
    }

@app.get("/health")
def health(): return {"status": "ok"}


class BehaviorRequest(BaseModel):
    studentId: str
    events: List[Dict[str, Any]]

@app.post("/analyze-behavior")
def analyze_behavior(req: BehaviorRequest):
    # Khởi tạo profile mặc định cho phiên tính toán
    profile = BehaviorProfile()
    
    # Đưa danh sách events vào hàm phân tích
    updated_profile = update_profile(profile, req.events)
    
    # Trả kết quả về cho Node.js ghi vào Supabase
    return {"profile": updated_profile.__dict__}