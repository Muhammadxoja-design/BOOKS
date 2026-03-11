import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getWeeklyQuiz = async (req: Request, res: Response) => {
  try {
    const quiz = await prisma.quiz.findFirst({
      where: { isActive: true },
      include: {
        questions: {
          select: {
            id: true,
            question: true,
            options: true,
            // don't send answer to the client before submission
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!quiz) {
      return res.status(404).json({ message: 'No active quiz found this week' });
    }

    res.status(200).json(quiz);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching weekly quiz', error });
  }
};

export const submitQuiz = async (req: Request, res: Response) => {
  try {
    const { quizId, answers } = req.body;
    // answers is expected to be an array or object: { [questionId]: answerString }
    const userId = (req as any).user?.id || 'sample-user-id'; // assuming auth middleware sets req.user

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true }
    });

    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    let score = 0;
    quiz.questions.forEach(q => {
      if (answers[q.id] === q.answer) {
        score += 10; // 10 points per correct answer
      }
    });

    // Save result
    const result = await prisma.quizResult.create({
      data: {
        quizId,
        userId,
        score
      }
    });

    // Update user points
    await prisma.user.update({
      where: { id: userId },
      data: { points: { increment: score } }
    });

    res.status(200).json({ message: 'Quiz submitted successfully', score, result });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting quiz', error });
  }
};
