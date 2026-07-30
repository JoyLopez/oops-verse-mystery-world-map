import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
}

export const CustomCursor: React.FC = () => {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [targetPos, setTargetPos] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isTargetLocked, setIsTargetLocked] = useState(false);
  const [targetBounds, setTargetBounds] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const requestRef = useRef<number | null>(null);
  const particleIdRef = useRef<number>(0);
  const rippleIdRef = useRef<number>(0);
  const prevPosRef = useRef({ x: -100, y: -100 });

  useEffect(() => {
    // Check if pointer device is touch
    if (window.matchMedia('(pointer: coarse)').matches) {
      setIsTouchDevice(true);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      // Check if hovering interactive element
      const target = e.target as HTMLElement | null;
      const interactiveEl = target?.closest('button, a, input, select, textarea, [role="button"], .cursor-pointer');

      if (interactiveEl) {
        setIsHovered(true);
        const rect = interactiveEl.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Apply magnetic pull (30% pull toward center)
        const magnetX = mouseX + (centerX - mouseX) * 0.35;
        const magnetY = mouseY + (centerY - mouseY) * 0.35;

        setTargetPos({ x: magnetX, y: magnetY });
        setIsTargetLocked(true);
        setTargetBounds({
          x: rect.left,
          y: rect.top,
          w: rect.width,
          h: rect.height,
        });
      } else {
        setIsHovered(false);
        setIsTargetLocked(false);
        setTargetBounds(null);
        setTargetPos({ x: mouseX, y: mouseY });
      }

      // Generate particle trail on move
      const distMoved = Math.hypot(mouseX - prevPosRef.current.x, mouseY - prevPosRef.current.y);
      if (distMoved > 8) {
        prevPosRef.current = { x: mouseX, y: mouseY };

        const colors = ['#f59e0b', '#38bdf8', '#c084fc', '#fbbf24'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        
        const newParticle: Particle = {
          id: particleIdRef.current++,
          x: mouseX + (Math.random() - 0.5) * 12,
          y: mouseY + (Math.random() - 0.5) * 12,
          size: Math.random() * 5 + 3,
          color: randomColor,
        };

        setParticles((prev) => [...prev.slice(-16), newParticle]);
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      setIsClicking(true);
      const newRipple: Ripple = {
        id: rippleIdRef.current++,
        x: e.clientX,
        y: e.clientY,
      };
      setRipples((prev) => [...prev.slice(-5), newRipple]);
    };

    const handleMouseUp = () => {
      setIsClicking(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Smooth interpolation loop for cursor movement
  useEffect(() => {
    if (isTouchDevice) return;

    const updateLoop = () => {
      setPos((prev) => ({
        x: prev.x + (targetPos.x - prev.x) * 0.25,
        y: prev.y + (targetPos.y - prev.y) * 0.25,
      }));

      requestRef.current = requestAnimationFrame(updateLoop);
    };

    requestRef.current = requestAnimationFrame(updateLoop);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [targetPos, isTouchDevice]);

  // Particle cleanup timer
  useEffect(() => {
    if (particles.length === 0) return;
    const timer = setTimeout(() => {
      setParticles((prev) => prev.slice(1));
    }, 400);
    return () => clearTimeout(timer);
  }, [particles]);

  // Ripple cleanup timer
  useEffect(() => {
    if (ripples.length === 0) return;
    const timer = setTimeout(() => {
      setRipples((prev) => prev.slice(1));
    }, 600);
    return () => clearTimeout(timer);
  }, [ripples]);

  if (isTouchDevice) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {/* 1. Dynamic Ambient Light Glow */}
      <div
        className="absolute w-96 h-96 rounded-full opacity-25 blur-3xl transition-transform duration-75 ease-out"
        style={{
          transform: `translate(${pos.x - 192}px, ${pos.y - 192}px)`,
          background: isTargetLocked
            ? 'radial-gradient(circle, rgba(245, 158, 11, 0.4) 0%, rgba(56, 189, 248, 0.2) 50%, transparent 70%)'
            : 'radial-gradient(circle, rgba(56, 189, 248, 0.3) 0%, rgba(192, 132, 252, 0.15) 50%, transparent 70%)',
        }}
      />

      {/* 2. Particle Trail */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0.9, scale: 1 }}
          animate={{ opacity: 0, scale: 0.2, y: p.y - 15 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="absolute rounded-full shadow-lg"
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            boxShadow: `0 0 10px ${p.color}`,
          }}
        />
      ))}

      {/* 3. Ripple Click Animations */}
      <AnimatePresence>
        {ripples.map((r) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0.9, scale: 0.2 }}
            animate={{ opacity: 0, scale: 2.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="absolute rounded-full border-2 border-amber-400 shadow-[0_0_20px_#f59e0b]"
            style={{
              left: r.x - 24,
              top: r.y - 24,
              width: 48,
              height: 48,
            }}
          />
        ))}
      </AnimatePresence>

      {/* 4. Target Lock Frame (When hovering clickable buttons) */}
      {isTargetLocked && targetBounds && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="absolute rounded-xl border-2 border-amber-400/80 shadow-[0_0_15px_rgba(245,158,11,0.4)] pointer-events-none"
          style={{
            left: targetBounds.x - 6,
            top: targetBounds.y - 6,
            width: targetBounds.w + 12,
            height: targetBounds.h + 12,
          }}
        >
          {/* Holographic Target Corners */}
          <div className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t-2 border-l-2 border-amber-300" />
          <div className="absolute -top-1.5 -right-1.5 w-3 h-3 border-t-2 border-r-2 border-amber-300" />
          <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b-2 border-l-2 border-amber-300" />
          <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b-2 border-r-2 border-amber-300" />
        </motion.div>
      )}

      {/* 5. Holographic Outer Pulsing Reticle Ring */}
      <motion.div
        animate={{
          scale: isClicking ? 0.7 : isHovered ? 1.6 : 1,
          rotate: isHovered ? 180 : 0,
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className={`absolute rounded-full border-2 flex items-center justify-center transition-colors duration-200 ${
          isHovered
            ? 'border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.8)] bg-amber-500/10'
            : 'border-cyan-400/70 shadow-[0_0_12px_rgba(56,189,248,0.5)] bg-cyan-500/5'
        }`}
        style={{
          left: pos.x - 20,
          top: pos.y - 20,
          width: 40,
          height: 40,
        }}
      >
        {/* Holographic Crosshair ticks */}
        <div className="absolute top-0 w-0.5 h-1.5 bg-amber-400/80" />
        <div className="absolute bottom-0 w-0.5 h-1.5 bg-amber-400/80" />
        <div className="absolute left-0 h-0.5 w-1.5 bg-amber-400/80" />
        <div className="absolute right-0 h-0.5 w-1.5 bg-amber-400/80" />
      </motion.div>

      {/* 6. Sharp Core Point */}
      <motion.div
        animate={{
          scale: isClicking ? 1.8 : isHovered ? 1.3 : 1,
        }}
        className={`absolute rounded-full shadow-md ${
          isHovered ? 'bg-amber-300 shadow-[0_0_10px_#f59e0b]' : 'bg-cyan-300 shadow-[0_0_10px_#38bdf8]'
        }`}
        style={{
          left: pos.x - 3,
          top: pos.y - 3,
          width: 6,
          height: 6,
        }}
      />
    </div>
  );
};
