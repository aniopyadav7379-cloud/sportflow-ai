import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, withApi } from "@/lib/api";
import { logAudit } from "@/lib/audit";

const createSchema = z.object({
  matchId: z.string().optional(),
  opponent: z.string().min(1),
  date: z.coerce.date(),
  scoreLine: z.string().min(1),
  rating: z.number().min(0).max(10),
  goals: z.number().int().min(0).default(0),
  assists: z.number().int().min(0).default(0),
  minutes: z.number().int().min(0).max(120).default(90),
});

export const GET = withApi(async (req, { params }) => {
  const limit = Math.min(50, Number(req.nextUrl.searchParams.get("limit") ?? 10));
  const stats = await prisma.playerMatchStat.findMany({
    where: { playerId: params.id },
    orderBy: { date: "desc" },
    take: limit,
  });
  return ok(stats);
});

export const POST = withApi(
  async (req, { params, session }) => {
    const body = createSchema.parse(await req.json());
    const stat = await prisma.playerMatchStat.create({ data: { ...body, playerId: params.id } });

    // Keep the player's season totals roughly in sync.
    await prisma.player.update({
      where: { id: params.id },
      data: {
        matches: { increment: 1 },
        goals: { increment: body.goals },
        assists: { increment: body.assists },
      },
    });

    await logAudit({ userId: session!.sub, action: "CREATE", entity: "PlayerMatchStat", entityId: stat.id });
    return ok(stat, 201);
  },
  { minRole: "COACH" }
);
