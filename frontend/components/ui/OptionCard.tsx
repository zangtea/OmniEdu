import React from "react";
import { cn } from "../../lib/utils";
import { Check, X } from "lucide-react";

export interface OptionCardProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  letter: string;
  state?: "default" | "selected" | "correct" | "incorrect";
}

export const OptionCard = React.forwardRef<HTMLButtonElement, OptionCardProps>(
  ({ className, letter, state = "default", children, ...props }, ref) => {
    
    // Base styles: Cao tối thiểu 56px, border bo góc, hiệu ứng chuyển màu mượt mà 150ms
    const baseStyles = "relative w-full min-h-[56px] flex items-center px-4 py-3 rounded-xl border-2 text-left transition-all duration-150 ease-in-out active:scale-[0.98]";

    // Style cho từng trạng thái theo đúng Spec
    const stateStyles = {
      default: "bg-white border-gray-200 text-gray-800 hover:bg-indigo-50 hover:border-indigo-300",
      selected: "bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/20 text-indigo-900",
      correct: "bg-green-50 border-green-500 text-green-900",
      incorrect: "bg-red-50 border-red-400 text-red-900",
    };

    // Style cho cái "chữ cái" (A, B, C, D) hình tròn ở đầu
    const letterStyles = {
      default: "bg-gray-100 text-gray-600 group-hover:bg-indigo-100 group-hover:text-indigo-600",
      selected: "bg-indigo-500 text-white",
      correct: "bg-green-500 text-white",
      incorrect: "bg-red-500 text-white",
    };

    return (
      <button
        ref={ref}
        className={cn("group", baseStyles, stateStyles[state], className)}
        {...props}
      >
        {/* Vòng tròn chứa chữ cái A, B, C, D */}
        <span
          className={cn(
            "flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold mr-3 transition-colors",
            letterStyles[state]
          )}
        >
          {letter}
        </span>

        {/* Nội dung đáp án */}
        <span className="flex-1 font-medium text-[16px]">
          {children}
        </span>

        {/* Icon Đúng/Sai (chỉ hiện khi state là correct hoặc incorrect) */}
        {state === "correct" && <Check className="w-5 h-5 text-green-600 ml-2" />}
        {state === "incorrect" && <X className="w-5 h-5 text-red-600 ml-2" />}
      </button>
    );
  }
);

OptionCard.displayName = "OptionCard";