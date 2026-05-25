import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TrailHeart {
  id: number;
  x: number;
  y: number;
  size: number;
  rotate: number;
}

export function CursorTrail() {
  const [hearts, setHearts] = useState<TrailHeart[]>([]);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let idCounter = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - lastPos.x;
      const dy = e.clientY - lastPos.y;
      const distance = Math.hypot(dx, dy);

      // Only spawn a heart if mouse has moved at least 35px
      if (distance > 35) {
        const size = Math.random() * 12 + 10; // 10px to 22px
        const rotate = Math.random() * 60 - 30; // -30deg to 30deg

        const newHeart: TrailHeart = {
          id: idCounter++,
          x: e.clientX,
          y: e.clientY + window.scrollY, // Adjust for page scroll
          size,
          rotate,
        };

        setHearts((prev) => [...prev.slice(-15), newHeart]); // Cap at 15 items on screen
        setLastPos({ x: e.clientX, y: e.clientY });

        // Auto remove after 800ms
        const idToRemove = newHeart.id;
        setTimeout(() => {
          setHearts((prev) => prev.filter((h) => h.id !== idToRemove));
        }, 800);
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [lastPos]);

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-[9999]">
      <AnimatePresence>
        {hearts.map((h) => (
          <motion.div
            key={h.id}
            initial={{ opacity: 0.8, scale: 0.5, x: h.x, y: h.y }}
            animate={{ opacity: 0, scale: [0.8, 1.2, 0.4], y: h.y - 40 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: h.size,
              height: h.size,
              transform: `translate(-50%, -50%) rotate(${h.rotate}deg)`,
              color: "rgba(242, 167, 187, 0.7)", // var(--rose) with transparency
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-full h-full drop-shadow-[0_0_4px_rgba(242,167,187,0.8)]"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
