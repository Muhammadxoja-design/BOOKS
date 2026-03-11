import Navbar from "@/components/layout/Navbar";
import { Headphones, Play, Clock, Star } from "lucide-react";
import Link from "next/link";

const mockAudiobooks = [
  {
    id: 1,
    title: "Deep Work Strategies",
    author: "Cal Newport",
    cover:
      "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=400",
    duration: "6h 45m",
    rating: 4.8,
  },
  {
    id: 2,
    title: "The Art of Listening",
    author: "Erich Fromm",
    cover:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400",
    duration: "8h 12m",
    rating: 4.5,
  },
  {
    id: 3,
    title: "Peak Performance",
    author: "Steve Magness",
    cover:
      "https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?auto=format&fit=crop&q=80&w=400",
    duration: "5h 30m",
    rating: 4.9,
  },
  {
    id: 4,
    title: "Atomic Habits",
    author: "James Clear",
    cover:
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400",
    duration: "7h 20m",
    rating: 4.9,
  },
];

export default function AudioBooksPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-zinc-200 dark:border-zinc-800 pb-8">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
              <div className="flex p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <Headphones className="h-8 w-8" />
              </div>
              Audio Books
            </h1>
            <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl">
              Immerse yourself in our premium collection of audiobooks. Listen
              at your own pace with our advanced player.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 rounded-full border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition">
              Filters
            </button>
            <button className="px-4 py-2 rounded-full border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition">
              Sort by: Popular
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {mockAudiobooks.map((book) => (
            <Link
              key={book.id}
              href={`/audiobooks/${book.id}`}
              className="group flex flex-col rounded-2xl border border-zinc-200 bg-white overflow-hidden hover:shadow-xl transition-all duration-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
            >
              <div className="relative aspect-square w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                <img
                  src={book.cover}
                  alt={book.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/30 text-white transform scale-90 group-hover:scale-100 transition-transform duration-300">
                    <Play className="h-8 w-8 ml-1" />
                  </div>
                </div>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-bold text-lg text-zinc-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {book.title}
                </h3>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  {book.author}
                </p>
                <div className="mt-auto pt-4 flex items-center justify-between text-sm font-medium">
                  <div className="flex items-center text-zinc-600 dark:text-zinc-400 gap-1.5 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md">
                    <Clock className="h-4 w-4 text-indigo-500" />
                    {book.duration}
                  </div>
                  <div className="flex items-center text-amber-600 gap-1 absolute right-5">
                    <Star className="h-4 w-4 fill-current" />
                    {book.rating}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
