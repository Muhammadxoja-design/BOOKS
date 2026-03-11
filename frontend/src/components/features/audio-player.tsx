"use client";

import { useEffect, useRef, useState } from "react";
import { FastForward, PlayCircle } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Book } from "@/lib/types";
import { formatDuration } from "@/lib/utils";
import { Surface } from "@/components/ui/surface";

const speeds = [1, 1.5, 2];

export function AudioPlayer({
  book,
  token,
}: {
  book: Book;
  token?: string;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastSavedRef = useRef(0);
  const [rate, setRate] = useState(1);
  const [position, setPosition] = useState(book.progress?.currentTime ?? 0);

  useEffect(() => {
    if (audioRef.current && book.progress?.currentTime) {
      audioRef.current.currentTime = book.progress.currentTime;
      setPosition(book.progress.currentTime);
    }
  }, [book.progress?.currentTime]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  }, [rate]);

  const syncProgress = async (currentTime: number, finished = false) => {
    if (!token) {
      return;
    }

    const duration = book.audioDuration ?? audioRef.current?.duration ?? 0;
    const percentage = duration > 0 ? (currentTime / duration) * 100 : 0;

    if (!finished && Math.abs(currentTime - lastSavedRef.current) < 15) {
      return;
    }

    lastSavedRef.current = currentTime;
    await apiFetch("/progress", {
      method: "PUT",
      token,
      body: {
        bookId: book.id,
        currentTime: Math.round(currentTime),
        percentage: finished ? 100 : Number(percentage.toFixed(2)),
      },
    }).catch(() => undefined);
  };

  return (
    <Surface className="space-y-5 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--muted-foreground)]">
            Immersive audio player
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-[color:var(--foreground)]">
            Variable-speed playback and synced progress
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {speeds.map((speed) => (
            <button
              key={speed}
              type="button"
              onClick={() => setRate(speed)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                rate === speed
                  ? "bg-[color:var(--foreground)] text-[color:var(--bg)]"
                  : "bg-[color:var(--muted)] text-[color:var(--foreground)]"
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>

      <audio
        ref={audioRef}
        controls
        preload="metadata"
        src={book.audioUrl ?? book.sampleAudioUrl ?? ""}
        className="w-full"
        onTimeUpdate={(event) => {
          const currentTime = Math.round(event.currentTarget.currentTime);
          setPosition(currentTime);
          void syncProgress(currentTime);
        }}
        onEnded={() => {
          void syncProgress(book.audioDuration ?? position, true);
        }}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[22px] bg-[color:var(--bg)] p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted-foreground)]">
            Current position
          </p>
          <p className="mt-3 text-2xl font-semibold text-[color:var(--foreground)]">
            {formatDuration(position)}
          </p>
        </div>
        <div className="rounded-[22px] bg-[color:var(--bg)] p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted-foreground)]">
            Total runtime
          </p>
          <p className="mt-3 text-2xl font-semibold text-[color:var(--foreground)]">
            {formatDuration(book.audioDuration)}
          </p>
        </div>
        <div className="rounded-[22px] bg-[color:var(--bg)] p-4">
          <div className="flex items-center gap-2 text-[color:var(--accent)]">
            <PlayCircle className="h-5 w-5" />
            <FastForward className="h-5 w-5" />
          </div>
          <p className="mt-3 text-sm text-[color:var(--muted-foreground)]">
            Progress is synced quietly in the background while the user listens.
          </p>
        </div>
      </div>
    </Surface>
  );
}
