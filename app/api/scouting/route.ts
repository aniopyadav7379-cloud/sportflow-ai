import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, withApi } from "@/lib/api";
import { logAudit } from "@/lib/audit";

const createSchema = z.object({
  name: z.string().min(2),
  position: z.string(),
  age: z.number().int().min(14).max(45),
  country: z.string(),
  team: z.string(),
  overall: z.number().int().min(0).max(100),
  potential: z.enum(["High", "Medium", "Low"]).default("Medium"),
  stage: z.enum(["Prospect", "Shortlisted", "OnTrial", "Signed", "Rejected"]).default("Prospect"),
  photoUrl: z.string().url().optional(),
  strengths: z.array(z.string()).default([]),
});

export const GET = withApi(async (req) => {
  const stage = req.nextUrl.searchParams.get("stage") ?? undefined;
  const players = await prisma.scoutedPlayer.findMany({
    where: stage && stage !== "All" ? { stage } : undefined,
    orderBy: { overall: "desc" },
  });
  return ok(players.map((p) => ({ ...p, strengths: JSON.parse(p.strengths) })));
});

export const POST = withApi(
  async (req, { session }) => {
    const body = createSchema.parse(await req.json());
    const player = await prisma.scoutedPlayer.create({
      data: {
        name: body.name,
        position: body.position,
        age: body.age,
        country: body.country,
        team: body.team,
        overall: body.overall,
        potential: body.potential,
        stage: body.stage,
        photoUrl: body.photoUrl,
        strengths: JSON.stringify(body.strengths),
      },
    });
    await logAudit({ userId: session!.sub, action: "CREATE", entity: "ScoutedPlayer", entityId: player.id });
    return ok({ ...player, strengths: body.strengths }, 201);
  },
  { minRole: "SCOUT" }
);
