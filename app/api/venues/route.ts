import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, withApi } from "@/lib/api";
import { logAudit } from "@/lib/audit";

const createSchema = z.object({
  name: z.string().min(2),
  location: z.string().min(2),
  type: z.enum(["Stadium", "Indoor", "Training Ground"]).default("Stadium"),
  capacity: z.number().int().min(1),
  surface: z.string().default("Grass"),
  utilization: z.number().int().min(0).max(100).default(0),
  status: z.enum(["Active", "Maintenance"]).default("Active"),
  imageUrl: z.string().url().optional(),
  clubId: z.string().optional(),
});

export const GET = withApi(async (req) => {
  const type = req.nextUrl.searchParams.get("type") ?? undefined;
  const venues = await prisma.venue.findMany({
    where: type && type !== "All Venues" ? { type } : undefined,
    include: { bookings: { orderBy: { start: "asc" }, take: 5 } },
    orderBy: { utilization: "desc" },
  });
  return ok(venues);
});

export const POST = withApi(
  async (req, { session }) => {
    const body = createSchema.parse(await req.json());
    const venue = await prisma.venue.create({
      data: {
        name: body.name,
        location: body.location,
        type: body.type,
        capacity: body.capacity,
        surface: body.surface,
        utilization: body.utilization,
        status: body.status,
        imageUrl: body.imageUrl,
        clubId: body.clubId,
      },
    });
    await logAudit({ userId: session!.sub, action: "CREATE", entity: "Venue", entityId: venue.id });
    return ok(venue, 201);
  },
  { minRole: "CLUB_MANAGER" }
);