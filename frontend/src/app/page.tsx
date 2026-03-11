import Link from "next/link";
import { ArrowRight, BookOpen, Headphones, Trophy, Star } from "lucide-react";
import Navbar from "@/components/layout/Navbar";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black font-sans selection:bg-indigo-500/30">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 sm:py-32 lg:pb-32 xl:pb-36">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-12 lg:gap-8">
              <div className="sm:text-center md:mx-auto md:max-w-2xl lg:col-span-6 lg:text-left">
                <div className="flex justify-center lg:justify-start">
                  <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 ring-1 ring-inset ring-indigo-500/20">
                    What's new in v1.0
                  </span>
                </div>
                <h1 className="mt-8 text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-6xl xl:text-7xl">
                  Redefining your
                  <span className="block text-indigo-600 dark:text-indigo-400"> reading journey.</span>
                </h1>
                <p className="mt-6 text-lg leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-xl">
                  Dive into a world of limitless knowledge. Listen, read, highlight, and track your progress all in one beautifully designed platform. Earn points and climb the leaderboard.
                </p>
                <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
                  <Link href="/register" className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-8 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all duration-200">
                    Start Reading Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  <Link href="/store" className="inline-flex items-center justify-center rounded-full ring-1 ring-zinc-200 bg-white px-8 py-3.5 text-base font-semibold text-zinc-900 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-white dark:ring-zinc-800 dark:hover:bg-zinc-800 transition-all duration-200">
                    Browse Store
                  </Link>
                </div>
              </div>
              <div className="relative mt-16 sm:mt-24 lg:col-span-6 lg:mt-0">
                <div className="aspect-[4/3] w-full rounded-2xl bg-zinc-100 p-2 ring-1 ring-inset ring-zinc-900/10 dark:bg-zinc-900 dark:ring-white/10 overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=1000" alt="App dashboard preview" className="rounded-xl object-cover w-full h-full opacity-90 shadow-2xl ring-1 ring-gray-900/10" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-white dark:bg-zinc-950">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">Everything you need to grow</h2>
              <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">A comprehensive suite of tools designed to make reading a habit.</p>
            </div>
            
            <div className="mt-20 grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-sm border border-indigo-100 dark:border-indigo-500/20">
                  <Headphones className="h-8 w-8" />
                </div>
                <h3 className="mt-6 text-xl font-bold text-zinc-900 dark:text-white">Audio Books</h3>
                <p className="mt-2 text-zinc-600 dark:text-zinc-400">Listen on the go with our advanced player. Control playback speeds seamlessly.</p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-sm border border-emerald-100 dark:border-emerald-500/20">
                  <BookOpen className="h-8 w-8" />
                </div>
                <h3 className="mt-6 text-xl font-bold text-zinc-900 dark:text-white">PDF Reader</h3>
                <p className="mt-2 text-zinc-600 dark:text-zinc-400">Highlight, take notes, and sync your reading progress automatically.</p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-sm border border-amber-100 dark:border-amber-500/20">
                  <Trophy className="h-8 w-8" />
                </div>
                <h3 className="mt-6 text-xl font-bold text-zinc-900 dark:text-white">Gamification</h3>
                <p className="mt-2 text-zinc-600 dark:text-zinc-400">Earn points, build streaks, take quizzes, and climb the weekly leaderboard.</p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 shadow-sm border border-pink-100 dark:border-pink-500/20">
                  <Star className="h-8 w-8" />
                </div>
                <h3 className="mt-6 text-xl font-bold text-zinc-900 dark:text-white">AI Recommendations</h3>
                <p className="mt-2 text-zinc-600 dark:text-zinc-400">Get personalized book suggestions based on your reading history and habits.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
