"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  return (
    <button 
      onClick={handleLogout}
      className="p-2.5 bg-zinc-800 border border-zinc-700 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-400 rounded-xl text-zinc-500 transition-all"
    >
      <LogOut size={18} />
    </button>
  );
}
