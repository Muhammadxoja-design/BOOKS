"use client";

import Navbar from "@/components/layout/Navbar";
import { Play, Pause, FastForward, Rewind, Volume2 } from "lucide-react";
import { useState } from "react";

export default function AudioPlayerPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [progress] = useState(35); // mock

  const toggleSpeed = () => {
    if (speed === 1) setSpeed(1.5);
    else if (speed === 1.5) setSpeed(2);
    else setSpeed(1);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans flex flex-col">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 pb-8">
            <div className="w-full aspect-video bg-zinc-100 dark:bg-zinc-800 relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=800" alt="Cover" className="w-full h-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 to-transparent flex items-end p-8">
                <div className="text-white backdrop-blur-sm">
                   <h1 className="text-3xl font-bold tracking-tight shadow-sm">Deep Work Strategies</h1>
                   <p className="text-white/80 mt-1 font-medium">Cal Newport</p>
                </div>
             </div>
           </div>

           <div className="px-8 mt-10">
              {/* Timeline */}
              <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full cursor-pointer overflow-hidden relative group">
                 <div className="h-full bg-indigo-600" style={{ width: `${progress}%` }}></div>
                 <div className="absolute top-0 bottom-0 bg-white w-4 rounded-full shadow-md ml-[-2px] -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity" style={{ left: `${progress}%` }}></div>
              </div>
              <div className="flex justify-between mt-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                 <span>2:14:30</span>
                 <span>-4:30:30</span>
              </div>

              {/* Controls */}
              <div className="mt-10 flex items-center justify-between">
                 <button onClick={toggleSpeed} className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm font-bold text-zinc-700 dark:text-zinc-300 transition-colors">
                    {speed}x
                 </button>

                 <div className="flex items-center gap-6">
                    <button className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                        <Rewind className="w-8 h-8" />
                    </button>
                    <button 
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="w-20 h-20 flex items-center justify-center bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 hover:scale-105 transition-all"
                    >
                        {isPlaying ? <Pause className="w-10 h-10" /> : <Play className="w-10 h-10 ml-1" />}
                    </button>
                     <button className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                        <FastForward className="w-8 h-8" />
                    </button>
                 </div>

                 <button className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                    <Volume2 className="w-6 h-6" />
                 </button>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
}
