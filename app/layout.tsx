import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kuroko Card Reserve — จองคิวการ์ด",
  description: "จองคิวซื้อการ์ด Kuroko Rivals ล่วงหน้า",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" data-theme="dark">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-zinc-950 text-zinc-100 min-h-screen font-sans" style={{ fontFamily: "'Kanit', sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
