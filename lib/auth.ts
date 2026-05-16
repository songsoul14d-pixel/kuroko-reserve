import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET environment variable is not set. This is required in production.");
  }
  console.warn(
    "[Security] JWT_SECRET is not set. Using a random key for development only. " +
    "Set JWT_SECRET in .env.local before deploying."
  );
}
const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || `dev-only-${crypto.randomUUID()}`
);

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function decrypt(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, secret, {
    algorithms: ["HS256"],
  });
  return payload;
}

export async function login(user: { id: string; username: string; is_admin: boolean }) {
  const session = await encrypt({ user });

  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  
  (await cookies()).set("session", session, { expires, httpOnly: true, secure: process.env.NODE_ENV === "production" });
}

export async function logout() {
  (await cookies()).set("session", "", { expires: new Date(0) });
}

export async function getSession() {
  const session = (await cookies()).get("session")?.value;
  if (!session) return null;
  try {
    return await decrypt(session);
  } catch {
    return null;
  }
}

export async function updateSession(request: NextRequest) {
  const session = request.cookies.get("session")?.value;
  if (!session) return;

  // Refresh the session so it doesn't expire
  const parsed = await decrypt(session);
  parsed.expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const res = NextResponse.next();
  res.cookies.set({
    name: "session",
    value: await encrypt(parsed),
    httpOnly: true,
    expires: parsed.expires,
  });
  return res;
}
