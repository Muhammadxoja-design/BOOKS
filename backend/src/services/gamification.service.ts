import { Book, BookFormat, RewardType, User } from "@prisma/client";
import prisma from "../lib/prisma";

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const resolveStreakUpdate = (user: Pick<User, "streakDays" | "longestStreak" | "lastActiveAt">) => {
  const now = new Date();
  const today = startOfDay(now);
  const lastActive = user.lastActiveAt ? startOfDay(user.lastActiveAt) : null;

  if (lastActive && lastActive.getTime() === today.getTime()) {
    return {
      streakDays: user.streakDays,
      longestStreak: user.longestStreak,
      streakAdvanced: false,
      lastActiveAt: now,
    };
  }

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const streakDays =
    lastActive && lastActive.getTime() === yesterday.getTime()
      ? user.streakDays + 1
      : 1;

  return {
    streakDays,
    longestStreak: Math.max(streakDays, user.longestStreak),
    streakAdvanced: true,
    lastActiveAt: now,
  };
};

export const getRewardTypeForFormat = (format: BookFormat) => {
  if (format === BookFormat.AUDIO) {
    return RewardType.LISTENING;
  }

  return RewardType.READING;
};

export const awardProgressEvent = async ({
  userId,
  user,
  book,
  previousPercentage,
  nextPercentage,
}: {
  userId: string;
  user: Pick<User, "points" | "streakDays" | "longestStreak" | "lastActiveAt">;
  book: Pick<Book, "id" | "title" | "format" | "pointsReward">;
  previousPercentage: number;
  nextPercentage: number;
}) => {
  const streak = resolveStreakUpdate(user);
  const progressDelta = Math.max(0, nextPercentage - previousPercentage);
  const milestonePoints = Math.floor(progressDelta / 10) * 4;
  const completedNow = previousPercentage < 100 && nextPercentage >= 100;
  const completionPoints = completedNow ? book.pointsReward : 0;
  const streakBonus = streak.streakAdvanced ? 5 : 0;
  const totalAward = milestonePoints + completionPoints + streakBonus;

  await prisma.user.update({
    where: { id: userId },
    data: {
      points: { increment: totalAward },
      streakDays: streak.streakDays,
      longestStreak: streak.longestStreak,
      lastActiveAt: streak.lastActiveAt,
    },
  });

  if (streakBonus > 0) {
    await prisma.rewardEvent.create({
      data: {
        userId,
        type: RewardType.STREAK,
        title: `${streak.streakDays}-day streak`,
        description: "You stayed active today and protected your learning streak.",
        pointsChange: streakBonus,
      },
    });
  }

  if (milestonePoints > 0 || completionPoints > 0) {
    await prisma.rewardEvent.create({
      data: {
        userId,
        type: getRewardTypeForFormat(book.format),
        title: completedNow ? `${book.title} completed` : `${book.title} progress updated`,
        description: completedNow
          ? "Completion bonus added to your account."
          : "Progress milestone unlocked.",
        pointsChange: milestonePoints + completionPoints,
      },
    });
  }

  return {
    totalAward,
    streakDays: streak.streakDays,
    completedNow,
  };
};
