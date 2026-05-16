import { NextRequest, NextResponse } from "next/server";

const ADMIN_PIN = process.env.ADMIN_PIN;

export async function POST(req: NextRequest) {
  if (!ADMIN_PIN) {
    return NextResponse.json(
      { error: "Admin PIN not configured. Set ADMIN_PIN in environment variables." },
      { status: 500 }
    );
  }

  const { pin } = await req.json();
  if (pin === ADMIN_PIN) {
    return NextResponse.json({ valid: true });
  }
  return NextResponse.json({ valid: false }, { status: 401 });
}
