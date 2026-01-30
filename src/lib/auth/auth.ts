import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { env } from "@/lib/config/env";
import type { User } from "next-auth";

// Types are automatically extended via module augmentation in @/types/next-auth.d.ts

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.email || !credentials?.password) {
          console.error("[Auth] Missing credentials");
          return null;
        }

        try {
          // Distributor login endpoint
          console.log("[Auth] API Base URL:", env.apiBaseUrl);
          const loginUrl = `${env.apiBaseUrl}/v1/auth/distributor/login`;
          console.log("[Auth] Attempting distributor login to:", loginUrl);

          const response = await fetch(loginUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              usernameOrEmail: credentials.email, // API expects userName, not email
              password: credentials.password,
            }),
          });

          console.log("[Auth] Response status:", response.status);

          if (!response.ok) {
            const errorText = await response.text();
            console.error("[Auth] API error:", response.status, errorText);
            return null;
          }

          const result = await response.json();
          console.log("[Auth] API result:", JSON.stringify(result, null, 2));

          if (!result.data) {
            console.error("[Auth] Login failed:", result.messages);
            return null;
          }

          // API returns data directly in result.data
          const data = result.data;

          console.log("[Auth] Login successful for distributor:", data.distributorName);

          // Map API response to NextAuth User interface
          const user: User = {
            id: data.userId,
            email: data.email,
            fullName: data.fullName,
            username: data.username,
            distributorId: data.distributorId,
            distributorName: data.distributorName,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            accessTokenExpiry: data.accessTokenExpiry,
            termsAcceptedAt: data.termsAcceptedAt || null,
            isPrimaryContact: data.isPrimaryContact,
          };

          return user;
        } catch (error) {
          console.error("[Auth] Exception during login:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // user object from authorize() contains all fields
        token.id = user.id;
        token.email = user.email ?? "";
        token.fullName = user.fullName;
        token.username = user.username;
        token.distributorId = user.distributorId;
        token.distributorName = user.distributorName;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.accessTokenExpiry = user.accessTokenExpiry;
        token.termsAcceptedAt = user.termsAcceptedAt || null;
        token.isPrimaryContact = user.isPrimaryContact;
      }
      return token;
    },
    async session({ session, token }) {
      // Map token to session
      if (session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.fullName = token.fullName;
        session.user.username = token.username;
        session.user.distributorId = token.distributorId;
        session.user.distributorName = token.distributorName;
        session.user.termsAcceptedAt = token.termsAcceptedAt || null;
        session.user.isPrimaryContact = token.isPrimaryContact;
      }
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.accessTokenExpiry = token.accessTokenExpiry;
      return session;
    },
  },
  pages: {
    signIn: "/",
    error: "/",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  trustHost: true,
});
