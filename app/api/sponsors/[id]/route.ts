import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, fail, withApi } from "@/lib/api";
import { logAudit } from "@/lib/audit";

const updateSchema = z.object({
  company: z.string().optional(),
  package: z.string().optional(),
  value: z.number().optional(),
  status: z.enum(["Active", "Pending", "Expired"]).optional(),
  endDate: z.coerce.date().optional(),
});

export const GET = withApi(async (_req, { params }) => {
  const sponsor = await prisma.sponsor.findUnique({ where: { id: params.id } });
  if (!sponsor) return fail("Sponsor not found", 404);
  return ok(sponsor);
});

export const PATCH = withApi(
  async (req, { params, session }) => {
    const body = updateSchema.parse(await req.json());
    const sponsor = await prisma.sponsor.update({ where: { id: params.id }, data: body }).catch(() => null);
    if (!sponsor) return fail("Sponsor not found", 404);
    await logAudit({ userId: session!.sub, action: "UPDATE", entity: "Sponsor", entityId: sponsor.id, metadata: body });
    return ok(sponsor);
  },
  { minRole: "CLUB_MANAGER" }
);

export const DELETE = withApi(
  async (_req, { params, session }) => {
    const sponsor = await prisma.sponsor.delete({ where: { id: params.id } }).catch(() => null);
    if (!sponsor) return fail("Sponsor not found", 404);
    await logAudit({ userId: session!.sub, action: "DELETE", entity: "Sponsor", entityId: params.id });
    return ok({ deleted: true });
  },
  { minRole: "ADMIN" }
);
