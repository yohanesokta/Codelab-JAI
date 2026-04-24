import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { isAuthEnabled } from "./lib/config";

export const authConfig = {
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.nim = (user as any).nim;
        token.role = (user as any).role;
      }
      if (trigger === "update" && session) {
        token.nim = session.nim ?? token.nim;
        token.role = session.role ?? token.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        (session.user as any).nim = token.nim;
        (session.user as any).role = token.role;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAdminRoute = nextUrl.pathname.startsWith('/admin');
      const isAuthPage = nextUrl.pathname.startsWith('/auth');
      
      // If auth is disabled, allow all
      if (!isAuthEnabled()) return true;

      if (isAdminRoute) {
        if (isLoggedIn) return true;
        return false; // Redirect to login page
      } else if (isAuthPage) {
        if (isLoggedIn) {
          return Response.redirect(new URL('/', nextUrl));
        }
        return true;
      }

      return true;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
} satisfies NextAuthConfig;
