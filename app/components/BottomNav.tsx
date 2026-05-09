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
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-6 pb-8 pt-4 bg-zinc-950/40 backdrop-blur-2xl border-t border-zinc-800/50">
      <div className="flex items-center justify-between max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          if (item.primary) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative group -mt-12"
              >
                <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-2xl shadow-indigo-600/40 border-[6px] border-zinc-950 transition-all group-active:scale-90 group-hover:bg-indigo-500">
                  {item.icon}
                </div>
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                   <span className={`text-[10px] font-black uppercase tracking-wider transition-colors ${isActive ? 'text-indigo-400' : 'text-zinc-500'}`}>
                    {item.label}
                   </span>
                </div>
              </Link>
            );
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1.5 transition-all active:scale-95 ${
                isActive ? "text-indigo-400" : "text-zinc-500 hover:text-zinc-400"
              }`}
            >
              <div className={`p-2.5 rounded-2xl transition-all ${isActive ? "bg-indigo-500/10" : "bg-transparent"}`}>
                {item.icon}
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
