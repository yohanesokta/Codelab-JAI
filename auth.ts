import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db";
import { users, accounts } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { isAuthEnabled } from "./lib/config";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth((request) => {
  if (!isAuthEnabled()) {
    return {
      ...authConfig,
      providers: [],
      adapter: DrizzleAdapter(db, {
        usersTable: users,
        accountsTable: accounts,
      }),
    };
  }

  return {
    ...authConfig,
    adapter: DrizzleAdapter(db, {
      usersTable: users,
      accountsTable: accounts,
    }),
    providers: [
      ...authConfig.providers,
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
  };
});
