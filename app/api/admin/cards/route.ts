import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

// GET /api/admin/cards - List all cards (admin only)
export async function GET() {
  const session = await getSession();
  if (!session?.user?.is_admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("cards")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/admin/cards - Create new card
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.user?.is_admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id, label, category, image_url, price, sort_order, active } = body;

  if (!id || !label || !price) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("cards")
    .insert({
      id,
      label,
      category: category || "standard",
      image_url: image_url || "",
      price: parseInt(price),
      sort_order: parseInt(sort_order) || 0,
      active: active !== undefined ? active : true,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// PATCH /api/admin/cards - Update card
export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session?.user?.is_admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id, ...updates } = body;

  if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

  const { data, error } = await supabase
    .from("cards")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE /api/admin/cards - Delete card
export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session?.user?.is_admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

  // Check if there are active reservations
  const { count } = await supabase
    .from("reservations")
    .select("*", { count: "exact", head: true })
    .eq("card_id", id);

  if ((count || 0) > 0) {
    return NextResponse.json({ 
      error: "ไม่สามารถลบได้เนื่องจากมีรายการจองผูกอยู่ กรุณาตั้งค่าเป็น 'ปิดการใช้งาน' แทน" 
    }, { status: 400 });
  }

  const { error } = await supabase
    .from("cards")
    .delete()
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
