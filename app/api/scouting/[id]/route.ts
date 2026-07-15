import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, fail, withApi } from "@/lib/api";
import { logAudit } from "@/lib/audit";

const updateSchema = z.object({
  stage: z.enum(["Prospect", "Shortlisted", "OnTrial", "Signed", "Rejected"]).optional(),
  potential: z.enum(["High", "Medium", "Low"]).optional(),
  overall: z.number().int().optional(),
  strengths: z.array(z.string()).optional(),
});

export const GET = withApi(async (_req, { params }) => {
  const player = await prisma.scoutedPlayer.findUnique({ where: { id: params.id } });
  if (!player) return fail("Scouted player not found", 404);
  return ok({ ...player, strengths: JSON.parse(player.strengths) });
});

export const PATCH = withApi(
  async (req, { params, session }) => {
    const body = updateSchema.parse(await req.json());
    const data: any = { ...body };
    if (body.strengths) data.strengths = JSON.stringify(body.strengths);
    const player = await prisma.scoutedPlayer.update({ where: { id: params.id }, data }).catch(() => null);
    if (!player) return fail("Scouted player not found", 404);
    await logAudit({ userId: session!.sub, action: "UPDATE", entity: "ScoutedPlayer", entityId: player.id, metadata: body });
    return ok({ ...player, strengths: JSON.parse(player.strengths) });
  },
  { minRole: "SCOUT" }
);

export const DELETE = withApi(
  async (_req, { params, session }) => {
    const player = await prisma.scoutedPlayer.delete({ where: { id: params.id } }).catch(() => null);
    if (!player) return fail("Scouted player not found", 404);
    await logAudit({ userId: session!.sub, action: "DELETE", entity: "ScoutedPlayer", entityId: params.id });
    return ok({ deleted: true });
  },
  { minRole: "CLUB_MANAGER" }
);
