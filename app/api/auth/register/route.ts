import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken, AUTH_COOKIE, Role } from "@/lib/auth";
import { ok, fail, handleError } from "@/lib/api";
import { logAudit } from "@/lib/audit";
import { rateLimit, clientKey } from "@/lib/rateLimit";

const schema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(72),
});

export async function POST(req: NextRequest) {
  const { ok: allowed } = rateLimit(`${clientKey(req)}:auth:register`, 10, 60_000);
  if (!allowed) return fail("Too many attempts. Try again shortly.", 429);

  try {
    const body = schema.parse(await req.json());

    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) return fail("An account with this email already exists.", 409);

    // First registered user becomes ADMIN; everyone after defaults to VIEWER.
    const userCount = await prisma.user.count();
    const role = userCount === 0 ? "ADMIN" : "VIEWER";

    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        passwordHash: await hashPassword(body.password),
        role,
      },
    });

    await logAudit({ userId: user.id, action: "CREATE", entity: "User", entityId: user.id });

    const token = await signToken({ sub: user.id, email: user.email, role: user.role as Role, name: user.name });
    const res = ok({ id: user.id, name: user.name, email: user.email, role: user.role }, 201);
    res.cookies.set(AUTH_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (err) {
    return handleError(err);
  }
}