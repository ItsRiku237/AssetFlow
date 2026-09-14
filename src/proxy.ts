import NextAuth from "next-auth";

import authConfig from "@/auth.config";

// Edge-safe: only the provider list + `authorized` callback from
// auth.config.ts are used here — no Prisma/bcrypt in this bundle.
const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  // Run on everything except static assets, image optimization,
  // favicon, and the Auth.js API routes themselves.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
};
