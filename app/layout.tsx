// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/ui/QueryProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PitchPad | Football Strategy Board",
  description: "Draw and share your football tactics and strategies.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* TanStack Query Provider로 전체 앱을 감쌉니다. */}
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
