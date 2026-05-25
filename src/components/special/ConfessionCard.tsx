import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, X } from "lucide-react";

interface ConfessionCardProps {
  onClose: () => void;
}

export function ConfessionCard({ onClose }: ConfessionCardProps) {
  const [step, setStep] = useState<"ask" | "loading" | "yes">("ask");
  const [noOffset, setNoOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleNoHover = () => {
    if (!containerRef.current) return;

    // Bounds restricted runaway: generate displacement within the container size
    const bounds = containerRef.current.getBoundingClientRect();
    const padding = 60;

    const maxX = bounds.width / 2 - padding;
    const maxY = bounds.height / 2 - padding;

    // Generate random position within constraints
    const x = (Math.random() - 0.5) * maxX * 2;
    const y = (Math.random() - 0.5) * maxY * 1.5;

    setNoOffset({ x, y });
  };

  const handleYesClick = () => {
    setStep("loading");
    setTimeout(() => {
      setStep("yes");
    }, 2800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <motion.div
        ref={containerRef}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-md bg-white rounded-2xl p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-[color:var(--gold)]/20 overflow-hidden flex flex-col items-center min-h-[440px] justify-center"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 transition p-1 bg-neutral-100 rounded-full cursor-pointer z-10"
        >
          <X className="h-5 w-5" />
        </button>

        <AnimatePresence mode="wait">
          {step === "ask" && (
            // Ask stage
            <motion.div
              key="ask-stage"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center text-center w-full"
            >
              {/* Question Video */}
              <div className="w-[160px] h-[160px] rounded-full overflow-hidden border-2 border-[color:var(--rose)]/20 mb-6 bg-neutral-100">
                <video
                  src="/videos/reply_me_love.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>

              <h3 className="font-display text-2xl md:text-3xl text-[color:var(--mauve)] font-bold mb-8">
                Do you love me? 🙈
              </h3>

              {/* Action Buttons */}
              <div className="relative flex justify-center items-center gap-6 min-h-[60px] w-full z-10">
                <button
                  onClick={handleYesClick}
                  className="px-8 py-2 bg-[color:var(--rose)] text-white font-semibold rounded-full hover:bg-[color:var(--mauve)] transition shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
                >
                  Yes!
                </button>

                <motion.button
                  onMouseEnter={handleNoHover}
                  onTouchStart={handleNoHover}
                  animate={noOffset}
                  transition={{ type: "spring", stiffness: 200, damping: 14 }}
                  className="px-8 py-2 bg-neutral-200 text-neutral-600 font-semibold rounded-full border border-neutral-300 transition shadow"
                  style={{
                    position: noOffset.x === 0 && noOffset.y === 0 ? "relative" : "absolute",
                  }}
                >
                  No
                </motion.button>
              </div>
            </motion.div>
          )}

          {step === "loading" && (
            // Beating heart loading stage
            <motion.div
              key="loading-stage"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center text-center py-10"
            >
              <div className="heart-spinner mb-6">
                <span className="heart-spinnerL"></span>
                <span className="heart-spinnerR"></span>
              </div>
              <p className="font-hand text-2xl text-[color:var(--rose)] animate-pulse">
                Holding my breath...
              </p>
            </motion.div>
          )}

          {step === "yes" && (
            // Confessed stage
            <motion.div
              key="yes-stage"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 100 }}
              className="flex flex-col items-center text-center w-full"
            >
              {/* Confessed Video */}
              <div className="w-[180px] h-[180px] rounded-2xl overflow-hidden border-2 border-[color:var(--rose)]/30 mb-6 shadow-lg bg-neutral-100">
                <video
                  src="/videos/love_me.mp4"
                  autoPlay
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>

              <h3 className="font-display text-2xl md:text-3xl text-[color:var(--rose)] font-bold mb-4">
                I knew it! 😍
              </h3>
              <p className="font-serif-soft italic text-[color:var(--foreground)]/80 leading-relaxed mb-6">
                "No matter where life takes us, remember that I carry a piece of your world in
                mine."
              </p>

              <button
                onClick={onClose}
                className="px-6 py-2 border border-[color:var(--rose)] text-[color:var(--rose)] font-medium rounded-full hover:bg-[color:var(--rose)] hover:text-white transition cursor-pointer"
              >
                Close with Love ♡
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
