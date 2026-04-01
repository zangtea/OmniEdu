import React from "react";
import { cn } from "../../lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "success" | "danger" | "ghost" | "ai";
  size?: "sm" | "md" | "lg" | "xl";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    
    // Quy tắc bắt buộc: border-radius 12px (rounded-xl), font 600
    // Animation: tap scale 0.97 trong 100ms ease-out
    const baseStyles = "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-100 ease-out active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none";

    // 6 Variants theo đúng Color System & Button spec
    const variants = {
      primary: "bg-indigo-500 text-white shadow-sm hover:bg-indigo-600",
      secondary: "border border-indigo-500 text-indigo-500 bg-transparent hover:bg-indigo-50",
      success: "bg-green-500 text-white hover:bg-green-600",
      danger: "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100",
      ghost: "text-indigo-500 bg-transparent hover:bg-indigo-50",
      ai: "bg-purple-50 text-purple-700 border border-purple-500 hover:bg-purple-100",
    };

    // Sizing quy định nghiêm ngặt theo px -> class Tailwind
    const sizes = {
      sm: "h-8 px-3 text-sm",     // 32px
      md: "h-10 px-4 text-base",  // 40px
      lg: "h-12 px-5 text-base",  // 48px
      xl: "h-14 px-6 text-lg",    // 56px
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";