export interface Card {
  id: string;
  label: string;
  category: string;
  image_url: string | null;
  price: number;
  sort_order: number;
  active: boolean;
}

export interface Profile {
  id: string;
  facebook_id: string | null;
  facebook_name: string;
  facebook_url: string | null;
  facebook_avatar: string | null;
  phone: string | null;
  created_at: string;
}

export interface Reservation {
  id: string;
  profile_id: string;
  card_id: string;
  quantity: number;
  status: 'queued' | 'paid' | 'confirmed' | 'delivered' | 'cancelled';
  week_start: string;
  queue_number: number | null;
  slip_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  profile?: Profile;
  card?: Card;
}

export function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split('T')[0];
}

export function getNextWeekStart(): string {
  const d = new Date();
  d.setDate(d.getDate() + (7 - d.getDay() + 1));
  // Adjust to Monday
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split('T')[0];
}

export const CARD_COLORS: Record<string, string> = {
  kise: "#6366f1", midorima: "#22c55e", aomine: "#3b82f6",
  murasakibara: "#a855f7", akashi: "#ef4444", kagamiSP: "#f97316",
  kiseSP: "#eab308", midorimaSP: "#14b8a6", aomineSP: "#6366f1",
  murasakibaraSP: "#ec4899", akashiSP: "#f43f5e",
  kagamiLastgame: "#f97316", kiseLastgame: "#eab308",
  midorimakiseLastgame: "#14b8a6", aominekiseLastgame: "#8b5cf8",
  murasakibarakiseLastgame: "#a855f7", akashikiseLastgame: "#ef4444",
};

export const CATEGORY_LABELS: Record<string, string> = {
  standard: "Standard",
  SP: "SP",
  LG: "Last Game",
};
