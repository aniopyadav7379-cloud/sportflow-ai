import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signToken, AUTH_COOKIE, Role } from "@/lib/auth";
import { ok, fail, handleError } from "@/lib/api";
import { rateLimit, clientKey } from "@/lib/rateLimit";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const { ok: allowed } = rateLimit(`${clientKey(req)}:auth:login`, 10, 60_000);
  if (!allowed) return fail("Too many attempts. Try again shortly.", 429);

  try {
    const body = schema.parse(await req.json());
    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
      return fail("Invalid email or password.", 401);
    }

    const token = await signToken({
      sub: user.id,
      email: user.email,
      role: user.role as Role,
      name: user.name,
    });
    const res = ok({ id: user.id, name: user.name, email: user.email, role: user.role });
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
