import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "抖音兴趣卡｜抖音开放平台",
  description: "把一个兴趣想法，变成人和人都能参与的内容。",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
