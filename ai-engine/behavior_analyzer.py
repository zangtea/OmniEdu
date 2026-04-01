# behavior_analyzer.py
from dataclasses import dataclass

@dataclass
class BehaviorProfile:
    avg_read_ms:      float = 0
    avg_response_ms:  float = 0
    hint_rate:        float = 0
    change_mind_rate: float = 0
    preferred_hours:  list  = None
    learning_style:   str   = "unknown"
    streak_days:      int   = 0

def classify_learning_style(profile: BehaviorProfile) -> str:
    """ Phân loại phong cách học dựa trên behavioral signals. """
    read_ms   = profile.avg_read_ms
    hint_rate = profile.hint_rate
    change_r  = profile.change_mind_rate

    # Đọc kỹ (>30s/câu) + ít đổi đáp án → careful
    if read_ms > 30_000 and change_r < 0.15:
        return "careful"

    # Đọc nhanh (<8s) + ít hint + sai nhiều → fast_guesser
    if read_ms < 8_000 and hint_rate < 0.1:
        return "fast_guesser"

    # Đổi đáp án nhiều (>40%) + dùng hint nhiều → hesitant
    if change_r > 0.4 and hint_rate > 0.3:
        return "hesitant"

    return "steady"

def update_profile(profile: BehaviorProfile, session_events: list) -> BehaviorProfile:
    """Cập nhật profile sau mỗi session học."""
    submits = [e for e in session_events if e["event_type"] == "answer_submit"]
    if not submits:
        return profile

    times       = [e["payload"]["total_time_ms"] for e in submits]
    hints       = [e["payload"].get("hint_used", False) for e in submits]
    n           = len(submits)

    # EMA (exponential moving average) — ưu tiên data mới hơn
    alpha = 0.3
    profile.avg_response_ms = (
        (1 - alpha) * profile.avg_response_ms + alpha * (sum(times) / n)
    )
    profile.hint_rate = (
        (1 - alpha) * profile.hint_rate + alpha * (sum(hints) / n)
    )

    # Cập nhật preferred_hours
    starts = [e for e in session_events if e["event_type"] == "session_start"]
    if starts:
        hour = starts[0]["payload"].get("hour_of_day")
        if hour is not None:
            profile.preferred_hours = profile.preferred_hours or []
            profile.preferred_hours.append(hour)
            profile.preferred_hours = profile.preferred_hours[-20:]  # keep last 20

    profile.learning_style = classify_learning_style(profile)
    return profile