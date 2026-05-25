import { useState } from "react";
import { ChevronLeft, ChevronRight, Play, Heart } from "lucide-react";

interface GalleryItem {
  type: "photo" | "video";
  url: string;
  aspectRatio: number;
}

interface Carousel3DProps {
  items: readonly GalleryItem[];
  onItemClick: (index: number) => void;
}

export function Carousel3D({ items, onItemClick }: Carousel3DProps) {
  const [rotation, setRotation] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const numElements = items.length;
  const anglePerItem = 360 / numElements;

  const handleNext = () => {
    setRotation((prev) => prev - anglePerItem);
  };

  const handlePrev = () => {
    setRotation((prev) => prev + anglePerItem);
  };

  return (
    <div className="relative w-full h-[550px] flex flex-col items-center justify-center select-none overflow-hidden my-12">
      {/* 3D Viewport Stage */}
      <div className="carousel-3d-stage">
        <div className="carousel-3d-wrapper" style={{ transform: `rotateY(${rotation}deg)` }}>
          {/* Loop items in a cylinder */}
          {items.map((item, index) => {
            const rotY = anglePerItem * index;
            // Radius of cylinder = width / (2 * sin(pi / N))
            // Approx radius for 60 elements = 170 / 0.1 = ~1700px.
            // Let's use a standard radius of 380px on desktop and 280px on mobile
            const radius = window.innerWidth < 640 ? 280 : 420;
            const style = {
              transform: `rotateY(${rotY}deg) translateZ(${radius}px)`,
              "--bg-url": `url('${item.url}')`,
            } as React.CSSProperties;

            return (
              <div
                key={index}
                className="carousel-3d-item group"
                style={style}
                onClick={() => onItemClick(index)}
              >
                <div className="carousel-3d-item-content relative flex items-center justify-center">
                  {item.type === "video" && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/0 transition-colors duration-300">
                      <div className="w-10 h-10 rounded-full bg-white/70 flex items-center justify-center shadow-lg group-hover:scale-110 transition duration-300">
                        <Play className="h-5 w-5 fill-current text-[color:var(--rose)] translate-x-[1px]" />
                      </div>
                    </div>
                  )}
                  {item.type === "photo" && (
                    <div className="absolute inset-0 bg-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Heart className="h-8 w-8 text-white/90 fill-current animate-pulse" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          <div className="carousel-3d-ground" />
        </div>
      </div>

      {/* Manual Control Buttons */}
      <div className="flex items-center gap-6 mt-12 z-10">
        <button
          onClick={handlePrev}
          className="w-12 h-12 rounded-full border border-[color:var(--gold)]/30 bg-[color:var(--ivory)]/20 hover:bg-[color:var(--rose)] hover:text-white transition-all shadow-md flex items-center justify-center text-[color:var(--rose)] hover:scale-105 active:scale-95 cursor-pointer"
          title="Previous"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <p className="font-serif-soft italic text-[color:var(--mauve)]/70 text-sm">
          Spin to browse old memories
        </p>
        <button
          onClick={handleNext}
          className="w-12 h-12 rounded-full border border-[color:var(--gold)]/30 bg-[color:var(--ivory)]/20 hover:bg-[color:var(--rose)] hover:text-white transition-all shadow-md flex items-center justify-center text-[color:var(--rose)] hover:scale-105 active:scale-95 cursor-pointer"
          title="Next"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}
