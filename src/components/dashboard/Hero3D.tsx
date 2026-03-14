"use client";

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap-setup';

export default function Hero3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const boxesRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hero-content > *", {
        y: 40,
        opacity: 0,
        stagger: 0.12,
        duration: 0.9,
        ease: "power3.out"
      });

      boxesRef.current.forEach((box, i) => {
        if (!box) return;
        gsap.set(box, {
          x: `+=${Math.random() * 380 - 190}`,
          y: `+=${Math.random() * 180 - 90}`,
          rotationX: Math.random() * 360,
          rotationY: Math.random() * 360,
          rotationZ: Math.random() * 45,
        });
        gsap.to(box, {
          y: `+=${Math.random() * 60 + 40}`,
          rotationX: `+=${Math.random() * 120 + 80}`,
          rotationY: `+=${Math.random() * 120 + 80}`,
          duration: Math.random() * 12 + 10,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: -Math.random() * 12
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const boxColors = [
    { border: 'rgba(99,102,241,0.5)', bg: 'rgba(99,102,241,0.08)', shadow: '0 0 30px rgba(99,102,241,0.25)' },
    { border: 'rgba(168,85,247,0.5)', bg: 'rgba(168,85,247,0.08)', shadow: '0 0 30px rgba(168,85,247,0.25)' },
    { border: 'rgba(6,182,212,0.5)', bg: 'rgba(6,182,212,0.08)', shadow: '0 0 30px rgba(6,182,212,0.2)' },
    { border: 'rgba(99,102,241,0.4)', bg: 'rgba(99,102,241,0.06)', shadow: '0 0 25px rgba(99,102,241,0.2)' },
    { border: 'rgba(168,85,247,0.4)', bg: 'rgba(168,85,247,0.06)', shadow: '0 0 25px rgba(168,85,247,0.2)' },
    { border: 'rgba(99,102,241,0.35)', bg: 'rgba(99,102,241,0.05)', shadow: 'none' },
  ];

  return (
    <div
      ref={containerRef}
      className="w-full h-[260px] md:h-[310px] rounded-2xl overflow-hidden relative mb-8"
      style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 30%, #4c1d95 60%, #2e1065 100%)',
        boxShadow: '0 20px 60px rgba(99,102,241,0.35), 0 8px 20px rgba(0,0,0,0.2)',
      }}
    >
      {/* Animated mesh gradient overlay */}
      <div className="absolute inset-0 opacity-40" style={{
        background: 'radial-gradient(ellipse 80% 70% at 70% 50%, rgba(168,85,247,0.5) 0%, transparent 60%), radial-gradient(ellipse 50% 60% at 10% 80%, rgba(6,182,212,0.3) 0%, transparent 50%)'
      }} />

      {/* Grid lines */}
      <div className="hero-bg absolute inset-0 opacity-10" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />

      {/* 3D Boxes */}
      <div className="absolute right-0 top-0 w-2/3 h-full pointer-events-none" style={{ perspective: '900px', transformStyle: 'preserve-3d' }}>
        {boxColors.map((color, i) => (
          <div
            key={i}
            ref={(el) => { if (el) boxesRef.current[i] = el; }}
            className="absolute top-1/2 left-1/2 w-16 h-16"
            style={{
              transformStyle: 'preserve-3d',
              marginLeft: '-2rem',
              marginTop: '-2rem',
              border: `1.5px solid ${color.border}`,
              background: color.bg,
              boxShadow: color.shadow,
            }}
          >
            <div style={{ position: 'absolute', inset: 0, border: `1px solid ${color.border}`, background: color.bg, transform: 'translateZ(32px)' }} />
            <div style={{ position: 'absolute', inset: 0, border: `1px solid ${color.border}`, background: color.bg, transform: 'translateZ(-32px)' }} />
            <div style={{ position: 'absolute', inset: 0, border: `1px solid ${color.border}`, background: color.bg, transform: 'rotateY(90deg) translateZ(32px)' }} />
            <div style={{ position: 'absolute', inset: 0, border: `1px solid ${color.border}`, background: color.bg, transform: 'rotateY(90deg) translateZ(-32px)' }} />
            <div style={{ position: 'absolute', inset: 0, border: `1px solid ${color.border}`, background: color.bg, transform: 'rotateX(90deg) translateZ(32px)' }} />
            <div style={{ position: 'absolute', inset: 0, border: `1px solid ${color.border}`, background: color.bg, transform: 'rotateX(90deg) translateZ(-32px)' }} />
          </div>
        ))}
      </div>

      {/* Left fade gradient */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'linear-gradient(to right, rgba(30,27,75,0.9) 0%, rgba(30,27,75,0.5) 50%, transparent 100%)'
      }} />

      {/* Content */}
      <div className="hero-content absolute inset-0 z-10 p-8 md:p-12 flex flex-col justify-center pointer-events-none">
        <p className="text-xs font-bold tracking-[0.3em] uppercase mb-3 font-mono" style={{ color: 'rgba(165,180,252,0.9)' }}>
          CoreInventory
        </p>
        <h1 className="text-3xl md:text-4xl font-display font-bold mb-3" style={{ color: '#ffffff' }}>
          Next-Gen{' '}
          <span style={{
            background: 'linear-gradient(90deg, #a5b4fc 0%, #c4b5fd 50%, #67e8f9 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Inventory Control
          </span>
        </h1>
        <p className="text-sm max-w-md leading-relaxed" style={{ color: 'rgba(196,181,253,0.8)' }}>
          Real-time tracking, predictive analytics, and automated workflows in one unified core.
        </p>

        {/* Stat pills */}
        <div className="flex gap-3 mt-5">
          {[
            { label: '99.9% Uptime', color: 'rgba(52,211,153,0.15)', border: 'rgba(52,211,153,0.3)', text: 'rgba(110,231,183,1)' },
            { label: 'Real-time sync', color: 'rgba(99,102,241,0.2)', border: 'rgba(165,180,252,0.3)', text: 'rgba(165,180,252,1)' },
            { label: 'Multi-warehouse', color: 'rgba(168,85,247,0.2)', border: 'rgba(196,181,253,0.3)', text: 'rgba(196,181,253,1)' },
          ].map(pill => (
            <div key={pill.label} className="px-3 py-1 rounded-full text-xs font-medium" style={{
              background: pill.color, border: `1px solid ${pill.border}`, color: pill.text
            }}>
              {pill.label}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{
        background: 'linear-gradient(90deg, #6366f1 0%, #a855f7 50%, #06b6d4 100%)'
      }} />
    </div>
  );
}
