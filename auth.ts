import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db";
import { users, accounts } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { isAuthEnabled } from "./lib/config";

export const { handlers, auth, signIn, signOut } = NextAuth(() => {
  if (!isAuthEnabled()) {
    // If auth is disabled, return a skeleton config to avoid errors
    return {
      providers: [],
      adapter: DrizzleAdapter(db, {
        usersTable: users,
        accountsTable: accounts,
      }),
      session: { strategy: "jwt" },
      callbacks: {},
    };
  }

  return {
    adapter: DrizzleAdapter(db, {
      usersTable: users,
      accountsTable: accounts,
    }),
    session: { strategy: "jwt" },
    providers: [
      Google({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      }),
      Credentials({
        name: "Credentials",
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) return null;

          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, credentials.email as string))
            .limit(1);

          if (!user || !user.password) return null;

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (!isPasswordValid) return null;

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            nim: user.nim,
            role: user.role,
          };
        },
      }),
    ],
    callbacks: {
      async jwt({ token, user, trigger, session }) {
        if (user) {
          token.id = user.id;
          token.nim = (user as any).nim;
          token.role = (user as any).role;
        }
        // Support updating session on the fly (e.g. after registration or admin approval)
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
    },
    pages: {
      signIn: "/auth/login",
      error: "/auth/error",
    },
  };
});
