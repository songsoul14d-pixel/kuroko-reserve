"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingCart, Clock, User, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  user?: any;
}

export default function BottomNav({ user }: Props) {
  const pathname = usePathname();

  const navItems = [
    { label: "หน้าแรก", icon: <Home size={22} />, href: "/" },
    { label: "คิว", icon: <Clock size={22} />, href: "/queue" },
    { 
      label: "จองคิว", 
      icon: <ShoppingCart size={24} />, 
      href: "/#reservation-section", 
      primary: true 
    },
    { label: "โปรไฟล์", icon: <User size={22} />, href: user ? "/profile" : "/login" },
  ];

  if (user?.is_admin) {
    navItems.push({ label: "แอดมิน", icon: <ShieldCheck size={22} />, href: "/admin" });
  }

  // Hide on login/signup pages
  if (pathname === "/login" || pathname === "/signup") return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-6 pb-safe-offset-4 pt-4 glass-premium">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-indigo-600/5 pointer-events-none" />
      
      <div className="flex items-end justify-between max-w-lg mx-auto relative h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          
          if (item.primary) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative -top-6"
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ y: -4 }}
                  className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white shadow-[0_0_25px_-5px_rgba(99,102,241,0.6)] border-4 border-zinc-950 transition-all"
                >
                  {item.icon}
                </motion.div>
                <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap">
                   <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
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
              className="relative flex flex-col items-center gap-1 min-w-[64px] touch-target-min"
            >
              <motion.div
                initial={false}
                animate={{
                  y: isActive ? -4 : 0,
                  color: isActive ? "#818cf8" : "#71717a",
                }}
                className={`p-2 rounded-xl transition-all ${
                  isActive ? "bg-indigo-500/10 shadow-[0_0_15px_-5px_rgba(99,102,241,0.3)]" : ""
                }`}
              >
                {item.icon}
              </motion.div>
              
              <AnimatePresence mode="wait">
                <motion.span
                  key={item.label}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`text-[9px] font-black uppercase tracking-[0.2em] ${
                    isActive ? "text-indigo-400" : "text-zinc-600"
                  }`}
                >
                  {item.label}
                </motion.span>
              </AnimatePresence>

              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -bottom-1 w-1 h-1 bg-indigo-500 rounded-full shadow-[0_0_8px_#6366f1]"
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
