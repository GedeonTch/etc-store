"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useLangue } from "@/contexts/LangueContext";
import { parserPhotos } from "@/lib/utils";

const cV = { hidden: {}, visible: { transition: { staggerChildren: 0.045, delayChildren: 0.1 } } };
const lV = { hidden: { opacity: 0, y: 28, rotateX: -80, scale: 0.85 }, visible: { opacity: 1, y: 0, rotateX: 0, scale: 1, transition: { type: "spring" as const, stiffness: 180, damping: 16 } } };

interface ProduitMini { id: string; titre: string; photos: string; categorie: string }
interface Props { imagesCarrousel?: ProduitMini[] }

export default function Hero3D({ imagesCarrousel = [] }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { t } = useLangue();

  // Extraire toutes les images disponibles
  const toutesImages = imagesCarrousel
    .flatMap((p) => parserPhotos(p.photos).slice(0, 1).map((url) => ({ url, titre: p.titre, categorie: p.categorie, id: p.id })))
    .filter((img) => img.url)
    .slice(0, 6);

  const [indexActif, setIndexActif] = useState(0);
  const [direction, setDirection] = useState(1);

  const suivant = useCallback(() => {
    if (toutesImages.length === 0) return;
    setDirection(1);
    setIndexActif((prev) => (prev + 1) % toutesImages.length);
  }, [toutesImages.length]);

  const precedent = useCallback(() => {
    if (toutesImages.length === 0) return;
    setDirection(-1);
    setIndexActif((prev) => (prev - 1 + toutesImages.length) % toutesImages.length);
  }, [toutesImages.length]);

  // Auto-rotation toutes les 4 secondes
  useEffect(() => {
    if (toutesImages.length <= 1) return;
    const timer = setInterval(suivant, 4000);
    return () => clearInterval(timer);
  }, [suivant, toutesImages.length]);

  // Three.js
  useEffect(() => {
    let aid: number; let renderer: any;
    const init = async () => {
      const THREE = await import("three");
      const canvas = canvasRef.current;
      if (!canvas) return;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
      camera.position.z = 3;
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      const geo = new THREE.IcosahedronGeometry(1, 4);
      const sphere = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0xc9a84c, metalness: 0.92, roughness: 0.08 }));
      scene.add(sphere);
      const wire = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xc9a84c, wireframe: true, transparent: true, opacity: 0.18 }));
      wire.scale.setScalar(1.015); scene.add(wire);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(1.65, 0.013, 8, 120), new THREE.MeshBasicMaterial({ color: 0xc9a84c, transparent: true, opacity: 0.3 }));
      ring.rotation.x = Math.PI / 3; scene.add(ring);
      scene.add(new THREE.AmbientLight(0xffffff, 0.4));
      const l1 = new THREE.PointLight(0xc9a84c, 3, 12); l1.position.set(3, 3, 3); scene.add(l1);
      const l2 = new THREE.PointLight(0x8866ff, 1.5, 10); l2.position.set(-4, -2, 2); scene.add(l2);
      const pGeo = new THREE.BufferGeometry();
      const pos = new Float32Array(300 * 3);
      for (let i = 0; i < 900; i++) pos[i] = (Math.random() - 0.5) * 9;
      pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0xc9a84c, size: 0.028, transparent: true, opacity: 0.75 }));
      scene.add(particles);
      const clock = new THREE.Clock();
      const animate = () => {
        aid = requestAnimationFrame(animate);
        const e = clock.getElapsedTime();
        sphere.rotation.y = e * 0.3; sphere.rotation.x = Math.sin(e * 0.2) * 0.2;
        wire.rotation.y = e * 0.3; wire.rotation.x = Math.sin(e * 0.2) * 0.2;
        ring.rotation.z = e * 0.15; particles.rotation.y = e * 0.05;
        sphere.scale.setScalar(1 + Math.sin(e * 0.8) * 0.03);
        renderer.render(scene, camera);
      }; animate();
      const onResize = () => { if (!canvas || !renderer) return; camera.aspect = canvas.clientWidth / canvas.clientHeight; camera.updateProjectionMatrix(); renderer.setSize(canvas.clientWidth, canvas.clientHeight); };
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    };
    init();
    return () => { if (aid) cancelAnimationFrame(aid); if (renderer) renderer.dispose(); };
  }, []);

  const g = { background: "linear-gradient(135deg,#C9A84C 0%,#F0D080 45%,#C9A84C 100%)", WebkitBackgroundClip: "text" as const, WebkitTextFillColor: "transparent" as const, backgroundClip: "text" as const };
  const g2 = { background: "linear-gradient(135deg,#F0D080 0%,#C9A84C 50%,#E8C060 100%)", WebkitBackgroundClip: "text" as const, WebkitTextFillColor: "transparent" as const, backgroundClip: "text" as const };

  const imgActuelle = toutesImages[indexActif];

  return (
    <section suppressHydrationWarning className="relative min-h-screen flex items-center overflow-hidden" style={{ background: "linear-gradient(135deg,#080808 0%,#0a0a0a 60%,#0d0b08 100%)" }}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ opacity: 0.55, pointerEvents: "none" }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to right,rgba(8,8,8,0.95) 0%,rgba(8,8,8,0.7) 50%,rgba(8,8,8,0.2) 100%)" }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 60% at 30% 50%,rgba(201,168,76,0.06) 0%,transparent 70%)" }} />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* ── Colonne gauche : texte ── */}
          <div style={{ perspective: "800px" }}>
            <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
              className="text-xs font-semibold uppercase tracking-[0.35em] mb-4" style={{ color: "rgba(201,168,76,0.55)" }}>
              — Bienvenue dans
            </motion.p>
            <motion.div variants={cV} initial="hidden" animate="visible" className="flex flex-wrap mb-1" style={{ transformStyle: "preserve-3d" }}>
              {"ÉTABLISSEMENT".split("").map((l, i) => (
                <motion.span key={i} variants={lV} className="font-playfair font-bold text-4xl sm:text-5xl lg:text-6xl inline-block" style={{ ...g, lineHeight: 1.1 }}>{l === " " ? "\u00A0" : l}</motion.span>
              ))}
            </motion.div>
            <motion.div variants={cV} initial="hidden" animate="visible" className="flex flex-wrap mb-8" style={{ transformStyle: "preserve-3d" }}>
              {"TCHIBANVUNYA".split("").map((l, i) => (
                <motion.span key={i} variants={lV} className="font-playfair font-bold text-4xl sm:text-5xl lg:text-6xl inline-block" style={{ ...g2, lineHeight: 1.1 }}>{l}</motion.span>
              ))}
            </motion.div>
            <motion.div initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: 1, opacity: 1 }} transition={{ duration: 0.8, delay: 0.8 }}
              className="mb-6 h-px w-32 origin-left" style={{ background: "linear-gradient(90deg,#C9A84C,transparent)" }} />
            <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 1.0 }}
              className="font-playfair text-2xl sm:text-3xl font-semibold leading-tight mb-4" style={{ color: "#F5F0E8" }}>
              {t("hero_titre")}
            </motion.h2>
            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 1.15 }}
              className="text-base leading-relaxed mb-10 max-w-lg" style={{ color: "rgba(245,240,232,0.55)" }}>
              {t("hero_sous_titre")}
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 1.3 }} className="flex flex-wrap gap-4">
              <Link href="/catalogue" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold text-sm transition-all duration-200"
                style={{ background: "linear-gradient(135deg,#C9A84C,#E8C060,#C9A84C)", color: "#0A0A0A", boxShadow: "0 4px 24px rgba(201,168,76,0.35)" }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.05)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}>
                {t("hero_cta")}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </Link>
              <a href="https://wa.me/25766504165" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold text-sm transition-all duration-200"
                style={{ border: "1px solid rgba(201,168,76,0.5)", color: "#C9A84C" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(201,168,76,0.1)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                WhatsApp
              </a>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }}
              className="mt-14 flex items-center gap-2 text-xs" style={{ color: "rgba(201,168,76,0.3)" }}>
              <div className="w-px h-7" style={{ background: "rgba(201,168,76,0.3)" }} />
              <span>Bukavu, Sud-Kivu — République Démocratique du Congo</span>
            </motion.div>
          </div>

          {/* ── Colonne droite : carrousel images produits ── */}
          {toutesImages.length > 0 && (
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.5 }}
              className="hidden lg:flex flex-col items-center gap-4">

              {/* Image principale */}
              <div className="relative w-full max-w-sm aspect-[4/3] rounded-2xl overflow-hidden"
                style={{ border: "1px solid rgba(201,168,76,0.2)", boxShadow: "0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(201,168,76,0.1)" }}>

                <AnimatePresence mode="wait" custom={direction}>
                  {imgActuelle && (
                    <motion.div key={indexActif} custom={direction}
                      initial={{ opacity: 0, x: direction * 60 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: direction * -60 }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                      className="absolute inset-0">
                      {imgActuelle.url.startsWith("data:") ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={imgActuelle.url} alt={imgActuelle.titre} className="w-full h-full object-cover" />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={imgActuelle.url} alt={imgActuelle.titre} className="w-full h-full object-cover" />
                      )}
                      {/* Overlay info produit */}
                      <div className="absolute bottom-0 left-0 right-0 p-4"
                        style={{ background: "linear-gradient(to top,rgba(0,0,0,0.85) 0%,transparent 100%)" }}>
                        <p className="text-xs font-medium uppercase tracking-widest mb-0.5" style={{ color: "rgba(201,168,76,0.8)" }}>
                          {imgActuelle.categorie}
                        </p>
                        <p className="text-sm font-semibold text-white truncate">{imgActuelle.titre}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Boutons navigation */}
                {toutesImages.length > 1 && (
                  <>
                    <button onClick={precedent}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 z-10"
                      style={{ background: "rgba(0,0,0,0.6)", border: "1px solid rgba(201,168,76,0.3)", color: "#C9A84C" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(201,168,76,0.2)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.6)"; }}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button onClick={suivant}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 z-10"
                      style={{ background: "rgba(0,0,0,0.6)", border: "1px solid rgba(201,168,76,0.3)", color: "#C9A84C" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(201,168,76,0.2)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.6)"; }}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}

                {/* Badge "Nouveau" */}
                <div className="absolute top-3 right-3 z-10">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{ background: "rgba(201,168,76,0.9)", color: "#0A0A0A" }}>
                    Nouveau
                  </span>
                </div>
              </div>

              {/* Miniatures */}
              {toutesImages.length > 1 && (
                <div className="flex gap-2 justify-center">
                  {toutesImages.map((img, i) => (
                    <button key={i} onClick={() => { setDirection(i > indexActif ? 1 : -1); setIndexActif(i); }}
                      className="relative w-12 h-12 rounded-lg overflow-hidden transition-all duration-200 flex-shrink-0"
                      style={{
                        border: i === indexActif ? "2px solid #C9A84C" : "2px solid rgba(255,255,255,0.1)",
                        opacity: i === indexActif ? 1 : 0.5,
                        transform: i === indexActif ? "scale(1.1)" : "scale(1)",
                      }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.url} alt={img.titre} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Lien vers le produit */}
              {imgActuelle && (
                <Link href={`/produit/${imgActuelle.id}`}
                  className="text-xs font-medium transition-colors duration-200 flex items-center gap-1.5"
                  style={{ color: "rgba(201,168,76,0.6)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#C9A84C")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(201,168,76,0.6)")}>
                  Voir ce produit
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
