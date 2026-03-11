"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { BookOpen, Trophy, Clock, Target, PlayCircle, BarChart3 } from "lucide-react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Welcome back, {session.user?.name || "Reader"}
            </h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              Pick up right where you left off and keep the streak alive.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-900 dark:bg-amber-900/30 dark:text-amber-500">
              <Trophy className="h-4 w-4" />
              1,240 Points
            </div>
            <div className="flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-900 dark:bg-orange-900/30 dark:text-orange-500">
              <Target className="h-4 w-4" />
              12 Day Streak
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-indigo-500" /> Continue Reading
              </h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Book Card Mock */}
                <div className="group relative flex gap-6 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="h-32 w-24 shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
                    <img src="https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=200" alt="Book cover" className="h-full w-full object-cover" />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <h3 className="font-semibold text-zinc-900 dark:text-white line-clamp-1">The Art of Innovation</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">By Sarah Connor</p>
                    <div className="mt-auto">
                      <div className="mb-1 flex justify-between text-xs font-medium text-zinc-600 dark:text-zinc-400">
                        <span>45% Completed</span>
                        <span>120/265 pages</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                        <div className="h-full rounded-full bg-indigo-500" style={{ width: '45%' }} />
                      </div>
                    </div>
                  </div>
                </div>

                 {/* Audio Card Mock */}
                 <div className="group relative flex gap-6 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="h-32 w-24 shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800 relative">
                     <img src="https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=200" alt="Audio cover" className="h-full w-full object-cover opacity-80" />
                     <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <PlayCircle className="h-10 w-10 text-white opacity-80 group-hover:opacity-100 transition-opacity" />
                     </div>
                  </div>
                  <div className="flex flex-1 flex-col">
                    <h3 className="font-semibold text-zinc-900 dark:text-white line-clamp-1">Deep Work Strategies</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Audiobook</p>
                    <div className="mt-auto">
                      <div className="mb-1 flex justify-between text-xs font-medium text-zinc-600 dark:text-zinc-400">
                         <span>1h 15m left</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                        <div className="h-full rounded-full bg-emerald-500" style={{ width: '70%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-8">
             <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
                   <BarChart3 className="h-5 w-5 text-indigo-500" /> Weekly Activity
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                     <span className="text-sm text-zinc-600 dark:text-zinc-400">Books Read</span>
                     <span className="font-bold text-zinc-900 dark:text-white">2</span>
                  </div>
                  <div className="flex items-center justify-between">
                     <span className="text-sm text-zinc-600 dark:text-zinc-400">Hours Listened</span>
                     <span className="font-bold text-zinc-900 dark:text-white">5.4h</span>
                  </div>
                   <div className="flex items-center justify-between">
                     <span className="text-sm text-zinc-600 dark:text-zinc-400">Quiz Score Avg</span>
                     <span className="font-bold text-zinc-900 dark:text-white">92%</span>
                  </div>
                </div>
                <button className="mt-8 w-full rounded-xl bg-zinc-100 py-3 text-sm font-medium text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700 transition-colors">
                   View Full Stats
                </button>
             </section>
          </div>
        </div>
      </main>
    </div>
  );
}
