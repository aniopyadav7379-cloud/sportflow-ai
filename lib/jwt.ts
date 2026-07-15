import { SignJWT, jwtVerify } from "jose";

// jose uses the Web Crypto API under the hood, so this module works
// identically in normal Node.js API routes AND in Next.js's Edge middleware
// runtime. jsonwebtoken does NOT — it depends on Node's `crypto` module,
// which silently breaks token verification inside middleware. That mismatch
// is what causes a login-success-but-redirect-to-login loop: the token
// verifies fine in API routes (Node) but never in middleware (Edge).

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "dev-only-insecure-secret-change-me"
);

export const AUTH_COOKIE = "sf_token";

export type Role = "ADMIN" | "CLUB_MANAGER" | "COACH" | "SCOUT" | "VIEWER";

export type SessionPayload = {
  sub: string; // user id
  email: string;
  role: Role;
  name: string;
};

export async function signToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
