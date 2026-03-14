"use client";

import { useEffect, useRef, useState } from "react";
import { LucideIcon } from "lucide-react";
import { gsap } from "@/lib/gsap-setup";

interface KPICardProps {
  title: string;
  value: number;
  trend: string;
  isPositive: boolean;
  icon: LucideIcon;
  accentColor?: string;
  accentBg?: string;
}

const DEFAULT_ACCENTS = [
  { color: '#6366f1', bg: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)', shadow: 'rgba(99,102,241,0.25)' },
  { color: '#a855f7', bg: 'linear-gradient(135deg, #a855f7 0%, #c084fc 100%)', shadow: 'rgba(168,85,247,0.25)' },
  { color: '#06b6d4', bg: 'linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)', shadow: 'rgba(6,182,212,0.25)' },
  { color: '#f59e0b', bg: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)', shadow: 'rgba(245,158,11,0.25)' },
  { color: '#10b981', bg: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)', shadow: 'rgba(16,185,129,0.25)' },
];

export function KPICard({ title, value, trend, isPositive, icon: Icon }: KPICardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLParagraphElement>(null);
  const [displayValue, setDisplayValue] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [accentIdx, setAccentIdx] = useState(0);
  
  // Set random accent only after mount to avoid hydration mismatch
  useEffect(() => {
    setAccentIdx(Math.floor(Math.random() * DEFAULT_ACCENTS.length));
    setMounted(true);
  }, []);
  
  const accent = DEFAULT_ACCENTS[accentIdx];

  useEffect(() => {
    if (!cardRef.current || !numberRef.current) return;

    const ctx = gsap.context(() => {
      gsap.to({ val: 0 }, {
        val: value,
        duration: 1.5,
        ease: "power2.out",
        onUpdate: function () {
          setDisplayValue(Math.floor(this.targets()[0].val));
        },
        scrollTrigger: {
          trigger: cardRef.current,
          start: "top 90%",
        }
      });
    }, cardRef);

    const handleMouseMove = (e: MouseEvent) => {
      if (!cardRef.current || !glowRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rotateX = ((y - rect.height / 2) / rect.height) * -12;
      const rotateY = ((x - rect.width / 2) / rect.width) * 12;

      gsap.to(cardRef.current, { rotateX, rotateY, duration: 0.35, ease: "power2.out", transformPerspective: 900 });
      gsap.to(glowRef.current, { x: x - rect.width / 2, y: y - rect.height / 2, opacity: 1, duration: 0.35, ease: "power2.out" });
    };

    const handleMouseLeave = () => {
      if (!cardRef.current || !glowRef.current) return;
      gsap.to(cardRef.current, { rotateX: 0, rotateY: 0, duration: 0.5, ease: "power3.out" });
      gsap.to(glowRef.current, { opacity: 0, duration: 0.5 });
    };

    const el = cardRef.current;
    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      ctx.revert();
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [value]);

  return (
    <div
      ref={cardRef}
      className="rounded-2xl p-5 relative card-3d cursor-pointer overflow-hidden"
      style={{
        background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
        border: '1px solid rgba(232,234,250,0.8)',
        boxShadow: `0 4px 16px ${accent.shadow}, 0 1px 4px rgba(0,0,0,0.04)`,
      }}
    >
      {/* Subtle top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl" style={{ background: accent.bg }} />

      {/* Mouse follow glow */}
      <div
        ref={glowRef}
        className="absolute w-40 h-40 rounded-full opacity-0 pointer-events-none"
        style={{
          background: accent.color,
          filter: 'blur(50px)',
          opacity: 0,
          transform: 'translate(-50%, -50%)',
          top: '50%',
          left: '50%',
        }}
      />

      <div className="flex justify-between items-start mb-4 relative z-10">
        {/* Gradient icon container */}
        <div
          className="p-3 rounded-xl"
          style={{
            background: accent.bg,
            boxShadow: `0 4px 12px ${accent.shadow}`,
          }}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
          isPositive
            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
            : 'bg-rose-50 text-rose-600 border border-rose-200'
        }`}>
          {trend}
        </div>
      </div>

      <div className="relative z-10">
        <h3 className="text-sm font-medium mb-1" style={{ color: '#6b7280' }}>{title}</h3>
        <p ref={numberRef} className="text-3xl font-display font-bold tracking-tight" style={{ color: '#1e1b4b' }}>
          {displayValue.toLocaleString()}
        </p>
      </div>
    </div>
  );
}
