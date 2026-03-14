"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { gsap } from "@/lib/gsap-setup";
import { Package, ArrowRight, ArrowLeft, Mail, KeyRound, ShieldCheck, CheckCircle2 } from "lucide-react";

type Step = 0 | 1 | 2;

export default function ResetPassword() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const formCardRef = useRef<HTMLDivElement>(null);
  const waveRef = useRef<SVGSVGElement>(null);
  const particlesRef = useRef<(HTMLDivElement | null)[]>([]);
  const [step, setStep] = useState<Step>(0);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const codeRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Card entry
      gsap.from(formCardRef.current, { scale: 0.88, opacity: 0, duration: 0.8, ease: "back.out(1.5)" });
      gsap.from(".rp-item", { y: 30, opacity: 0, stagger: 0.1, duration: 0.7, ease: "power3.out", delay: 0.3 });

      // Waving path animation
      if (waveRef.current) {
        gsap.to(waveRef.current, { y: -15, duration: 3, repeat: -1, yoyo: true, ease: "sine.inOut" });
      }

      // Particles
      particlesRef.current.forEach((p, i) => {
        if (!p) return;
        const startX = Math.random() * window.innerWidth;
        const startY = window.innerHeight + 20;
        gsap.set(p, { x: startX, y: startY, scale: 0.5 + Math.random() * 0.8 });
        gsap.to(p, {
          y: -100,
          x: startX + (Math.random() - 0.5) * 200,
          rotation: Math.random() * 360,
          opacity: 0,
          duration: 6 + Math.random() * 6,
          repeat: -1,
          delay: -Math.random() * 8,
          ease: "none",
        });
      });

      // Step indicator line
      gsap.from(".step-line", { scaleX: 0, duration: 0.6, ease: "power2.out", delay: 0.5, transformOrigin: "left" });
    }, containerRef);

    // Mouse parallax
    const onMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      gsap.to(".rp-parallax-slow", { x: x * 30, y: y * 30, duration: 1.5, ease: "power2.out" });
      gsap.to(".rp-parallax-fast", { x: x * 60, y: y * 60, duration: 0.8, ease: "power2.out" });
    };
    window.addEventListener("mousemove", onMouseMove);

    const card = formCardRef.current;
    const onMove = (e: MouseEvent) => {
      if (!card) return;
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      gsap.to(card, { rotateY: x * 10, rotateX: -y * 10, duration: 0.35, ease: "power2.out", transformPerspective: 900 });
    };
    const onLeave = () => gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.6, ease: "power3.out" });
    card?.addEventListener("mousemove", onMove);
    card?.addEventListener("mouseleave", onLeave);

    return () => {
      ctx.revert();
      window.removeEventListener("mousemove", onMouseMove);
      card?.removeEventListener("mousemove", onMove);
      card?.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  // Animate step change
  const goToStep = (next: Step) => {
    setLoading(true);
    const card = formCardRef.current;
    gsap.to(card, { x: -40, opacity: 0, duration: 0.3, ease: "power2.in", onComplete: () => {
      setStep(next);
      setLoading(false);
      gsap.fromTo(card, { x: 40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4, ease: "power2.out" });
      gsap.from(".rp-item", { y: 20, opacity: 0, stagger: 0.08, duration: 0.5, ease: "power2.out" });
    }});
  };

  const handleCodeInput = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...code];
    next[i] = val.slice(-1);
    setCode(next);
    if (val && i < 5) codeRefs.current[i + 1]?.focus();
  };
  const handleCodeKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[i] && i > 0) codeRefs.current[i - 1]?.focus();
  };

  const particles = Array.from({ length: 20 }, (_, i) => ({
    size: 4 + Math.random() * 8,
    shape: i % 3 === 0 ? "circle" : i % 3 === 1 ? "square" : "diamond",
    color: ["rgba(99,102,241,0.6)", "rgba(168,85,247,0.6)", "rgba(6,182,212,0.5)"][i % 3],
  }));

  const steps = [
    { icon: Mail, label: "Email" },
    { icon: ShieldCheck, label: "Verify" },
    { icon: KeyRound, label: "Reset" },
  ];

  return (
    <div ref={containerRef} className="min-h-screen w-full flex items-center justify-center relative overflow-hidden"
      style={{ background: "linear-gradient(135deg,#080620 0%,#130d40 40%,#1e0d5a 65%,#0a0820 100%)" }}>

      {/* Animated grid */}
      <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)", backgroundSize: "56px 56px" }} />

      {/* Center aurora */}
      <div className="rp-parallax-slow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(99,102,241,0.3) 0%, rgba(168,85,247,0.2) 40%, transparent 70%)", filter: "blur(50px)" }} />
      <div className="rp-parallax-fast absolute top-1/4 right-1/4 w-[300px] h-[300px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(6,182,212,0.25) 0%, transparent 70%)", filter: "blur(40px)" }} />

      {/* Floating particles */}
      {particles.map((p, i) => (
        <div key={i} ref={(el) => { if (el) particlesRef.current[i] = el; }}
          className="absolute pointer-events-none"
          style={{
            width: p.size, height: p.size, background: p.color,
            borderRadius: p.shape === "circle" ? "50%" : p.shape === "square" ? "2px" : "2px",
            transform: p.shape === "diamond" ? "rotate(45deg)" : undefined,
            opacity: 0.7,
          }}
        />
      ))}

      {/* Rotating rings in background */}
      <div className="rp-parallax-slow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        {[500, 700, 900].map((size, i) => (
          <div key={i} className="absolute rounded-full"
            style={{
              width: size, height: size,
              marginLeft: -size / 2, marginTop: -size / 2,
              border: `1px dashed rgba(${["99,102,241", "168,85,247", "6,182,212"][i]},${0.12 - i * 0.03})`,
              animation: `spin ${20 + i * 10}s linear infinite ${i % 2 ? "reverse" : ""}`,
            }} />
        ))}
      </div>

      {/* Wave SVG bottom */}
      <svg ref={waveRef} className="absolute bottom-0 left-0 w-full pointer-events-none" viewBox="0 0 1440 120" fill="none" preserveAspectRatio="none" style={{ height: 120 }}>
        <path d="M0,60 C360,120 1080,0 1440,60 L1440,120 L0,120 Z" fill="rgba(99,102,241,0.06)" />
        <path d="M0,80 C480,20 960,120 1440,80 L1440,120 L0,120 Z" fill="rgba(168,85,247,0.04)" />
      </svg>

      {/* Logo top-left */}
      <div className="absolute top-8 left-8 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}>
          <Package className="w-4 h-4 text-white" />
        </div>
        <span className="text-lg font-display font-bold text-white">CoreInventory</span>
      </div>

      {/* Form card */}
      <div ref={formCardRef} className="relative z-10 w-full max-w-[440px] mx-6 rounded-2xl p-8"
        style={{ background: "rgba(255,255,255,0.97)", boxShadow: "0 40px 100px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)" }}>

        {/* Step indicator */}
        <div className="rp-item flex items-center gap-2 mb-8">
          {steps.map(({ icon: Icon, label }, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300"
                  style={{
                    background: i < step ? "linear-gradient(135deg,#6366f1,#a855f7)" : i === step ? "linear-gradient(135deg,#6366f1,#a855f7)" : "#f3f4f6",
                    boxShadow: i <= step ? "0 4px 10px rgba(99,102,241,0.35)" : "none",
                  }}>
                  {i < step ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Icon className="w-3.5 h-3.5" style={{ color: i === step ? "#fff" : "#9ca3af" }} />}
                </div>
                <span className="text-xs font-medium hidden sm:block" style={{ color: i === step ? "#6366f1" : i < step ? "#a855f7" : "#9ca3af" }}>{label}</span>
              </div>
              {i < 2 && (
                <div className="flex-1 h-0.5 w-8 rounded step-line" style={{ background: i < step ? "linear-gradient(90deg,#6366f1,#a855f7)" : "#e5e7eb" }} />
              )}
            </div>
          ))}
        </div>

        {/* Step 0: Email */}
        {step === 0 && (
          <>
            <div className="rp-item mb-6">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: "linear-gradient(135deg,rgba(99,102,241,0.12),rgba(168,85,247,0.12))", border: "1px solid rgba(99,102,241,0.15)" }}>
                <Mail className="w-7 h-7" style={{ color: "#6366f1" }} />
              </div>
              <h2 className="text-2xl font-display font-bold" style={{ color: "#1e1b4b" }}>Forgot password?</h2>
              <p className="text-sm mt-1" style={{ color: "#6b7280" }}>No worries, we'll send you reset instructions.</p>
            </div>
            <div className="rp-item space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "#374151" }}>Email address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ background: "#f8f9ff", border: "1.5px solid #e5e7eb", color: "#1f2937" }}
                  onFocus={e => (e.target.style.border = "1.5px solid #6366f1")}
                  onBlur={e => (e.target.style.border = "1.5px solid #e5e7eb")}
                />
              </div>
              <button onClick={() => goToStep(1)} disabled={!email || loading}
                className="w-full py-3 px-6 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)", boxShadow: "0 8px 24px rgba(99,102,241,0.4)", opacity: !email ? 0.7 : 1 }}
                onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-1px)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}
              >
                <span>Send reset link</span><ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}

        {/* Step 1: Verify code */}
        {step === 1 && (
          <>
            <div className="rp-item mb-6">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: "linear-gradient(135deg,rgba(99,102,241,0.12),rgba(168,85,247,0.12))", border: "1px solid rgba(99,102,241,0.15)" }}>
                <ShieldCheck className="w-7 h-7" style={{ color: "#6366f1" }} />
              </div>
              <h2 className="text-2xl font-display font-bold" style={{ color: "#1e1b4b" }}>Check your email</h2>
              <p className="text-sm mt-1" style={{ color: "#6b7280" }}>
                We sent a 6-digit code to <span className="font-medium" style={{ color: "#374151" }}>{email}</span>
              </p>
            </div>
            <div className="rp-item space-y-5">
              <div>
                <label className="block text-sm font-medium mb-3 text-center" style={{ color: "#374151" }}>Enter verification code</label>
                <div className="flex gap-2 justify-center">
                  {code.map((digit, i) => (
                    <input key={i} ref={(el) => { if (el) codeRefs.current[i] = el; }}
                      type="text" maxLength={1} value={digit}
                      onChange={e => handleCodeInput(i, e.target.value)}
                      onKeyDown={e => handleCodeKey(i, e)}
                      className="w-11 h-13 text-center text-lg font-bold rounded-xl outline-none transition-all"
                      style={{ background: digit ? "rgba(99,102,241,0.08)" : "#f8f9ff", border: digit ? "2px solid #6366f1" : "2px solid #e5e7eb", color: "#1e1b4b", height: "52px" }}
                    />
                  ))}
                </div>
              </div>
              <button onClick={() => goToStep(2)} disabled={code.join("").length < 6 || loading}
                className="w-full py-3 px-6 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)", boxShadow: "0 8px 24px rgba(99,102,241,0.4)", opacity: code.join("").length < 6 ? 0.7 : 1 }}
                onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-1px)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}
              >
                <span>Verify code</span><ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-center text-sm" style={{ color: "#9ca3af" }}>
                Didn't receive it?{" "}
                <button onClick={() => {}} className="font-medium" style={{ color: "#6366f1" }}>Resend code</button>
              </p>
            </div>
          </>
        )}

        {/* Step 2: New password */}
        {step === 2 && (
          <>
            <div className="rp-item mb-6">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: "linear-gradient(135deg,rgba(99,102,241,0.12),rgba(168,85,247,0.12))", border: "1px solid rgba(99,102,241,0.15)" }}>
                <KeyRound className="w-7 h-7" style={{ color: "#6366f1" }} />
              </div>
              <h2 className="text-2xl font-display font-bold" style={{ color: "#1e1b4b" }}>Set new password</h2>
              <p className="text-sm mt-1" style={{ color: "#6b7280" }}>Choose a strong password you haven't used before.</p>
            </div>
            <div className="rp-item space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "#374151" }}>New password</label>
                <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="Min. 8 characters"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ background: "#f8f9ff", border: "1.5px solid #e5e7eb", color: "#1f2937" }}
                  onFocus={e => (e.target.style.border = "1.5px solid #6366f1")}
                  onBlur={e => (e.target.style.border = "1.5px solid #e5e7eb")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "#374151" }}>Confirm new password</label>
                <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Re-enter password"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ background: "#f8f9ff", border: confirm && confirm !== newPass ? "1.5px solid #ef4444" : "1.5px solid #e5e7eb", color: "#1f2937" }}
                  onFocus={e => (e.target.style.border = "1.5px solid #6366f1")}
                  onBlur={e => (e.target.style.border = confirm && confirm !== newPass ? "1.5px solid #ef4444" : "1.5px solid #e5e7eb")}
                />
                {confirm && confirm !== newPass && <p className="text-xs mt-1 text-red-500">Passwords don't match</p>}
              </div>

              {/* Requirements */}
              <div className="rounded-xl p-3 space-y-1.5" style={{ background: "#f8f9ff", border: "1px solid #e5e7eb" }}>
                {[
                  { ok: newPass.length >= 8, text: "At least 8 characters" },
                  { ok: /[A-Z]/.test(newPass), text: "One uppercase letter" },
                  { ok: /[0-9]/.test(newPass), text: "One number" },
                  { ok: /[^a-zA-Z0-9]/.test(newPass), text: "One special character" },
                ].map(({ ok, text }) => (
                  <div key={text} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: ok ? "linear-gradient(135deg,#6366f1,#a855f7)" : "#e5e7eb" }}>
                      {ok && <Check className="w-2.5 h-2.5 text-white" />}
                    </div>
                    <span className="text-xs" style={{ color: ok ? "#6366f1" : "#9ca3af" }}>{text}</span>
                  </div>
                ))}
              </div>

              <button onClick={() => {
                setLoading(true);
                setTimeout(() => { setLoading(false); router.push("/login"); }, 1200);
              }} disabled={!newPass || newPass !== confirm || loading}
                className="w-full py-3 px-6 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)", boxShadow: "0 8px 24px rgba(99,102,241,0.4)", opacity: (!newPass || newPass !== confirm) ? 0.7 : 1 }}
                onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-1px)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}
              >
                {loading ? (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" fill="none" strokeDasharray="30" strokeDashoffset="10" /></svg>
                ) : (
                  <><span>Reset password</span><ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          </>
        )}

        {/* Back to login */}
        <div className="rp-item mt-6 pt-5 text-center" style={{ borderTop: "1px solid #f3f4f6" }}>
          <Link href="/login" className="text-sm font-medium flex items-center justify-center gap-1.5" style={{ color: "#6b7280" }}>
            <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

function Check({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>;
}
