import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import prisma from "@/lib/db";
import { createCustomerByAdmin, getCustomers } from "@/services/customers";
import { z } from "zod";

const createCustomerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().optional(),
  phone: z.string().optional(),
});

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getCustomers({});
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createCustomerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message || "Invalid input" },
      { status: 400 }
    );
  }

  const result = await createCustomerByAdmin(parsed.data);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  await prisma.auditLog.create({
    data: {
      adminId: session.sub,
      action: "CREATE",
      entity: "customer",
      entityId: result.customer.id,
      details: { email: parsed.data.email, firstName: parsed.data.firstName },
    },
  });

  return NextResponse.json(result.customer, { status: 201 });
}
