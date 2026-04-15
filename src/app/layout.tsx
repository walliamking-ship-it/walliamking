import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ERP系统 - 印刷包装管理",
  description: "印刷厂ERP管理系统",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  );
}
