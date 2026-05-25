"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AlertCircle, Loader2, Pause, Play, Volume2 } from "lucide-react";

type AudioPreviewPlayerProps = {
  audioUrl: string;
  title?: string;
  compact?: boolean;
};

const AUDIO_PLAY_EVENT = "ellbopa:audio-preview-play";

export function AudioPreviewPlayer({ audioUrl, title = "Preview", compact = false }: AudioPreviewPlayerProps) {
  const playerId = useId();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    setIsPlaying(false);
    setIsLoading(Boolean(audioUrl));
    setHasError(false);
    setCurrentTime(0);
    setDuration(0);
    audio.load();
  }, [audioUrl]);

  useEffect(() => {
    const handleOtherPlayer = (event: Event) => {
      const detail = (event as CustomEvent<{ id?: string }>).detail;
      if (detail?.id !== playerId) {
        audioRef.current?.pause();
      }
    };

    window.addEventListener(AUDIO_PLAY_EVENT, handleOtherPlayer);
    return () => window.removeEventListener(AUDIO_PLAY_EVENT, handleOtherPlayer);
  }, [playerId]);

  const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  async function togglePlayback() {
    const audio = audioRef.current;
    if (!audio || hasError) return;

    if (isPlaying) {
      audio.pause();
      return;
    }

    try {
      setIsLoading(true);
      window.dispatchEvent(new CustomEvent(AUDIO_PLAY_EVENT, { detail: { id: playerId } }));
      await audio.play();
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }

  function handleLoadedMetadata(audio: HTMLAudioElement) {
    const nextDuration = Number.isFinite(audio.duration) ? audio.duration : 0;
    setDuration(nextDuration);
    setIsLoading(false);

    if (process.env.NODE_ENV === "development" && nextDuration <= 0) {
      console.error("[audio-preview][metadata-zero-duration]", {
        audioUrl,
        readyState: audio.readyState,
        networkState: audio.networkState
      });
    }
  }

  function seekTo(value: number) {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const nextRatio = Math.min(1, Math.max(0, value / 100));
    audio.currentTime = nextRatio * duration;
    setCurrentTime(audio.currentTime);
  }

  return (
    <div className={`group rounded-xl border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,.08),rgba(255,255,255,.025))] p-3 shadow-[0_18px_45px_rgba(0,0,0,.28)] backdrop-blur-xl transition hover:border-studio-red/45 hover:shadow-[0_0_34px_rgba(229,9,20,.18)] ${compact ? "" : "sm:p-4"}`}>
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
        onLoadStart={() => {
          setIsLoading(true);
          setHasError(false);
        }}
        onCanPlay={() => setIsLoading(false)}
        onLoadedMetadata={(event) => handleLoadedMetadata(event.currentTarget)}
        onDurationChange={(event) => handleLoadedMetadata(event.currentTarget)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
        onError={(event) => {
          if (process.env.NODE_ENV === "development") {
            const audio = event.currentTarget;
            console.error("[audio-preview][error]", {
              audioUrl,
              readyState: audio.readyState,
              networkState: audio.networkState,
              errorCode: audio.error?.code,
              errorMessage: audio.error?.message
            });
          }
          setHasError(true);
          setIsLoading(false);
          setIsPlaying(false);
        }}
      />

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={togglePlayback}
          disabled={hasError}
          aria-label={isPlaying ? `Pausar ${title}` : `Reproducir ${title}`}
          className="grid size-11 shrink-0 place-items-center rounded-full bg-studio-red text-white shadow-glow transition hover:scale-105 hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/35"
        >
          {hasError ? <AlertCircle className="h-5 w-5" /> : isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : isPlaying ? <Pause className="h-5 w-5 fill-white" /> : <Play className="ml-0.5 h-5 w-5 fill-white" />}
        </button>

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="truncate text-xs font-black uppercase tracking-[0.14em] text-white/70">{hasError ? "Preview no disponible" : title}</p>
            <div className="flex shrink-0 items-center gap-2 text-[11px] font-bold text-white/42">
              <Volume2 className="h-3.5 w-3.5 text-studio-gold" />
              <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
            </div>
          </div>

          <div className="relative h-3 w-full overflow-hidden rounded-full bg-white/10">
            <span className="pointer-events-none absolute inset-y-0 left-0 rounded-full bg-[linear-gradient(90deg,#e50914,#d9a441)] shadow-[0_0_18px_rgba(229,9,20,.45)] transition-[width]" style={{ width: `${progress}%` }} />
            <span className="pointer-events-none absolute inset-0 opacity-45 [background-image:repeating-linear-gradient(90deg,transparent_0,transparent_7px,rgba(255,255,255,.45)_8px,transparent_10px)]" />
            <input
              type="range"
              min={0}
              max={100}
              step={0.1}
              value={progress}
              disabled={hasError || !duration}
              onChange={(event) => seekTo(Number(event.target.value))}
              aria-label={`Buscar en ${title}`}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function formatTime(value: number) {
  if (!Number.isFinite(value) || value <= 0) return "0:00";
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}
