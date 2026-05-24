export const dynamic = "force-dynamic";

"use client";

import { useState, useEffect, useRef } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLangue } from "@/contexts/LangueContext";
import NomEtablissement from "@/components/NomEtablissement";

export default function AdminLogin() {
  const { t } = useLangue();
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [erreur, setErreur] = useState("");
  const [loading, setLoading] = useState(false);

  // ── Three.js background ──────────────────────────────────
  useEffect(() => {
    let animId: number;
    let renderer: any;

    const init = async () => {
      const THREE = await import("three");
      const canvas = canvasRef.current;
      if (!canvas) return;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
      camera.position.z = 4;

      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // Tore doré — forme plus élégante qu'une sphère pour le login
      const torusGeo = new THREE.TorusGeometry(1.2, 0.35, 32, 100);
      const torusMat = new THREE.MeshStandardMaterial({
        color: 0xc9a84c,
        metalness: 0.95,
        roughness: 0.05,
      });
      const torus = new THREE.Mesh(torusGeo, torusMat);
      scene.add(torus);

      // Wireframe tore
      const wireMat = new THREE.MeshBasicMaterial({
        color: 0xc9a84c,
        wireframe: true,
        transparent: true,
        opacity: 0.08,
      });
      const wire = new THREE.Mesh(torusGeo, wireMat);
      wire.scale.setScalar(1.02);
      scene.add(wire);

      // Anneau extérieur fin
      const ringGeo = new THREE.TorusGeometry(1.9, 0.015, 8, 120);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xc9a84c, transparent: true, opacity: 0.3 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      scene.add(ring);

      // Particules flottantes
      const pGeo = new THREE.BufferGeometry();
      const pCount = 120;
      const pPos = new Float32Array(pCount * 3);
      for (let i = 0; i < pCount * 3; i++) pPos[i] = (Math.random() - 0.5) * 10;
      pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
      const particles = new THREE.Points(
        pGeo,
        new THREE.PointsMaterial({ color: 0xc9a84c, size: 0.025, transparent: true, opacity: 0.5 })
      );
      scene.add(particles);

      // Lumières
      scene.add(new THREE.AmbientLight(0xffffff, 0.2));
      const l1 = new THREE.PointLight(0xc9a84c, 3, 12);
      l1.position.set(4, 3, 3);
      scene.add(l1);
      const l2 = new THREE.PointLight(0x4466ff, 1, 10);
      l2.position.set(-4, -2, 2);
      scene.add(l2);

      const clock = new THREE.Clock();
      const animate = () => {
        animId = requestAnimationFrame(animate);
        const e = clock.getElapsedTime();
        torus.rotation.x = e * 0.25;
        torus.rotation.y = e * 0.18;
        wire.rotation.x = e * 0.25;
        wire.rotation.y = e * 0.18;
        ring.rotation.z = e * 0.12;
        ring.rotation.x = Math.sin(e * 0.3) * 0.4;
        particles.rotation.y = e * 0.04;
        particles.rotation.x = e * 0.02;
        renderer.render(scene, camera);
      };
      animate();

      const onResize = () => {
        if (!canvas || !renderer) return;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
      };
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    };

    init();
    return () => {
      if (animId) cancelAnimationFrame(animId);
      if (renderer) renderer.dispose();
    };
  }, []);

  // ── Connexion ────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErreur("");

    const result = await signIn("credentials", {
      email: email.trim().toLowerCase(),
      password,
      loginType: "admin",
      userAgent: navigator.userAgent,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      if (result.error.startsWith("BLOQUE:")) {
        const min = result.error.split(":")[1];
        setErreur(`${t("trop_tentatives")} ${min} min.`);
      } else if (result.error === "ADMIN_ONLY") {
        setErreur(t("compte_non_admin"));
      } else {
        setErreur(t("identifiants_incorrects"));
      }
    } else if (result?.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      setErreur("Connexion impossible. Réessayez.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #080808 0%, #0a0a0a 50%, #0d0b08 100%)" }}>

      {/* Canvas Three.js */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0.45, pointerEvents: "none" }}
      />

      {/* Halo doré central */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(201,168,76,0.07) 0%, transparent 70%)",
        }}
      />

      {/* Contenu */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Nom établissement animé */}
        <div className="mb-8">
          <NomEtablissement
            size="sm"
            subtitle="Panneau d'administration"
            showSubtitle
          />
        </div>

        {/* Formulaire */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: "rgba(15,15,15,0.85)",
            border: "1px solid rgba(201,168,76,0.15)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 24px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(201,168,76,0.08)",
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest mb-2 block"
                style={{ color: "rgba(201,168,76,0.6)" }}>
                Email
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="etsTchibanvunya@gmail.com"
                className="w-full px-4 py-3 rounded-xl text-sm transition-all duration-200"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(201,168,76,0.2)",
                  color: "#F5F0E8",
                  outline: "none",
                }}
                onFocus={(e) => { e.target.style.border = "1px solid rgba(201,168,76,0.6)"; e.target.style.boxShadow = "0 0 0 3px rgba(201,168,76,0.08)"; }}
                onBlur={(e) => { e.target.style.border = "1px solid rgba(201,168,76,0.2)"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            {/* Mot de passe */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest mb-2 block"
                style={{ color: "rgba(201,168,76,0.6)" }}>
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 rounded-xl text-sm transition-all duration-200"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(201,168,76,0.2)",
                    color: "#F5F0E8",
                    outline: "none",
                  }}
                  onFocus={(e) => { e.target.style.border = "1px solid rgba(201,168,76,0.6)"; e.target.style.boxShadow = "0 0 0 3px rgba(201,168,76,0.08)"; }}
                  onBlur={(e) => { e.target.style.border = "1px solid rgba(201,168,76,0.2)"; e.target.style.boxShadow = "none"; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-200"
                  style={{ color: "rgba(201,168,76,0.4)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#C9A84C")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(201,168,76,0.4)")}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Erreur */}
            {erreur && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl px-4 py-3"
                style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)" }}
              >
                <p className="text-red-400 text-sm">{erreur}</p>
              </motion.div>
            )}

            {/* Bouton */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: loading
                  ? "rgba(201,168,76,0.5)"
                  : "linear-gradient(135deg, #C9A84C 0%, #E8C060 50%, #C9A84C 100%)",
                color: "#0A0A0A",
                boxShadow: loading ? "none" : "0 4px 20px rgba(201,168,76,0.3)",
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Connexion...
                </span>
              ) : "Se connecter"}
            </button>
          </form>
        </div>

        {/* Liens bas */}
        <div className="text-center mt-6 space-y-2">
          <Link href="/"
            className="block text-sm transition-colors duration-200"
            style={{ color: "rgba(201,168,76,0.4)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#C9A84C")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(201,168,76,0.4)")}
          >
            ← Retour au site
          </Link>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.15)" }}>
            Accès réservé au personnel autorisé
          </p>
        </div>
      </motion.div>
    </div>
  );
}
