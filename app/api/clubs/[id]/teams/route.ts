import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, withApi } from "@/lib/api";
import { logAudit } from "@/lib/audit";

const createSchema = z.object({
  name: z.string().min(2),
  category: z.string().min(1),
  coach: z.string().min(1),
  status: z.enum(["Active", "Inactive"]).default("Active"),
});

export const POST = withApi(
  async (req, { params, session }) => {
    const body = createSchema.parse(await req.json());
    const team = await prisma.team.create({
      data: {
        name: body.name,
        category: body.category,
        coach: body.coach,
        status: body.status,
        clubId: params.id as string,
      },
    });
    await logAudit({ userId: session!.sub, action: "CREATE", entity: "Team", entityId: team.id });
    return ok(team, 201);
  },
  { minRole: "CLUB_MANAGER" }
);
