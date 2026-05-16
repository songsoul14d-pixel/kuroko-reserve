import { createClient } from "./utils/supabase/middleware";
import { type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  return createClient(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder assets (card images, QR codes, etc.)
     */
    "/((?!_next/static|_next/image|favicon\\.ico|card/|promptpay-qr|qr-reserve|.*\\.svg).*)",
  ],
};
