import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { Card, CARD_COLORS, CATEGORY_LABELS } from "@/lib/types";

interface Props {
  card: Card;
  index: number;
  onClick: (id: string) => void;
}

export default function CardItem({ card, index, onClick }: Props) {
  const color = CARD_COLORS[card.id] || "#6366f1";
  
  return (
    <motion.button
      key={card.id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      onClick={() => onClick(card.id)}
      className="group relative flex flex-col bg-zinc-900 border border-zinc-800 rounded-[2rem] p-3 text-left hover:border-indigo-500/50 transition-all duration-500 overflow-hidden"
    >
      {/* Background Glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" 
           style={{ background: `radial-gradient(circle at 50% 100%, ${color}20, transparent 80%)` }} />
      
      {/* Image Container */}
      <div className="relative aspect-[4/5] rounded-[1.5rem] overflow-hidden bg-zinc-950 mb-4">
        <img
          src={card.image_url || `/card/${card.id}.png`}
          alt={card.label}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent opacity-60" />
        
        {/* Price Tag Floating */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <div className="px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-black text-white tracking-widest">
            ฿{card.price}
          </div>
          <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg scale-0 group-hover:scale-100 transition-transform duration-300">
            <ChevronRight size={16} />
          </div>
        </div>
      </div>

      <div className="px-2 pb-2">
        <h3 className="font-black text-white text-base md:text-lg leading-tight group-hover:text-indigo-400 transition-colors">
          {card.label}
        </h3>
        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] mt-1">
          {CATEGORY_LABELS[card.category]} SERIES
        </p>
      </div>
    </motion.button>
  );
}
