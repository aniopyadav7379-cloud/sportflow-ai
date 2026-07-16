import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, withApi } from "@/lib/api";
import { logAudit } from "@/lib/audit";

const createSchema = z.object({
  name: z.string().min(2),
  department: z.enum(["Staff", "Equipment", "Transport", "Volunteers", "Medical", "Security"]),
  role: z.string().min(1),
  status: z.string().default("Available"),
});

export const GET = withApi(async (req) => {
  const department = req.nextUrl.searchParams.get("department") ?? undefined;
  const staff = await prisma.staffMember.findMany({
    where: department ? { department } : undefined,
    orderBy: { name: "asc" },
  });
  return ok(staff);
});

export const POST = withApi(
  async (req, { session }) => {
    const body = createSchema.parse(await req.json());
    const staff = await prisma.staffMember.create({
      data: {
        name: body.name,
        department: body.department,
        role: body.role,
        status: body.status,
      },
    });
    await logAudit({ userId: session!.sub, action: "CREATE", entity: "StaffMember", entityId: staff.id });
    return ok(staff, 201);
  },
  { minRole: "CLUB_MANAGER" }
);