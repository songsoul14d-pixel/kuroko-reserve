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
        className="flex items-center gap-2 px-3 py-1.5 text-zinc-400 hover:text-white transition-colors"
      >
        <span className="text-sm font-medium">{user.username}</span>
        <ChevronDown size={12} className={`text-zinc-600 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-44 bg-[#0a0a0a] border border-white/[0.06] rounded-xl overflow-hidden z-50">
          <div className="p-1.5 space-y-0.5">
            <Link 
              href="/profile" 
              className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/[0.04] rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Settings size={14} /> จัดการโปรไฟล์
            </Link>
            
            {user.is_admin && (
              <Link 
                href="/admin" 
                className="flex items-center gap-2 px-3 py-2 text-sm text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/5 rounded-lg transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Shield size={14} /> ระบบหลังบ้าน
              </Link>
            )}

            <div className="h-px bg-white/[0.06] mx-2 my-1" />

            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 rounded-lg transition-colors"
            >
              <LogOut size={14} /> ออกจากระบบ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
