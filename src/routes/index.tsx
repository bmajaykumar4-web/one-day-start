import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import confetti from "canvas-confetti";
import { Heart, Sparkles, Gift, ChevronDown, Mail, MailOpen, X, Play, Pause, Volume2, VolumeX, Music } from "lucide-react";
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

  // Centralized Audio Loader & playback coordinator
  useEffect(() => {
    if (bgAudioRef.current) {
      bgAudioRef.current.load();
      if (isPlaying && activeSection !== "soundtrack") {
        bgAudioRef.current.play()
          .catch((err) => console.log("Background audio play blocked on switch:", err));
      }
    }
  }, [currentBgSongIndex]);

  useEffect(() => {
    if (cassetteAudioRef.current) {
      cassetteAudioRef.current.load();
      if (isPlaying && activeSection === "soundtrack" && isPlayingCassette) {
        cassetteAudioRef.current.play()
          .catch((err) => console.log("Cassette audio play blocked on switch:", err));
      }
    }
  }, [currentCassetteIndex]);

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
          cassetteAudioRef.current.play()
            .catch((err) => console.log("Cassette audio play blocked:", err));
        } else {
          cassetteAudioRef.current.pause();
        }
      } else {
        cassetteAudioRef.current.pause();
        bgAudioRef.current.play()
          .catch((err) => console.log("Background audio play blocked:", err));
      }
    }
  }, [isPlaying, isMuted, activeSection, isPlayingCassette, isVideoPlaying]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleOpen = () => {
    setOpened(true);
    setIsPlaying(true);
    if (bgAudioRef.current) {
      bgAudioRef.current.play()
        .catch((err) => console.log("Audio play blocked by browser:", err));
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

    const sceneIds = ["welcome", "letter", "effort", "timeline", "archive", "soundtrack", "gift", "promise", "you-and-me", "finale", "gallery"];
    const sceneToSongMap: Record<string, number> = {
      welcome: 0,
      letter: 1,
      effort: 2,
      timeline: 3,
      archive: 4,
      soundtrack: 1,
      gift: 0,
      promise: 0,
      "you-and-me": 0,
      finale: 1,
      gallery: 2,
    };

    let observer: IntersectionObserver | null = null;
    let timer: any;

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
            entry.intersectionRatio > max.intersectionRatio ? entry : max
            , visibleEntries[0]);

          const sceneId = mainEntry.target.id;
          setActiveSection(sceneId);

          const songIdx = sceneToSongMap[sceneId];
          if (songIdx !== undefined && sceneId !== "soundtrack") {
            setCurrentBgSongIndex(songIdx);
          }
        }
      };

      const observerOptions = {
        root: null,
        rootMargin: "-25% 0px -25% 0px",
        threshold: 0.1,
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
  }, [opened, allRead]);

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
        loop
        style={{ display: "none" }}
      />
      <audio
        ref={cassetteAudioRef}
        src={birthdayConfig.music.cassetteSongs[currentCassetteIndex].url}
        loop
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
                    setIsPlayingCassette(!isPlayingCassette);
                    setIsPlaying(true);
                  }}
                  isMuted={isMuted}
                  toggleMute={toggleMute}
                  currentCassetteIndex={currentCassetteIndex}
                  onSelectCassette={(idx) => {
                    setCurrentCassetteIndex(idx);
                    setIsPlayingCassette(true);
                    setIsPlaying(true);
                  }}
                />
                <SceneGift />
                <SceneNote />
                <SceneYouAndMe />
                <SceneFinale />
                <SceneGallery onVideoPlayStateChange={setIsVideoPlaying} />
              </motion.div>
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
          <div className={`flex items-center text-[color:var(--rose)] ${isPlaying && (activeSection !== "soundtrack" || isPlayingCassette) ? "spinning" : ""}`}>
            <Music className="h-4 w-4" />
          </div>
          <span className="text-[10px] tracking-wider uppercase font-semibold text-[color:var(--mauve)] max-w-[120px] truncate">
            {getActiveTrackTitle()}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleMute();
            }}
            className="border-none bg-transparent text-[color:var(--rose)]/80 hover:text-[color:var(--rose)] cursor-pointer p-0"
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
          Pssst… come closer
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
        background:
          "linear-gradient(180deg, oklch(0.95 0.04 10) 0%, oklch(0.92 0.06 350) 100%)",
      }}
    >
      <Stars count={50} />
      <div className="relative z-10 px-6">
        <p className="font-hand text-2xl text-[color:var(--mauve)]">It's your day, Sri</p>
        <h2 className="mt-4 font-display text-6xl leading-none md:text-9xl">
          <span className="shimmer-text">Happy Birthday</span>
        </h2>
        <div className="mt-6 flex flex-wrap justify-center gap-2 font-script text-6xl text-[color:var(--mauve)] md:text-8xl">
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
    <section id="letter" className="relative overflow-hidden py-32" style={{ background: "var(--ivory)" }}>
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

function SceneEffort() {
  const startDate = new Date(birthdayConfig.meetingDate);
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
      { threshold: 0.15 }
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

  const diffMs = isAnimating ? animatedDiffMs : (liveNow.getTime() - startDate.getTime());

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
  const { years, months, days: remainingDays, totalMonths, decimalYears } = getDetailedDifference(startDate, currentDate);

  const formatDate = (date: Date) => {
    const day = date.getDate();
    const monthsNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
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
        background:
          "linear-gradient(180deg, oklch(0.2 0.05 340) 0%, oklch(0.28 0.08 350) 100%)",
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
            { label: "Seconds", value: totalSeconds.toLocaleString(), isTicking: true }
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
                className={`font-display text-[color:var(--gold)] ${s.isTicking ? 'tabular-nums' : ''} ${s.value.length > 8
                  ? 'text-xl sm:text-2xl lg:text-3xl xl:text-4xl'
                  : s.value.length > 5
                    ? 'text-2xl sm:text-3xl lg:text-4xl xl:text-5xl'
                    : 'text-3xl sm:text-4xl lg:text-5xl xl:text-6xl'
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
              <p className="text-sm uppercase tracking-wider text-[color:var(--blush)]/70 font-serif-soft">Months</p>
              <p className="mt-2 font-serif-soft text-2xl text-[color:var(--ivory)] font-medium">
                ~{totalMonths} month{totalMonths !== 1 ? 's' : ''} and {remainingDays} day{remainingDays !== 1 ? 's' : ''}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="rounded-2xl border border-[color:var(--gold)]/20 bg-[color:var(--ivory)]/5 p-6 backdrop-blur"
            >
              <p className="text-sm uppercase tracking-wider text-[color:var(--blush)]/70 font-serif-soft">Years</p>
              <p className="mt-2 font-serif-soft text-2xl text-[color:var(--ivory)] font-medium">
                ~{years} year{years !== 1 ? 's' : ''} and {remainingDays} day{remainingDays !== 1 ? 's' : ''} <span className="text-[color:var(--gold)]/80 text-lg font-light">(≈ {decimalYears} years)</span>
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
        …and so many more to come.
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
          Click to read each envelope. Reveal the final lock when all are read. ({readLetters.length}/{birthdayConfig.secretLetters.length} read)
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
                  className={`mb-4 transition-colors duration-300 ${isRead ? "text-[color:var(--gold)]" : "text-[color:var(--rose)] group-hover:text-[color:var(--mauve)]"
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
        background:
          "linear-gradient(180deg, oklch(0.93 0.04 10) 0%, oklch(0.96 0.02 60) 100%)",
      }}
    >
      <div className="mx-auto max-w-6xl px-6 text-center">
        <p className="font-hand text-2xl text-[color:var(--rose)]">A little surprise</p>
        <h3 className="mt-2 font-display text-5xl text-[color:var(--mauve)] md:text-6xl">
          Choose Your Gifts 🎁
        </h3>
        <p className="mt-4 font-serif-soft text-lg text-[color:var(--mauve)]/80 max-w-2xl mx-auto">
          I have written six special promises for you. Choose **any three** cards and let's see your luck on what you get from me!
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
                    className={`absolute inset-0 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[color:var(--gold)]/60 p-6 [backface-visibility:hidden] transition-shadow duration-300 ${!isDisabled ? "group-hover:shadow-[0_15px_30px_rgba(196,122,163,0.15)] group-hover:border-[color:var(--rose)]/50" : ""
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

        <p className="mt-6 text-sm uppercase tracking-widest text-[color:var(--gold)]/70 cursor-pointer hover:text-[color:var(--gold)] transition-colors" onClick={handleOpen}>
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


/* ===================== Scene 6.3: You & Me ===================== */
function SceneYouAndMe() {
  const [isUnited, setIsUnited] = useState(false);

  const handleUnite = () => {
    setIsUnited(!isUnited);
    if (!isUnited) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.65 },
        colors: ["#E8C87A", "#FFD700", "#FFC0CB", "#FFF"],
      });
    }
  };

  return (
    <section
      id="you-and-me"
      className="relative overflow-hidden py-32 flex flex-col items-center"
      style={{
        background: "linear-gradient(180deg, oklch(0.12 0.01 320) 0%, oklch(0.22 0.05 340) 100%)",
      }}
    >
      <Stars count={40} />
      <div className="mx-auto max-w-4xl px-6 text-center relative z-10 flex flex-col items-center w-full">
        <p className="font-hand text-2xl text-[color:var(--gold)]">Two Halves of One Whole</p>
        <h3 className="mt-2 font-display text-5xl text-[color:var(--ivory)] md:text-6xl">
          {birthdayConfig.youAndMe.title}
        </h3>
        <p className="mt-4 font-serif-soft text-lg text-[color:var(--ivory)]/70 max-w-xl mx-auto">
          {birthdayConfig.youAndMe.subtitle}
        </p>
        <div className="gold-divider mx-auto mt-6 w-32" />

        {/* You & Me Interactive Merge Card */}
        <div className="relative mt-16 flex flex-col items-center justify-center min-h-[300px] w-full max-w-2xl px-4">
          <div className="relative w-full flex flex-col md:flex-row items-stretch justify-center gap-6 md:gap-12 select-none overflow-hidden py-6">
            
            {/* United Card (Morph in when isUnited) */}
            <motion.div
              initial={false}
              animate={{
                opacity: isUnited ? 1 : 0,
                scale: isUnited ? 1 : 0.9,
                y: isUnited ? 0 : 20,
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute inset-0 w-full h-full flex items-center justify-center p-4 z-20 pointer-events-none"
              style={{ display: isUnited ? "flex" : "none" }}
            >
              <div className="w-full max-w-xl bg-white/5 backdrop-blur-md border border-[color:var(--gold)]/30 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center">
                <Sparkles className="h-8 w-8 text-[color:var(--gold)] mb-4 animate-bounce" />
                <h4 className="font-display text-3xl text-[color:var(--gold)]">Together</h4>
                <p className="mt-4 font-serif-soft text-lg sm:text-xl italic text-[color:var(--ivory)] leading-relaxed">
                  "{birthdayConfig.youAndMe.unitedMessage}"
                </p>
                <div className="mt-6 flex items-center gap-2 text-[color:var(--gold)] font-hand text-2xl">
                  <span>Srividya</span>
                  <Heart className="h-5 w-5 fill-current animate-pulse text-[color:var(--rose)]" />
                  <span>Ajaykumar</span>
                </div>
              </div>
            </motion.div>

            {/* Srividya (You) Card */}
            <motion.div
              initial={false}
              animate={{
                x: isUnited ? "50%" : "0%",
                opacity: isUnited ? 0 : 1,
                scale: isUnited ? 0.9 : 1,
              }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="w-full md:w-1/2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 flex flex-col items-center shadow-lg text-center"
            >
              <div className="w-16 h-16 rounded-full bg-[color:var(--rose)]/20 border border-[color:var(--rose)]/30 flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-[color:var(--rose)]" />
              </div>
              <h4 className="font-display text-2xl text-[color:var(--rose)]">Srividya (You)</h4>
              <p className="mt-2 text-xs uppercase tracking-widest text-[color:var(--ivory)]/50">Your beautiful traits</p>
              <ul className="mt-4 space-y-2 w-full text-left">
                {birthdayConfig.youAndMe.youTraits.map((trait, index) => (
                  <li key={index} className="flex items-center gap-3 text-sm text-[color:var(--ivory)]/90 font-serif-soft">
                    <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--rose)]" />
                    {trait}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Ajaykumar (Me) Card */}
            <motion.div
              initial={false}
              animate={{
                x: isUnited ? "-50%" : "0%",
                opacity: isUnited ? 0 : 1,
                scale: isUnited ? 0.9 : 1,
              }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="w-full md:w-1/2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 flex flex-col items-center shadow-lg text-center"
            >
              <div className="w-16 h-16 rounded-full bg-[color:var(--gold)]/20 border border-[color:var(--gold)]/30 flex items-center justify-center mb-4">
                <Heart className="h-6 w-6 text-[color:var(--gold)]" />
              </div>
              <h4 className="font-display text-2xl text-[color:var(--gold)]">Ajaykumar (Me)</h4>
              <p className="mt-2 text-xs uppercase tracking-widest text-[color:var(--ivory)]/50">My quiet promise</p>
              <ul className="mt-4 space-y-2 w-full text-left">
                {birthdayConfig.youAndMe.meTraits.map((trait, index) => (
                  <li key={index} className="flex items-center gap-3 text-sm text-[color:var(--ivory)]/90 font-serif-soft">
                    <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--gold)]" />
                    {trait}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Unite Cue Button (Only visible when split) */}
            <motion.div
              animate={{
                opacity: isUnited ? 0 : 1,
                scale: isUnited ? 0.8 : 1,
              }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden md:flex flex-col items-center justify-center cursor-pointer"
              onClick={handleUnite}
            >
              <div className="rounded-full bg-[color:var(--gold)]/20 backdrop-blur-md p-4 border border-[color:var(--gold)]/40 shadow-lg animate-pulse hover:scale-110 transition-transform">
                <Heart className="h-8 w-8 text-[color:var(--gold)] fill-current" />
              </div>
              <span className="mt-2 text-xs uppercase tracking-widest text-[color:var(--gold)]/80 font-semibold bg-black/40 px-3 py-1 rounded-full border border-[color:var(--gold)]/20">
                Unite Us
              </span>
            </motion.div>
          </div>
        </div>

        <p className="mt-6 text-sm uppercase tracking-widest text-[color:var(--gold)]/70 cursor-pointer hover:text-[color:var(--gold)] transition-colors" onClick={handleUnite}>
          {isUnited ? "Tap to split back to you & me" : "Tap to unite us together"}
        </p>
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
      badgeColor: "bg-[color:var(--rose)]/25 text-[color:var(--rose)] border-[color:var(--rose)]/30",
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
      badgeColor: "bg-[color:var(--gold)]/25 text-[color:var(--gold)] border-[color:var(--gold)]/30",
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
      badgeColor: "bg-[color:var(--mauve)]/25 text-[color:var(--mauve)] border-[color:var(--mauve)]/30",
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
        background:
          "linear-gradient(180deg, oklch(0.2 0.05 340) 0%, oklch(0.28 0.08 350) 100%)",
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
          Three dedicated cassettes, specifically curated for you. Click any cassette to play its song. Scrolling away will pause the player and restore the background theme music.
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
                      {isCurrentPlaying ? "🔊 Playing" : isSelected ? "⏸️ Selected" : "🎵 Dedication"}
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
      className="relative flex min-h-screen items-center justify-center overflow-hidden py-24 text-center"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(28,10,30,.85), rgba(60,20,55,.85)), url(${starsBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Stars count={80} />
      <Petals count={10} />

      <motion.div className="relative z-10 mx-auto max-w-3xl px-6">
        <p className="font-hand text-2xl text-[color:var(--gold)]">Make a wish</p>
        <h3 className="mt-2 font-display text-5xl text-[color:var(--ivory)] md:text-7xl">
          <span className="shimmer-text">Happy Birthday</span>
        </h3>
        <p className="mt-1 font-script text-5xl text-[color:var(--blush)] md:text-7xl">
          {birthdayConfig.herName}
        </p>

        <div className="relative mx-auto mt-10 w-[280px] md:w-[360px]">
          <img
            src={cake}
            alt="A pink birthday cake with candles"
            width={768}
            height={768}
            style={{ filter: "drop-shadow(0 20px 30px rgba(232,200,122,.35))" }}
          />
          {/* clickable candle hot-spots */}
          <div className="absolute inset-0 flex items-start justify-center gap-[10%] pt-[8%]">
            {candles.map((lit, i) => (
              <button
                key={i}
                onClick={() => lit && blow(i)}
                aria-label={`Blow out candle ${i + 1}`}
                className="relative h-[22%] w-[14%]"
              >
                {lit && (
                  <span
                    className="candle-flame absolute left-1/2 top-0 h-6 w-3 -translate-x-1/2 rounded-full"
                    style={{
                      background:
                        "radial-gradient(circle at 50% 60%, #fff7c2 0%, #ffd24c 50%, #ff7a3a 100%)",
                      boxShadow: "0 0 18px #ffb84d, 0 0 36px #ff7a3a",
                    }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-3 text-sm uppercase tracking-widest text-[color:var(--blush)]/70">
          Tap the flames to blow them out
        </p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
transition={{ duration: 1 }}
          className="mx-auto mt-12 max-w-2xl font-serif-soft text-2xl italic text-[color:var(--ivory)]/90 md:text-3xl"
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
  const outTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Clear any pending removal
            if (outTimer.current) clearTimeout(outTimer.current);
            // Load src only when needed
            if (!activeSrc) setActiveSrc(src);
            el.play().catch(() => {});
          } else {
            el.pause();
            // After 500ms out of viewport, clear src to release GPU memory
            outTimer.current = setTimeout(() => {
              setActiveSrc(null);
              setLoaded(false);
            }, 500);
          }
        });
      },
      { rootMargin: "100px 0px", threshold: 0.15 }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (outTimer.current) clearTimeout(outTimer.current);
    };
  }, [src, activeSrc]);

  return (
    <div className="relative w-full aspect-[9/16] max-h-[300px] overflow-hidden flex items-center justify-center bg-black">
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
        onLoadedData={() => setLoaded(true)}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 flex items-end justify-center pb-4 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
        <span className="font-hand text-sm text-white drop-shadow">Tap to open ♡</span>
      </div>
    </div>
  );
}

/* ===================== Scene 8: Gallery ===================== */
interface SceneGalleryProps {
  onVideoPlayStateChange?: (isPlaying: boolean) => void;
}

function SceneGallery({ onVideoPlayStateChange }: SceneGalleryProps) {
  const [active, setActive] = useState<number | null>(null);

  const handleClose = () => {
    setActive(null);
    onVideoPlayStateChange?.(false);
  };

  const activeItem = active !== null ? birthdayConfig.galleryItems[active] : null;
  const isVideo = activeItem?.type === "video";

  return (
    <section id="gallery" className="relative py-32" style={{ background: "var(--ivory)" }}>
      <div className="mx-auto max-w-6xl px-6 text-center">
        <p className="font-hand text-2xl text-[color:var(--rose)]">Forever page</p>
        <h3 className="mt-2 font-display text-5xl text-[color:var(--mauve)] md:text-6xl">
          Every moment with you is my favorite
        </h3>
        <div className="gold-divider mx-auto mt-6 w-32" />
        <p className="mt-4 font-serif-soft italic text-[color:var(--mauve)]/70">
          Come back here anytime, Sri. This page belongs to you.
        </p>
      </div>

      <div className="mx-auto mt-16 max-w-6xl columns-2 gap-4 px-6 md:columns-3 lg:columns-4">
        {birthdayConfig.galleryItems.map((item, i) => {
          const isItemVideo = item.type === "video";
          return (
            <motion.button
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (i % 4) * 0.05 }}
              onClick={() => setActive(i)}
              className="group mb-4 block w-full overflow-hidden rounded-xl border border-[color:var(--gold)]/10 bg-white/20 p-2 backdrop-blur hover:border-[color:var(--rose)]/40 transition-all duration-300 hover:shadow-[0_15px_30px_rgba(196,122,163,0.15)] cursor-pointer"
            >
              <div className="relative overflow-hidden rounded-lg bg-black/5">
                {isItemVideo ? (
                  <GalleryVideoCard src={item.url} />
                ) : (
                  <img
                    src={item.url}
                    alt={`Memory photo ${i + 1}`}
                    loading="lazy"
                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4 z-10">
                  <div className="flex items-center gap-2 text-white">
                    <Heart className="h-4 w-4 fill-white text-white" />
                    <span className="font-hand text-sm">{isItemVideo ? "Play Video" : "View Memory"}</span>
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {active !== null && activeItem && (
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
                boxShadow: "0 25px 60px -15px rgba(0,0,0,0.7)"
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
              <div className="relative overflow-hidden rounded-lg bg-neutral-900 shadow-inner flex items-center justify-center" style={{ maxHeight: "70vh" }}>
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
                    alt={`Memory ${active + 1}`}
                    className="w-full h-auto max-h-[60vh] object-contain rounded-sm"
                  />
                )}
              </div>

              {/* Polaroid Bottom Caption Area */}
              <div className="mt-4 md:mt-6 flex flex-col md:flex-row items-center justify-between gap-4 px-2">
                <div className="text-center md:text-left">
                  <p className="font-hand text-2xl text-[color:var(--mauve)]">
                    {isVideo ? `Video #${active + 1}` : `Memory #${active + 1}`}
                  </p>
                  <p className="font-serif-soft text-xs text-[color:var(--foreground)]/60 mt-1 uppercase tracking-wider">
                    {activeItem.url.split('/').pop()?.replace('_', ' #').replace('.mp4', '').replace('.jpg', '')}
                  </p>
                </div>
                
                {/* Download / Save Button */}
                <a
                  href={activeItem.url}
                  download={isVideo ? `sri-video-${active + 1}.mp4` : `sri-memory-${active + 1}.jpg`}
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

