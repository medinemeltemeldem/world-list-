import { Prisma, type SessionType } from "@prisma/client";
import { addCalendarDays, istanbulStartOfDay } from "@/lib/dates";

type Tx = Prisma.TransactionClient;

export async function applyActivity(
  tx: Tx,
  userId: string,
  seconds: number,
  type: SessionType,
  itemCount: number,
) {
  const duration = Math.max(1, Math.min(Math.round(seconds) || 1, 180));
  await tx.learningSession.create({
    data: { userId, type, duration, itemCount },
  });

  const progress = await tx.userProgress.findUnique({ where: { userId } });
  const todayStart = istanbulStartOfDay();
  const yesterdayStart = addCalendarDays(todayStart, -1);
  const last = progress?.lastStudyDate ?? null;
  let current = progress?.currentStreak ?? 0;

  if (last && last >= todayStart) {
    current = Math.max(current, 1);
  } else if (last && last >= yesterdayStart) {
    current += 1;
  } else {
    current = 1;
  }

  const longest = Math.max(progress?.longestStreak ?? 0, current);

  await tx.userProgress.upsert({
    where: { userId },
    update: {
      currentStreak: current,
      longestStreak: longest,
      lastStudyDate: new Date(),
      totalStudySeconds: { increment: duration },
    },
    create: {
      userId,
      currentStreak: 1,
      longestStreak: 1,
      lastStudyDate: new Date(),
      totalStudySeconds: duration,
    },
  });
}
