import { useState, useEffect, useRef } from "react";
import { useToast } from "./use-toast";
import { useStudySessions } from "./useStudySessions";

type TimerStatus = "idle" | "running" | "paused" | "completed";

export const useFocusTimer = () => {
  const [duration, setDuration] = useState<number>(25 * 60); // Default: 25 min in seconds
  const [timeLeft, setTimeLeft] = useState<number>(duration);
  const [status, setStatus] = useState<TimerStatus>("idle");
  const [coins, setCoins] = useState<number>(0);
  const intervalRef = useRef<number | null>(null);
  const { toast } = useToast();
  const { logTimerSession } = useStudySessions(); // 🔥 Auto-log study session

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (status === "idle") {
      setTimeLeft(duration);
    }
  }, [duration, status]);

  const startTimer = () => {
    if (status === "idle" || status === "paused") {
      setStatus("running");
  
      if (intervalRef.current) clearInterval(intervalRef.current);
  
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setStatus("completed");
  
            // 🔥 Fix: Prevent crashing by handling zero-time state properly
            if (prev <= 0) return 0;
  
            // 🔥 Ensure coins are earned (minimum 1)
            const earnedCoins = Math.max(1, Math.floor(duration / 10));
            setCoins((prev) => prev + earnedCoins);
  
            // 🔥 Log the session safely
            logTimerSession(duration / 60).catch((error) => {
              console.error("Failed to log session:", error);
            });
  
            // 🔥 Prevent blank screen by delaying UI update
            setTimeout(() => {
              toast({
                title: "Study Session Completed!",
                description: `You earned ${earnedCoins} coins!`,
              });
            }, 100);
  
            return 0;
          }
  
          return prev - 1;
        });
      }, 1000);
    }
  };

  const pauseTimer = () => {
    if (status === "running") {
      clearInterval(intervalRef.current!);
      setStatus("paused");
      toast({
        title: "Timer Paused",
        description: "Taking a short break is okay. Stay consistent!",
      });
    }
  };

  const resumeTimer = () => {
    if (status === "paused") {
      startTimer();
    }
  };

  const stopTimer = () => {
    clearInterval(intervalRef.current!);
    setStatus("idle");
    setTimeLeft(duration);
    toast({
      title: "Timer Stopped",
      description: "Your focus session has been reset.",
    });
  };

  const resetTimer = () => {
    stopTimer();
  };

  const updateDuration = (minutes: number) => {
    if (status === "idle") {
      const newDuration = minutes * 60;
      setDuration(newDuration);
      setTimeLeft(newDuration);
    }
  };

  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return {
    timeLeft,
    formattedTime: formatTime(timeLeft),
    status,
    coins,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    resetTimer,
    updateDuration,
  };
};
