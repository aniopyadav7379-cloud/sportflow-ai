import { prisma } from "@/lib/prisma";
import { ok, withApi } from "@/lib/api";

export const GET = withApi(async (_req, { params }) => {
  const grouped = await prisma.playerMatchStat.groupBy({
    by: ["playerId"],
    where: { match: { leagueId: params.id } },
    _sum: { goals: true, assists: true },
    orderBy: { _sum: { goals: "desc" } },
    take: 10,
  });

  const players = await prisma.player.findMany({
    where: { id: { in: grouped.map((g) => g.playerId) } },
    include: { club: { select: { name: true } } },
  });

  const result = grouped
    .map((g, i) => {
      const player = players.find((p) => p.id === g.playerId);
      if (!player) return null;
      return {
        rank: i + 1,
        playerId: player.id,
        name: player.name,
        club: player.club.name,
        goals: g._sum.goals ?? 0,
        assists: g._sum.assists ?? 0,
      };
    })
    .filter(Boolean);

  return ok(result);
});
