"use client";

import Navbar from "@/components/layout/Navbar";
import { Users, BookOpen, DollarSign, Settings, Activity, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated" || (session?.user as any)?.role !== "ADMIN") {
      router.push("/");
    }
  }, [status, session, router]);

  if (status === "loading" || !session) return null;

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans">
      <div className="w-64 bg-white dark:bg-black border-r border-zinc-200 dark:border-zinc-800 p-6 flex flex-col">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white mb-10 text-indigo-600 dark:text-indigo-400">Lexicon Admin</h1>
        <nav className="flex-1 space-y-2">
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-50 text-indigo-600 font-medium dark:bg-indigo-500/10 dark:text-indigo-400">
                <Activity className="w-5 h-5" /> Dashboard
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-600 hover:bg-zinc-100 font-medium dark:text-zinc-400 dark:hover:bg-zinc-900 transition text-sm">
                <BookOpen className="w-5 h-5" /> Library
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-600 hover:bg-zinc-100 font-medium dark:text-zinc-400 dark:hover:bg-zinc-900 transition text-sm">
                <Users className="w-5 h-5" /> Users
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-600 hover:bg-zinc-100 font-medium dark:text-zinc-400 dark:hover:bg-zinc-900 transition text-sm">
                <DollarSign className="w-5 h-5" /> Transactions
            </a>
        </nav>
        <div className="mt-auto">
             <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-600 hover:bg-zinc-100 font-medium dark:text-zinc-400 dark:hover:bg-zinc-900 transition text-sm">
                <Settings className="w-5 h-5" /> Settings
            </a>
        </div>
      </div>

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Overview</h2>
            <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-sm font-medium rounded-lg transition shadow-sm">
                <Plus className="w-4 h-4" /> Add Book
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
             <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col items-start">
                 <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl mb-4">
                     <Users className="w-6 h-6" />
                 </div>
                 <span className="text-zinc-500 dark:text-zinc-400 text-sm font-medium mb-1">Total Users</span>
                 <span className="text-3xl font-bold text-zinc-900 dark:text-white">1,248</span>
             </div>
             <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col items-start">
                 <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl mb-4">
                     <BookOpen className="w-6 h-6" />
                 </div>
                 <span className="text-zinc-500 dark:text-zinc-400 text-sm font-medium mb-1">Total Books</span>
                 <span className="text-3xl font-bold text-zinc-900 dark:text-white">342</span>
             </div>
             <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col items-start">
                 <div className="p-3 bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 rounded-xl mb-4">
                     <DollarSign className="w-6 h-6" />
                 </div>
                 <span className="text-zinc-500 dark:text-zinc-400 text-sm font-medium mb-1">Total Revenue</span>
                 <span className="text-3xl font-bold text-zinc-900 dark:text-white">$12,450.00</span>
             </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
             <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
                 <h3 className="font-bold text-zinc-900 dark:text-white">Recent Transactions</h3>
             </div>
             <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm whitespace-nowrap">
                     <thead className="bg-zinc-50 dark:bg-zinc-950/50 text-zinc-500 dark:text-zinc-400 uppercase text-xs font-semibold">
                         <tr>
                             <th className="px-6 py-4">Transaction ID</th>
                             <th className="px-6 py-4">User</th>
                             <th className="px-6 py-4">Amount</th>
                             <th className="px-6 py-4">Status</th>
                             <th className="px-6 py-4">Date</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                         <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition">
                             <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">#TRX-9823</td>
                             <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">john.doe@example.com</td>
                             <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">$9.99</td>
                             <td className="px-6 py-4">
                                 <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400">
                                     Completed
                                 </span>
                             </td>
                             <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">Oct 24, 2023</td>
                         </tr>
                         <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition">
                             <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">#TRX-9824</td>
                             <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">sarah.smith@example.com</td>
                             <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">$35.00</td>
                             <td className="px-6 py-4">
                                 <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400">
                                     Pending
                                 </span>
                             </td>
                             <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">Oct 24, 2023</td>
                         </tr>
                     </tbody>
                 </table>
             </div>
        </div>
      </main>
    </div>
  );
}
