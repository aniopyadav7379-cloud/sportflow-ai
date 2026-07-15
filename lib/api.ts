import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { getSession, hasRole, SessionPayload, Role } from "@/lib/auth";
import { rateLimit, clientKey } from "@/lib/rateLimit";

export function ok(data: unknown, init?: number) {
  return NextResponse.json({ success: true, data }, { status: init ?? 200 });
}

export function fail(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ success: false, error: message, details }, { status });
}

export function handleError(err: unknown) {
  if (err instanceof ZodError) {
    return fail("Validation failed", 422, err.flatten());
  }
  console.error(err);
  return fail("Internal server error", 500);
}

type Handler = (req: NextRequest, ctx: { session: SessionPayload | null; params: any }) => Promise<NextResponse>;

/**
 * Wraps a route handler with rate limiting + (optional) RBAC enforcement.
 * Usage: export const POST = withApi(handler, { minRole: "COACH" })
 */
export function withApi(handler: Handler, opts?: { minRole?: Role; limit?: number }) {
  return async (req: NextRequest, ctx: { params: any }) => {
    const { ok: allowed } = rateLimit(`${clientKey(req)}:${req.nextUrl.pathname}`, opts?.limit ?? 120);
    if (!allowed) return fail("Too many requests — please slow down.", 429);

    const session = getSession(req);

    if (opts?.minRole && !hasRole(session, opts.minRole)) {
      return fail(session ? "Insufficient permissions" : "Authentication required", session ? 403 : 401);
    }

    try {
      return await handler(req, { session, params: ctx.params });
    } catch (err) {
      return handleError(err);
    }
  };
}
