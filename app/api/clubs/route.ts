import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, fail, withApi } from "@/lib/api";
import { logAudit } from "@/lib/audit";

const updateSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  founded: z.number().int().optional(),
  status: z.enum(["Active", "Inactive"]).optional(),
  logoColor: z.string().optional(),
  description: z.string().optional(),
});

export const GET = withApi(async (_req, { params }) => {
  const club = await prisma.club.findUnique({
    where: { id: params.id },
    include: { teams: true, players: true, venues: true },
  });
  if (!club) return fail("Club not found", 404);
  return ok(club);
});

export const PATCH = withApi(
  async (req, { params, session }) => {
    const body = updateSchema.parse(await req.json());
    const club = await prisma.club.update({ where: { id: params.id }, data: body }).catch(() => null);
    if (!club) return fail("Club not found", 404);
    await logAudit({ userId: session!.sub, action: "UPDATE", entity: "Club", entityId: club.id, metadata: body });
    return ok(club);
  },
  { minRole: "CLUB_MANAGER" }
);

export const DELETE = withApi(
  async (_req, { params, session }) => {
    const club = await prisma.club.delete({ where: { id: params.id } }).catch(() => null);
    if (!club) return fail("Club not found", 404);
    await logAudit({ userId: session!.sub, action: "DELETE", entity: "Club", entityId: params.id });
    return ok({ deleted: true });
  },
  { minRole: "ADMIN" }
);
