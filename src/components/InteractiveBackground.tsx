import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  alpha: number;
  maxAlpha: number;
  twinkleSpeed: number;
}

interface CircuitTrace {
  x: number;
  y: number;
  length: number;
  horizontal: boolean;
  progress: number;
  speed: number;
  color: string;
}

interface Drone {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  angle: number;
  type: 'drone' | 'satellite';
}

interface PulseWave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export const InteractiveBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse state with smooth lerp
    const mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
      vx: 0,
      vy: 0,
    };

    // Resize listener
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Mouse move listener
    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };

    // Click listener for particle explosion & pulse wave
    const handleClick = (e: MouseEvent) => {
      const clickX = e.clientX;
      const clickY = e.clientY;

      // Add AI Pulse Wave
      pulseWaves.push({
        x: clickX,
        y: clickY,
        radius: 5,
        maxRadius: Math.max(width, height) * 0.4,
        alpha: 0.9,
        color: '#f59e0b', // Amber pulse
      });

      // Add Particle Explosion (Sparks)
      const colors = ['#f59e0b', '#38bdf8', '#c084fc', '#10b981', '#f43f5e'];
      for (let i = 0; i < 28; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 6 + 2;
        sparks.push({
          x: clickX,
          y: clickY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0,
          maxLife: Math.random() * 30 + 20,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 3 + 2,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);

    // Initialize 1: Dynamic Stars
    const stars: Star[] = [];
    const starCount = Math.floor((width * height) / 12000);
    for (let i = 0; i < Math.max(50, starCount); i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.8 + 0.5,
        speedX: (Math.random() - 0.5) * 0.15,
        speedY: (Math.random() - 0.5) * 0.15,
        alpha: Math.random(),
        maxAlpha: Math.random() * 0.7 + 0.3,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
      });
    }

    // Initialize 2: Circuit Traces
    const traces: CircuitTrace[] = [];
    for (let i = 0; i < 14; i++) {
      traces.push({
        x: Math.random() * width,
        y: Math.random() * height,
        length: Math.random() * 180 + 80,
        horizontal: Math.random() > 0.5,
        progress: Math.random(),
        speed: Math.random() * 0.005 + 0.002,
        color: Math.random() > 0.4 ? 'rgba(56, 189, 248, 0.4)' : 'rgba(245, 158, 11, 0.4)',
      });
    }

    // Initialize 3: Floating Drones & Satellites
    const drones: Drone[] = [
      { x: width * 0.2, y: height * 0.25, vx: 0.4, vy: 0.2, size: 14, angle: 0, type: 'drone' },
      { x: width * 0.8, y: height * 0.35, vx: -0.3, vy: 0.15, size: 18, angle: 0.5, type: 'satellite' },
      { x: width * 0.5, y: height * 0.75, vx: 0.2, vy: -0.3, size: 12, angle: 1.2, type: 'drone' },
    ];

    // Pulse waves & Sparks collections
    const pulseWaves: PulseWave[] = [];
    const sparks: Spark[] = [];

    // Periodic AI Pulse Wave from center/random
    let pulseTimer = 0;

    // Radar Sweep Angle
    let radarAngle = 0;

    // Main Animation Render Loop
    const render = () => {
      // 1. Smooth lerp mouse physics
      const dx = mouse.targetX - mouse.x;
      const dy = mouse.targetY - mouse.y;
      mouse.x += dx * 0.06;
      mouse.y += dy * 0.06;
      mouse.vx = dx * 0.06;
      mouse.vy = dy * 0.06;

      ctx.clearRect(0, 0, width, height);

      // Parallax Offset from mouse center
      const offsetX = (mouse.x - width / 2) * 0.02;
      const offsetY = (mouse.y - height / 2) * 0.02;

      // -------------------------------------------------------------
      // LAYER 1: Moving Nebula & Aurora Glow Gradients
      // -------------------------------------------------------------
      const time = Date.now() * 0.0005;

      // Aurora Gradient 1 (Cyan/Blue)
      const grad1X = width * 0.3 + Math.sin(time) * 100 + offsetX * 2;
      const grad1Y = height * 0.3 + Math.cos(time * 0.8) * 80 + offsetY * 2;
      const aurora1 = ctx.createRadialGradient(grad1X, grad1Y, 10, grad1X, grad1Y, width * 0.5);
      aurora1.addColorStop(0, 'rgba(14, 165, 233, 0.08)');
      aurora1.addColorStop(0.5, 'rgba(99, 102, 241, 0.04)');
      aurora1.addColorStop(1, 'transparent');
      ctx.fillStyle = aurora1;
      ctx.fillRect(0, 0, width, height);

      // Aurora Gradient 2 (Amber/Gold Nebula)
      const grad2X = width * 0.7 + Math.cos(time * 0.7) * 120 - offsetX * 2;
      const grad2Y = height * 0.6 + Math.sin(time * 0.9) * 90 - offsetY * 2;
      const aurora2 = ctx.createRadialGradient(grad2X, grad2Y, 10, grad2X, grad2Y, width * 0.45);
      aurora2.addColorStop(0, 'rgba(245, 158, 11, 0.07)');
      aurora2.addColorStop(0.6, 'rgba(168, 85, 247, 0.03)');
      aurora2.addColorStop(1, 'transparent');
      ctx.fillStyle = aurora2;
      ctx.fillRect(0, 0, width, height);

      // -------------------------------------------------------------
      // LAYER 2: Holographic Grid Lines with Parallax Tilt
      // -------------------------------------------------------------
      ctx.save();
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.15)';
      ctx.lineWidth = 1;
      const gridSize = 48;
      const gridOffsetX = (offsetX * 1.5) % gridSize;
      const gridOffsetY = (offsetY * 1.5) % gridSize;

      ctx.beginPath();
      for (let x = gridOffsetX; x < width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = gridOffsetY; y < height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();
      ctx.restore();

      // -------------------------------------------------------------
      // LAYER 3: Circuit Traces (Glowing energy signals along grid)
      // -------------------------------------------------------------
      ctx.save();
      traces.forEach((t) => {
        t.progress += t.speed;
        if (t.progress > 1) {
          t.progress = 0;
          t.x = Math.random() * width;
          t.y = Math.random() * height;
        }

        const headX = t.horizontal ? t.x + t.length * t.progress : t.x;
        const headY = t.horizontal ? t.y : t.y + t.length * t.progress;

        const grad = ctx.createLinearGradient(
          t.horizontal ? headX - t.length * 0.4 : headX,
          t.horizontal ? headY : headY - t.length * 0.4,
          headX,
          headY
        );
        grad.addColorStop(0, 'transparent');
        grad.addColorStop(1, t.color);

        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.beginPath();
        if (t.horizontal) {
          ctx.moveTo(headX - t.length * 0.4, headY);
          ctx.lineTo(headX, headY);
        } else {
          ctx.moveTo(headX, headY - t.length * 0.4);
          ctx.lineTo(headX, headY);
        }
        ctx.stroke();

        // Glowing Signal Head Node
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(headX, headY, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      // -------------------------------------------------------------
      // LAYER 4: Dynamic Twinkling Stars
      // -------------------------------------------------------------
      ctx.save();
      stars.forEach((star) => {
        star.x += star.speedX + offsetX * 0.02;
        star.y += star.speedY + offsetY * 0.02;

        // Wrap edges
        if (star.x < 0) star.x = width;
        if (star.x > width) star.x = 0;
        if (star.y < 0) star.y = height;
        if (star.y > height) star.y = 0;

        // Twinkle opacity oscillation
        star.alpha += star.twinkleSpeed;
        if (star.alpha > star.maxAlpha || star.alpha < 0.1) {
          star.twinkleSpeed = -star.twinkleSpeed;
        }

        ctx.fillStyle = `rgba(241, 245, 249, ${Math.max(0, star.alpha)})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      // -------------------------------------------------------------
      // LAYER 5: Radar Sweeps (Subtle detective scanner circle)
      // -------------------------------------------------------------
      radarAngle += 0.015;
      const radarCenterX = width * 0.85 + offsetX;
      const radarCenterY = height * 0.25 + offsetY;
      const radarRadius = 90;

      ctx.save();
      // Radar Outer Ring
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(radarCenterX, radarCenterY, radarRadius, 0, Math.PI * 2);
      ctx.arc(radarCenterX, radarCenterY, radarRadius * 0.5, 0, Math.PI * 2);
      ctx.stroke();

      // Radar Rotating Wedge Beam
      ctx.beginPath();
      ctx.moveTo(radarCenterX, radarCenterY);
      ctx.arc(
        radarCenterX,
        radarCenterY,
        radarRadius,
        radarAngle,
        radarAngle + Math.PI * 0.25
      );
      ctx.closePath();
      const radarGrad = ctx.createRadialGradient(
        radarCenterX,
        radarCenterY,
        0,
        radarCenterX,
        radarCenterY,
        radarRadius
      );
      radarGrad.addColorStop(0, 'rgba(56, 189, 248, 0.25)');
      radarGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = radarGrad;
      ctx.fill();
      ctx.restore();

      // -------------------------------------------------------------
      // LAYER 6: Floating Drones & Satellites
      // -------------------------------------------------------------
      ctx.save();
      drones.forEach((d) => {
        d.x += d.vx + offsetX * 0.05;
        d.y += d.vy + offsetY * 0.05;
        d.angle += 0.01;

        // Bounce boundaries
        if (d.x < 50 || d.x > width - 50) d.vx = -d.vx;
        if (d.y < 50 || d.y > height - 50) d.vy = -d.vy;

        ctx.save();
        ctx.translate(d.x, d.y);
        ctx.rotate(d.angle);

        if (d.type === 'drone') {
          // Sci-Fi Drone Body
          ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(-d.size / 2, -d.size / 2, d.size, d.size);

          // Rotors
          ctx.fillStyle = 'rgba(56, 189, 248, 0.8)';
          ctx.beginPath();
          ctx.arc(-d.size / 2, -d.size / 2, 3, 0, Math.PI * 2);
          ctx.arc(d.size / 2, -d.size / 2, 3, 0, Math.PI * 2);
          ctx.arc(-d.size / 2, d.size / 2, 3, 0, Math.PI * 2);
          ctx.arc(d.size / 2, d.size / 2, 3, 0, Math.PI * 2);
          ctx.fill();

          // Blinking Center LED
          ctx.fillStyle = Math.sin(time * 10) > 0 ? '#f59e0b' : '#38bdf8';
          ctx.beginPath();
          ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Satellite Solar Panels & Lens
          ctx.strokeStyle = 'rgba(192, 132, 252, 0.7)';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(-d.size, -3, d.size * 2, 6);

          ctx.fillStyle = 'rgba(56, 189, 248, 0.7)';
          ctx.fillRect(-4, -d.size / 2, 8, d.size);

          // Sensor Glow
          ctx.fillStyle = '#c084fc';
          ctx.beginPath();
          ctx.arc(0, 0, 3, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });
      ctx.restore();

      // -------------------------------------------------------------
      // LAYER 7: AI Pulse Waves (Concentric shockwave rings)
      // -------------------------------------------------------------
      pulseTimer++;
      if (pulseTimer > 280) {
        pulseTimer = 0;
        pulseWaves.push({
          x: mouse.x,
          y: mouse.y,
          radius: 10,
          maxRadius: Math.min(width, height) * 0.35,
          alpha: 0.8,
          color: '#38bdf8',
        });
      }

      ctx.save();
      for (let i = pulseWaves.length - 1; i >= 0; i--) {
        const p = pulseWaves[i];
        p.radius += 4;
        p.alpha -= 0.012;

        if (p.alpha <= 0 || p.radius >= p.maxRadius) {
          pulseWaves.splice(i, 1);
          continue;
        }

        ctx.strokeStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();

      // -------------------------------------------------------------
      // LAYER 8: Particle Explosions (Sparks from click / interactions)
      // -------------------------------------------------------------
      ctx.save();
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vx *= 0.96;
        s.vy *= 0.96;
        s.life++;

        if (s.life >= s.maxLife) {
          sparks.splice(i, 1);
          continue;
        }

        const opacity = 1 - s.life / s.maxLife;
        ctx.fillStyle = s.color;
        ctx.globalAlpha = opacity;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * opacity, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      animFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      cancelAnimationFrame(animFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 block w-full h-full"
    />
  );
};
