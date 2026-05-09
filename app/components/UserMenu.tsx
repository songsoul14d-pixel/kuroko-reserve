"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { User, Shield, LogOut, ChevronDown, Settings } from "lucide-react";

interface Props {
  user: {
    username: string;
    is_admin?: boolean;
  };
}

export default function UserMenu({ user }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-all"
      >
        <User size={14} className="text-indigo-400" />
        <span className="text-sm font-bold text-zinc-300">{user.username}</span>
        <ChevronDown size={14} className={`text-zinc-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-2 space-y-1">
            <Link 
              href="/profile" 
              className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
              onClick={() => setIsOpen(false)}
            >
              <Settings size={14} /> จัดการโปรไฟล์
            </Link>
            
            {user.is_admin && (
              <Link 
                href="/admin" 
                className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg transition-all"
                onClick={() => setIsOpen(false)}
              >
                <Shield size={14} /> ระบบหลังบ้าน
              </Link>
            )}

            <div className="h-px bg-zinc-800 mx-2 my-1" />

            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
            >
              <LogOut size={14} /> ออกจากระบบ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
