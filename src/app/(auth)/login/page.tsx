"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { gsap } from "@/lib/gsap-setup";
import { Eye, EyeOff, Package, ArrowRight, Zap, Shield, BarChart3 } from "lucide-react";
import { logIn } from "@/actions/auth.actions";
import { toast } from "sonner";

export default function Login() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const formCardRef = useRef<HTMLDivElement>(null);
  const cubesRef = useRef<(HTMLDivElement | null)[]>([]);
  const orb1Ref = useRef<HTMLDivElement>(null);
  const orb2Ref = useRef<HTMLDivElement>(null);
  const orb3Ref = useRef<HTMLDivElement>(null);
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [buttonHovered, setButtonHovered] = useState(false);
  const getBorderStyle = (fieldName: string) => focusedField === fieldName ? "1.5px solid #6366f1" : "1.5px solid #e5e7eb";

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Stagger in the left panel content
      gsap.from(".auth-left-item", {
        x: -60, opacity: 0, stagger: 0.12, duration: 0.9, ease: "power3.out", delay: 0.2,
      });

      // Form card slides in from right
      gsap.from(formCardRef.current, {
        x: 80, opacity: 0, duration: 0.9, ease: "power3.out", delay: 0.1,
      });

      // Form fields stagger up
      gsap.from(".form-field", {
        y: 30, opacity: 0, stagger: 0.1, duration: 0.7, ease: "power2.out", delay: 0.5,
      });

      // Floating cubes continuous animation
      cubesRef.current.forEach((cube, i) => {
        if (!cube) return;
        gsap.set(cube, {
          x: (Math.random() - 0.5) * 600,
          y: (Math.random() - 0.5) * 600,
          rotationX: Math.random() * 360,
          rotationY: Math.random() * 360,
          rotationZ: Math.random() * 45,
          scale: 0.5 + Math.random() * 1.2,
        });
        gsap.to(cube, {
          rotationX: `+=${180 + Math.random() * 180}`,
          rotationY: `+=${180 + Math.random() * 180}`,
          y: `+=${80 + Math.random() * 80}`,
          duration: 12 + Math.random() * 10,
          repeat: -1, yoyo: true, ease: "sine.inOut",
          delay: -Math.random() * 12,
        });
      });

      // Orbs pulsing
      [orb1Ref, orb2Ref, orb3Ref].forEach((ref, i) => {
        if (!ref.current) return;
        gsap.to(ref.current, {
          scale: 1.2 + i * 0.1,
          opacity: 0.6 + i * 0.05,
          duration: 4 + i * 1.5,
          repeat: -1, yoyo: true, ease: "sine.inOut",
          delay: i * 1.2,
        });
      });

      // Stat counters
      document.querySelectorAll(".stat-num").forEach((el) => {
        const target = parseInt(el.getAttribute("data-target") || "0");
        gsap.to({ val: 0 }, {
          val: target, duration: 2, ease: "power2.out", delay: 0.8,
          onUpdate: function () { el.textContent = Math.floor(this.targets()[0].val).toLocaleString(); },
        });
      });
    }, containerRef);

    // Mouse parallax on the entire left panel
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 2;
      const y = (e.clientY / innerHeight - 0.5) * 2;

      gsap.to(".parallax-slow", { x: x * 20, y: y * 20, duration: 1.2, ease: "power2.out" });
      gsap.to(".parallax-mid", { x: x * 40, y: y * 40, duration: 1, ease: "power2.out" });
      gsap.to(".parallax-fast", { x: x * 70, y: y * 70, duration: 0.8, ease: "power2.out" });
    };

    window.addEventListener("mousemove", handleMouseMove);

    // 3D tilt on form card
    const card = formCardRef.current;
    const handleCardMove = (e: MouseEvent) => {
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      gsap.to(card, { rotateY: x * 8, rotateX: -y * 8, duration: 0.4, ease: "power2.out", transformPerspective: 1000 });
    };
    const handleCardLeave = () => {
      gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.6, ease: "power3.out" });
    };
    card?.addEventListener("mousemove", handleCardMove);
    card?.addEventListener("mouseleave", handleCardLeave);

    return () => {
      ctx.revert();
      window.removeEventListener("mousemove", handleMouseMove);
      card?.removeEventListener("mousemove", handleCardMove);
      card?.removeEventListener("mouseleave", handleCardLeave);
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    gsap.to(formCardRef.current, { scale: 0.98, duration: 0.1, yoyo: true, repeat: 1 });
    
    try {
      console.log("Attempting login with:", { email, password: password.length + " chars" });
      const result = await logIn({ email, password });
      console.log("Login result:", result);
      
      if (result.success) {
        toast.success("Login successful!");
        // Small delay for animation then redirect
        setTimeout(() => {
          console.log("Redirecting to inventory...");
          router.push("/inventory");
        }, 300);
      } else {
        console.log("Login failed:", result.error);
        setError(result.error || "Login failed");
        toast.error(result.error || "Login failed");
        setLoading(false);
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "An error occurred");
      toast.error(err.message || "An error occurred");
      setLoading(false);
    }
  };

  const cubeColors = [
    { b: "rgba(99,102,241,0.5)", bg: "rgba(99,102,241,0.06)" },
    { b: "rgba(168,85,247,0.5)", bg: "rgba(168,85,247,0.06)" },
    { b: "rgba(6,182,212,0.4)", bg: "rgba(6,182,212,0.05)" },
    { b: "rgba(99,102,241,0.35)", bg: "rgba(99,102,241,0.04)" },
    { b: "rgba(168,85,247,0.35)", bg: "rgba(168,85,247,0.04)" },
    { b: "rgba(6,182,212,0.3)", bg: "rgba(6,182,212,0.03)" },
    { b: "rgba(99,102,241,0.25)", bg: "rgba(99,102,241,0.03)" },
    { b: "rgba(168,85,247,0.25)", bg: "rgba(168,85,247,0.03)" },
  ];

  return (
    <div ref={containerRef} className="min-h-screen w-full flex overflow-hidden" style={{ background: "linear-gradient(135deg,#0f0c29 0%,#1a1050 40%,#2d1b69 70%,#0d0d2b 100%)" }}>

      {/* === LEFT BRAND PANEL === */}
      <div className="hidden lg:flex flex-col flex-1 relative overflow-hidden p-12 xl:p-16">

        {/* Animated gradient orbs */}
        <div ref={orb1Ref} className="parallax-slow absolute top-[-15%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-50" style={{ background: "radial-gradient(circle, rgba(99,102,241,0.5) 0%, transparent 70%)", filter: "blur(60px)" }} />
        <div ref={orb2Ref} className="parallax-mid absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full opacity-40" style={{ background: "radial-gradient(circle, rgba(168,85,247,0.5) 0%, transparent 70%)", filter: "blur(50px)" }} />
        <div ref={orb3Ref} className="parallax-slow absolute top-[40%] left-[50%] w-[300px] h-[300px] rounded-full opacity-30" style={{ background: "radial-gradient(circle, rgba(6,182,212,0.5) 0%, transparent 70%)", filter: "blur(60px)" }} />

        {/* 3D floating cubes */}
        <div className="parallax-fast absolute inset-0 pointer-events-none" style={{ perspective: "1000px" }}>
          {cubeColors.map((c, i) => (
            <div key={i} ref={(el) => { if (el) cubesRef.current[i] = el; }}
              className="absolute top-1/2 left-1/2"
              style={{ transformStyle: "preserve-3d", width: 56 + i * 8, height: 56 + i * 8, marginLeft: `-${(56 + i * 8) / 2}px`, marginTop: `-${(56 + i * 8) / 2}px` }}>
              {[...Array(6)].map((_, f) => {
                const transforms = ["translateZ(28px)", "translateZ(-28px)", "rotateY(90deg) translateZ(28px)", "rotateY(90deg) translateZ(-28px)", "rotateX(90deg) translateZ(28px)", "rotateX(90deg) translateZ(-28px)"];
                return <div key={f} style={{ position: "absolute", inset: 0, border: `1.5px solid ${c.b}`, background: c.bg, transform: transforms[f] }} />;
              })}
            </div>
          ))}
        </div>

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)", backgroundSize: "48px 48px" }} />

        {/* Logo */}
        <div className="auth-left-item flex items-center gap-3 mb-auto relative z-10">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}>
            <Package className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-display font-bold text-white">CoreInventory</span>
        </div>

        {/* Main headline */}
        <div className="relative z-10 mb-8">
          <p className="auth-left-item text-xs font-bold tracking-[0.3em] uppercase mb-4" style={{ color: "rgba(165,180,252,0.8)" }}>Welcome back</p>
          <h1 className="auth-left-item text-4xl xl:text-5xl font-display font-bold leading-tight mb-4" style={{ color: "#fff" }}>
            Control your{" "}
            <span style={{ background: "linear-gradient(90deg,#a5b4fc,#c4b5fd,#67e8f9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              inventory
            </span>
            <br />like never before.
          </h1>
          <p className="auth-left-item text-base leading-relaxed max-w-sm" style={{ color: "rgba(196,181,253,0.7)" }}>
            Real-time visibility across every warehouse, every product, every movement — all in one place.
          </p>
        </div>

        {/* Feature pills */}
        <div className="auth-left-item flex flex-col gap-3 relative z-10 mb-10">
          {[
            { icon: Zap, text: "Real-time stock sync across all warehouses" },
            { icon: Shield, text: "Role-based access with audit trail" },
            { icon: BarChart3, text: "Predictive analytics & low-stock alerts" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(8px)" }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg,rgba(99,102,241,0.4),rgba(168,85,247,0.4))", border: "1px solid rgba(165,180,252,0.2)" }}>
                <Icon className="w-4 h-4" style={{ color: "#a5b4fc" }} />
              </div>
              <span className="text-sm" style={{ color: "rgba(196,181,253,0.8)" }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* === RIGHT FORM PANEL === */}
      <div className="flex-1 lg:max-w-[480px] xl:max-w-[520px] flex items-center justify-center p-6 lg:p-12 relative">
        <div className="w-full max-w-[420px]">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8 justify-center">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}>
              <Package className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-display font-bold text-white">CoreInventory</span>
          </div>

          {/* Form card */}
          <div ref={formCardRef} className="rounded-2xl p-8" style={{ background: "rgba(255,255,255,0.97)", boxShadow: "0 30px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1)", backdropFilter: "blur(20px)" }}>
            <div className="form-field mb-7">
              <h2 className="text-2xl font-display font-bold" style={{ color: "#1e1b4b" }}>Sign in</h2>
              <p className="text-sm mt-1" style={{ color: "#6b7280" }}>Enter your credentials to continue</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg text-sm" style={{ background: "#fee2e2", border: "1px solid #fecaca", color: "#991b1b" }}>
                  {error}
                </div>
              )}
              <div className="form-field">
                <label className="block text-sm font-medium mb-1.5" style={{ color: "#374151" }}>Email address</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  placeholder="you@company.com"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{ background: "#f8f9ff", border: getBorderStyle("email"), color: "#1f2937" }}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                />
              </div>

              <div className="form-field">
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-sm font-medium" style={{ color: "#374151" }}>Password</label>
                  <Link href="/reset-password" className="text-xs font-medium hover:underline" style={{ color: "#6366f1" }}>Forgot password?</Link>
                </div>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all pr-12"
                    style={{ background: "#f8f9ff", border: getBorderStyle("password"), color: "#1f2937" }}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#9ca3af" }}>
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="form-field flex items-center gap-2">
                <input type="checkbox" id="remember" className="w-4 h-4 rounded accent-indigo-500" />
                <label htmlFor="remember" className="text-sm" style={{ color: "#6b7280" }}>Remember me for 30 days</label>
              </div>

              <div className="form-field pt-1">
                <button type="submit" disabled={loading}
                  className="w-full py-3 px-6 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all"
                  style={{ background: loading ? "#818cf8" : "linear-gradient(135deg,#6366f1,#a855f7)", boxShadow: "0 8px 24px rgba(99,102,241,0.4)", transform: buttonHovered && !loading ? "translateY(-1px)" : "translateY(0)" }}
                  onMouseEnter={() => !loading && setButtonHovered(true)}
                  onMouseLeave={() => setButtonHovered(false)}
                >
                  {loading ? (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" fill="none" strokeDasharray="30" strokeDashoffset="10" /></svg>
                  ) : (
                    <><span>Sign in</span><ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </div>
            </form>

            <div className="form-field mt-6 pt-5 text-center" style={{ borderTop: "1px solid #f3f4f6" }}>
              <p className="text-sm" style={{ color: "#6b7280" }}>
                Don't have an account?{" "}
                <Link href="/signup" className="font-semibold hover:underline" style={{ color: "#6366f1" }}>Create one</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
