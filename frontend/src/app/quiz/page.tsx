"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { AuthGuard } from "@/components/features/auth-guard";
import { Surface } from "@/components/ui/surface";
import { apiFetch, getToken } from "@/lib/api";
import { WeeklyQuiz } from "@/lib/types";

export default function QuizPage() {
  const { data: session } = useSession();
  const token = getToken(session ?? null);
  const [quiz, setQuiz] = useState<WeeklyQuiz | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadQuiz = async () => {
      const response = await apiFetch<WeeklyQuiz>("/quizzes/weekly", { token });
      setQuiz(response);
    };

    void loadQuiz();
  }, [token]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      return;
    }

    const result = await apiFetch<{ score: number; streakDays: number }>("/quizzes/weekly/submit", {
      method: "POST",
      token,
      body: {
        answers,
      },
    });

    setMessage(`Quiz submitted. Score: ${result.score}. Streak: ${result.streakDays} days.`);
  };

  return (
    <AuthGuard>
      {!quiz ? (
        <Surface className="p-10 text-center">Loading weekly quiz...</Surface>
      ) : (
        <div className="page-grid">
          <Surface className="p-8 md:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[color:var(--muted-foreground)]">
              Weekly quiz
            </p>
            <h1 className="mt-5 section-title text-[color:var(--foreground)]">{quiz.title}</h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-[color:var(--muted-foreground)]">
              {quiz.description}
            </p>
          </Surface>

          {message ? <Surface className="p-4 text-sm">{message}</Surface> : null}

          <form className="grid gap-6" onSubmit={handleSubmit}>
            {quiz.questions.map((question, index) => (
              <Surface key={question.id} className="p-6">
                <p className="text-xs uppercase tracking-[0.28em] text-[color:var(--muted-foreground)]">
                  Question {index + 1}
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-[color:var(--foreground)]">
                  {question.prompt}
                </h2>
                <div className="mt-5 grid gap-3">
                  {question.options.map((option) => (
                    <label
                      key={option}
                      className="flex items-center gap-3 rounded-[22px] border border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-3"
                    >
                      <input
                        type="radio"
                        name={question.id}
                        value={option}
                        checked={answers[question.id] === option}
                        onChange={() =>
                          setAnswers((current) => ({
                            ...current,
                            [question.id]: option,
                          }))
                        }
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </Surface>
            ))}

            <button
              type="submit"
              disabled={quiz.alreadySubmitted}
              className="rounded-full bg-[color:var(--foreground)] px-6 py-3 text-sm font-semibold text-[color:var(--bg)] disabled:opacity-50"
            >
              {quiz.alreadySubmitted ? "Already submitted" : "Submit weekly quiz"}
            </button>
          </form>
        </div>
      )}
    </AuthGuard>
  );
}
