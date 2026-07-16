import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, withApi } from "@/lib/api";
import { logAudit } from "@/lib/audit";

const createSchema = z.object({
  company: z.string().min(2),
  package: z.string().min(2),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  value: z.number().min(0),
  status: z.enum(["Active", "Pending", "Expired"]).default("Active"),
  clubId: z.string().optional(),
});

export const GET = withApi(async () => {
  const sponsors = await prisma.sponsor.findMany({ orderBy: { value: "desc" } });
  return ok(sponsors);
});

export const POST = withApi(
  async (req, { session }) => {
    const body = createSchema.parse(await req.json());
    const sponsor = await prisma.sponsor.create({
      data: {
        company: body.company,
        package: body.package,
        startDate: body.startDate,
        endDate: body.endDate,
        value: body.value,
        status: body.status,
        clubId: body.clubId,
      },
    });
    await logAudit({ userId: session!.sub, action: "CREATE", entity: "Sponsor", entityId: sponsor.id });
    return ok(sponsor, 201);
  },
  { minRole: "CLUB_MANAGER" }
);
