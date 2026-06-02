import React, { useEffect, useRef, useState } from 'react';

/**
 * Premium Custom Cursor — MBW Foods Edition
 * • A crisp glowing dot follows the exact cursor position
 * • A soft trailing ring lags behind with spring physics
 * • On hovering links / buttons: ring expands, changes colour, shows a fork-and-spoon icon
 * • Random mini food emoji "particles" burst out on click
 * • The native cursor is hidden site-wide
 */

const FOOD_PARTICLES = ['🍛', '🍜', '☕', '🍚', '🥘', '🫙', '🌶️', '🧆'];

export default function CustomCursor() {
  const dotRef   = useRef(null);   // precise dot
  const ringRef  = useRef(null);   // lagging outer ring
  const [isHover, setIsHover]       = useState(false);
  const [particles, setParticles]   = useState([]);          // click burst
  const pos      = useRef({ x: -200, y: -200 });             // current mouse
  const ringPos  = useRef({ x: -200, y: -200 });             // ring (lagged)
  const raf      = useRef(null);

  // ── spring physics for the ring ──────────────────────────────────────────
  useEffect(() => {
    const lerp = (a, b, t) => a + (b - a) * t;

    function animate() {
      ringPos.current.x = lerp(ringPos.current.x, pos.current.x, 0.12);
      ringPos.current.y = lerp(ringPos.current.y, pos.current.y, 0.12);

      if (dotRef.current) {
        dotRef.current.style.transform =
          `translate(${pos.current.x}px, ${pos.current.y}px) translate(-50%, -50%)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform =
          `translate(${ringPos.current.x}px, ${ringPos.current.y}px) translate(-50%, -50%)`;
      }
      raf.current = requestAnimationFrame(animate);
    }
    raf.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf.current);
  }, []);

  // ── mouse tracking ────────────────────────────────────────────────────────
  useEffect(() => {
    const onMove = (e) => {
      pos.current.x = e.clientX;
      pos.current.y = e.clientY;
    };

    // Detect hover over interactive elements
    const onEnter = (e) => {
      if (e.target.closest('a, button, [role="button"], input, select, textarea, label')) {
        setIsHover(true);
      }
    };
    const onLeave = () => setIsHover(false);

    window.addEventListener('mousemove', onMove);
    document.addEventListener('mouseover',  onEnter);
    document.addEventListener('mouseout',   onLeave);

    // Hide native cursor globally
    const style = document.createElement('style');
    style.id = 'custom-cursor-style';
    style.textContent = '*, *::before, *::after { cursor: none !important; }';
    document.head.appendChild(style);

    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover',  onEnter);
      document.removeEventListener('mouseout',   onLeave);
      document.getElementById('custom-cursor-style')?.remove();
    };
  }, []);

  // ── click burst particles ─────────────────────────────────────────────────
  useEffect(() => {
    const onClick = (e) => {
      const count = 6;
      const newParticles = Array.from({ length: count }, (_, i) => ({
        id:    Date.now() + i,
        x:     e.clientX,
        y:     e.clientY,
        emoji: FOOD_PARTICLES[Math.floor(Math.random() * FOOD_PARTICLES.length)],
        angle: (360 / count) * i + Math.random() * 30,
        dist:  60 + Math.random() * 60,
      }));
      setParticles(p => [...p, ...newParticles]);
      setTimeout(() => {
        setParticles(p => p.filter(px => !newParticles.find(n => n.id === px.id)));
      }, 800);
    };
    window.addEventListener('click', onClick);
    return () => window.removeEventListener('click', onClick);
  }, []);

  return (
    <>
      {/* ── Precise glowing dot ── */}
      <div
        ref={dotRef}
        style={{
          position:        'fixed',
          top:             0,
          left:            0,
          width:           isHover ? '10px' : '8px',
          height:          isHover ? '10px' : '8px',
          borderRadius:    '50%',
          background:      isHover
            ? 'var(--color-brand-accent, #f97316)'
            : 'var(--color-brand-primary, #f97316)',
          boxShadow:       `0 0 ${isHover ? 14 : 8}px 2px var(--color-brand-primary, #f97316)`,
          pointerEvents:   'none',
          zIndex:          99999,
          transition:      'width 0.2s, height 0.2s, box-shadow 0.2s, background 0.2s',
          willChange:      'transform',
        }}
      />

      {/* ── Lagging outer ring ── */}
      <div
        ref={ringRef}
        style={{
          position:       'fixed',
          top:            0,
          left:           0,
          width:          isHover ? '52px' : '36px',
          height:         isHover ? '52px' : '36px',
          borderRadius:   '50%',
          border:         `2px solid ${isHover
            ? 'var(--color-brand-accent, #f97316)'
            : 'rgba(249,115,22,0.55)'}`,
         // backdropFilter: isHover ? 'blur(2px)' : 'none',
          background:     isHover ? 'rgba(249,115,22,0.08)' : 'transparent',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          pointerEvents:  'none',
          zIndex:         99998,
          transition:     'width 0.25s cubic-bezier(.23,1,.32,1), height 0.25s cubic-bezier(.23,1,.32,1), border-color 0.25s, background 0.25s',
          willChange:     'transform',
        }}
      >
        {/* Fork & spoon icon shown on hover */}
        {isHover && (
          <span style={{ fontSize: '16px', lineHeight: 1, userSelect: 'none' }}>🍴</span>
        )}
      </div>

      {/* ── Click burst food particles ── */}
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position:       'fixed',
            top:            p.y,
            left:           p.x,
            fontSize:       '18px',
            lineHeight:     1,
            pointerEvents:  'none',
            zIndex:         99997,
            animation:      `mbw-particle 0.75s cubic-bezier(.23,1,.32,1) forwards`,
            '--angle':      `${p.angle}deg`,
            '--dist':       `${p.dist}px`,
            transform:      'translate(-50%, -50%)',
          }}
        >
          {p.emoji}
        </div>
      ))}

      {/* ── Particle keyframe injected inline ── */}
      <style>{`
        @keyframes mbw-particle {
          0%   { opacity: 1; transform: translate(-50%,-50%) rotate(var(--angle)) translateX(0);    }
          100% { opacity: 0; transform: translate(-50%,-50%) rotate(var(--angle)) translateX(var(--dist)) scale(0.4); }
        }
      `}</style>
    </>
  );
}
