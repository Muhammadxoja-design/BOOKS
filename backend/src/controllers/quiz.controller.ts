import { Response } from "express";
import { RewardType } from "@prisma/client";
import prisma from "../lib/prisma";
import { getErrorMessage, isObject } from "../lib/http";
import { AuthRequest } from "../middlewares/auth.middleware";
import { resolveStreakUpdate } from "../services/gamification.service";

const getActiveQuiz = () =>
  prisma.quiz.findFirst({
    where: {
      isPublished: true,
    },
    include: {
      questions: {
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { startsAt: "desc" },
  });

export const getWeeklyQuiz = async (req: AuthRequest, res: Response) => {
  try {
    const quiz = await getActiveQuiz();

    if (!quiz) {
      res.status(404).json({ message: "No active weekly quiz available." });
      return;
    }

    const attempt = req.user?.id
      ? await prisma.quizAttempt.findUnique({
          where: {
            quizId_userId: {
              quizId: quiz.id,
              userId: req.user.id,
            },
          },
        })
      : null;

    res.status(200).json({
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      startsAt: quiz.startsAt,
      endsAt: quiz.endsAt,
      alreadySubmitted: Boolean(attempt),
      questions: quiz.questions.map((question) => ({
        id: question.id,
        prompt: question.prompt,
        options: question.options,
        points: question.points,
        explanation: attempt ? question.explanation : null,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const submitWeeklyQuiz = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: "Authentication required." });
      return;
    }

    const quiz = await getActiveQuiz();

    if (!quiz) {
      res.status(404).json({ message: "No active weekly quiz available." });
      return;
    }

    const existingAttempt = await prisma.quizAttempt.findUnique({
      where: {
        quizId_userId: {
          quizId: quiz.id,
          userId: req.user.id,
        },
      },
    });

    if (existingAttempt) {
      res.status(409).json({ message: "Weekly quiz already submitted.", attempt: existingAttempt });
      return;
    }

    const answers = isObject(req.body.answers) ? req.body.answers : null;

    if (!answers) {
      res.status(400).json({ message: "Answers payload is required." });
      return;
    }

    let score = 0;

    quiz.questions.forEach((question) => {
      if (answers[question.id] === question.answer) {
        score += question.points;
      }
    });

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        streakDays: true,
        longestStreak: true,
        lastActiveAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    const streak = resolveStreakUpdate(user);

    const [attempt] = await prisma.$transaction([
      prisma.quizAttempt.create({
        data: {
          quizId: quiz.id,
          userId: req.user.id,
          answers,
          score,
        },
      }),
      prisma.user.update({
        where: { id: req.user.id },
        data: {
          points: { increment: score },
          streakDays: streak.streakDays,
          longestStreak: streak.longestStreak,
          lastActiveAt: streak.lastActiveAt,
        },
      }),
      prisma.rewardEvent.create({
        data: {
          userId: req.user.id,
          type: RewardType.QUIZ,
          title: "Weekly quiz completed",
          description: `You scored ${score} points in this week's challenge.`,
          pointsChange: score,
        },
      }),
    ]);

    res.status(201).json({
      attempt,
      score,
      streakDays: streak.streakDays,
    });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};
