import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, withApi } from "@/lib/api";
import { logAudit } from "@/lib/audit";

const createSchema = z.object({
  name: z.string().min(2),
  sport: z.string().min(2),
  matchday: z.string().default("1 / 1"),
  status: z.string().default("Live"),
  progress: z.number().int().min(0).max(100).default(0),
});

export const GET = withApi(async () => {
  const leagues = await prisma.league.findMany({
    include: { _count: { select: { matches: true } } },
    orderBy: { name: "asc" },
  });
  return ok(leagues);
});

export const POST = withApi(
  async (req, { session }) => {
    const body = createSchema.parse(await req.json());
    const league = await prisma.league.create({
      data: {
        name: body.name,
        sport: body.sport,
        matchday: body.matchday,
        status: body.status,
        progress: body.progress,
      },
    });
    await logAudit({ userId: session!.sub, action: "CREATE", entity: "League", entityId: league.id });
    return ok(league, 201);
  },
  { minRole: "CLUB_MANAGER" }
);