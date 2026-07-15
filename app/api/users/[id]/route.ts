import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, fail, withApi } from "@/lib/api";
import { logAudit } from "@/lib/audit";

const schema = z.object({ role: z.enum(["ADMIN", "CLUB_MANAGER", "COACH", "SCOUT", "VIEWER"]) });

export const PATCH = withApi(
  async (req, { params, session }) => {
    const body = schema.parse(await req.json());
    const user = await prisma.user
      .update({ where: { id: params.id }, data: { role: body.role }, select: { id: true, name: true, email: true, role: true } })
      .catch(() => null);
    if (!user) return fail("User not found", 404);
    await logAudit({ userId: session!.sub, action: "UPDATE", entity: "User", entityId: user.id, metadata: body });
    return ok(user);
  },
  { minRole: "ADMIN" }
);
