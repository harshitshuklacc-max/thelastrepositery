import prisma from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import type { UserRole } from "@prisma/client";

export async function getCustomers(params: { page?: number; limit?: number }) {
  const page = params.page || 1;
  const limit = params.limit || 50;
  const skip = (page - 1) * limit;

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      include: { user: { select: { email: true, isActive: true, createdAt: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.customer.count(),
  ]);

  return { customers, total, page, totalPages: Math.ceil(total / limit) };
}

export async function createCustomerByAdmin(data: {
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
  phone?: string;
}) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    return { success: false as const, error: "Email already registered" };
  }

  const passwordHash = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      role: "CUSTOMER" as UserRole,
      customer: {
        create: {
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          carts: { create: {} },
        },
      },
    },
    include: { customer: true },
  });

  return { success: true as const, customer: user.customer! };
}
