import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function registerUser(input: { name: string; email: string; password: string }) {
  const passwordHash = await bcrypt.hash(input.password, 12);
  try {
    return await prisma.user.create({
      data: {
        name: input.name,
        email: input.email.toLowerCase(),
        passwordHash,
        dailyGoal: { create: { wordsPerDay: 10, reviewsPerDay: 20 } },
        progress: { create: {} },
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return null;
    }
    throw error;
  }
}

export async function updateProfile(userId: string, name: string) {
  return prisma.user.update({ where: { id: userId }, data: { name } });
}

export async function updateGoals(userId: string, wordsPerDay: number, reviewsPerDay: number) {
  return prisma.dailyGoal.upsert({
    where: { userId },
    update: { wordsPerDay, reviewsPerDay },
    create: { userId, wordsPerDay, reviewsPerDay },
  });
}

export async function updatePreferences(
  userId: string,
  input: { theme: string; locale: string; notifications: boolean },
) {
  return prisma.user.update({
    where: { id: userId },
    data: input,
  });
}

export async function changePassword(userId: string, current: string, nextPassword: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return false;
  const valid = await bcrypt.compare(current, user.passwordHash);
  if (!valid) return false;
  const passwordHash = await bcrypt.hash(nextPassword, 12);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  return true;
}

export async function deleteAccount(userId: string) {
  await prisma.user.delete({ where: { id: userId } });
}
