import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, fail, withApi } from "@/lib/api";
import { logAudit } from "@/lib/audit";

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  jersey: z.number().int().optional(),
  position: z.string().optional(),
  age: z.number().int().optional(),
  overall: z.number().optional(),
  fitness: z.number().int().optional(),
  form: z.string().optional(),
  goals: z.number().int().optional(),
  assists: z.number().int().optional(),
  matches: z.number().int().optional(),
  marketValue: z.string().optional(),
  teamId: z.string().nullable().optional(),
  photoUrl: z.string().url().optional(),
});

export const GET = withApi(async (_req, { params }) => {
  const player = await prisma.player.findUnique({
    where: { id: params.id },
    include: { club: true, team: true },
  });
  if (!player) return fail("Player not found", 404);
  return ok(player);
});

export const PATCH = withApi(
  async (req, { params, session }) => {
    const body = updateSchema.parse(await req.json());
    const player = await prisma.player.update({ where: { id: params.id }, data: body }).catch(() => null);
    if (!player) return fail("Player not found", 404);
    await logAudit({ userId: session!.sub, action: "UPDATE", entity: "Player", entityId: player.id, metadata: body });
    return ok(player);
  },
  { minRole: "COACH" }
);

export const DELETE = withApi(
  async (_req, { params, session }) => {
    const player = await prisma.player.delete({ where: { id: params.id } }).catch(() => null);
    if (!player) return fail("Player not found", 404);
    await logAudit({ userId: session!.sub, action: "DELETE", entity: "Player", entityId: params.id });
    return ok({ deleted: true });
  },
  { minRole: "CLUB_MANAGER" }
);
