import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import confetti from "canvas-confetti";
import {
  Heart,
  Sparkles,
  Gift,
  ChevronDown,
  Mail,
  MailOpen,
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Music,
  SkipForward,
} from "lucide-react";
import { birthdayConfig } from "@/lib/birthday-config";
import { Petals, Stars } from "@/components/Petals";
import petalsBg from "@/assets/petals-bg.jpg";
import parchment from "@/assets/parchment.jpg";
import starsBg from "@/assets/stars-bg.jpg";
import envelope from "@/assets/envelope.png";
import cake from "@/assets/cake.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `Happy Birthday, ${birthdayConfig.herName} 💗` },
      { name: "description", content: "A little world I built just for you." },
      { property: "og:title", content: `A Little World For ${birthdayConfig.herName}` },
      { property: "og:description", content: "A handcrafted birthday journey, made with love." },
    ],
  }),
  component: BirthdayPage,
});

function BirthdayPage() {
  const [opened, setOpened] = useState(false);
  const [readLetters, setReadLetters] = useState<number[]>([]);
  const bgAudioRef = useRef<HTMLAudioElement>(null);
  const cassetteAudioRef = useRef<HTMLAudioElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentBgSongIndex, setCurrentBgSongIndex] = useState(0);
  const [currentCassetteIndex, setCurrentCassetteIndex] = useState(0);
  const [isPlayingCassette, setIsPlayingCassette] = useState(false);
  const [activeSection, setActiveSection] = useState("welcome");
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [deferredMounted, setDeferredMounted] = useState(false);

  useEffect(() => {
    if (opened) {
      const timer = setTimeout(() => {
        setDeferredMounted(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [opened]);

  // Centralized Audio coordinator
  useEffect(() => {
    if (!bgAudioRef.current || !cassetteAudioRef.current) return;

    bgAudioRef.current.muted = isMuted;
    cassetteAudioRef.current.muted = isMuted;

    if (!isPlaying || isVideoPlaying) {
      bgAudioRef.current.pause();
      cassetteAudioRef.current.pause();
    } else {
      if (activeSection === "soundtrack") {
        bgAudioRef.current.pause();
        if (isPlayingCassette) {
          cassetteAudioRef.current
            .play()
            .catch((err) => console.log("Cassette audio play blocked:", err));
        } else {
          cassetteAudioRef.current.pause();
        }
      } else {
        cassetteAudioRef.current.pause();
        bgAudioRef.current
          .play()
          .catch((err) => console.log("Background audio play blocked:", err));
      }
    }
  }, [isPlaying, isMuted, activeSection, isPlayingCassette, isVideoPlaying]);

  const togglePlay = () => {
    const nextPlaying = !isPlaying;
    setIsPlaying(nextPlaying);
    if (nextPlaying) {
      if (activeSection === "soundtrack") {
        if (isPlayingCassette && cassetteAudioRef.current) {
          cassetteAudioRef.current
            .play()
            .catch((err) => console.log("Cassette play blocked on toggle:", err));
        }
      } else {
        if (bgAudioRef.current) {
          bgAudioRef.current.play().catch((err) => console.log("BG play blocked on toggle:", err));
        }
      }
    } else {
      if (bgAudioRef.current) bgAudioRef.current.pause();
      if (cassetteAudioRef.current) cassetteAudioRef.current.pause();
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleOpen = () => {
    setOpened(true);
    setIsPlaying(true);
    if (bgAudioRef.current) {
      bgAudioRef.current.play().catch((err) => console.log("Audio play blocked by browser:", err));
    }
  };

  const handleNextTrack = () => {
    if (activeSection === "soundtrack") {
      const nextIdx = (currentCassetteIndex + 1) % birthdayConfig.music.cassetteSongs.length;
      setCurrentCassetteIndex(nextIdx);
      setIsPlayingCassette(true);
      setIsPlaying(true);
      if (cassetteAudioRef.current) {
        cassetteAudioRef.current.src = birthdayConfig.music.cassetteSongs[nextIdx].url;
        cassetteAudioRef.current
          .play()
          .catch((err) => console.log("Next cassette play blocked:", err));
      }
    } else {
      const nextIdx = (currentBgSongIndex + 1) % birthdayConfig.music.pageSongs.length;
      setCurrentBgSongIndex(nextIdx);
      setIsPlaying(true);
      if (bgAudioRef.current) {
        bgAudioRef.current.src = birthdayConfig.music.pageSongs[nextIdx].url;
        bgAudioRef.current.play().catch((err) => console.log("Next bg song play blocked:", err));
      }
    }
  };

  const handleBgEnded = () => {
    const nextIdx = (currentBgSongIndex + 1) % birthdayConfig.music.pageSongs.length;
    setCurrentBgSongIndex(nextIdx);
    if (bgAudioRef.current) {
      bgAudioRef.current.src = birthdayConfig.music.pageSongs[nextIdx].url;
      bgAudioRef.current.play().catch((err) => console.log("Bg ended play blocked:", err));
    }
  };

  const handleCassetteEnded = () => {
    const nextIdx = (currentCassetteIndex + 1) % birthdayConfig.music.cassetteSongs.length;
    setCurrentCassetteIndex(nextIdx);
    if (cassetteAudioRef.current) {
      cassetteAudioRef.current.src = birthdayConfig.music.cassetteSongs[nextIdx].url;
      cassetteAudioRef.current
        .play()
        .catch((err) => console.log("Cassette ended play blocked:", err));
    }
  };

  const handleReadLetter = (index: number) => {
    if (!readLetters.includes(index)) {
      setReadLetters((prev) => {
        const next = [...prev, index];
        if (next.length === birthdayConfig.secretLetters.length) {
          confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 },
            colors: ["#F2A7BB", "#E8C87A", "#C47AA3", "#FFD6E0"],
          });
        }
        return next;
      });
    }
  };

  const allRead = readLetters.length === birthdayConfig.secretLetters.length;

  useEffect(() => {
    if (!opened) return;

    const sceneIds = [
      "welcome",
      "letter",
      "effort",
      "timeline",
      "archive",
      "soundtrack",
      "gift",
      "promise",
      "finale",
      "gallery",
    ];
    const sceneToSongMap: Record<string, number> = {
      welcome: 0,
      letter: 1,
      effort: 2,
      timeline: 3,
      archive: 4,
      soundtrack: 1,
      gift: 0,
      promise: 0,
      finale: 5,
      gallery: 3,
    };

    let observer: IntersectionObserver | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const setupObserver = () => {
      const welcomeEl = document.getElementById("welcome");
      if (!welcomeEl) {
        timer = setTimeout(setupObserver, 100);
        return;
      }

      const callback = (entries: IntersectionObserverEntry[]) => {
        const visibleEntries = entries.filter((e) => e.isIntersecting);
        if (visibleEntries.length > 0) {
          const mainEntry = visibleEntries.reduce((max, entry) =>
            entry.intersectionRect.height > max.intersectionRect.height ? entry : max
            , visibleEntries[0]);

          const sceneId = mainEntry.target.id;
          setActiveSection(sceneId);

          const songIdx = sceneToSongMap[sceneId];
          if (songIdx !== undefined && sceneId !== "soundtrack") {
            setCurrentBgSongIndex((prev) => {
              if (prev !== songIdx) {
                if (bgAudioRef.current) {
                  const wasPlaying = !bgAudioRef.current.paused;
                  bgAudioRef.current.src = birthdayConfig.music.pageSongs[songIdx].url;
                  if (wasPlaying) {
                    bgAudioRef.current.play().catch((err) => console.log("Background audio play blocked on scroll:", err));
                  }
                }
                return songIdx;
              }
              return prev;
            });
          }
        }
      };

      const observerOptions = {
        root: null,
        rootMargin: "-25% 0px -25% 0px",
        threshold: 0.01,
      };

      observer = new IntersectionObserver(callback, observerOptions);

      sceneIds.forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
          observer?.observe(el);
        }
      });
    };

    timer = setTimeout(setupObserver, 200);

    return () => {
      clearTimeout(timer);
      if (observer) {
        observer.disconnect();
      }
    };
  }, [opened, allRead, deferredMounted]);

  // Determine current active playing track title for floating widget
  const getActiveTrackTitle = () => {
    if (!isPlaying) return "Paused";
    if (activeSection === "soundtrack") {
      return isPlayingCassette
        ? birthdayConfig.music.cassetteSongs[currentCassetteIndex].title
        : "Silent (Choose Cassette)";
    }
    return birthdayConfig.music.pageSongs[currentBgSongIndex].title;
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <audio
        ref={bgAudioRef}
        src={birthdayConfig.music.pageSongs[currentBgSongIndex].url}
        onEnded={handleBgEnded}
        style={{ display: "none" }}
      />
      <audio
        ref={cassetteAudioRef}
        src={birthdayConfig.music.cassetteSongs[currentCassetteIndex].url}
        onEnded={handleCassetteEnded}
        style={{ display: "none" }}
      />
      <AnimatePresence mode="wait">
        {!opened ? (
          <SceneLanding key="landing" onOpen={handleOpen} />
        ) : (
          <motion.div
            key="journey"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2 }}
          >
            <SceneWelcome />
            {deferredMounted && (
              <>
                <SceneLetter />
                <SceneEffort />
                <SceneTimeline />
                <SceneUnspokenArchive readLetters={readLetters} onRead={handleReadLetter} />

                {allRead && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                  >
                    <SceneSoundtrack
                      isPlayingCassette={isPlayingCassette}
                      togglePlayCassette={() => {
                        const nextPlaying = !isPlayingCassette;
                        setIsPlayingCassette(nextPlaying);
                        setIsPlaying(true);
                        if (cassetteAudioRef.current) {
                          if (nextPlaying) {
                            cassetteAudioRef.current
                              .play()
                              .catch((err) => console.log("Cassette play blocked on toggle:", err));
                          } else {
                            cassetteAudioRef.current.pause();
                          }
                        }
                      }}
                      isMuted={isMuted}
                      toggleMute={toggleMute}
                      currentCassetteIndex={currentCassetteIndex}
                      onSelectCassette={(idx) => {
                        setCurrentCassetteIndex(idx);
                        setIsPlayingCassette(true);
                        setIsPlaying(true);
                        if (cassetteAudioRef.current) {
                          cassetteAudioRef.current.src = birthdayConfig.music.cassetteSongs[idx].url;
                          cassetteAudioRef.current
                            .play()
                            .catch((err) => console.log("Cassette play blocked on select:", err));
                        }
                      }}
                    />
                    <SceneGift />
                    <SceneNote />
                    <SceneFinale />
                    <SceneGallery onVideoPlayStateChange={setIsVideoPlaying} />
                  </motion.div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Global Audio Player Widget */}
      {opened && (
        <div
          className="fixed bottom-5 right-5 z-40 flex items-center gap-3 rounded-full border border-[color:var(--gold)]/30 bg-[color:var(--ivory)]/15 p-2 px-4 backdrop-blur shadow-lg cursor-pointer transition-all duration-300 hover:scale-105 hover:bg-[color:var(--ivory)]/25"
          onClick={togglePlay}
        >
          <div
            className={`flex items-center text-[color:var(--rose)] ${isPlaying && (activeSection !== "soundtrack" || isPlayingCassette) ? "spinning" : ""}`}
          >
            <Music className="h-4 w-4" />
          </div>
          <span className="text-[10px] tracking-wider uppercase font-semibold text-[color:var(--mauve)] max-w-[120px] truncate">
            {getActiveTrackTitle()}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNextTrack();
            }}
            className="border-none bg-transparent text-[color:var(--rose)]/80 hover:text-[color:var(--rose)] cursor-pointer p-0 ml-1 flex items-center"
            title="Next Track"
          >
            <SkipForward className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleMute();
            }}
            className="border-none bg-transparent text-[color:var(--rose)]/80 hover:text-[color:var(--rose)] cursor-pointer p-0 ml-1 flex items-center"
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
        </div>
      )}
    </main>
  );
}

/* ===================== Scene 1: Landing ===================== */
function SceneLanding({ onOpen }: { onOpen: () => void }) {
  const [busting, setBusting] = useState(false);

  const handleOpen = () => {
    setBusting(true);
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.55 },
      colors: ["#F2A7BB", "#E8C87A", "#C47AA3", "#FFD6E0"],
      scalar: 1.1,
    });
    setTimeout(onOpen, 1400);
  };

  return (
    <motion.section
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.9 }}
      className="relative flex min-h-screen items-center justify-center overflow-hidden text-center"
      style={{
        background:
          "radial-gradient(circle at 50% 40%, oklch(0.35 0.08 350) 0%, oklch(0.18 0.05 340) 60%, oklch(0.12 0.03 340) 100%)",
      }}
    >
      <Stars count={90} />
      <Petals count={14} />

      <div className="relative z-10 mx-auto max-w-2xl px-6">
        <motion.p
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="font-hand text-2xl text-[color:var(--gold)]"
        >
          Please wear headphones for better experience
        </motion.p>

        <motion.div
          animate={
            busting
              ? { scale: [1, 1.15, 0], rotate: [0, -8, 12], opacity: [1, 1, 0] }
              : { y: [0, -10, 0] }
          }
          transition={
            busting ? { duration: 1.2 } : { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }
          className="mx-auto mt-6 w-[260px] md:w-[340px]"
          style={{ filter: "drop-shadow(0 20px 40px rgba(232,200,122,.35))" }}
        >
          <img src={envelope} alt="Sealed love letter envelope" width={768} height={768} />
        </motion.div>

        <motion.h1
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9, duration: 1 }}
          className="font-script mt-6 text-5xl text-[color:var(--ivory)] md:text-7xl"
        >
          I made something just for you
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="mx-auto mt-4 max-w-md font-serif-soft text-lg italic text-[color:var(--blush)]"
        >
          A little world. A few scenes. A lot of love.
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.8 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleOpen}
          className="btn-romance mt-10"
        >
          <Heart className="h-5 w-5 fill-current" />
          Open it, Sri
        </motion.button>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6, y: [0, 8, 0] }}
          transition={{ delay: 2.5, duration: 2.4, repeat: Infinity }}
          className="mt-12 text-[color:var(--ivory)]/60"
        >
          <ChevronDown className="mx-auto h-6 w-6" />
        </motion.div>
      </div>
    </motion.section>
  );
}

/* ===================== Scene 2: Welcome ===================== */
function SceneWelcome() {
  const name = birthdayConfig.herName;
  return (
    <section
      id="welcome"
      className="relative flex min-h-screen items-center justify-center overflow-hidden text-center"
      style={{
        background: "linear-gradient(180deg, oklch(0.95 0.04 10) 0%, oklch(0.92 0.06 350) 100%)",
      }}
    >
      <Stars count={50} />
      <div className="relative z-10 px-6">
        <p className="font-hand text-2xl text-[color:var(--mauve)]">It's your day, Sri</p>
        <h2 className="mt-4 font-display text-6xl leading-none md:text-9xl">
          <span className="shimmer-text">Happy Birthday</span>
        </h2>
        <div className="mt-16 flex flex-wrap justify-center gap-2 font-script text-6xl text-[color:var(--mauve)] md:text-8xl">
          {name.split("").map((c, i) => (
            <motion.span
              key={i}
              initial={{ y: 40, opacity: 0, rotate: -10 }}
              whileInView={{ y: 0, opacity: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * i, type: "spring", stiffness: 120 }}
            >
              {c === " " ? "\u00A0" : c}
            </motion.span>
          ))}
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1.2, duration: 1 }}
          className="mx-auto mt-8 max-w-xl font-serif-soft text-xl italic text-[color:var(--mauve)]/80"
        >
          Today is about you. I've been waiting to show you this.
        </motion.p>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mt-16 text-[color:var(--mauve)]/60"
        >
          <ChevronDown className="mx-auto h-6 w-6" /> scroll, beautiful
        </motion.div>
      </div>
    </section>
  );
}

/* ===================== Scene 3: Love Letter ===================== */
function SceneLetter() {
  return (
    <section
      id="letter"
      className="relative overflow-hidden py-32"
      style={{ background: "var(--ivory)" }}
    >
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url(${petalsBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          mixBlendMode: "multiply",
        }}
      />
      <div className="relative z-10 mx-auto max-w-3xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="text-center"
        >
          <p className="font-hand text-2xl text-[color:var(--rose)]">A letter for you</p>
          <h3 className="mt-2 font-display text-5xl text-[color:var(--mauve)] md:text-6xl">
            What you mean to me
          </h3>
          <div className="gold-divider mx-auto mt-6 w-32" />
        </motion.div>

        <motion.article
          initial={{ opacity: 0, rotateX: -8 }}
          whileInView={{ opacity: 1, rotateX: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2 }}
          className="paper-texture relative mt-16 rounded-sm p-10 md:p-16"
          style={{
            backgroundImage: `url(${parchment})`,
            backgroundSize: "cover",
            boxShadow:
              "0 30px 60px -20px rgba(196, 122, 163, .35), inset 0 0 80px rgba(232,200,122,.15)",
          }}
        >
          {birthdayConfig.loveLetter.map((p, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.9, delay: i * 0.15 }}
              className="mb-6 font-serif-soft text-xl leading-relaxed text-[color:var(--foreground)] md:text-2xl"
            >
              {p}
            </motion.p>
          ))}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 1, duration: 1 }}
            className="mt-10 text-right font-script text-4xl text-[color:var(--mauve)]"
          >
            — Ajay
          </motion.p>
        </motion.article>
      </div>
    </section>
  );
}

const startDate = new Date(birthdayConfig.meetingDate);

function SceneEffort() {
  const containerRef = useRef<HTMLDivElement>(null);

  const [animatedDiffMs, setAnimatedDiffMs] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const [liveNow, setLiveNow] = useState(new Date());

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !hasStarted) {
            setHasStarted(true);
          }
        });
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;

    const duration = 2500; // 2.5 seconds
    const startTime = performance.now();

    const tick = (nowTime: number) => {
      const elapsed = nowTime - startTime;
      const progress = Math.min(1, elapsed / duration);

      const easeOut = 1 - Math.pow(1 - progress, 4);

      const currentRealDiffMs = new Date().getTime() - startDate.getTime();
      const currentDiff = easeOut * currentRealDiffMs;
      setAnimatedDiffMs(currentDiff);

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        setIsAnimating(false);
      }
    };

    requestAnimationFrame(tick);
  }, [hasStarted]);

  useEffect(() => {
    if (isAnimating) return;

    const timer = setInterval(() => {
      setLiveNow(new Date());
    }, 100);
    return () => clearInterval(timer);
  }, [isAnimating]);

  const diffMs = isAnimating ? animatedDiffMs : liveNow.getTime() - startDate.getTime();

  // Cumulative values
  const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
  const totalMinutes = Math.max(0, Math.floor(diffMs / (1000 * 60)));
  const totalHours = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
  const totalDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

  // Detailed difference for Years, Months, Days
  const getDetailedDifference = (start: Date, end: Date) => {
    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();

    if (days < 0) {
      const previousMonth = new Date(end.getFullYear(), end.getMonth(), 0);
      days += previousMonth.getDate();
      months -= 1;
    }

    if (months < 0) {
      months += 12;
      years -= 1;
    }

    const totalMonths = Math.max(0, years * 12 + months);
    const decimalYears = Math.max(0, totalDays / 365.25).toFixed(2);

    return {
      years: Math.max(0, years),
      months: Math.max(0, months),
      days: Math.max(0, days),
      totalMonths,
      decimalYears,
    };
  };

  const currentDate = isAnimating ? new Date(startDate.getTime() + diffMs) : liveNow;
  const {
    years,
    months,
    days: remainingDays,
    totalMonths,
    decimalYears,
  } = getDetailedDifference(startDate, currentDate);

  const formatDate = (date: Date) => {
    const day = date.getDate();
    const monthsNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return `${day} ${monthsNames[date.getMonth()]} ${date.getFullYear()}`;
  };

  const formattedStart = formatDate(startDate);
  const formattedNow = formatDate(currentDate);

  const millionSecs = Math.floor(totalSeconds / 1000000);

  return (
    <section
      id="effort"
      ref={containerRef}
      className="relative overflow-hidden py-32 text-center"
      style={{
        background: "linear-gradient(180deg, oklch(0.2 0.05 340) 0%, oklch(0.28 0.08 350) 100%)",
      }}
    >
      <Stars count={70} />
      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <p className="font-hand text-2xl text-[color:var(--gold)]">Our Journey</p>
        <h3 className="mt-2 font-display text-5xl text-[color:var(--ivory)] md:text-6xl">
          Every second <em className="shimmer-text not-italic">since we met</em>
        </h3>
        <p className="mt-4 font-serif-soft text-lg text-[color:var(--blush)]/80">
          From {formattedStart} &rarr; {formattedNow} (today):
        </p>
        <div className="gold-divider mx-auto mt-6 w-32" />

        {/* Cumulative Counters Grid */}
        <div className="mt-16 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {[
            { label: "Days", value: totalDays.toLocaleString() },
            { label: "Hours", value: totalHours.toLocaleString() },
            { label: "Minutes", value: totalMinutes.toLocaleString() },
            { label: "Seconds", value: totalSeconds.toLocaleString(), isTicking: true },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ rotateY: 90, opacity: 0 }}
              whileInView={{ rotateY: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.1 }}
              className="rounded-2xl border border-[color:var(--gold)]/30 bg-[color:var(--ivory)]/5 p-4 sm:p-6 backdrop-blur flex flex-col justify-center min-h-[140px]"
            >
              <div
                className={`font-display text-[color:var(--gold)] ${s.isTicking ? "tabular-nums" : ""} ${s.value.length > 8
                  ? "text-xl sm:text-2xl lg:text-3xl xl:text-4xl"
                  : s.value.length > 5
                    ? "text-2xl sm:text-3xl lg:text-4xl xl:text-5xl"
                    : "text-3xl sm:text-4xl lg:text-5xl xl:text-6xl"
                  }`}
              >
                {s.value}
              </div>
              <p className="mt-3 font-serif-soft text-sm uppercase tracking-widest text-[color:var(--blush)]/80">
                {s.label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* In Larger Units Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="rounded-2xl border border-[color:var(--gold)]/20 bg-[color:var(--ivory)]/5 p-6 backdrop-blur"
            >
              <p className="text-sm uppercase tracking-wider text-[color:var(--blush)]/70 font-serif-soft">
                Months
              </p>
              <p className="mt-2 font-serif-soft text-2xl text-[color:var(--ivory)] font-medium">
                ~{totalMonths} month{totalMonths !== 1 ? "s" : ""} and {remainingDays} day
                {remainingDays !== 1 ? "s" : ""}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="rounded-2xl border border-[color:var(--gold)]/20 bg-[color:var(--ivory)]/5 p-6 backdrop-blur"
            >
              <p className="text-sm uppercase tracking-wider text-[color:var(--blush)]/70 font-serif-soft">
                Years
              </p>
              <p className="mt-2 font-serif-soft text-2xl text-[color:var(--ivory)] font-medium">
                ~{years} year{years !== 1 ? "s" : ""} and {remainingDays} day
                {remainingDays !== 1 ? "s" : ""}{" "}
                <span className="text-[color:var(--gold)]/80 text-lg font-light">
                  (≈ {decimalYears} years)
                </span>
              </p>
            </motion.div>
          </div>
        </div>

        {/* Romantic Footer line */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.4 }}
          className="mt-16"
        >
          <p className="font-hand text-3xl md:text-4xl text-[color:var(--gold)] italic">
            “it's been {millionSecs} million seconds of knowing you…”
          </p>
        </motion.div>
      </div>
    </section>
  );
}

/* ===================== Scene 5: Memory Timeline ===================== */
function SceneTimeline() {
  return (
    <section id="timeline" className="relative py-32" style={{ background: "var(--ivory)" }}>
      <div className="mx-auto max-w-5xl px-6 text-center">
        <p className="font-hand text-2xl text-[color:var(--rose)]">Our little story</p>
        <h3 className="mt-2 font-display text-5xl text-[color:var(--mauve)] md:text-6xl">
          Moments I keep
        </h3>
        <div className="gold-divider mx-auto mt-6 w-32" />
      </div>

      <div className="relative mx-auto mt-20 max-w-4xl px-6">
        <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-[color:var(--rose)]/40 to-transparent md:block" />
        {birthdayConfig.memories.map((m, i) => {
          const left = i % 2 === 0;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: left ? -60 : 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className={`relative mb-16 flex flex-col items-center md:flex-row ${left ? "md:flex-row" : "md:flex-row-reverse"}`}
            >
              <div className="md:w-1/2 md:px-10">
                <div
                  className="polaroid mx-auto max-w-xs rotate-[-2deg]"
                  style={{ rotate: left ? "-2deg" : "2deg" }}
                >
                  <div className="aspect-square w-full overflow-hidden rounded-sm bg-neutral-100 relative group/img">
                    {m.image.endsWith(".mp4") ? (
                      <video
                        src={m.image}
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110"
                      />
                    ) : (
                      <img
                        src={m.image}
                        alt={m.date}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110"
                      />
                    )}
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Heart className="h-8 w-8 text-white/80 animate-pulse" />
                    </div>
                  </div>
                  <p className="mt-3 text-center font-hand text-xl text-[color:var(--mauve)]">
                    {m.date}
                  </p>
                </div>
              </div>
              <div className="mt-6 md:mt-0 md:w-1/2 md:px-10">
                <p className="font-serif-soft text-2xl italic leading-relaxed text-[color:var(--foreground)]/85">
                  "{m.caption}"
                </p>
              </div>
              <div className="absolute left-1/2 hidden h-4 w-4 -translate-x-1/2 rounded-full bg-[color:var(--rose)] shadow-[0_0_0_6px_rgba(242,167,187,.3)] md:block" />
            </motion.div>
          );
        })}
      </div>
      <p className="mt-8 text-center font-hand text-lg text-[color:var(--mauve)]/70">
        Thank you for the love you shared for us
      </p>
    </section>
  );
}

/* ===================== Scene 4.5: Unspoken Archive ===================== */
interface SceneUnspokenArchiveProps {
  readLetters: number[];
  onRead: (index: number) => void;
}

function SceneUnspokenArchive({ readLetters, onRead }: SceneUnspokenArchiveProps) {
  const [activeMessage, setActiveMessage] = useState<number | null>(null);

  const handleOpenMessage = (index: number) => {
    setActiveMessage(index);
    onRead(index);
  };

  const handleCloseMessage = () => {
    setActiveMessage(null);
  };

  const allRead = readLetters.length === birthdayConfig.secretLetters.length;

  return (
    <section
      id="archive"
      className="relative overflow-hidden py-32 text-center"
      style={{
        background: "var(--ivory)",
      }}
    >
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url(${petalsBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          mixBlendMode: "multiply",
        }}
      />
      <div className="relative z-10 mx-auto max-w-4xl px-6">
        <p className="font-hand text-2xl text-[color:var(--rose)]">Unspoken Archive</p>
        <h3 className="mt-2 font-display text-5xl text-[color:var(--mauve)] md:text-6xl">
          Deep within the heart
        </h3>
        <p className="mt-4 font-serif-soft text-lg text-[color:var(--mauve)]/80">
          Click to read each envelope. Reveal the final lock when all are read. (
          {readLetters.length}/{birthdayConfig.secretLetters.length} read)
        </p>
        <div className="gold-divider mx-auto mt-6 w-32" />

        {/* Envelopes Grid */}
        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 max-w-2xl mx-auto">
          {birthdayConfig.secretLetters.map((letter, index) => {
            const isRead = readLetters.includes(index);
            return (
              <motion.button
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                onClick={() => handleOpenMessage(index)}
                className="group relative flex flex-col items-center justify-center rounded-2xl border border-[color:var(--rose)]/25 bg-white/40 p-8 backdrop-blur transition-all duration-300 hover:border-[color:var(--rose)]/60 hover:shadow-[0_15px_30px_rgba(196,122,163,0.15)] hover:translate-y-[-4px] cursor-pointer"
              >
                <div
                  className={`mb-4 transition-colors duration-300 ${isRead
                    ? "text-[color:var(--gold)]"
                    : "text-[color:var(--rose)] group-hover:text-[color:var(--mauve)]"
                    }`}
                >
                  {isRead ? <MailOpen className="h-12 w-12" /> : <Mail className="h-12 w-12" />}
                </div>
                <h4 className="font-display text-xl text-[color:var(--mauve)] font-medium mb-1">
                  {letter.title}
                </h4>
                <p className="font-serif-soft text-sm italic text-[color:var(--foreground)]/70">
                  {letter.intro}
                </p>
                {isRead && (
                  <span className="absolute top-4 right-4 text-[10px] tracking-wider font-bold bg-[color:var(--gold)]/20 text-[color:var(--gold)] px-2.5 py-0.5 rounded-full uppercase">
                    Read
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Locked Status Indicator */}
        <div className="mt-16 h-12 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {!allRead ? (
              <motion.p
                key="locked"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="font-serif-soft text-lg italic text-[color:var(--rose)]/80 flex items-center gap-2"
              >
                🔐 Keep reading the envelopes to unlock the coupons and finale...
              </motion.p>
            ) : (
              <motion.p
                key="unlocked"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="font-serif-soft text-lg font-medium text-[color:var(--gold)] flex items-center gap-2"
              >
                🎉 All letters read! Scroll down to unlock your surprise coupons below.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Detail Modal Overlay */}
      <AnimatePresence>
        {activeMessage !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseMessage}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg rounded-lg p-10 md:p-14 text-left"
              style={{
                backgroundImage: `url(${parchment})`,
                backgroundSize: "cover",
                boxShadow:
                  "0 30px 60px -12px rgba(0, 0, 0, 0.5), inset 0 0 80px rgba(232, 200, 122, 0.15)",
                border: "1px solid #e7decb",
              }}
            >
              {/* Close Button top-right */}
              <button
                onClick={handleCloseMessage}
                aria-label="Close Letter"
                className="absolute top-6 right-6 border-none bg-transparent cursor-pointer text-[#4b3621] opacity-60 hover:opacity-100 transition-opacity"
              >
                <X className="h-6 w-6" />
              </button>

              <h3 className="font-display text-3xl font-semibold text-center text-[#4b3621] mb-6 pb-3 border-b border-dashed border-[#4b3621]/20">
                {birthdayConfig.secretLetters[activeMessage].title}
              </h3>

              <div className="font-serif-soft text-lg md:text-xl leading-relaxed italic text-[#3d2b1f] whitespace-pre-line mb-8 min-h-[150px]">
                {birthdayConfig.secretLetters[activeMessage].content}
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleCloseMessage}
                  className="bg-[#991b1b] text-white hover:bg-[#b91c1c] transition font-display font-medium rounded-full px-8 py-3 shadow-[0_4px_15px_rgba(153,27,27,0.4)] hover:shadow-[0_6px_20px_rgba(153,27,27,0.6)] hover:translate-y-[-1px] active:translate-y-0 text-sm tracking-wider flex items-center gap-2 cursor-pointer"
                >
                  Close Letter
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

/* ===================== Scene 6: Gift / Coupons ===================== */
function SceneGift() {
  const [selected, setSelected] = useState<number[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("selected_gifts");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const handleCardClick = (index: number) => {
    if (selected.includes(index)) {
      return;
    }
    if (selected.length < 3) {
      const next = [...selected, index];
      setSelected(next);
      localStorage.setItem("selected_gifts", JSON.stringify(next));

      if (next.length === 3) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.8 },
          colors: ["#F2A7BB", "#E8C87A", "#FFD6E0"],
        });
      }
    }
  };

  const isLocked = selected.length === 3;

  return (
    <section
      id="gift"
      className="relative overflow-hidden py-32"
      style={{
        background: "linear-gradient(180deg, oklch(0.93 0.04 10) 0%, oklch(0.96 0.02 60) 100%)",
      }}
    >
      <div className="mx-auto max-w-6xl px-6 text-center">
        <p className="font-hand text-2xl text-[color:var(--rose)]">A little surprise</p>
        <h3 className="mt-2 font-display text-5xl text-[color:var(--mauve)] md:text-6xl">
          Choose Your Gifts 🎁
        </h3>
        <p className="mt-4 font-serif-soft text-lg text-[color:var(--mauve)]/80 max-w-2xl mx-auto">
          I have written six special promises for you. Choose **any three** cards and let's see your
          luck on what you get from me!
        </p>
        <p className="mt-2 font-serif-soft italic font-semibold text-[color:var(--rose)]">
          Selected: {selected.length} / 3
        </p>
        <div className="gold-divider mx-auto mt-6 w-32" />

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {birthdayConfig.coupons.map((c, i) => {
            const isFlipped = selected.includes(i);
            const isDisabled = (isLocked && !isFlipped) || isFlipped;
            return (
              <motion.button
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                onClick={() => handleCardClick(i)}
                disabled={isDisabled}
                className={`group relative h-56 [perspective:1200px] transition-all duration-300 ${isDisabled && !isFlipped ? "opacity-40 cursor-not-allowed scale-95" : ""
                  } ${isFlipped ? "cursor-default" : ""}`}
              >
                <div
                  className="relative h-full w-full transition-transform duration-700 [transform-style:preserve-3d]"
                  style={{ transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
                >
                  {/* front */}
                  <div
                    className={`absolute inset-0 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[color:var(--gold)]/60 p-6 [backface-visibility:hidden] transition-shadow duration-300 ${!isDisabled
                      ? "group-hover:shadow-[0_15px_30px_rgba(196,122,163,0.15)] group-hover:border-[color:var(--rose)]/50"
                      : ""
                      }`}
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.99 0.005 75) 0%, oklch(0.95 0.04 10) 100%)",
                      boxShadow: "0 18px 40px -16px rgba(196,122,163,.4)",
                    }}
                  >
                    <Gift className="h-10 w-10 text-[color:var(--rose)]" />
                    <p className="mt-3 font-hand text-2xl text-[color:var(--mauve)]">
                      Gift Card #{i + 1}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-widest text-[color:var(--mauve)]/60">
                      Tap to choose
                    </p>
                  </div>
                  {/* back */}
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl p-6 text-[color:var(--ivory)] [backface-visibility:hidden] [transform:rotateY(180deg)]"
                    style={{
                      background: "linear-gradient(135deg, var(--rose), var(--mauve))",
                      boxShadow: "0 20px 40px -10px rgba(196,122,163,.55)",
                    }}
                  >
                    <Sparkles className="h-7 w-7 opacity-80" />
                    <p className="mt-3 font-display text-2xl">{c.title}</p>
                    <p className="mt-2 px-2 font-serif-soft italic opacity-90">{c.note}</p>
                    <span className="absolute top-4 right-4 text-[10px] tracking-wider font-bold bg-white/20 text-[color:var(--ivory)] px-2.5 py-0.5 rounded-full uppercase">
                      Chosen
                    </span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ===================== Scene 6.2: The ₹10 Promise ===================== */
function SceneNote() {
  const [isOpened, setIsOpened] = useState(false);

  const handleOpen = () => {
    setIsOpened(!isOpened);
    if (!isOpened) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.65 },
        colors: ["#E8C87A", "#FFD700", "#FFC0CB", "#FFF"],
      });
    }
  };

  return (
    <section
      id="promise"
      className="relative overflow-hidden py-32 flex flex-col items-center"
      style={{
        background: "linear-gradient(180deg, oklch(0.18 0.02 320) 0%, oklch(0.12 0.01 320) 100%)",
      }}
    >
      <Stars count={40} />
      <div className="mx-auto max-w-4xl px-6 text-center relative z-10 flex flex-col items-center w-full">
        <p className="font-hand text-2xl text-[color:var(--gold)]">Our secret promise</p>
        <h3 className="mt-2 font-display text-5xl text-[color:var(--ivory)] md:text-6xl">
          {birthdayConfig.tenRupeeNote.title}
        </h3>
        <p className="mt-4 font-serif-soft text-lg text-[color:var(--ivory)]/70 max-w-xl mx-auto">
          {birthdayConfig.tenRupeeNote.subtitle}
        </p>
        <div className="gold-divider mx-auto mt-6 w-32" />

        {/* Note Interactive Merge Container */}
        <div className="relative mt-16 flex flex-col items-center justify-center h-[260px] w-full max-w-md">
          <div
            onClick={handleOpen}
            className="relative w-full h-[180px] sm:h-[220px] cursor-pointer select-none flex items-center justify-center overflow-hidden"
          >
            {/* The United Full Note */}
            <motion.div
              initial={false}
              animate={{
                opacity: isOpened ? 1 : 0,
                scale: isOpened ? 1 : 0.9,
                y: isOpened ? 0 : 15,
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute inset-0 w-full h-full flex items-center justify-center p-2 z-20 pointer-events-none"
            >
              <img
                src={birthdayConfig.tenRupeeNote.fullNoteImage}
                alt="United Ten Rupee Note"
                className="max-w-full max-h-full object-contain rounded-2xl shadow-[0_20px_50px_rgba(232,200,122,0.3)] border border-[color:var(--gold)]/30"
              />
            </motion.div>

            {/* Left Half Note */}
            <motion.div
              initial={false}
              animate={{
                x: isOpened ? "30%" : "-15%",
                opacity: isOpened ? 0 : 1,
                rotate: isOpened ? 5 : -4,
              }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="absolute left-0 w-1/2 h-full flex items-center justify-end pr-2 z-10"
            >
              <img
                src={birthdayConfig.tenRupeeNote.firstHalfImage}
                alt="Left Half Note"
                className="max-w-[90%] max-h-[90%] object-contain rounded-xl shadow-[0_15px_30px_rgba(0,0,0,0.3)] border border-white/5"
              />
            </motion.div>

            {/* Right Half Note */}
            <motion.div
              initial={false}
              animate={{
                x: isOpened ? "-30%" : "15%",
                opacity: isOpened ? 0 : 1,
                rotate: isOpened ? -5 : 4,
              }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="absolute right-0 w-1/2 h-full flex items-center justify-start pl-2 z-10"
            >
              <img
                src={birthdayConfig.tenRupeeNote.secondHalfImage}
                alt="Right Half Note"
                className="max-w-[90%] max-h-[90%] object-contain rounded-xl shadow-[0_15px_30px_rgba(0,0,0,0.3)] border border-white/5"
              />
            </motion.div>

            {/* Center Connection Cue (Only visible when separate) */}
            <motion.div
              animate={{
                opacity: isOpened ? 0 : 1,
                scale: isOpened ? 0.8 : 1,
              }}
              className="absolute z-20 flex flex-col items-center justify-center"
            >
              <div className="rounded-full bg-[color:var(--gold)]/20 backdrop-blur-md p-3 border border-[color:var(--gold)]/40 shadow-lg animate-pulse">
                <Heart className="h-6 w-6 text-[color:var(--gold)] fill-current" />
              </div>
            </motion.div>

            {/* Merge Flash Overlay */}
            {isOpened && (
              <motion.div
                initial={{ opacity: 0.8, scale: 0.8 }}
                animate={{ opacity: 0, scale: 1.5 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 bg-white rounded-full filter blur-xl pointer-events-none z-30"
              />
            )}
          </div>
        </div>

        <p
          className="mt-6 text-sm uppercase tracking-widest text-[color:var(--gold)]/70 cursor-pointer hover:text-[color:var(--gold)] transition-colors"
          onClick={handleOpen}
        >
          {isOpened ? "Tap to separate the halves" : "Tap the note to bring the halves together"}
        </p>

        {/* Reveal Message */}
        <AnimatePresence>
          {isOpened && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8 }}
              className="mt-12 max-w-2xl bg-white/5 backdrop-blur-md border border-[color:var(--gold)]/20 rounded-2xl p-6 md:p-8 shadow-2xl"
            >
              <Sparkles className="h-6 w-6 text-[color:var(--gold)] mx-auto mb-4 animate-bounce" />
              <p className="font-serif-soft text-xl italic text-[color:var(--ivory)] leading-relaxed">
                "{birthdayConfig.tenRupeeNote.message}"
              </p>
              <div className="my-6 border-t border-[color:var(--gold)]/20 w-24 mx-auto" />
              <p className="font-hand text-2xl text-[color:var(--gold)]">
                {birthdayConfig.tenRupeeNote.promise}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

/* ===================== Scene 6.5: The Soundtrack of Us ===================== */
interface SceneSoundtrackProps {
  isPlayingCassette: boolean;
  togglePlayCassette: () => void;
  isMuted: boolean;
  toggleMute: () => void;
  currentCassetteIndex: number;
  onSelectCassette: (index: number) => void;
}

function SceneSoundtrack({
  isPlayingCassette,
  togglePlayCassette,
  isMuted,
  toggleMute,
  currentCassetteIndex,
  onSelectCassette,
}: SceneSoundtrackProps) {
  const cassetteThemes = [
    {
      name: "rose",
      shellBorder: "var(--rose)",
      labelBorder: "var(--rose)",
      labelBg: "linear-gradient(180deg, var(--blush) 0%, var(--ivory) 100%)",
      wheelColor: "var(--gold)",
      wheelCenterBg: "var(--mauve)",
      holeBorder: "var(--rose)",
      textColor: "var(--mauve)",
      glowColor: "rgba(196, 122, 163, 0.45)",
      badgeColor:
        "bg-[color:var(--rose)]/25 text-[color:var(--rose)] border-[color:var(--rose)]/30",
    },
    {
      name: "gold",
      shellBorder: "var(--gold)",
      labelBorder: "var(--gold)",
      labelBg: "linear-gradient(180deg, var(--ivory) 0%, oklch(0.98 0.04 80) 100%)",
      wheelColor: "var(--rose)",
      wheelCenterBg: "var(--gold)",
      holeBorder: "var(--gold)",
      textColor: "oklch(0.45 0.08 75)",
      glowColor: "rgba(232, 200, 122, 0.45)",
      badgeColor:
        "bg-[color:var(--gold)]/25 text-[color:var(--gold)] border-[color:var(--gold)]/30",
    },
    {
      name: "mauve",
      shellBorder: "var(--mauve)",
      labelBorder: "var(--mauve)",
      labelBg: "linear-gradient(180deg, var(--blush) 0%, var(--ivory) 100%)",
      wheelColor: "var(--blush)",
      wheelCenterBg: "var(--mauve)",
      holeBorder: "var(--mauve)",
      textColor: "var(--mauve)",
      glowColor: "rgba(90, 40, 75, 0.45)",
      badgeColor:
        "bg-[color:var(--mauve)]/25 text-[color:var(--mauve)] border-[color:var(--mauve)]/30",
    },
  ];

  const handleCassetteClick = (idx: number) => {
    if (idx === currentCassetteIndex) {
      togglePlayCassette();
    } else {
      onSelectCassette(idx);
    }
  };

  return (
    <section
      id="soundtrack"
      className="relative overflow-hidden py-32 text-center"
      style={{
        background: "linear-gradient(180deg, oklch(0.2 0.05 340) 0%, oklch(0.28 0.08 350) 100%)",
      }}
    >
      <Stars count={60} />
      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <div className="inline-flex p-3 rounded-full bg-[color:var(--rose)]/15 text-[color:var(--gold)] mb-4">
          <Music className="h-6 w-6" />
        </div>
        <h3 className="font-display text-4xl text-[color:var(--ivory)] md:text-5xl">
          The Soundtrack of Us
        </h3>
        <p className="mt-4 font-serif-soft text-lg text-[color:var(--blush)]/80 max-w-xl mx-auto">
          Three dedicated cassettes, specifically curated for you. Click any cassette to play its
          song. Scrolling away will pause the player and restore the background theme music.
        </p>
        <div className="gold-divider mx-auto mt-6 w-32" />

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto px-4">
          {birthdayConfig.music.cassetteSongs.map((song, index) => {
            const isSelected = index === currentCassetteIndex;
            const isCurrentPlaying = isSelected && isPlayingCassette;
            const theme = cassetteThemes[index] || cassetteThemes[0];

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="flex flex-col items-center"
              >
                {/* Cassette Tape Card Container */}
                <motion.div
                  whileHover={{ y: -8, scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCassetteClick(index)}
                  className="group relative cursor-pointer select-none rounded-xl"
                >
                  {/* Cassette Outer Shell */}
                  <div
                    className="cassette-shell transition-all duration-300"
                    style={{
                      borderColor: theme.shellBorder,
                      boxShadow: isCurrentPlaying
                        ? `0 20px 40px -10px ${theme.glowColor}, 0 0 25px ${theme.shellBorder}`
                        : isSelected
                          ? `0 15px 30px -10px ${theme.glowColor}, 0 0 15px ${theme.shellBorder}44`
                          : `0 10px 25px -10px rgba(0,0,0,0.5)`,
                    }}
                  >
                    <div
                      className="cassette-label"
                      style={{
                        borderColor: theme.labelBorder,
                        background: theme.labelBg,
                      }}
                    >
                      <div className="cassette-lines" />
                      <div
                        className="cassette-label-text font-bold"
                        style={{ color: theme.textColor }}
                      >
                        A-SIDE: {song.title}
                      </div>

                      {/* Clear center plastic window */}
                      <div
                        className="cassette-center-window"
                        style={{ borderColor: theme.shellBorder }}
                      >
                        <div
                          className={`cassette-wheel ${isCurrentPlaying ? "spinning" : ""}`}
                          style={{ borderColor: theme.wheelColor }}
                        >
                          <div
                            className="cassette-wheel-center"
                            style={{ backgroundColor: theme.wheelCenterBg }}
                          />
                        </div>
                        <div
                          style={{
                            width: "40px",
                            height: "8px",
                            background: "rgba(255, 255, 255, 0.05)",
                            borderRadius: "4px",
                          }}
                        />
                        <div
                          className={`cassette-wheel ${isCurrentPlaying ? "spinning" : ""}`}
                          style={{ borderColor: theme.wheelColor }}
                        >
                          <div
                            className="cassette-wheel-center"
                            style={{ backgroundColor: theme.wheelCenterBg }}
                          />
                        </div>
                      </div>

                      <div
                        style={{
                          fontSize: "0.6rem",
                          color: theme.textColor,
                          fontWeight: "bold",
                          zIndex: 2,
                          display: "flex",
                          gap: "20px",
                          opacity: 0.8,
                        }}
                      >
                        <span>NR [ON]</span>
                        <span>CrO2 TYPE II</span>
                      </div>
                    </div>

                    {/* Bottom holes */}
                    <div className="cassette-bottom-holes">
                      <div className="cassette-hole" style={{ borderColor: theme.holeBorder }} />
                      <div className="cassette-hole" style={{ borderColor: theme.holeBorder }} />
                      <div className="cassette-hole" style={{ borderColor: theme.holeBorder }} />
                    </div>

                    {/* Interactive hover overlay with play/pause icons */}
                    <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center backdrop-blur-[1px]">
                      <div className="rounded-full bg-white/20 p-4 border border-white/30 text-white shadow-lg backdrop-blur">
                        {isCurrentPlaying ? (
                          <Pause className="h-8 w-8 fill-current text-[color:var(--ivory)]" />
                        ) : (
                          <Play className="h-8 w-8 fill-current text-[color:var(--ivory)] ml-0.5" />
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Subtext and Badge */}
                <div className="mt-4 max-w-sm px-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span
                      className={`text-[10px] tracking-wider uppercase font-bold px-3 py-1 rounded-full border ${theme.badgeColor}`}
                    >
                      {isCurrentPlaying
                        ? "🔊 Playing"
                        : isSelected
                          ? "⏸️ Selected"
                          : "🎵 Dedication"}
                    </span>
                  </div>
                  <h4 className="font-display text-lg text-[color:var(--ivory)] font-semibold">
                    {song.title}
                  </h4>
                  <p className="font-serif-soft text-sm italic text-[color:var(--blush)]/70 mt-1">
                    "{song.situation}"
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Global Controls / Mute */}
        <div className="mt-12 flex justify-center gap-4">
          <button
            onClick={toggleMute}
            className="flex items-center gap-2 rounded-full border border-[color:var(--gold)]/30 bg-white/5 px-6 py-2.5 text-sm font-medium text-[color:var(--ivory)] backdrop-blur transition hover:bg-white/10 hover:border-[color:var(--gold)]/60 cursor-pointer"
          >
            {isMuted ? (
              <>
                <VolumeX className="h-4 w-4 text-[color:var(--rose)]" />
                Unmute Soundtrack
              </>
            ) : (
              <>
                <Volume2 className="h-4 w-4 text-[color:var(--gold)]" />
                Mute Soundtrack
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}

/* ===================== Scene 7: Birthday Finale ===================== */
function SceneFinale() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const [candles, setCandles] = useState([true, true, true]);

  const blow = (i: number) => {
    setCandles((c) => c.map((v, idx) => (idx === i ? false : v)));
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.45, x: 0.3 + i * 0.2 },
      colors: ["#F2A7BB", "#E8C87A", "#C47AA3", "#FFD6E0", "#fff"],
    });
    setTimeout(() => {
      const all = candles.map((v, idx) => (idx === i ? false : v)).every((v) => !v);
      if (all) {
        confetti({
          particleCount: 220,
          spread: 130,
          origin: { y: 0.6 },
          colors: ["#F2A7BB", "#E8C87A", "#C47AA3", "#FFD6E0", "#fff"],
          scalar: 1.2,
        });
      }
    }, 100);
  };

  return (
    <section
      id="finale"
      ref={ref}
      className="relative flex h-screen items-center justify-center overflow-hidden py-12 text-center"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(28,10,30,.85), rgba(60,20,55,.85)), url(${starsBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Stars count={80} />
      <Petals count={10} />

      <motion.div className="relative z-10 mx-auto max-w-3xl px-6 flex flex-col items-center justify-center h-full max-h-[90vh]">
        <p className="font-hand text-xl text-[color:var(--gold)]">Make a wish</p>
        <h3 className="mt-2 font-display text-4xl text-[color:var(--ivory)] md:text-6xl leading-tight">
          <span className="shimmer-text">Happy Birthday</span>
        </h3>
        <p className="mt-6 font-script text-5xl text-[color:var(--blush)] md:text-6xl leading-none">
          {birthdayConfig.herName}
        </p>

        <div className="relative mx-auto mt-6 w-[200px] md:w-[260px] transition-all duration-300">
          <img
            src={cake}
            alt="A pink birthday cake with candles"
            width={768}
            height={768}
            style={{ filter: "drop-shadow(0 15px 25px rgba(232,200,122,.35))" }}
          />
          {/* clickable candle hot-spots */}
          <div className="absolute inset-0 pointer-events-none">
            {candles.map((lit, i) => {
              const positions = [
                { left: "37.5%", top: "27%", rotate: "-15deg" },
                { left: "50%", top: "22%", rotate: "0deg" },
                { left: "62.5%", top: "27%", rotate: "15deg" },
              ];
              const pos = positions[i];
              return (
                <button
                  key={i}
                  onClick={() => lit && blow(i)}
                  aria-label={`Blow out candle ${i + 1}`}
                  className="absolute w-[16%] h-[16%] flex items-center justify-center cursor-pointer pointer-events-auto"
                  style={{
                    left: pos.left,
                    top: pos.top,
                    transform: `translate(-50%, -50%) rotate(${pos.rotate})`,
                  }}
                >
                  {lit && (
                    <span
                      className="candle-flame block h-6 w-3 rounded-full"
                      style={{
                        background:
                          "radial-gradient(circle at 50% 60%, #fff7c2 0%, #ffd24c 50%, #ff7a3a 100%)",
                        boxShadow: "0 0 14px #ffb84d, 0 0 28px #ff7a3a",
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <p className="mt-3 text-xs uppercase tracking-widest text-[color:var(--blush)]/70">
          Tap the flames to blow them out
        </p>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="mx-auto mt-8 max-w-xl font-serif-soft text-lg md:text-xl italic text-[color:var(--ivory)]/90"
        >
          {birthdayConfig.birthdayMessage}
        </motion.p>
      </motion.div>
    </section>
  );
}

/* ===================== Gallery Video Card (Viewport-aware) ===================== */
function GalleryVideoCard({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [activeSrc, setActiveSrc] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Load src only when needed
            if (!activeSrc) setActiveSrc(src);
          } else {
            if (videoRef.current) {
              videoRef.current.pause();
            }
            setIsHovered(false);
          }
        });
      },
      { rootMargin: "200px 0px", threshold: 0.01 },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, [src, activeSrc]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !activeSrc) return;

    if (isHovered) {
      el.play().catch(() => { });
    } else {
      el.pause();
    }
  }, [isHovered, activeSrc]);

  return (
    <div
      className="relative w-full h-full overflow-hidden flex items-center justify-center bg-black"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
          <div className="w-6 h-6 rounded-full border-2 border-white/30 border-t-white animate-spin" />
        </div>
      )}
      <video
        ref={videoRef}
        src={activeSrc ?? undefined}
        muted
        loop
        playsInline
        preload="metadata"
        onLoadedData={() => setLoaded(true)}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 flex items-end justify-center pb-4 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
        <span className="font-hand text-sm text-white drop-shadow">
          Hover to play / Tap to open ♡
        </span>
      </div>
    </div>
  );
}

const friendsGlob = import.meta.glob('/src/photos/friends/*', { eager: true });
const heroChaiGlob = import.meta.glob('/src/photos/hero_chai/*', { eager: true });
const midnightTalksGlob = import.meta.glob('/src/photos/midnight_talks/*', { eager: true });
const bogMakingGlob = import.meta.glob('/src/photos/bog_making/*', { eager: true });
const surpriseGlob = import.meta.glob('/src/photos/surprise/*', { eager: true });

const getPublicPaths = (globResult: Record<string, any>) => {
  return Object.keys(globResult).map((path, idx) => {
    const module = globResult[path] as { default: string } | string;
    const resolvedUrl = typeof module === 'string' ? module : module.default;
    const isVideo = path.toLowerCase().endsWith('.mp4') || path.toLowerCase().endsWith('.webm');
    return {
      originalIndex: idx,
      type: isVideo ? ('video' as const) : ('photo' as const),
      url: resolvedUrl,
      filename: path.split("/").pop() || "",
      aspectRatio: isVideo ? 1.778 : undefined
    };
  });
};

function GalleryPhotoCard({ src }: { src: string }) {
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);

  return (
    <div 
      className="relative rounded overflow-hidden bg-[#ebdcb4]/20 flex items-center justify-center w-full shadow-inner"
      style={{
        aspectRatio: aspectRatio 
          ? (aspectRatio < 1 ? 0.75 : 1.333) 
          : 1.333 // default to 4:3 while loading
      }}
    >
      <img
        src={src}
        alt="Memory"
        loading="lazy"
        onLoad={(e) => {
          const img = e.currentTarget;
          if (img.naturalWidth && img.naturalHeight) {
            setAspectRatio(img.naturalWidth / img.naturalHeight);
          }
        }}
        className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
        <Heart className="h-6 w-6 text-[color:var(--rose)]/80 animate-pulse" />
      </div>
    </div>
  );
}

/* ===================== Scene 8: Gallery ===================== */
interface SceneGalleryProps {
  onVideoPlayStateChange?: (isPlaying: boolean) => void;
}

function SceneGallery({ onVideoPlayStateChange }: SceneGalleryProps) {
  const [activeItem, setActiveItem] = useState<any | null>(null);
  const [openVolume, setOpenVolume] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleClose = () => {
    setActiveItem(null);
    onVideoPlayStateChange?.(false);
  };

  // Categorize items dynamically into leather books
  const volumes = [
    {
      id: "friends",
      title: "Volume I: Friends & Laughter",
      subtitle: "Friends",
      tabLabel: "Friends",
      description: "Golden days with friends, college memories, and shared smiles.",
      themeSpine: "spine-burgundy",
      textColor: "text-[#ffd6e0]",
      glowColor: "rgba(107, 29, 51, 0.4)",
      items: getPublicPaths(friendsGlob),
    },
    {
      id: "hero_chai",
      title: "Volume II: Conversations over Chai",
      subtitle: "Hero chai",
      tabLabel: "Hero chai",
      description: "Every version of us, tea shop diaries, and endless cups of tea.",
      themeSpine: "spine-green",
      textColor: "text-[#d8f3dc]",
      glowColor: "rgba(34, 77, 58, 0.4)",
      items: getPublicPaths(heroChaiGlob),
    },
    {
      id: "midnight_talks",
      title: "Volume III: Late Night Chronicles",
      subtitle: "Midnight talks",
      tabLabel: "Midnight talks",
      description: "Midnight conversations, shared thoughts, and screen captures of us.",
      themeSpine: "spine-navy",
      textColor: "text-[#d0dbf5]",
      glowColor: "rgba(24, 43, 92, 0.4)",
      items: getPublicPaths(midnightTalksGlob),
    },
    {
      id: "bog_making",
      title: "Volume IV: Behind The Scenes",
      subtitle: "BOG making",
      tabLabel: "BOG making",
      description: "Laughter, voice notes, live motion recordings, and candid video logs.",
      themeSpine: "spine-gold",
      textColor: "text-[#fff2d4]",
      glowColor: "rgba(232, 200, 122, 0.4)",
      items: getPublicPaths(bogMakingGlob),
    },
    {
      id: "surprise",
      title: "Volume V: Sweet Discoveries",
      subtitle: "Surprise",
      tabLabel: "Surprise",
      description: "Cute snaps, unexpected captures, and beautiful frames of you.",
      themeSpine: "spine-purple",
      textColor: "text-[#e8d5f5]",
      glowColor: "rgba(128, 90, 213, 0.4)",
      items: getPublicPaths(surpriseGlob),
    },
  ];

  const currentVolume = openVolume !== null ? volumes[openVolume] : null;

  const filteredItems = currentVolume
    ? currentVolume.items.filter((item) => {
      const filename = item.filename?.toLowerCase() || item.url.split("/").pop()?.toLowerCase() || "";
      const refCode = `ref-vol${openVolume! + 1}-crd${item.originalIndex + 1}`;
      const query = searchQuery.toLowerCase();
      return filename.includes(query) || refCode.includes(query);
    })
    : [];

  const isVideo = activeItem?.type === "video";

  return (
    <section id="gallery" className="relative py-32 animate-fade-in" style={{ background: "var(--ivory)" }}>
      {/* Background Petals/Stars decor */}
      <Stars count={35} />

      <div className="mx-auto max-w-6xl px-6 text-center">
        <p className="font-hand text-2xl text-[color:var(--rose)]">Forever page</p>
        <h3 className="mt-2 font-display text-5xl text-[color:var(--mauve)] md:text-6xl">
          The Memory Library
        </h3>
        <div className="gold-divider mx-auto mt-6 w-32" />
        <p className="mt-4 font-serif-soft italic text-[color:var(--mauve)]/70 max-w-2xl mx-auto">
          Welcome to our private archive. Every photo, screenshot, and video has been filed, bound, and cataloged. Select a volume from the shelf to open.
        </p>
      </div>

      <div className="mx-auto mt-16 max-w-5xl px-6">
        <AnimatePresence mode="wait">
          {openVolume === null ? (
            /* ===================== The Bookshelf View ===================== */
            <motion.div
              key="shelf"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center"
            >
              {/* Virtual Shelf */}
              <div className="w-full max-w-3xl rounded-lg bookshelf-container p-8 md:p-12 flex justify-center items-end gap-3 md:gap-6 min-h-[360px] flex-wrap md:flex-nowrap">
                <div className="bookshelf-shadow" />

                {volumes.map((vol, idx) => (
                  <motion.div
                    key={vol.id}
                    className={`book-spine ${vol.themeSpine} flex flex-col justify-between items-center py-6 px-2`}
                    whileHover={{
                      y: -15,
                      rotate: -4,
                      scale: 1.04,
                      boxShadow: `0 25px 35px rgba(0,0,0,0.6), 0 0 20px ${vol.glowColor}`
                    }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setOpenVolume(idx)}
                  >
                    {/* Gold Book Label (Top) */}
                    <div className="w-1.5 h-6 bg-[color:var(--gold)] rounded-sm opacity-80" />

                    {/* Book Spine Title (Rotated) */}
                    <div
                      className={`font-display text-[10px] md:text-sm font-bold tracking-widest ${vol.textColor} uppercase select-none whitespace-nowrap`}
                      style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
                    >
                      {vol.subtitle}
                    </div>

                    {/* Volume Label (Bottom) */}
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] font-mono tracking-widest text-[color:var(--gold)]/80 uppercase">
                        VOL. {idx + 1}
                      </span>
                      <div className="w-4 h-1 bg-[color:var(--gold)]/40 mt-1" />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Shelf Description Details */}
              <div className="mt-8 text-center max-w-2xl px-6">
                <p className="text-xs uppercase tracking-widest text-[color:var(--mauve)]/50 font-bold mb-2">
                  Library Catalog Index
                </p>
                <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-[11px] font-serif-soft italic text-[color:var(--foreground)]/70">
                  {volumes.map((vol, idx) => (
                    <div key={vol.id} className="cursor-pointer hover:text-[color:var(--rose)] transition" onClick={() => setOpenVolume(idx)}>
                      <span className="font-bold text-[color:var(--gold)] block not-italic">VOL. {idx + 1}</span>
                      {vol.subtitle}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            /* ===================== The Opened Scrapbook View ===================== */
            <motion.div
              key="book-content"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="w-full bg-[#fdfbf7] border border-[#e8dfc7] rounded-xl p-6 md:p-10 shadow-2xl relative"
            >
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none rounded-xl" style={{ backgroundImage: `url(${parchment})`, backgroundSize: "cover" }} />

              {/* Book Header / Reading Desk Controls */}
              <div className="flex flex-col md:flex-row items-center justify-between border-b border-dashed border-[#e3d7b9] pb-6 gap-6 relative z-10">
                <button
                  onClick={() => {
                    setOpenVolume(null);
                    setSearchQuery("");
                  }}
                  className="flex items-center gap-2 rounded-full border border-[#d2c49e] bg-white/60 px-5 py-2 text-xs font-serif-soft italic text-[#5c4033] hover:bg-[#ebdcb4] hover:text-[#3d2b1f] transition cursor-pointer"
                >
                  ← Return to Shelf
                </button>

                <div className="text-center">
                  <span className="text-[10px] tracking-wider font-mono font-bold text-[color:var(--gold)] uppercase block mb-1">
                    Reading Desk: Volume {openVolume + 1}
                  </span>
                  <h4 className="font-display text-2xl md:text-3xl text-[#3d2b1f] font-semibold">
                    {currentVolume?.title}
                  </h4>
                  <p className="font-serif-soft text-xs italic text-[#5c4033]/70 mt-1 max-w-md">
                    {currentVolume?.description}
                  </p>
                </div>

                {/* Library Catalog Drawer Search Bar */}
                <div className="relative w-full md:w-60">
                  <input
                    type="text"
                    placeholder="Search Catalog..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-md border border-[#c2b48f] bg-[#fbf9f3] px-3 py-2 text-xs text-[#3d2b1f] placeholder-[#a69772] shadow-inner focus:outline-none focus:ring-1 focus:ring-[#8e2b45] font-serif-soft"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#a69772] hover:text-[#3d2b1f]"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              {/* Volume Tabs */}
              <div className="flex justify-center gap-2 mt-4 relative z-10 border-b border-[#ebdcb4]/30 pb-2 flex-wrap">
                {volumes.map((vol, idx) => (
                  <button
                    key={vol.id}
                    onClick={() => {
                      setOpenVolume(idx);
                      setSearchQuery("");
                    }}
                    className={`px-3 py-1.5 md:px-5 md:py-2 rounded-t-md text-[10px] md:text-xs uppercase font-bold tracking-wider transition cursor-pointer border-t border-x ${idx === openVolume
                      ? "bg-[#fcfaf5] text-[#8e2b45] border-[#c2b48f]"
                      : "bg-transparent text-[#a69772] border-transparent hover:text-[#8e2b45] hover:bg-[#ebdcb4]/10"
                      }`}
                  >
                    {vol.tabLabel}
                  </button>
                ))}
              </div>

              {/* Grid of Catalog Cards */}
              {filteredItems.length > 0 ? (
                <div 
                  className={
                    currentVolume?.id === "friends" || currentVolume?.id === "hero_chai"
                      ? "mt-8 columns-1 sm:columns-2 md:columns-3 gap-6 relative z-10"
                      : "mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 items-start relative z-10"
                  }
                >
                  {filteredItems.map((item) => {
                    const isItemVideo = item.type === "video";
                    const isMasonry = currentVolume?.id === "friends" || currentVolume?.id === "hero_chai";
                    return (
                      <motion.div
                        key={item.originalIndex}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                        onClick={() => setActiveItem(item)}
                        className={`library-card group cursor-pointer p-3 flex flex-col justify-between hover:translate-y-[-4px] hover:shadow-[0_12px_24px_rgba(90,40,75,0.12)] border border-[#ebdcb4] ${
                          isMasonry ? "break-inside-avoid mb-6" : ""
                        }`}
                      >
                        {/* Catalog Header Index Label */}
                        <div className="flex justify-between items-center border-b border-[#e8dfc7] pb-2 mb-3">
                          <span className="text-[9px] font-mono text-[#a69772] font-semibold tracking-wider">
                            REF: V{openVolume! + 1}-C{item.originalIndex + 1}
                          </span>
                          <span className="library-stamp">Archived</span>
                        </div>

                        {/* Card Image Area */}
                        {isItemVideo ? (
                          <div 
                            className="relative rounded overflow-hidden bg-[#ebdcb4]/20 flex items-center justify-center w-full shadow-inner"
                            style={{ aspectRatio: item.aspectRatio || 1.778 }}
                          >
                            <GalleryVideoCard src={item.url} />
                            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                              <Heart className="h-6 w-6 text-[color:var(--rose)]/80 animate-pulse" />
                            </div>
                          </div>
                        ) : (
                          <GalleryPhotoCard src={item.url} />
                        )}

                        {/* Card Footer Detail */}
                        <div className="mt-3 flex justify-between items-center">
                          <div className="text-left max-w-[80%]">
                            <p className="font-serif-soft text-xs text-[#3d2b1f] font-semibold truncate">
                              {item.url.split("/").pop() || "Memory Card"}
                            </p>
                            <span className="font-hand text-[10px] text-[#a69772] italic block mt-0.5">
                              {isItemVideo ? "Live recorded motion" : "Captured photo snap"}
                            </span>
                          </div>
                          <div className="w-6 h-6 rounded-full bg-[#f3ede0] border border-[#d2c49e] flex items-center justify-center text-[#5c4033] hover:bg-[#8e2b45] hover:text-white transition">
                            <Heart className="h-3 w-3 fill-current" />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-20 text-center relative z-10">
                  <p className="font-serif-soft italic text-[#a69772]">
                    No archive files match your catalog search.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {activeItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 md:p-10 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, rotate: -2 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.9, opacity: 0, rotate: 2 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-xl rounded-xl bg-white p-4 md:p-6 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] border border-white/20"
              style={{
                boxShadow: "0 25px 60px -15px rgba(0,0,0,0.7)",
              }}
            >
              {/* Close button inside modal */}
              <button
                onClick={handleClose}
                aria-label="Close modal"
                className="absolute -top-3 -right-3 md:top-4 md:right-4 z-10 rounded-full bg-black/70 p-2 text-white hover:bg-black/90 transition shadow-md border border-white/20 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Media Area */}
              <div
                className="relative overflow-hidden rounded-lg bg-neutral-900 shadow-inner flex items-center justify-center"
                style={{ maxHeight: "70vh" }}
              >
                {isVideo ? (
                  <video
                    src={activeItem.url}
                    controls
                    autoPlay
                    playsInline
                    onPlay={() => onVideoPlayStateChange?.(true)}
                    onPause={() => onVideoPlayStateChange?.(false)}
                    onEnded={() => onVideoPlayStateChange?.(false)}
                    className="w-full h-auto max-h-[60vh] object-contain rounded-sm"
                  />
                ) : (
                  <img
                    src={activeItem.url}
                    alt="Memory"
                    className="w-full h-auto max-h-[60vh] object-contain rounded-sm"
                  />
                )}
              </div>

              {/* Polaroid Bottom Caption Area */}
              <div className="mt-4 md:mt-6 flex flex-col md:flex-row items-center justify-between gap-4 px-2">
                <div className="text-center md:text-left">
                  <p className="font-hand text-2xl text-[color:var(--mauve)]">
                    {isVideo ? "Video Clip" : "Memory Snap"}
                  </p>
                  <p className="font-serif-soft text-xs text-[color:var(--foreground)]/60 mt-1 uppercase tracking-wider">
                    {activeItem.url
                      .split("/")
                      .pop()
                      ?.replace("_", " ")
                      .replace("-", " ")
                      .replace(".mp4", "")
                      .replace(".jpg", "")
                      .replace(".png", "")
                      .replace(".webp", "")}
                  </p>
                </div>

                {/* Download / Save Button */}
                <a
                  href={activeItem.url}
                  download={activeItem.url.split("/").pop()}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-2 rounded-full bg-[color:var(--rose)] px-5 py-2 text-sm font-medium text-white hover:bg-[color:var(--mauve)] transition shadow-[0_4px_12px_rgba(196,122,163,0.3)] cursor-pointer"
                >
                  <Heart className="h-4 w-4 fill-current text-white" />
                  {isVideo ? "Save Video" : "Save Photo"}
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="mt-24 text-center">
        <div className="gold-divider mx-auto w-24" />
        <p className="mt-6 font-script text-3xl text-[color:var(--mauve)]">
          Built with love, What ever it takes i will be with you forever.
        </p>
        <p className="mt-2 font-hand text-lg text-[color:var(--rose)]">
          Yours — {birthdayConfig.yourName} 💗
        </p>
      </footer>
    </section>
  );
}
