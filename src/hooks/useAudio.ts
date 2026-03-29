"use client";
import { useRef, useEffect, useState, useCallback } from "react";

export function useAudio(src: string, loop = false, onEnded?: () => void) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const onEndedRef = useRef(onEnded);
  const durationResolved = useRef(false);
  onEndedRef.current = onEnded;

  useEffect(() => {
    const audio = new Audio(src);
    audio.loop = loop;
    audio.preload = "auto";
    audioRef.current = audio;
    durationResolved.current = false;

    // For concatenated MP3s, the metadata duration is often wrong (only the
    // first chunk's duration). Force the browser to discover the real duration
    // by briefly seeking to the end.
    function resolveDuration() {
      if (durationResolved.current) return;
      if (!isFinite(audio.duration) || audio.duration === 0) return;

      // If duration seems suspiciously short (< 30s for a chapter), try seeking to find real duration
      durationResolved.current = true;

      // Save current position
      const savedTime = audio.currentTime;
      const wasPlaying = !audio.paused;

      // Seek to a very large time — the browser clamps to actual end and recalculates duration
      audio.currentTime = 1e7;

      function onSeeked() {
        audio.removeEventListener("seeked", onSeeked);
        const realDuration = audio.duration;
        if (isFinite(realDuration) && realDuration > 0) {
          setDuration(realDuration);
        }
        // Restore position
        audio.currentTime = savedTime;
        if (wasPlaying) {
          audio.play().catch(() => {});
        }
      }
      audio.addEventListener("seeked", onSeeked);
    }

    audio.addEventListener("loadedmetadata", () => {
      setDuration(audio.duration);
      // Kick off the real duration discovery
      resolveDuration();
    });

    // Also try when enough data is buffered
    audio.addEventListener("canplaythrough", () => {
      resolveDuration();
    });

    audio.addEventListener("timeupdate", () => setCurrentTime(audio.currentTime));
    audio.addEventListener("ended", () => {
      setPlaying(false);
      onEndedRef.current?.();
    });

    // Update duration if it changes (some browsers update it as more data loads)
    audio.addEventListener("durationchange", () => {
      if (isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    });

    return () => { audio.pause(); audio.src = ""; };
  }, [src, loop]);

  const play = useCallback(() => { audioRef.current?.play().catch(() => {}); setPlaying(true); }, []);
  const pause = useCallback(() => { audioRef.current?.pause(); setPlaying(false); }, []);
  const toggle = useCallback(() => { if (playing) pause(); else play(); }, [playing, play, pause]);
  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);
  const setVolume = useCallback((vol: number) => { if (audioRef.current) audioRef.current.volume = Math.max(0, Math.min(1, vol)); }, []);
  const setSpeed = useCallback((speed: number) => { if (audioRef.current) audioRef.current.playbackRate = speed; }, []);

  return { playing, currentTime, duration, play, pause, toggle, seek, setVolume, setSpeed };
}
