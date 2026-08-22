import React, { useEffect, useRef, useState } from "react";
import { Heart, Shuffle, SkipBack, SkipForward, Repeat, Play, Pause, Volume2, Volume1, VolumeX } from "lucide-react";

const TRACK = {
  title: "Not Just a Profile",
  artist: "Parth Mahato",
  src: "/audio/not-just-a-profile.mp3",
};

const formatTime = (seconds) => {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export default function MinimalMusicPlayer({ isVisible = true }) {
  const audioRef = useRef(null);
  const progressRef = useRef(null);
  const audioCtxRef = useRef(null);
  const gainNodeRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [volumeGain, setVolumeGain] = useState(1.8); // 180% volume amplification (loud & clear)
  const [isMuted, setIsMuted] = useState(false);
  const [showVolumeControl, setShowVolumeControl] = useState(false);

  // Initialize Web Audio Gain booster on user play
  const setupAudioGain = () => {
    try {
      if (!audioCtxRef.current && audioRef.current) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          const ctx = new AudioContextClass();
          const source = ctx.createMediaElementSource(audioRef.current);
          const gainNode = ctx.createGain();
          gainNode.gain.setValueAtTime(isMuted ? 0 : volumeGain, ctx.currentTime);
          source.connect(gainNode);
          gainNode.connect(ctx.destination);
          audioCtxRef.current = ctx;
          gainNodeRef.current = gainNode;
        }
      }
      if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume();
      }
    } catch (e) {
      console.log("Web Audio booster active:", e);
    }
  };

  // Sync volume gain
  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      const effectiveGain = isMuted ? 0 : volumeGain;
      gainNodeRef.current.gain.setValueAtTime(effectiveGain, audioCtxRef.current.currentTime);
    }
  }, [volumeGain, isMuted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 1.0;

    const handleLoadedMetadata = () => {
      if (audio.duration && Number.isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleTimeUpdate = () => {
      if (!isDragging) {
        setCurrentTime(audio.currentTime);
      }
    };

    const handleEnded = () => {
      if (isRepeat) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        setIsPlaying(false);
        setCurrentTime(0);
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
    };
  }, [isRepeat, isDragging]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    setupAudioGain();

    if (audio.paused) {
      try {
        audio.volume = 1.0;
        await audio.play();
        setIsPlaying(true);
      } catch (err) {
        console.error("Audio playback error:", err);
      }
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const handlePrevious = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    setCurrentTime(0);
  };

  const handleNext = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    setCurrentTime(0);
    if (!audio.paused) {
      audio.play().catch(() => {});
    }
  };

  const seekTo = (clientX) => {
    const progress = progressRef.current;
    const audio = audioRef.current;
    if (!progress || !audio || !duration) return;
    const rect = progress.getBoundingClientRect();
    const percentage = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
    const newTime = percentage * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleSeekStart = (clientX) => {
    setIsDragging(true);
    seekTo(clientX);
  };

  const handleSeekMove = (clientX) => {
    if (!isDragging) return;
    seekTo(clientX);
  };

  const handleSeekEnd = (clientX) => {
    if (!isDragging) return;
    setIsDragging(false);
    seekTo(clientX);
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <section
      id="audio"
      className={`reveal py-20 border-t ${isVisible ? "is-visible" : ""}`}
      style={{ borderColor: "var(--portfolio-line, #E2E1DB)" }}
    >
      <div
        className="font-mono text-xs tracking-widest mb-10"
        style={{ color: "#2E2FA6" }}
      >
        01 — AUDIO
      </div>

      <div className="w-full flex justify-center">
        {/* Minimalist Card matching the reference design */}
        <div
          className="w-full max-w-[540px] bg-[#F5F3F5] text-[#171717] px-8 py-10 sm:px-12 sm:py-12 rounded-[2px] relative"
          style={{
            boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
            fontFamily: "Georgia, 'Instrument Serif', 'Times New Roman', serif",
          }}
        >
          <audio
            ref={audioRef}
            src={TRACK.src}
            preload="auto"
            crossOrigin="anonymous"
            onError={(e) => console.error("Audio error:", e)}
          />

          {/* Top Row: Track & Artist Name + Volume & Heart */}
          <div className="flex items-start justify-between gap-6">
            <div>
              <h2 className="text-[24px] sm:text-[26px] font-normal leading-tight tracking-[0.04em] text-[#171717]">
                {TRACK.title}
              </h2>
              <p className="mt-1.5 text-[18px] sm:text-[20px] font-normal text-[#171717]/85 leading-tight">
                {TRACK.artist}
              </p>
            </div>

            <div className="flex items-center gap-3 mt-1">
              {/* Volume Booster Icon */}
              <div className="relative">
                <button
                  type="button"
                  aria-label="Volume boost control"
                  onClick={() => setShowVolumeControl((v) => !v)}
                  className="text-[#171717]/80 hover:text-[#171717] transition-transform hover:scale-110 p-1"
                  title={`Volume: ${Math.round(volumeGain * 100)}%`}
                >
                  {isMuted ? (
                    <VolumeX size={22} strokeWidth={1.8} />
                  ) : volumeGain > 1.2 ? (
                    <Volume2 size={22} strokeWidth={1.8} />
                  ) : (
                    <Volume1 size={22} strokeWidth={1.8} />
                  )}
                </button>

                {/* Minimalist Popover Slider for Volume Boost */}
                {showVolumeControl && (
                  <div className="absolute right-0 top-9 bg-[#171717] text-white p-3 rounded-xl shadow-xl z-20 flex items-center gap-3 w-44 font-sans text-xs">
                    <input
                      type="range"
                      min="0"
                      max="2.5"
                      step="0.05"
                      value={isMuted ? 0 : volumeGain}
                      onChange={(e) => {
                        setVolumeGain(parseFloat(e.target.value));
                        setIsMuted(false);
                        setupAudioGain();
                      }}
                      className="w-24 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
                    />
                    <span className="font-mono text-[11px] min-w-[34px]">
                      {Math.round(volumeGain * 100)}%
                    </span>
                  </div>
                )}
              </div>

              {/* Heart */}
              <button
                type="button"
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                onClick={() => setIsFavorite((v) => !v)}
                className="shrink-0 transition-transform duration-150 hover:scale-110 active:scale-90 text-[#171717]"
              >
                <Heart
                  size={26}
                  strokeWidth={1.8}
                  fill={isFavorite ? "#171717" : "none"}
                />
              </button>
            </div>
          </div>

          {/* Slider Progress Bar */}
          <div className="mt-10">
            <div
              ref={progressRef}
              role="slider"
              tabIndex={0}
              aria-label="Audio progress"
              aria-valuemin={0}
              aria-valuemax={duration || 0}
              aria-valuenow={currentTime}
              onClick={(e) => seekTo(e.clientX)}
              onMouseDown={(e) => handleSeekStart(e.clientX)}
              onMouseMove={(e) => handleSeekMove(e.clientX)}
              onMouseUp={(e) => handleSeekEnd(e.clientX)}
              onTouchStart={(e) => e.touches[0] && handleSeekStart(e.touches[0].clientX)}
              onTouchMove={(e) => e.touches[0] && handleSeekMove(e.touches[0].clientX)}
              onTouchEnd={(e) => e.changedTouches[0] && handleSeekEnd(e.changedTouches[0].clientX)}
              className="group relative h-8 cursor-pointer flex items-center select-none touch-none"
            >
              {/* Background Track Rail */}
              <div className="absolute left-0 right-0 h-[2.5px] bg-[#D4D2D4]" />

              {/* Active Progress Track */}
              <div
                className="absolute left-0 h-[2.5px] bg-[#171717]"
                style={{ width: `${progressPercentage}%` }}
              />

              {/* Clean Thumb Dot */}
              <div
                className="absolute h-[18px] w-[18px] rounded-full bg-[#171717] transition-transform duration-75 group-hover:scale-110"
                style={{ left: `calc(${progressPercentage}% - 9px)` }}
              />
            </div>

            {/* Timestamps */}
            <div className="flex justify-between items-center text-[16px] text-[#171717] mt-0.5">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls Row */}
          <div className="mt-8 flex items-center justify-between px-2 sm:px-4">
            {/* Shuffle */}
            <button
              type="button"
              aria-label="Shuffle"
              onClick={() => setIsShuffle((v) => !v)}
              className={`transition-all duration-150 hover:scale-110 active:scale-90 ${
                isShuffle ? "opacity-100 text-[#171717]" : "opacity-40 hover:opacity-80"
              }`}
            >
              <Shuffle size={24} strokeWidth={1.8} />
            </button>

            {/* Previous */}
            <button
              type="button"
              aria-label="Previous"
              onClick={handlePrevious}
              className="transition-transform duration-150 hover:scale-110 active:scale-90 text-[#171717]"
            >
              <SkipBack size={28} strokeWidth={0} fill="currentColor" />
            </button>

            {/* Main Play / Pause Circle */}
            <button
              type="button"
              aria-label={isPlaying ? "Pause" : "Play"}
              onClick={togglePlay}
              className="flex h-[76px] w-[76px] items-center justify-center rounded-full bg-[#171717] text-white transition-transform duration-150 hover:scale-105 active:scale-95 shadow-md"
            >
              {isPlaying ? (
                <Pause size={30} strokeWidth={0} fill="currentColor" />
              ) : (
                <Play size={32} strokeWidth={0} fill="currentColor" className="translate-x-[2px]" />
              )}
            </button>

            {/* Next */}
            <button
              type="button"
              aria-label="Next"
              onClick={handleNext}
              className="transition-transform duration-150 hover:scale-110 active:scale-90 text-[#171717]"
            >
              <SkipForward size={28} strokeWidth={0} fill="currentColor" />
            </button>

            {/* Repeat */}
            <button
              type="button"
              aria-label="Repeat"
              onClick={() => setIsRepeat((v) => !v)}
              className={`transition-all duration-150 hover:scale-110 active:scale-90 ${
                isRepeat ? "opacity-100 text-[#171717]" : "opacity-40 hover:opacity-80"
              }`}
            >
              <Repeat size={24} strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
