import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, withApi } from "@/lib/api";
import { logAudit } from "@/lib/audit";

const createSchema = z.object({
  matchId: z.string().optional(),
  type: z.enum(["General", "VIP", "Season Pass"]),
  price: z.number().min(0),
  quantity: z.number().int().min(1),
});

export const GET = withApi(async () => {
  const tickets = await prisma.ticket.findMany({ orderBy: { createdAt: "desc" } });
  return ok(tickets);
});

export const POST = withApi(
  async (req, { session }) => {
    const body = createSchema.parse(await req.json());
    const ticket = await prisma.ticket.create({
      data: {
        matchId: body.matchId,
        type: body.type,
        price: body.price,
        quantity: body.quantity,
      },
    });
    await logAudit({ userId: session!.sub, action: "CREATE", entity: "Ticket", entityId: ticket.id });
    return ok(ticket, 201);
  },
  { minRole: "CLUB_MANAGER" }
);
