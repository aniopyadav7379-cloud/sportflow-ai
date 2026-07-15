import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";
import { signToken, verifyToken, AUTH_COOKIE, Role, SessionPayload } from "@/lib/jwt";

export { signToken, verifyToken, AUTH_COOKIE };
export type { Role, SessionPayload };

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

/** Extract + verify the session from an incoming API request's cookie. */
export async function getSession(req: NextRequest): Promise<SessionPayload | null> {
  const token = req.cookies.get(AUTH_COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

/** Role hierarchy used for simple "at least this level" RBAC checks. */
const ROLE_RANK: Record<Role, number> = {
  VIEWER: 0,
  SCOUT: 1,
  COACH: 2,
  CLUB_MANAGER: 3,
  ADMIN: 4,
};

export function hasRole(session: SessionPayload | null, minimum: Role): boolean {
  if (!session) return false;
  return ROLE_RANK[session.role] >= ROLE_RANK[minimum];
}
