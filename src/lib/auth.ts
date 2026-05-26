import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import Apple from "next-auth/providers/apple";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hasAppleConfig, hasFacebookConfig, hasGoogleConfig, isConfiguredAdminEmail } from "@/lib/config";
import { isOwnerAdminEmail } from "@/lib/admin";
import { normalizeRole } from "@/lib/roles";
import { findLocalUserByEmail } from "@/lib/local-users";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

function isAdminEmail(email?: string | null) {
  return isConfiguredAdminEmail(email);
}

function demoUser(email: string, password: string) {
  if (process.env.NODE_ENV === "production") return null;
  if (process.env.ENABLE_DEMO_USERS !== "true") return null;

  if (email === "admin@ellbopastudio.com" && password === "admin12345") {
    return {
      id: "dev-admin",
      name: "Adonis Castillo",
      email,
      role: "ADMIN" as const,
      phone: "+1 809-590-3643",
      verified: true,
      onboardingCompleted: true
    };
  }

  if (email === "cliente@demo.com" && password === "cliente12345") {
    return {
      id: "dev-client",
      name: "Cliente Demo",
      email,
      role: "ARTIST" as const,
      phone: "+1 809-000-0000",
      verified: true,
      onboardingCompleted: true
    };
  }

  return null;
}

export const authConfig = {
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          const parsed = credentialsSchema.safeParse(credentials);
          if (!parsed.success) return null;
          const fallback = demoUser(parsed.data.email, parsed.data.password);

          const user = await prisma.user.findUnique({
            where: { email: parsed.data.email }
          });
          if (!user?.passwordHash) {
            const localUser = await findLocalUserByEmail(parsed.data.email);
            if (localUser && await bcrypt.compare(parsed.data.password, localUser.passwordHash)) {
              return {
                id: localUser.id,
                name: localUser.name,
                email: localUser.email,
                role: localUser.role,
                phone: localUser.phone,
                verified: localUser.verified,
                onboardingCompleted: localUser.onboardingCompleted
              };
            }
            return fallback;
          }
          if (!user.verified) return null;

          const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
          if (!valid) return fallback;

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            verified: user.verified,
            onboardingCompleted: user.onboardingCompleted
          };
        } catch (error) {
          console.error("[auth][credentials authorize]", error);
          const parsed = credentialsSchema.safeParse(credentials);
          if (!parsed.success) return null;
          const localUser = await findLocalUserByEmail(parsed.data.email);
          if (localUser && await bcrypt.compare(parsed.data.password, localUser.passwordHash)) {
            return {
              id: localUser.id,
              name: localUser.name,
              email: localUser.email,
              role: localUser.role,
              phone: localUser.phone,
              verified: localUser.verified,
              onboardingCompleted: localUser.onboardingCompleted
            };
          }
          return demoUser(parsed.data.email, parsed.data.password);
        }
      }
    }),
    ...(hasGoogleConfig()
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            allowDangerousEmailAccountLinking: true
          })
        ]
      : []),
    ...(hasFacebookConfig()
      ? [
          Facebook({
            clientId: process.env.FACEBOOK_CLIENT_ID!,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
            allowDangerousEmailAccountLinking: true
          })
        ]
      : []),
    ...(hasAppleConfig()
      ? [
          Apple({
            clientId: process.env.APPLE_CLIENT_ID!,
            clientSecret: process.env.APPLE_CLIENT_SECRET!,
            allowDangerousEmailAccountLinking: true
          })
        ]
      : [])
  ],
  debug: process.env.NODE_ENV === "development",
  logger: {
    error(error) {
      console.error("[auth][error]", error);
    },
    warn(code) {
      console.warn("[auth][warn]", code);
    },
    debug(code, metadata) {
      console.log("[auth][debug]", code, metadata);
    }
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        if (account?.provider && account.provider !== "credentials" && user.email) {
          const emailVerified =
            account.provider === "google" || account.provider === "apple" || Boolean((profile as { email_verified?: boolean })?.email_verified);

          await prisma.user.upsert({
            where: { email: user.email },
            create: {
              email: user.email,
              name: user.name,
              image: user.image,
              verified: emailVerified,
              emailVerified: emailVerified ? new Date() : null,
              role: isAdminEmail(user.email) ? "ADMIN" : "ARTIST",
              onboardingCompleted: isAdminEmail(user.email)
            },
            update: {
              name: user.name,
              image: user.image,
              verified: emailVerified,
              emailVerified: emailVerified ? new Date() : null,
              role: isAdminEmail(user.email) ? "ADMIN" : undefined
            }
          });
        }
        return true;
      } catch (error) {
        console.error("[auth][signIn callback]", error);
        return true;
      }
    },
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.role = normalizeRole(user.role ?? (isAdminEmail(user.email) ? "ADMIN" : "ARTIST"));
        token.phone = user.phone;
        token.verified = user.verified ?? account?.provider !== "credentials";
        token.onboardingCompleted = user.onboardingCompleted ?? isAdminEmail(user.email);
      }
      if (account?.provider && account.provider !== "credentials") {
        const profileEmail = token.email || user?.email || (profile as { email?: string })?.email;
        token.role = isAdminEmail(profileEmail) ? "ADMIN" : "ARTIST";
        token.verified = true;
      }
      if (token.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email },
            select: { id: true, role: true, phone: true, verified: true, onboardingCompleted: true }
          });
          if (dbUser) {
            token.sub = dbUser.id;
            const dbRole = normalizeRole(dbUser.role);
            token.role = dbRole === "ADMIN" && !isOwnerAdminEmail(token.email) ? "ARTIST" : dbRole;
            token.phone = dbUser.phone;
            token.verified = dbUser.verified;
            token.onboardingCompleted = dbUser.onboardingCompleted;
          } else {
            const localUser = await findLocalUserByEmail(token.email);
            if (localUser) {
              token.role = localUser.role;
              token.phone = localUser.phone;
              token.verified = localUser.verified;
              token.onboardingCompleted = localUser.onboardingCompleted;
            }
          }
        } catch (error) {
          console.error("[auth][jwt load user]", error);
          token.role = isAdminEmail(token.email) ? "ADMIN" : "ARTIST";
          token.verified = true;
          token.onboardingCompleted = isAdminEmail(token.email);
        }
      }
      if (token.email && isAdminEmail(token.email)) token.role = "ADMIN";
      if (token.role === "ADMIN" && !isOwnerAdminEmail(token.email)) token.role = "ARTIST";
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = normalizeRole(token.role);
        session.user.phone = token.phone as string | null;
        session.user.verified = Boolean(token.verified);
        session.user.onboardingCompleted = Boolean(token.onboardingCompleted || session.user.role === "ADMIN");
      }
      return session;
    }
  },
  pages: {
    signIn: "/login"
  }
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
