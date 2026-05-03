import { NextRequest, NextResponse } from "next/server";

const ADMIN_PIN = process.env.ADMIN_PIN || "1234";

export async function POST(req: NextRequest) {
  const { pin } = await req.json();
  if (pin === ADMIN_PIN) {
    return NextResponse.json({ valid: true });
  }
  return NextResponse.json({ valid: false }, { status: 401 });
}
