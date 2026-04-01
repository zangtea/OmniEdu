import { Button } from "../components/ui/Button";
import { OptionCard } from "../components/ui/OptionCard";
export default function Home() {
  return (
    <main className="p-12 space-y-12">
      <header>
        <h1 className="text-h1 text-indigo-500 mb-2">Xin chào, Frontend đã sẵn sàng! 🚀</h1>
        <p className="text-sub">Test các Component cốt lõi theo Design Spec</p>
      </header>

      {/* Test các màu sắc của nút */}
      <section className="space-y-4">
        <h2 className="text-h2">1. Button Variants</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary">Bắt đầu học</Button>
          <Button variant="secondary">Xem lại bài</Button>
          <Button variant="success">Câu tiếp theo</Button>
          <Button variant="danger">Hủy bỏ</Button>
          <Button variant="ghost">Bỏ qua</Button>
          <Button variant="ai">✦ Gợi ý từ AI Tutor</Button>
        </div>
      </section>

      {/* Test các kích thước của nút */}
      <section className="space-y-4">
        <h2 className="text-h2">2. Button Sizes</h2>
        <div className="flex flex-wrap items-center gap-4 border-t pt-8">
          <Button variant="primary" size="sm">Size SM (h-8)</Button>
          <Button variant="primary" size="md">Size MD (h-10)</Button>
          <Button variant="primary" size="lg">Size LG (h-12)</Button>
          <Button variant="primary" size="xl">Size XL (h-14)</Button>
        </div>
      </section>
    <section className="space-y-4">
        <h2 className="text-h2">3. Answer Option Cards (Các trạng thái)</h2>
        <div className="flex flex-col gap-[10px] bg-white p-6 rounded-2xl border shadow-sm">
          <OptionCard letter="A" state="default">
            Đây là đáp án bình thường (Hover thử nhé)
          </OptionCard>
          
          <OptionCard letter="B" state="selected">
            Đáp án đang được học sinh lựa chọn (Selected)
          </OptionCard>
          
          <OptionCard letter="C" state="correct">
            Đáp án chính xác (Correct)
          </OptionCard>
          
          <OptionCard letter="D" state="incorrect">
            Đáp án học sinh chọn sai (Incorrect)
          </OptionCard>
        </div>
      </section>
    </main>
  );
}