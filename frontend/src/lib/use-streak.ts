"use client";
import { useState, useEffect } from "react";

export function useStreakTracker() {
  const [streak, setStreak] = useState(0);
  const [pagesReadToday, setPagesReadToday] = useState(0);

  useEffect(() => {
    const lastReadDateStr = localStorage.getItem("bookora_last_read");
    const currentStreak = parseInt(localStorage.getItem("bookora_streak") || "0", 10);
    const pagesRead = parseInt(localStorage.getItem("bookora_pages_today") || "0", 10);
    
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (lastReadDateStr === today) {
      setStreak(currentStreak);
      setPagesReadToday(pagesRead);
    } else if (lastReadDateStr === yesterday) {
      // Streak continues
      setStreak(currentStreak + 1);
      localStorage.setItem("bookora_streak", (currentStreak + 1).toString());
      setPagesReadToday(0); 
    } else {
      // Streak broken/started
      setStreak(1);
      localStorage.setItem("bookora_streak", "1");
      setPagesReadToday(0);
    }
    
    localStorage.setItem("bookora_last_read", today);
  }, []);

  const addPageRead = () => {
    const newPages = pagesReadToday + 1;
    setPagesReadToday(newPages);
    localStorage.setItem("bookora_pages_today", newPages.toString());
  };

  return { streak, pagesReadToday, addPageRead };
}
