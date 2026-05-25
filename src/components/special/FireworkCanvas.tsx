import { useEffect, useRef } from "react";

interface FireworkCanvasProps {
  active: boolean;
}

export function FireworkCanvas({ active }: FireworkCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Handle resize
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Classes for Fireworks and Particles
    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      alpha: number;
      decay: number;
      color: string;
      gravity: number;
      friction: number;

      constructor(x: number, y: number, color: string) {
        this.x = x;
        this.y = y;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 2;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.alpha = 1;
        this.decay = Math.random() * 0.015 + 0.01;
        this.color = color;
        this.gravity = 0.06;
        this.friction = 0.98;
      }

      update() {
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= this.decay;
      }

      draw(c: CanvasRenderingContext2D) {
        c.save();
        c.globalAlpha = this.alpha;
        c.beginPath();
        c.arc(this.x, this.y, Math.random() * 2 + 1, 0, Math.PI * 2);
        c.fillStyle = this.color;
        c.shadowBlur = 6;
        c.shadowColor = this.color;
        c.fill();
        c.restore();
      }
    }

    class Firework {
      x: number;
      y: number;
      tx: number; // target X
      ty: number; // target Y
      vx: number;
      vy: number;
      color: string;
      exploded: boolean;
      particles: Particle[];

      constructor() {
        this.x = Math.random() * width;
        this.y = height;
        this.tx = Math.random() * width;
        this.ty = Math.random() * (height * 0.5) + height * 0.1;
        const angle = Math.atan2(this.ty - this.y, this.tx - this.x);
        const speed = Math.random() * 8 + 8;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.color = `hsl(${Math.random() * 360}, 100%, 70%)`;
        this.exploded = false;
        this.particles = [];
      }

      update() {
        if (!this.exploded) {
          this.x += this.vx;
          this.y += this.vy;

          // Check if it reached the height target
          if (this.vy >= 0 || this.y <= this.ty) {
            this.exploded = true;
            this.explode();
          }
        } else {
          for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update();
            if (this.particles[i].alpha <= 0) {
              this.particles.splice(i, 1);
            }
          }
        }
      }

      explode() {
        const count = Math.floor(Math.random() * 60 + 50);
        for (let i = 0; i < count; i++) {
          this.particles.push(new Particle(this.x, this.y, this.color));
        }
      }

      draw(c: CanvasRenderingContext2D) {
        if (!this.exploded) {
          c.save();
          c.beginPath();
          c.arc(this.x, this.y, 3, 0, Math.PI * 2);
          c.fillStyle = this.color;
          c.shadowBlur = 8;
          c.shadowColor = this.color;
          c.fill();
          c.restore();
        } else {
          for (const p of this.particles) {
            p.draw(c);
          }
        }
      }
    }

    const fireworks: Firework[] = [];
    let frame = 0;

    // Launch rate: launch a firework every 35 frames
    const loop = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
      ctx.fillRect(0, 0, width, height);

      // Launch new firework
      if (frame % 35 === 0 && fireworks.length < 12) {
        fireworks.push(new Firework());
      }

      for (let i = fireworks.length - 1; i >= 0; i--) {
        fireworks[i].update();
        fireworks[i].draw(ctx);

        // Remove if exploded and all particles faded
        if (fireworks[i].exploded && fireworks[i].particles.length === 0) {
          fireworks.splice(i, 1);
        }
      }

      frame++;
      animationFrameId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-50 pointer-events-none w-screen h-screen"
      style={{ mixBlendMode: "screen" }}
    />
  );
}
