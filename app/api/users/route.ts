import { prisma } from "@/lib/prisma";
import { ok, withApi } from "@/lib/api";

export const GET = withApi(
  async () => {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });
    return ok(users);
  },
  { minRole: "ADMIN" }
);
