import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, withApi } from "@/lib/api";
import { logAudit } from "@/lib/audit";

const createSchema = z.object({
  homeTeam: z.string().min(1),
  awayTeam: z.string().min(1),
  date: z.coerce.date(),
  venueId: z.string().optional(),
  leagueId: z.string().optional(),
  status: z.enum(["Live", "Upcoming", "Completed", "Cancelled"]).default("Upcoming"),
});

export const GET = withApi(async (req) => {
  const status = req.nextUrl.searchParams.get("status") ?? undefined;
  const matches = await prisma.match.findMany({
    where: status && status !== "All Matches" ? { status } : undefined,
    include: { venue: { select: { name: true, location: true } }, league: { select: { name: true } } },
    orderBy: { date: "asc" },
  });
  return ok(matches);
});

export const POST = withApi(
  async (req, { session }) => {
    const body = createSchema.parse(await req.json());
    const match = await prisma.match.create({ data: body });
    await logAudit({ userId: session!.sub, action: "CREATE", entity: "Match", entityId: match.id });
    return ok(match, 201);
  },
  { minRole: "COACH" }
);
