import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, fail, withApi } from "@/lib/api";
import { logAudit } from "@/lib/audit";

const updateSchema = z.object({
  status: z.enum(["Live", "Upcoming", "Completed", "Cancelled"]).optional(),
  homeScore: z.number().int().optional(),
  awayScore: z.number().int().optional(),
  date: z.coerce.date().optional(),
  venueId: z.string().optional(),
});

export const GET = withApi(async (_req, { params }) => {
  const match = await prisma.match.findUnique({ where: { id: params.id }, include: { venue: true, league: true } });
  if (!match) return fail("Match not found", 404);
  return ok(match);
});

export const PATCH = withApi(
  async (req, { params, session }) => {
    const body = updateSchema.parse(await req.json());
    const match = await prisma.match.update({ where: { id: params.id }, data: body }).catch(() => null);
    if (!match) return fail("Match not found", 404);
    await logAudit({ userId: session!.sub, action: "UPDATE", entity: "Match", entityId: match.id, metadata: body });
    return ok(match);
  },
  { minRole: "COACH" }
);

export const DELETE = withApi(
  async (_req, { params, session }) => {
    const match = await prisma.match.delete({ where: { id: params.id } }).catch(() => null);
    if (!match) return fail("Match not found", 404);
    await logAudit({ userId: session!.sub, action: "DELETE", entity: "Match", entityId: params.id });
    return ok({ deleted: true });
  },
  { minRole: "CLUB_MANAGER" }
);
