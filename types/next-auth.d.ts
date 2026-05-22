import "next-auth";
import "next-auth/jwt";
import type { UserRole } from "@/lib/session";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: UserRole;
      motDePasseChange: boolean;
    };
  }
  interface User {
    id: string;
    role: UserRole;
    motDePasseChange: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole;
    motDePasseChange: boolean;
  }
}
