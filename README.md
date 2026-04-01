# OmniEdu

OmniEdu là một bộ công cụ học tập thích ứng, kết hợp giữa:

- **Frontend**: ứng dụng Next.js + Tailwind CSS.
- **Backend**: API Express.js kết nối Supabase.
- **AI Engine**: mô-đun Python dùng cho phân tích hành vi và mô hình IRT.

## Cấu trúc dự án

- `ai-engine/`
  - `api_engine.py`: điểm khởi đầu cho các API và logic máy học.
  - `behavior_analyzer.py`: mô-đun phân tích hành vi người dùng.
  - `irt_engine.py`: mô-đun tính toán Item Response Theory.
- `backend/`
  - `app.js`: server Express chính.
  - `src/db.js`: cấu hình Supabase.
  - `src/routes/`: các tuyến API hiện có.
- `frontend/`
  - `src/app/`: ứng dụng Next.js.
  - `package.json`: các lệnh phát triển và phụ thuộc frontend.

## Yêu cầu

- Node.js 18+ / 20+
- npm
- Python 3.11+ (nếu bạn muốn chạy hoặc phát triển phần `ai-engine`)
- Supabase project để lưu trữ và truy vấn dữ liệu

## Chạy dự án

### 1. Backend

```bash
cd backend
npm install
npm run dev
```

Backend sẽ chạy mặc định trên `http://localhost:3001`.

> Lưu ý: backend dùng `dotenv`, nên tạo file `.env` với các biến phù hợp như `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` và `FRONTEND_URL`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend sẽ chạy trên `http://localhost:3000`.

> Nếu dùng Supabase với frontend, cần thêm file `.env.local` hoặc cấu hình biến môi trường của Next.js tương ứng.

### 3. AI Engine

Phần `ai-engine` hiện tại là các mô-đun Python. Bạn có thể kích hoạt virtual environment và sử dụng các file Python theo nhu cầu:

```bash
cd ai-engine
python -m venv .venv
.venv\Scripts\activate
```

Sau đó, cài đặt thư viện cần thiết nếu có hoặc dùng môi trường hiện tại.

## Các thông tin chính

- `backend/app.js`: API kiểm tra trạng thái và kết nối Supabase.
- `backend/src/db.js`: lấy cấu hình Supabase từ biến môi trường.
- `frontend/src/app/page.tsx`: trang khởi đầu Next.js.

## Hướng phát triển

- Mở rộng API backend trong `backend/src/routes/`
- Thêm giao diện người dùng trong `frontend/src/app/`
- Hoàn thiện mô hình học thích ứng ở `ai-engine/`

## Liên hệ

Đây là tài liệu khởi tạo để bạn tiếp tục phát triển OmniEdu. Nếu cần, hãy bổ sung thêm phần mô tả chi tiết chức năng và môi trường cho từng module.