"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Card, CARD_COLORS, CATEGORY_LABELS } from "@/lib/types";
import { getAvailableWeeks } from "@/lib/utils";

// Sub-components
import CardItem from "./components/reserve/CardItem";
import ProcessSteps from "./components/reserve/ProcessSteps";
import ResultModal from "./components/reserve/ResultModal";
import ReservationModal from "./components/reserve/ReservationModal";

interface Props {
  cards: Card[];
  user?: any;
  settings?: any;
}

export default function CardGridClient({ cards, user, settings }: Props) {
  // State
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [confirmLimit, setConfirmLimit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: user?.full_name || "",
    facebookUrl: user?.facebook_url || "",
    ingameName: user?.ingame_name || "",
    quantity: 1,
    selectedWeeks: [] as string[],
    notes: "",
  });

  const availableWeeks = getAvailableWeeks();
  const selectedCardData = cards.find((c) => c.id === selectedCard);

  // Handlers
  const resetForm = () => {
    setResult(null);
    setShowForm(false);
    setSelectedCard(null);
    setFormData({
      name: user?.full_name || "",
      facebookUrl: user?.facebook_url || "",
      ingameName: user?.ingame_name || "",
      quantity: 1,
      selectedWeeks: [],
      notes: ""
    });
    setConfirmLimit(false);
  };

  const handleSubmit = async () => {
    if (!selectedCard || !formData.name.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          card_id: selectedCard,
          customer_name: formData.name.trim(),
          facebook_url: formData.facebookUrl.trim() || null,
          ingame_name: formData.ingameName.trim() || null,
          profile_id: user?.id || null,
          quantity: formData.quantity,
          selected_weeks: formData.selectedWeeks,
          notes: formData.notes.trim() || null,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setResult({ success: false, message: data.error });
      } else {
        // Close form modal first so ResultModal is visible
        setShowForm(false);
        setResult({ 
          success: true,
          queueNumber: data.queue_number,
          total: data.total, 
          weeks: formData.selectedWeeks.length,
          reservations: data.reservations
        });

        // Save reservation IDs to localStorage for device-based history
        if (data.reservations?.length) {
          try {
            const saved = JSON.parse(localStorage.getItem("kuroko_reservation_ids") || "[]");
            const newIds = data.reservations.map((r: any) => r.id);
            localStorage.setItem("kuroko_reservation_ids", JSON.stringify([...new Set([...saved, ...newIds])]));
          } catch {}
        }
        
        // Fire confetti
        import("canvas-confetti").then((confetti) => {
          confetti.default({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ["#818cf8", "#6366f1", "#a78bfa", "#fbbf24"] });
        });
      }
    } catch {
      setResult({ success: false, message: "เกิดข้อผิดพลาด ลองใหม่" });
    }
    setSubmitting(false);
  };

  // Effects
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.full_name || prev.name,
        facebookUrl: user.facebook_url || prev.facebookUrl,
        ingameName: user.ingame_name || prev.ingameName
      }));
    }
  }, [user]);

  useEffect(() => {
    if (showForm && formData.selectedWeeks.length === 0) {
      setFormData(prev => ({ ...prev, selectedWeeks: [availableWeeks[0]] }));
    }
  }, [showForm, availableWeeks, formData.selectedWeeks.length]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  // Data Grouping
  const grouped = cards.reduce((acc, card) => {
    if (!acc[card.category]) acc[card.category] = [];
    acc[card.category].push(card);
    return acc;
  }, {} as Record<string, Card[]>);

  const categoryOrder = ["standard", "SP", "LG"];

  return (
    <div className="max-w-5xl mx-auto px-4 pb-12">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-2xl shadow-indigo-500/25"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <ResultModal 
        result={result} 
        resetForm={resetForm} 
        selectedCardLabel={selectedCardData?.label}
        quantity={formData.quantity}
      />

      <ReservationModal
        isOpen={showForm}
        selectedCard={selectedCard}
        selectedCardData={selectedCardData}
        formData={formData}
        setFormData={setFormData}
        availableWeeks={availableWeeks}
        submitting={submitting}
        confirmLimit={confirmLimit}
        setConfirmLimit={setConfirmLimit}
        resetForm={resetForm}
        onSubmit={handleSubmit}
      />

      {/* Card Grid by Category */}
      {categoryOrder.map((cat) => {
        const catCards = grouped[cat];
        if (!catCards || catCards.length === 0) return null;

        return (
          <div key={cat} className="space-y-6 mb-12">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-black text-white flex items-center gap-3">
                <span className={`w-3 h-3 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)] ${
                  cat === "SP" ? "bg-emerald-500 shadow-emerald-500/50" : 
                  cat === "LG" ? "bg-orange-500 shadow-orange-500/50" : 
                  "bg-blue-500 shadow-blue-500/50"
                }`} />
                {CATEGORY_LABELS[cat] || cat}
              </h2>
              <div className="flex-1 h-px bg-gradient-to-r from-zinc-800 to-transparent" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {catCards.map((card, index) => (
                <CardItem 
                  key={card.id} 
                  card={card} 
                  index={index} 
                  onClick={(id) => { setSelectedCard(id); setShowForm(true); }} 
                />
              ))}
            </div>
          </div>
        );
      })}

      <ProcessSteps />
    </div>
  );
}
