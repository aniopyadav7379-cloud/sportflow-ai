import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, withApi } from "@/lib/api";
import { logAudit } from "@/lib/audit";

const createSchema = z.object({
  name: z.string().min(2).max(120),
  jersey: z.number().int().min(0).max(99),
  position: z.string().min(1),
  age: z.number().int().min(14).max(50),
  height: z.string(),
  weight: z.string(),
  foot: z.enum(["Left", "Right"]).default("Right"),
  nationality: z.string(),
  clubId: z.string(),
  teamId: z.string().optional(),
  overall: z.number().min(0).max(10).default(0),
  fitness: z.number().int().min(0).max(100).default(100),
  form: z.string().default("Good"),
  marketValue: z.string().default("₹0"),
  photoUrl: z.string().url().optional(),
});

export const GET = withApi(async (req) => {
  const sp = req.nextUrl.searchParams;
  const q = sp.get("q")?.trim();
  const clubId = sp.get("clubId") ?? undefined;
  const page = Math.max(1, Number(sp.get("page") ?? 1));
  const pageSize = Math.min(50, Math.max(1, Number(sp.get("pageSize") ?? 20)));

  const where = {
    ...(clubId ? { clubId } : {}),
    ...(q ? { name: { contains: q } } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.player.findMany({
      where,
      include: { club: { select: { name: true } }, team: { select: { name: true } } },
      orderBy: { overall: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.player.count({ where }),
  ]);

  return ok({ items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
});

export const POST = withApi(
  async (req, { session }) => {
    const body = createSchema.parse(await req.json());
    const player = await prisma.player.create({ data: body });
    await logAudit({ userId: session!.sub, action: "CREATE", entity: "Player", entityId: player.id });
    return ok(player, 201);
  },
  { minRole: "COACH" }
);
