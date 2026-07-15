import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, fail, withApi } from "@/lib/api";
import { logAudit } from "@/lib/audit";

const updateSchema = z.object({
  name: z.string().optional(),
  location: z.string().optional(),
  type: z.string().optional(),
  capacity: z.number().int().optional(),
  surface: z.string().optional(),
  utilization: z.number().int().min(0).max(100).optional(),
  status: z.enum(["Active", "Maintenance"]).optional(),
  imageUrl: z.string().url().optional(),
});

export const GET = withApi(async (_req, { params }) => {
  const venue = await prisma.venue.findUnique({ where: { id: params.id }, include: { bookings: true } });
  if (!venue) return fail("Venue not found", 404);
  return ok(venue);
});

export const PATCH = withApi(
  async (req, { params, session }) => {
    const body = updateSchema.parse(await req.json());
    const venue = await prisma.venue.update({ where: { id: params.id }, data: body }).catch(() => null);
    if (!venue) return fail("Venue not found", 404);
    await logAudit({ userId: session!.sub, action: "UPDATE", entity: "Venue", entityId: venue.id, metadata: body });
    return ok(venue);
  },
  { minRole: "CLUB_MANAGER" }
);

export const DELETE = withApi(
  async (_req, { params, session }) => {
    const venue = await prisma.venue.delete({ where: { id: params.id } }).catch(() => null);
    if (!venue) return fail("Venue not found", 404);
    await logAudit({ userId: session!.sub, action: "DELETE", entity: "Venue", entityId: params.id });
    return ok({ deleted: true });
  },
  { minRole: "ADMIN" }
);
