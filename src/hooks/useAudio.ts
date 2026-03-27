"use client";
import { useRef, useEffect, useState, useCallback } from "react";

export function useAudio(src: string, loop = false) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = new Audio(src);
    audio.loop = loop;
    audio.preload = "metadata";
    audioRef.current = audio;
    audio.addEventListener("loadedmetadata", () => setDuration(audio.duration));
    audio.addEventListener("timeupdate", () => setCurrentTime(audio.currentTime));
    audio.addEventListener("ended", () => setPlaying(false));
    return () => { audio.pause(); audio.src = ""; };
  }, [src, loop]);

  const play = useCallback(() => { audioRef.current?.play(); setPlaying(true); }, []);
  const pause = useCallback(() => { audioRef.current?.pause(); setPlaying(false); }, []);
  const toggle = useCallback(() => { if (playing) pause(); else play(); }, [playing, play, pause]);
  const seek = useCallback((time: number) => { if (audioRef.current) { audioRef.current.currentTime = time; setCurrentTime(time); } }, []);
  const setVolume = useCallback((vol: number) => { if (audioRef.current) audioRef.current.volume = Math.max(0, Math.min(1, vol)); }, []);
  const setSpeed = useCallback((speed: number) => { if (audioRef.current) audioRef.current.playbackRate = speed; }, []);

  return { playing, currentTime, duration, play, pause, toggle, seek, setVolume, setSpeed };
}
