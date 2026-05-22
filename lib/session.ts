import type { Session } from "next-auth";

export type UserRole = "SUPER_ADMIN" | "ADJOINT" | "MEMBRE" | "CLIENT";

export function isClient(session: Session | null | undefined): boolean {
  return session?.user?.role === "CLIENT";
}

export function isStaff(session: Session | null | undefined): boolean {
  const role = session?.user?.role;
  return !!role && role !== "CLIENT";
}
