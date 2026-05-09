import type { Metadata } from "next";
import "./globals.css";
import { getSession } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import BottomNav from "./components/BottomNav";

export const metadata: Metadata = {
  title: "Kuroko Card Reserve — จองคิวการ์ด",
  description: "จองคิวซื้อการ์ด Kuroko Rivals ล่วงหน้า",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  let userProfile = null;
  
  if (session) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, is_admin")
      .eq("id", session.user.id)
      .single();
    userProfile = profile;
  }

  return (
    <html lang="th" data-theme="dark" className="scroll-smooth">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@300;400;500;600;700&family=Russo+One&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-zinc-950 text-zinc-100 min-h-screen font-body pb-32 md:pb-0 overflow-x-hidden">
        {children}
        <BottomNav user={userProfile} />
      </body>
    </html>
  );
}
