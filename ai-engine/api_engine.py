# api_engine.py
from fastapi import FastAPI
from pydantic import BaseModel
from irt_engine import IRTEngine, StudentAbility, Question
from typing import List, Dict, Any
from behavior_analyzer import BehaviorProfile, update_profile
from typing import List, Dict, Optional
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

class NextQuestionRequest(BaseModel):
    theta: float
    confidence: float
    responses: int
    pool: List[Dict] # Danh sách câu hỏi lấy từ DB
    answered_ids: List[str]
    behavior: Optional[Dict] = None

@app.post("/next-question")
def get_next_question(req: NextQuestionRequest):
    # 1. Khôi phục state của học sinh
    student = StudentAbility(req.theta, req.confidence, req.responses)
    
    # 2. Khôi phục pool câu hỏi (Chỉ lấy các tham số IRT)
    pool = [
        Question(
            id=q["id"], 
            difficulty=q["difficulty"], 
            discrimination=q["discrimination"], 
            guessing=q.get("guessing", 0.25)
        ) for q in req.pool
    ]
    
    # 3. Gọi engine chọn câu hỏi tối ưu nhất
    selected_q = engine.select_next_question(
        student=student, 
        pool=pool, 
        answered_ids=set(req.answered_ids),
        behavior=req.behavior
    )
    
    if not selected_q:
        return {"question_id": None}
        
    return {"question_id": selected_q.id}