import Navbar from "@/components/layout/Navbar";
import { ShoppingBag, Star, Plus, Check } from "lucide-react";

export default function StorePage() {
  const storeItems = [
    { id: 1, title: "Premium Access (1 Month)", desc: "Unlimited audios and PDFs.", price: 9.99, type: "Subscription" },
    { id: 2, title: "Hardcover: The Pragmatic Programmer", desc: "Physical copy shipped to you.", price: 35.00, type: "Physical" },
    { id: 3, title: "Hardcover: Clean Architecture", desc: "Physical copy shipped.", price: 42.50, type: "Physical" },
    { id: 4, title: "points Bundle X", desc: "1000 points to unlock rewards.", price: 4.99, type: "Points" },
  ];

  return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-zinc-200 dark:border-zinc-800 pb-8">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
              <div className="flex p-3 rounded-2xl bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400">
                <ShoppingBag className="h-8 w-8" />
              </div>
              Book Store
            </h1>
            <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl">
              Buy physical books, premium subscriptions, or point bundles securely.
            </p>
          </div>
           <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-sm font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition shadow-lg shadow-zinc-900/20 dark:shadow-white/20">
              <ShoppingBag className="h-4 w-4" /> View Cart (0)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {storeItems.map((item) => (
             <div key={item.id} className="group relative flex flex-col overflow-hidden rounded-3xl bg-white border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 transition-all hover:shadow-xl hover:-translate-y-1">
                 <div className="absolute top-4 right-4 z-10">
                     <span className="inline-flex items-center rounded-full bg-black/5 dark:bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-zinc-900 dark:text-white backdrop-blur-md">
                         {item.type}
                     </span>
                 </div>
                 <div className="aspect-square bg-zinc-100 dark:bg-zinc-800 p-8 flex items-center justify-center relative overflow-hidden group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700 transition-colors">
                     <div className="w-32 h-32 rounded-full bg-white/50 backdrop-blur-3xl absolute blur-3xl"></div>
                     <ShoppingBag className="w-24 h-24 text-zinc-300 dark:text-zinc-600 relative z-10 transform group-hover:scale-110 transition-transform duration-500" />
                 </div>
                 <div className="p-6 flex flex-col flex-1">
                     <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">{item.title}</h3>
                     <p className="text-sm text-zinc-500 dark:text-zinc-400 flex-1">{item.desc}</p>
                     
                     <div className="mt-6 flex items-center justify-between">
                         <span className="text-2xl font-black text-zinc-900 dark:text-white">${item.price}</span>
                         <button className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500 dark:hover:text-white transition-colors">
                             <Plus className="w-5 h-5" />
                         </button>
                     </div>
                 </div>
             </div>
          ))}
        </div>
      </main>
    </div>
  );
}
