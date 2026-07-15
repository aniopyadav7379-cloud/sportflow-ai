import { prisma } from "@/lib/prisma";
import { ok, withApi } from "@/lib/api";

export const GET = withApi(async () => {
  const [clubCount, playerCount, matchCount, ticketAgg, sponsorAgg, venues] = await Promise.all([
    prisma.club.count(),
    prisma.player.count(),
    prisma.match.count(),
    prisma.ticket.aggregate({ _sum: { sold: true, quantity: true } }),
    prisma.sponsor.aggregate({ _sum: { value: true }, _count: true }),
    prisma.venue.findMany({ select: { utilization: true } }),
  ]);

  const avgUtilization = venues.length
    ? Math.round(venues.reduce((s, v) => s + v.utilization, 0) / venues.length)
    : 0;

  return ok({
    clubs: clubCount,
    players: playerCount,
    matches: matchCount,
    ticketsSold: ticketAgg._sum.sold ?? 0,
    ticketsTotal: ticketAgg._sum.quantity ?? 0,
    sponsorshipRevenue: sponsorAgg._sum.value ?? 0,
    sponsorCount: sponsorAgg._count,
    avgVenueUtilization: avgUtilization,
  });
});
