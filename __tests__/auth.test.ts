/**
 * @jest-environment node
 */
import { hashPassword, verifyPassword, signToken, verifyToken, hasRole } from "@/lib/auth";

describe("auth: password hashing", () => {
  it("hashes a password and verifies it correctly", async () => {
    const hash = await hashPassword("Sup3rSecret!");
    expect(hash).not.toEqual("Sup3rSecret!");
    expect(await verifyPassword("Sup3rSecret!", hash)).toBe(true);
    expect(await verifyPassword("wrong-password", hash)).toBe(false);
  });
});

describe("auth: JWT sign/verify", () => {
  const payload = { sub: "user_123", email: "test@example.com", role: "COACH" as const, name: "Test User" };

  it("round-trips a signed token", async () => {
    const token = await signToken(payload);
    const decoded = await verifyToken(token);
    expect(decoded?.sub).toBe(payload.sub);
    expect(decoded?.role).toBe("COACH");
  });

  it("rejects a tampered token", async () => {
    const token = await signToken(payload);
    expect(await verifyToken(token + "tampered")).toBeNull();
  });
});

describe("auth: RBAC rank checks", () => {
  const session = { sub: "1", email: "a@b.com", name: "A", role: "COACH" as const };

  it("allows access at or below the user's role", () => {
    expect(hasRole(session, "VIEWER")).toBe(true);
    expect(hasRole(session, "SCOUT")).toBe(true);
    expect(hasRole(session, "COACH")).toBe(true);
  });

  it("denies access above the user's role", () => {
    expect(hasRole(session, "CLUB_MANAGER")).toBe(false);
    expect(hasRole(session, "ADMIN")).toBe(false);
  });

  it("denies access with no session", () => {
    expect(hasRole(null, "VIEWER")).toBe(false);
  });
});
