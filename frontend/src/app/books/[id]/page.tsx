"use client";

import Navbar from "@/components/layout/Navbar";
import {
  BookOpen,
  Bookmark,
  Star,
  ChevronLeft,
  ChevronRight,
  Settings,
  Maximize2,
} from "lucide-react";
import { useState } from "react";

export default function PDFReaderPage() {
  const [currentPage, setCurrentPage] = useState(12);
  const totalPages = 464;

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans">
      <Navbar />

      <main className="flex-1 flex flex-col py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between bg-white dark:bg-zinc-900 px-6 py-4 rounded-t-2xl border border-zinc-200 dark:border-zinc-800 border-b-0 shadow-sm">
          <div className="flex items-center gap-4">
            <h1 className="font-bold text-lg text-zinc-900 dark:text-white">
              Clean Code
            </h1>
            <span className="hidden hidden md:inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20">
              Programming
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition group flex items-center gap-2">
              <Bookmark className="w-5 h-5 group-hover:fill-current" />
              <span className="text-sm font-medium hidden md:block">
                Save Note
              </span>
            </button>
            <button className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition">
              <Settings className="w-5 h-5" />
            </button>
            <button className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition">
              <Maximize2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mock PDF Area */}
        <div className="flex-1 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden flex flex-col items-center justify-center p-8 relative">
          <div className="max-w-3xl w-full h-full bg-zinc-50 border border-zinc-200 shadow-md p-16 overflow-y-auto prose prose-zinc dark:prose-invert">
            <h1>Chapter 3: Functions</h1>
            <p>
              Functions are the first line of organization in any program. In
              the early days of programming we composed our systems of routines
              and subroutines. Then, in the era of Fortran and PL/1 we composed
              our systems of programs, subprograms, and functions...
            </p>
            <h3>Small!</h3>
            <p>
              The first rule of functions is that they should be small. The
              second rule of functions is that they should be smaller than that.
              Functions should not be 100 lines long. Functions should hardly
              ever be 20 lines long.
            </p>
            <div className="bg-yellow-200 dark:bg-yellow-900/30 p-2 rounded relative cursor-pointer group">
              <p className="m-0 font-medium text-amber-900 dark:text-amber-200">
                Functions should do one thing. They should do it well. They
                should do it only.
              </p>
              <div className="absolute top-0 right-0 -mt-3 -mr-3 bg-white dark:bg-zinc-800 shadow shadow-amber-500/20 rounded-full p-1 border border-amber-200 dark:border-amber-800 opacity-0 group-hover:opacity-100 transition">
                <Bookmark className="w-4 h-4 text-amber-500 fill-current" />
              </div>
            </div>
            <p>
              This is a piece of highlighted text that a user saved as a note.
              Reading in this environment is distraction free and focused.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between bg-zinc-100 dark:bg-zinc-900 px-6 py-4 rounded-b-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm mt-0">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          <div className="flex items-center gap-4 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            <div className="w-32 h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500"
                style={{ width: `${(currentPage / totalPages) * 100}%` }}
              ></div>
            </div>
            {currentPage} / {totalPages}
          </div>

          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </main>
    </div>
  );
}
