import math
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class StudentAbility:
    theta:      float = 0.0   # năng lực hiện tại
    confidence: float = 1.0   # độ lệch chuẩn (nhỏ = chính xác)
    responses:  int   = 0     # số câu đã trả lời


@dataclass
class Question:
    id:             str
    difficulty:     float        # b
    discrimination: float        # a
    guessing:       float = 0.25 # c


class IRTEngine:
    """3-Parameter Logistic IRT với Bayesian ability update."""

    def probability_correct(
        self, student: StudentAbility, question: Question
    ) -> float:
        """P(đúng | θ) theo mô hình 3PL."""
        z = question.discrimination * (student.theta - question.difficulty)
        return question.guessing + (1 - question.guessing) / (1 + math.exp(-z))

    def fisher_information(
        self, student: StudentAbility, question: Question
    ) -> float:
        """Fisher Information — đo lường câu hỏi hữu ích đến đâu."""
        p = self.probability_correct(student, question)
        if p <= question.guessing or p >= 1:
            return 0.0
        a, c = question.discrimination, question.guessing
        numerator   = (a * (p - c)) ** 2
        denominator = (1 - c) ** 2 * p * (1 - p)
        return numerator / denominator if denominator > 0 else 0.0

    def update_ability(
        self,
        student:    StudentAbility,
        question:   Question,
        is_correct: bool,
        lr:         float = 0.3
    ) -> StudentAbility:
        """Cập nhật theta sau mỗi câu (gradient ascent trên log-likelihood)."""
        p       = self.probability_correct(student, question)
        obs     = 1.0 if is_correct else 0.0
        delta   = question.discrimination * (obs - p)

        # learning rate giảm dần khi có nhiều data
        eff_lr  = lr / (1 + 0.05 * student.responses)
        new_theta = student.theta + eff_lr * delta
        new_theta = max(-3.5, min(3.5, new_theta))  # clamp

       # Đảm bảo confidence không bao giờ bằng 0 để tránh lỗi ZeroDivisionError
        safe_confidence = max(student.confidence, 0.001)

        # Bayesian confidence update
        info          = p * (1 - p) * question.discrimination ** 2
        new_conf      = 1.0 / math.sqrt(1.0 / safe_confidence**2 + info)

        return StudentAbility(
            theta=new_theta,
            confidence=new_conf,
            responses=student.responses + 1
        )

    def select_next_question(
        self,
        student:      StudentAbility,
        pool:         list[Question],
        answered_ids: set[str],
        behavior:     dict | None = None   # behavioral profile
    ) -> Optional[Question]:
        """Chọn câu hỏi tối ưu, có tính đến behavior profile."""
        candidates = [q for q in pool if q.id not in answered_ids]
        if not candidates:
            return None

        # Điều chỉnh nếu học sinh hay đoán mò (change_mind_rate thấp + sai nhiều)
        theta_adj = student.theta
        if behavior and behavior.get("learning_style") == "fast_guesser":
            theta_adj -= 0.3  # cho câu dễ hơn để kiểm tra thực sự

        def score(q: Question) -> float:
            fi = self.fisher_information(
                StudentAbility(theta=theta_adj, confidence=student.confidence),
                q
            )
            # Ưu tiên câu chưa hỏi lâu (diversity bonus)
            return fi

        return max(candidates, key=score)

    def is_converged(
        self,
        student:   StudentAbility,
        threshold: float = 0.3
    ) -> bool:
        """Kết thúc session khi theta đã ổn định đủ."""
        return student.confidence < threshold and student.responses >= 5

    def describe_level(self, theta: float) -> dict:
        levels = [
            (-4.0, -2.0, "Cần ôn tập nhiều", "red"),
            (-2.0, -1.0, "Còn yếu",          "orange"),
            (-1.0,  0.0, "Trung bình yếu",   "amber"),
            ( 0.0,  0.5, "Trung bình",        "blue"),
            ( 0.5,  1.5, "Khá",               "teal"),
            ( 1.5,  2.5, "Giỏi",              "green"),
            ( 2.5,  4.0, "Xuất sắc",          "purple"),
        ]
        for lo, hi, label, color in levels:
            if lo <= theta < hi:
                return {"label": label, "color": color, "theta": round(theta, 2)}
        return {"label": "Xuất sắc", "color": "purple", "theta": round(theta, 2)}
