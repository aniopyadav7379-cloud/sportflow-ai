import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

export type Role = "ADMIN" | "CLUB_MANAGER" | "COACH" | "SCOUT" | "VIEWER";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-only-insecure-secret-change-me";
const JWT_EXPIRES_IN = "7d";
export const AUTH_COOKIE = "sf_token";

export type SessionPayload = {
  sub: string; // user id
  email: string;
  role: Role;
  name: string;
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: SessionPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionPayload;
  } catch {
    return null;
  }
}

/** Extract + verify the session from an incoming API request's cookie. */
export function getSession(req: NextRequest): SessionPayload | null {
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
