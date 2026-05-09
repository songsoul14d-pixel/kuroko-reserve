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
    { label: "จองคิว", icon: <ShoppingCart size={20} />, href: "/#reservation-section", primary: true },
    { label: "โปรไฟล์", icon: <User size={20} />, href: user ? "/profile" : "/login" },
  ];

  if (user?.is_admin) {
    navItems.push({ label: "แอดมิน", icon: <ShieldCheck size={20} />, href: "/admin" });
  }

  if (pathname === "/login" || pathname === "/signup") return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2 bg-zinc-950/80 backdrop-blur-xl border-t border-white/5">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          if (item.primary) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-1 -mt-8"
              >
                <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/40 border-4 border-zinc-950 transition-transform active:scale-90">
                  {item.icon}
                </div>
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-wider">{item.label}</span>
              </Link>
            );
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center gap-1 transition-all ${
                isActive ? "text-indigo-400" : "text-zinc-500"
              }`}
            >
              <div className={`p-1 rounded-xl transition-all ${isActive ? "bg-indigo-500/10" : ""}`}>
                {item.icon}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
