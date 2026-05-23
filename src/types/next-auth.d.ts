import "next-auth";
import "next-auth/jwt";

export type EllbopaRole = "ARTIST" | "PRODUCER" | "ENGINEER" | "STUDIO" | "ADMIN";

declare module "next-auth" {
  interface User {
    role?: EllbopaRole;
    phone?: string | null;
    verified?: boolean;
    onboardingCompleted?: boolean;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: EllbopaRole;
      phone?: string | null;
      verified?: boolean;
      onboardingCompleted?: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: EllbopaRole;
    phone?: string | null;
    verified?: boolean;
    onboardingCompleted?: boolean;
  }
}
