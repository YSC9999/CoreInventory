"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { gsap } from "@/lib/gsap-setup";
import { Eye, EyeOff, Package, ArrowRight, Check, Users, Globe, Lock, Shield } from "lucide-react";

const STRENGTH_COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#6366f1"];
const STRENGTH_LABELS = ["Too weak", "Weak", "Fair", "Strong", "Excellent"];

function getStrength(p: string) {
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^a-zA-Z0-9]/.test(p)) s++;
  return s;
}

export default function Signup() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const formCardRef = useRef<HTMLDivElement>(null);
  const ringsRef = useRef<(HTMLDivElement | null)[]>([]);
  const geometryRef = useRef<(HTMLDivElement | null)[]>([]);
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const strength = getStrength(form.password);

  const setField = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Left panel content
      gsap.from(".signup-left-item", { x: -60, opacity: 0, stagger: 0.1, duration: 0.9, ease: "power3.out", delay: 0.1 });

      // Form card
      gsap.from(formCardRef.current, { x: 80, opacity: 0, duration: 0.9, ease: "power3.out", delay: 0.05 });
      gsap.from(".form-field", { y: 25, opacity: 0, stagger: 0.08, duration: 0.65, ease: "power2.out", delay: 0.4 });

      // Rotating rings
      ringsRef.current.forEach((ring, i) => {
        if (!ring) return;
        gsap.to(ring, {
          rotation: i % 2 === 0 ? 360 : -360,
          duration: 20 + i * 8,
          repeat: -1, ease: "none",
        });
        gsap.to(ring, {
          scale: 1.05 + i * 0.02,
          opacity: 0.4 + i * 0.05,
          duration: 5 + i * 2,
          repeat: -1, yoyo: true, ease: "sine.inOut",
          delay: i * 1.5,
        });
      });

      // Floating geometric shapes
      geometryRef.current.forEach((geo, i) => {
        if (!geo) return;
        gsap.to(geo, {
          y: `+=${50 + i * 20}`,
          rotation: `+=${90 + i * 45}`,
          duration: 8 + i * 3,
          repeat: -1, yoyo: true, ease: "sine.inOut",
          delay: -i * 2,
        });
      });

      // Checkmarks animate in
      gsap.from(".feature-check", {
        scale: 0, opacity: 0, stagger: 0.15, duration: 0.5, ease: "back.out(2)", delay: 0.8,
      });
    }, containerRef);

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 2;
      const y = (e.clientY / innerHeight - 0.5) * 2;
      gsap.to(".parallax-slow", { x: x * 25, y: y * 25, duration: 1.5, ease: "power2.out" });
      gsap.to(".parallax-fast", { x: x * 55, y: y * 55, duration: 0.9, ease: "power2.out" });
    };
    window.addEventListener("mousemove", handleMouseMove);

    const card = formCardRef.current;
    const onMove = (e: MouseEvent) => {
      if (!card) return;
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      gsap.to(card, { rotateY: x * 7, rotateX: -y * 7, duration: 0.35, ease: "power2.out", transformPerspective: 1000 });
    };
    const onLeave = () => gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.6, ease: "power3.out" });
    card?.addEventListener("mousemove", onMove);
    card?.addEventListener("mouseleave", onLeave);

    return () => {
      ctx.revert();
      window.removeEventListener("mousemove", handleMouseMove);
      card?.removeEventListener("mousemove", onMove);
      card?.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    gsap.to(formCardRef.current, { scale: 0.98, duration: 0.1, yoyo: true, repeat: 1 });
    setTimeout(() => { setLoading(false); router.push("/inventory"); }, 1400);
  };

  const ringConfigs = [
    { size: 320, border: "rgba(99,102,241,0.25)", dashes: "20 10" },
    { size: 480, border: "rgba(168,85,247,0.18)", dashes: "30 15" },
    { size: 640, border: "rgba(6,182,212,0.12)", dashes: "40 20" },
    { size: 820, border: "rgba(99,102,241,0.08)", dashes: "50 25" },
  ];

  return (
    <div ref={containerRef} className="min-h-screen w-full flex overflow-hidden" style={{ background: "linear-gradient(135deg,#0d0b26 0%,#1a0f4e 35%,#2d1272 65%,#150d3a 100%)" }}>

      {/* === LEFT PANEL === */}
      <div className="hidden lg:flex flex-col flex-1 relative overflow-hidden p-12 xl:p-16 items-center justify-center">

        {/* Animated rings */}
        <div className="parallax-slow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          {ringConfigs.map((r, i) => (
            <div key={i} ref={(el) => { if (el) ringsRef.current[i] = el; }}
              className="absolute rounded-full"
              style={{ width: r.size, height: r.size, marginLeft: -r.size / 2, marginTop: -r.size / 2, border: `1.5px dashed ${r.border}` }}
            />
          ))}
        </div>

        {/* Floating geometry */}
        <div className="parallax-fast absolute inset-0 pointer-events-none">
          {[
            { t: "10%", l: "15%", s: 40, rot: 30, color: "rgba(99,102,241,0.3)" },
            { t: "60%", l: "10%", s: 60, rot: 60, color: "rgba(168,85,247,0.25)" },
            { t: "20%", l: "70%", s: 35, rot: 15, color: "rgba(6,182,212,0.2)" },
            { t: "75%", l: "75%", s: 50, rot: 45, color: "rgba(99,102,241,0.2)" },
            { t: "45%", l: "85%", s: 30, rot: 70, color: "rgba(168,85,247,0.15)" },
          ].map((geo, i) => (
            <div key={i} ref={(el) => { if (el) geometryRef.current[i] = el; }}
              className="absolute"
              style={{ top: geo.t, left: geo.l, width: geo.s, height: geo.s, transform: `rotate(${geo.rot}deg)`, border: `2px solid ${geo.color}`, borderRadius: i % 2 === 0 ? "4px" : "50%" }}
            />
          ))}
        </div>

        {/* Glow orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(99,102,241,0.35) 0%, rgba(168,85,247,0.2) 40%, transparent 70%)", filter: "blur(40px)" }} />

        {/* Logo */}
        <div className="signup-left-item absolute top-12 left-12 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}>
            <Package className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-display font-bold text-white">CoreInventory</span>
        </div>

        {/* Center content */}
        <div className="relative z-10 text-center max-w-sm">
          <div className="signup-left-item w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center" style={{ background: "linear-gradient(135deg,rgba(99,102,241,0.3),rgba(168,85,247,0.3))", border: "1px solid rgba(165,180,252,0.2)", boxShadow: "0 0 40px rgba(99,102,241,0.3)" }}>
            <Users className="w-9 h-9" style={{ color: "#a5b4fc" }} />
          </div>
          <h2 className="signup-left-item text-3xl xl:text-4xl font-display font-bold text-white mb-3">
            Join{" "}
            <span style={{ background: "linear-gradient(90deg,#a5b4fc,#c4b5fd)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>thousands</span>
            {" "}of teams
          </h2>
          <p className="signup-left-item text-sm leading-relaxed mb-8" style={{ color: "rgba(196,181,253,0.7)" }}>
            Trusted by operations teams worldwide to manage inventory at scale.
          </p>

          {/* Features */}
          <div className="space-y-3 text-left">
            {[
              "Free 14-day trial, no credit card",
              "Import existing data in minutes",
              "Unlimited products & warehouses",
              "24/7 support & onboarding help",
            ].map((f) => (
              <div key={f} className="signup-left-item flex items-center gap-3 px-4 py-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="feature-check w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}>
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm" style={{ color: "rgba(196,181,253,0.8)" }}>{f}</span>
              </div>
            ))}
          </div>

          {/* Trust badges */}
          <div className="signup-left-item flex items-center justify-center gap-4 mt-8">
            {[Globe, Shield, Lock].map((Icon, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5" style={{ color: "rgba(165,180,252,0.5)" }} />
                <span className="text-xs" style={{ color: "rgba(165,180,252,0.5)" }}>{["GDPR", "SOC2", "256-bit"][i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* === RIGHT FORM PANEL === */}
      <div className="flex-1 lg:max-w-[500px] xl:max-w-[540px] flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-[440px]">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8 justify-center">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}>
              <Package className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-display font-bold text-white">CoreInventory</span>
          </div>

          <div ref={formCardRef} className="rounded-2xl p-8" style={{ background: "rgba(255,255,255,0.97)", boxShadow: "0 30px 80px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.12)", backdropFilter: "blur(20px)" }}>
            <div className="form-field mb-6">
              <h2 className="text-2xl font-display font-bold" style={{ color: "#1e1b4b" }}>Create account</h2>
              <p className="text-sm mt-1" style={{ color: "#6b7280" }}>Start your free 14-day trial today</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-field">
                <label className="block text-sm font-medium mb-1.5" style={{ color: "#374151" }}>Full name</label>
                <input type="text" value={form.name} onChange={setField("name")} required placeholder="John Smith"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ background: "#f8f9ff", border: "1.5px solid #e5e7eb", color: "#1f2937" }}
                  onFocus={e => (e.target.style.border = "1.5px solid #6366f1")}
                  onBlur={e => (e.target.style.border = "1.5px solid #e5e7eb")}
                />
              </div>

              <div className="form-field">
                <label className="block text-sm font-medium mb-1.5" style={{ color: "#374151" }}>Work email</label>
                <input type="email" value={form.email} onChange={setField("email")} required placeholder="you@company.com"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ background: "#f8f9ff", border: "1.5px solid #e5e7eb", color: "#1f2937" }}
                  onFocus={e => (e.target.style.border = "1.5px solid #6366f1")}
                  onBlur={e => (e.target.style.border = "1.5px solid #e5e7eb")}
                />
              </div>

              <div className="form-field">
                <label className="block text-sm font-medium mb-1.5" style={{ color: "#374151" }}>Password</label>
                <div className="relative">
                  <input type={showPass ? "text" : "password"} value={form.password} onChange={setField("password")} required placeholder="Min. 8 characters"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none pr-12"
                    style={{ background: "#f8f9ff", border: "1.5px solid #e5e7eb", color: "#1f2937" }}
                    onFocus={e => (e.target.style.border = "1.5px solid #6366f1")}
                    onBlur={e => (e.target.style.border = "1.5px solid #e5e7eb")}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#9ca3af" }}>
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {/* Strength bar */}
                {form.password && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[0, 1, 2, 3].map(i => (
                        <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
                          style={{ background: i < strength ? STRENGTH_COLORS[strength] : "#e5e7eb" }} />
                      ))}
                    </div>
                    <p className="text-xs" style={{ color: STRENGTH_COLORS[strength] }}>{STRENGTH_LABELS[strength]}</p>
                  </div>
                )}
              </div>

              <div className="form-field">
                <label className="block text-sm font-medium mb-1.5" style={{ color: "#374151" }}>Confirm password</label>
                <input type="password" value={form.confirm} onChange={setField("confirm")} required placeholder="Re-enter password"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ background: "#f8f9ff", border: form.confirm && form.confirm !== form.password ? "1.5px solid #ef4444" : "1.5px solid #e5e7eb", color: "#1f2937" }}
                  onFocus={e => (e.target.style.border = "1.5px solid #6366f1")}
                  onBlur={e => (e.target.style.border = form.confirm && form.confirm !== form.password ? "1.5px solid #ef4444" : "1.5px solid #e5e7eb")}
                />
                {form.confirm && form.confirm !== form.password && <p className="text-xs mt-1 text-red-500">Passwords don't match</p>}
              </div>

              <div className="form-field flex items-start gap-2">
                <input type="checkbox" id="terms" required className="w-4 h-4 mt-0.5 rounded accent-indigo-500" />
                <label htmlFor="terms" className="text-xs leading-relaxed" style={{ color: "#6b7280" }}>
                  I agree to the{" "}
                  <a href="#" className="font-medium" style={{ color: "#6366f1" }}>Terms of Service</a>
                  {" "}and{" "}
                  <a href="#" className="font-medium" style={{ color: "#6366f1" }}>Privacy Policy</a>
                </label>
              </div>

              <div className="form-field pt-1">
                <button type="submit" disabled={loading || (!!form.confirm && form.confirm !== form.password)}
                  className="w-full py-3 px-6 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all"
                  style={{ background: loading ? "#818cf8" : "linear-gradient(135deg,#6366f1,#a855f7)", boxShadow: "0 8px 24px rgba(99,102,241,0.4)" }}
                  onMouseEnter={e => !loading && ((e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)")}
                  onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)")}
                >
                  {loading ? (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" fill="none" strokeDasharray="30" strokeDashoffset="10" /></svg>
                  ) : (
                    <><span>Create free account</span><ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </div>
            </form>

            <div className="form-field mt-5 pt-5 text-center" style={{ borderTop: "1px solid #f3f4f6" }}>
              <p className="text-sm" style={{ color: "#6b7280" }}>
                Already have an account?{" "}
                <Link href="/login" className="font-semibold hover:underline" style={{ color: "#6366f1" }}>Sign in</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
