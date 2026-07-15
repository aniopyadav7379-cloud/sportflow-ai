import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";

export async function GET(req: NextRequest) {
  const session = getSession(req);
  if (!session) return fail("Not authenticated", 401);
  return ok({ id: session.sub, name: session.name, email: session.email, role: session.role });
}
