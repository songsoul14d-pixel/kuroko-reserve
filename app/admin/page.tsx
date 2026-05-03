import { getWeekStart } from "@/lib/types";
import AdminClient from "./AdminClient";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const weekStart = getWeekStart();
  // Don't pass PIN to client — auth via API
  return <AdminClient weekStart={weekStart} />;
}
