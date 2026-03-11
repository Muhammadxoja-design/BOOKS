import Navbar from "@/components/layout/Navbar";
import { BookOpen, FileText, Star, ArrowRight } from "lucide-react";
import Link from "next/link";

const mockBooks = [
  { id: 1, title: "Clean Code", author: "Robert C. Martin", cover: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=400", category: "Programming", pages: 464, rating: 4.8 },
  { id: 2, title: "Design Patterns", author: "GoF", cover: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=400", category: "Architecture", pages: 395, rating: 4.7 },
  { id: 3, title: "The Pragmatic Programmer", author: "Andrew Hunt", cover: "https://images.unsplash.com/photo-1589998059171-988d887df646?auto=format&fit=crop&q=80&w=400", category: "Programming", pages: 352, rating: 4.9 },
  { id: 4, title: "Thinking, Fast and Slow", author: "Daniel Kahneman", cover: "https://images.unsplash.com/photo-1555529733-0e670560f8e1?auto=format&fit=crop&q=80&w=400", category: "Psychology", pages: 499, rating: 4.6 },
];

export default function BooksPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-zinc-200 dark:border-zinc-800 pb-8">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
              <div className="flex p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <BookOpen className="h-8 w-8" />
              </div>
              PDF Library
            </h1>
            <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl">
              Access hundreds of premium books in PDF format. Read, highlight, and annotate directly in your browser.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {mockBooks.map((book) => (
            <Link key={book.id} href={`/books/${book.id}`} className="group flex flex-col rounded-2xl bg-white p-4 hover:shadow-xl transition-all duration-300 dark:bg-zinc-900">
              <div className="flex gap-5">
                  <div className="relative w-28 h-40 shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800 shadow-md transform group-hover:-translate-y-2 group-hover:scale-105 transition-all duration-300">
                    <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col flex-1 py-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">{book.category}</span>
                    <h3 className="font-bold text-lg text-zinc-900 dark:text-white line-clamp-2 leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {book.title}
                    </h3>
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{book.author}</p>
                    
                    <div className="mt-auto flex items-center justify-between text-xs font-medium text-zinc-500">
                        <div className="flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5" />
                            {book.pages} pages
                        </div>
                        <div className="flex items-center gap-1 text-amber-500">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            {book.rating}
                        </div>
                    </div>
                  </div>
              </div>
              
              <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center text-sm font-semibold text-zinc-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Read Book
                  <ArrowRight className="ml-auto w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
