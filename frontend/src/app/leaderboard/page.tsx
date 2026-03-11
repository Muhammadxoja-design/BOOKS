"use client";

import { useEffect, useState } from "react";
import { Flame, Trophy } from "lucide-react";
import { Surface } from "@/components/ui/surface";
import { apiFetch } from "@/lib/api";
import { LeaderboardUser } from "@/lib/types";

export default function LeaderboardPage() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);

  useEffect(() => {
    const loadLeaderboard = async () => {
      const response = await apiFetch<LeaderboardUser[]>("/users/leaderboard");
      setUsers(response);
    };

    void loadLeaderboard();
  }, []);

  return (
    <div className="page-grid">
      <Surface className="p-8 md:p-10">
        <h1 className="section-title text-[color:var(--foreground)]">Leaderboard</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-[color:var(--muted-foreground)]">
          Weekly points and streak momentum. This view is public so competition itself becomes part
          of product retention.
        </p>
      </Surface>

      <Surface className="overflow-hidden">
        <div className="divide-y divide-[color:var(--border)]">
          {users.map((user, index) => (
            <div
              key={user.id}
              className="grid gap-4 px-6 py-5 md:grid-cols-[80px_1fr_auto_auto] md:items-center"
            >
              <div className="text-3xl font-semibold text-[color:var(--foreground)]">#{index + 1}</div>
              <div>
                <p className="text-xl font-semibold text-[color:var(--foreground)]">{user.name}</p>
                <p className="text-sm text-[color:var(--muted-foreground)]">
                  {user.headline ?? "Committed reader"}
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[color:var(--muted)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)]">
                <Flame className="h-4 w-4 text-[color:var(--accent)]" />
                {user.streakDays} days
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[color:var(--foreground)] px-4 py-2 text-sm font-semibold text-[color:var(--bg)]">
                <Trophy className="h-4 w-4" />
                {user.points} pts
              </div>
            </div>
          ))}
        </div>
      </Surface>
    </div>
  );
}
