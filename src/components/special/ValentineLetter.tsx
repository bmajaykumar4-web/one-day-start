import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";

interface ValentineLetterProps {
  onOpen: () => void;
}

export function ValentineLetter({ onOpen }: ValentineLetterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [noOffset, setNoOffset] = useState({ x: 0, y: 0 });
  const [yesClicked, setYesClicked] = useState(false);

  const handleNoHover = () => {
    // Generate a random jump of 120px to 200px in a random angle
    const min = 120;
    const max = 200;
    const distance = Math.random() * (max - min) + min;
    const angle = Math.random() * Math.PI * 2;
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;
    setNoOffset({ x, y });
  };

  const handleYesClick = () => {
    setYesClicked(true);
    // Let the happy animation run for 1.8s before triggering transition
    setTimeout(onOpen, 1800);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <AnimatePresence mode="wait">
        {!isOpen ? (
          // Sealed Envelope Stage
          <motion.div
            key="envelope"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0, y: -40 }}
            transition={{ type: "spring", stiffness: 120 }}
            className="flex flex-col items-center cursor-pointer group"
            onClick={() => setIsOpen(true)}
          >
            <div className="relative w-[280px] md:w-[340px] aspect-[4/3] drop-shadow-2xl">
              <img
                src="/photos/valentine_envelope.png"
                alt="Sealed Envelope"
                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105 group-hover:rotate-1"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Heart className="h-10 w-10 text-[color:var(--rose)] fill-current animate-pulse drop-shadow" />
              </div>
            </div>
            <p className="mt-8 font-hand text-3xl text-[color:var(--gold)] animate-bounce">
              Tap the envelope, Sri 💌
            </p>
          </motion.div>
        ) : (
          // Letter Window Stage
          <motion.div
            key="letter"
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="paper-texture w-[90vw] max-w-md rounded-2xl border border-[color:var(--gold)]/30 bg-[color:var(--ivory)]/95 p-6 md:p-8 text-center shadow-2xl relative"
            style={{
              backgroundImage: "url('/photos/valentine_window.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="bg-[color:var(--ivory)]/90 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-[color:var(--gold)]/10">
              <h2 className="font-display text-2xl md:text-3xl text-[color:var(--mauve)] font-semibold">
                {yesClicked ? "Yippeeee! 🎉" : "Hey Srividya… 💗"}
              </h2>

              {/* GIF Preview */}
              <div className="mx-auto my-6 w-[180px] h-[180px] rounded-lg overflow-hidden border-2 border-[color:var(--rose)]/20 shadow-inner flex items-center justify-center bg-white">
                <img
                  src={yesClicked ? "/photos/cat_dance.gif" : "/photos/cat_heart.gif"}
                  alt="Cute Animation"
                  className="w-full h-full object-cover"
                />
              </div>

              {!yesClicked ? (
                <>
                  <p className="font-serif-soft text-base md:text-lg text-[color:var(--foreground)] leading-relaxed italic mb-8">
                    "I have built a little world just for you. Will you come inside and open it?"
                  </p>

                  {/* Yes & No Buttons */}
                  <div className="relative flex justify-center items-center gap-6 min-h-[60px] w-full">
                    {/* Yes Button */}
                    <button
                      onClick={handleYesClick}
                      className="px-6 py-2 bg-[color:var(--rose)] text-white font-medium rounded-full hover:bg-[color:var(--mauve)] transition shadow-[0_4px_12px_rgba(196,122,163,0.3)] hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2"
                    >
                      <img src="/photos/valentine_yes.png" alt="" className="h-4 w-4" />
                      Yes, show me!
                    </button>

                    {/* Runaway No Button */}
                    <motion.button
                      onMouseEnter={handleNoHover}
                      onTouchStart={handleNoHover}
                      animate={noOffset}
                      transition={{ type: "spring", stiffness: 180, damping: 15 }}
                      className="px-6 py-2 bg-neutral-200 text-neutral-600 font-medium rounded-full border border-neutral-300 transition shadow cursor-pointer flex items-center gap-2"
                      style={{
                        position: noOffset.x === 0 && noOffset.y === 0 ? "relative" : "absolute",
                      }}
                    >
                      <img src="/photos/valentine_no.png" alt="" className="h-4 w-4" />
                      No
                    </motion.button>
                  </div>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-6"
                >
                  <p className="font-hand text-2xl text-[color:var(--rose)] animate-pulse">
                    Opening your little world now... ♡
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
