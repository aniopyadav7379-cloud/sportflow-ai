import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, withApi } from "@/lib/api";
import { logAudit } from "@/lib/audit";

const rowSchema = z.object({
  team: z.string().min(1),
  played: z.number().int().min(0).default(0),
  won: z.number().int().min(0).default(0),
  drawn: z.number().int().min(0).default(0),
  lost: z.number().int().min(0).default(0),
  goalsFor: z.number().int().min(0).default(0),
  goalsAgainst: z.number().int().min(0).default(0),
  points: z.number().int().min(0).default(0),
  form: z.array(z.enum(["W", "D", "L"])).default([]),
});

export const GET = withApi(async (_req, { params }) => {
  const rows = await prisma.standingsRow.findMany({
    where: { leagueId: params.id },
    orderBy: { points: "desc" },
  });
  return ok(rows.map((r) => ({ ...r, form: JSON.parse(r.form) })));
});

// Upsert a single team's row (create it if it doesn't exist yet for this league).
export const POST = withApi(
  async (req, { params, session }) => {
    const body = rowSchema.parse(await req.json());
    const row = await prisma.standingsRow.upsert({
      where: { leagueId_team: { leagueId: params.id, team: body.team } },
      update: { ...body, form: JSON.stringify(body.form) },
      create: {
        team: body.team,
        played: body.played,
        won: body.won,
        drawn: body.drawn,
        lost: body.lost,
        goalsFor: body.goalsFor,
        goalsAgainst: body.goalsAgainst,
        points: body.points,
        form: JSON.stringify(body.form),
        leagueId: params.id as string,
      },
    });
    await logAudit({ userId: session!.sub, action: "UPDATE", entity: "StandingsRow", entityId: row.id });
    return ok({ ...row, form: JSON.parse(row.form) }, 201);
  },
  { minRole: "CLUB_MANAGER" }
);
