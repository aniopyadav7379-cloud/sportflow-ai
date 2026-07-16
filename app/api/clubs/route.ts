import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, withApi } from "@/lib/api";
import { logAudit } from "@/lib/audit";

const createSchema = z.object({
  name: z.string().min(2).max(120),
  city: z.string().min(1),
  country: z.string().min(1),
  founded: z.number().int().min(1850).max(new Date().getFullYear()),
  status: z.enum(["Active", "Inactive"]).default("Active"),
  logoColor: z.string().default("#4f6bfd"),
  description: z.string().optional(),
});

export const GET = withApi(async (req) => {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  const clubs = await prisma.club.findMany({
    where: q ? { name: { contains: q } } : undefined,
    include: { _count: { select: { teams: true, players: true } } },
    orderBy: { name: "asc" },
  });
  return ok(
    clubs.map((c) => ({
      ...c,
      teamsCount: c._count.teams,
      playersCount: c._count.players,
    }))
  );
});

export const POST = withApi(
  async (req, { session }) => {
    const body = createSchema.parse(await req.json());

    const club = await prisma.club.create({
      data: {
        name: body.name,
        city: body.city,
        country: body.country,
        founded: body.founded,
        status: body.status,
        logoColor: body.logoColor,
        description: body.description ?? null,
      },
    });

    await logAudit({
      userId: session!.sub,
      action: "CREATE",
      entity: "Club",
      entityId: club.id,
    });

    return ok(club, 201);
  },
  { minRole: "CLUB_MANAGER" }
);