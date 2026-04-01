import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AdaptLearn - AI Adaptive Learning",
  description: "Nền tảng học tập thích ứng thông minh",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}