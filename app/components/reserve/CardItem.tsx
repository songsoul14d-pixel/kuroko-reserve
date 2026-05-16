import { motion } from "framer-motion";
import { Card, CATEGORY_LABELS } from "@/lib/types";

interface Props {
  card: Card;
  index: number;
  onClick: (id: string) => void;
}

export default function CardItem({ card, index, onClick }: Props) {
  return (
    <motion.button
      key={card.id}
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.03 }}
      onClick={() => onClick(card.id)}
      className="group relative flex flex-col bg-white/[0.03] border border-white/[0.06] rounded-xl text-left hover:border-white/[0.12] transition-colors overflow-hidden"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden bg-zinc-900">
        <img
          src={card.image_url || `/card/${card.id}.png`}
          alt={card.label}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-white text-sm leading-tight">
            {card.label}
          </h3>
          <span className="text-sm font-bold text-zinc-400 shrink-0">
            ฿{card.price}
          </span>
        </div>
        <p className="text-[10px] text-zinc-600 mt-1">
          {CATEGORY_LABELS[card.category]}
        </p>
      </div>
    </motion.button>
  );
}
