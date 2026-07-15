import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, fail, withApi } from "@/lib/api";

export const GET = withApi(async (_req, { session }) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: session!.sub },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
  return ok(notifications);
});

const patchSchema = z.object({ id: z.string(), read: z.boolean() });

export const PATCH = withApi(async (req, { session }) => {
  const body = patchSchema.parse(await req.json());
  const notif = await prisma.notification.findUnique({ where: { id: body.id } });
  if (!notif || notif.userId !== session!.sub) return fail("Notification not found", 404);
  const updated = await prisma.notification.update({ where: { id: body.id }, data: { read: body.read } });
  return ok(updated);
});
