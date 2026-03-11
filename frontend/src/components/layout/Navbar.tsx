import Link from 'next/link';
import { BookOpen, Headphones, ShoppingBag, User, Command } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-black/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <Command className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">Lexicon</span>
          </Link>
          
          <div className="hidden md:flex md:items-center md:gap-6">
            <Link href="/audiobooks" className="flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-indigo-600 dark:text-zinc-300 dark:hover:text-indigo-400 transition-colors">
              <Headphones className="h-4 w-4" />
              Audio Books
            </Link>
            <Link href="/books" className="flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-indigo-600 dark:text-zinc-300 dark:hover:text-indigo-400 transition-colors">
              <BookOpen className="h-4 w-4" />
              PDF Books
            </Link>
            <Link href="/store" className="flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-indigo-600 dark:text-zinc-300 dark:hover:text-indigo-400 transition-colors">
              <ShoppingBag className="h-4 w-4" />
              Store
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login" className="hidden text-sm font-medium text-zinc-600 hover:text-indigo-600 dark:text-zinc-300 dark:hover:text-indigo-400 md:block transition-colors">
            Sign In
          </Link>
          <Link href="/register" className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors">
            Get Started
          </Link>
          <Link href="/dashboard" className="ml-2 rounded-full border border-zinc-200 p-2 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors">
            <User className="h-4 w-4" />
            <span className="sr-only">Dashboard</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
