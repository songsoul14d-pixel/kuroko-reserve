"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingCart, Clock, User, ShieldCheck } from "lucide-react";

interface Props {
  user?: any;
}

export default function BottomNav({ user }: Props) {
  const pathname = usePathname();

  const navItems = [
    { label: "หน้าแรก", icon: <Home size={20} />, href: "/" },
    { label: "คิว", icon: <Clock size={20} />, href: "/queue" },
    { 
      label: "จองคิว", 
      icon: <ShoppingCart size={20} />, 
      href: "/#reservation-section", 
    },
    { label: "โปรไฟล์", icon: <User size={20} />, href: user ? "/profile" : "/login" },
  ];

  if (user?.is_admin) {
    navItems.push({ label: "แอดมิน", icon: <ShieldCheck size={20} />, href: "/admin" });
  }

  // Hide on login/signup pages
  if (pathname === "/login" || pathname === "/signup") return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-xl border-t border-white/[0.06] px-4 pb-safe-offset-4 pt-2">
      <div className="flex items-center justify-around max-w-lg mx-auto h-14">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center gap-0.5 min-w-[56px] py-1"
            >
              <span className={`transition-colors ${isActive ? "text-indigo-400" : "text-zinc-600"}`}>
                {item.icon}
              </span>
              <span className={`text-[9px] font-medium tracking-wide ${
                isActive ? "text-indigo-400" : "text-zinc-600"
              }`}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute -top-0.5 w-1 h-1 bg-indigo-400 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
