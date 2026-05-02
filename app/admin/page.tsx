import { supabase } from "@/lib/supabase";
import { getWeekStart } from "@/lib/types";
import AdminClient from "./AdminClient";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const weekStart = getWeekStart();

  const [{ data: reservations }, { data: cards }] = await Promise.all([
    supabase
      .from("reservations")
      .select("*")
      .eq("week_start", weekStart)
      .order("queue_number", { ascending: true }),
    supabase.from("cards").select("*").order("sort_order", { ascending: true }),
  ]);

  return <AdminClient reservations={reservations || []} cards={cards || []} weekStart={weekStart} />;
}
