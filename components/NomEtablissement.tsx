"use client";

// Composant — Nom animé ÉTABLISSEMENT TCHIBANVUNYA
// Chaque lettre entre en scène individuellement avec un effet 3D

import { motion } from "framer-motion";

interface Props {
  size?: "sm" | "md" | "lg" | "xl";
  showSubtitle?: boolean;
  subtitle?: string;
  className?: string;
}

const SIZES = {
  sm: "text-lg sm:text-xl tracking-[0.15em]",
  md: "text-2xl sm:text-3xl tracking-[0.18em]",
  lg: "text-3xl sm:text-4xl tracking-[0.2em]",
  xl: "text-4xl sm:text-5xl lg:text-6xl tracking-[0.22em]",
};

// Animation lettre par lettre
const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.04, delayChildren: 0.1 },
  },
};

const letterVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    rotateX: -90,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 200,
      damping: 18,
    },
  },
};

// Ligne décorative animée
const lineVariants = {
  hidden: { scaleX: 0, opacity: 0 },
  visible: {
    scaleX: 1,
    opacity: 1,
    transition: { duration: 0.8, delay: 0.6, ease: "easeOut" as const },
  },
};

export default function NomEtablissement({
  size = "md",
  showSubtitle = true,
  subtitle = "Panneau d'administration",
  className = "",
}: Props) {
  const ligne1 = "ÉTABLISSEMENT";
  const ligne2 = "TCHIBANVUNYA";

  return (
    <div className={`text-center select-none ${className}`} style={{ perspective: "600px" }}>

      {/* Ligne décorative haut */}
      <motion.div
        variants={lineVariants}
        initial="hidden"
        animate="visible"
        className="mx-auto mb-4 h-px w-16 origin-center"
        style={{
          background: "linear-gradient(90deg, transparent, #C9A84C, transparent)",
        }}
      />

      {/* ÉTABLISSEMENT */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={`font-playfair font-bold ${SIZES[size]} flex flex-wrap justify-center`}
        style={{ transformStyle: "preserve-3d" }}
      >
        {ligne1.split("").map((lettre, i) => (
          <motion.span
            key={`l1-${i}`}
            variants={letterVariants}
            className="inline-block"
            style={{
              background: "linear-gradient(135deg, #C9A84C 0%, #F0D080 45%, #C9A84C 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              textShadow: "none",
              display: "inline-block",
              // Espace pour les espaces
              minWidth: lettre === " " ? "0.3em" : undefined,
            }}
          >
            {lettre === " " ? "\u00A0" : lettre}
          </motion.span>
        ))}
      </motion.div>

      {/* TCHIBANVUNYA — décalé légèrement */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={`font-playfair font-bold ${SIZES[size]} flex flex-wrap justify-center mt-1`}
        style={{ transformStyle: "preserve-3d" }}
      >
        {ligne2.split("").map((lettre, i) => (
          <motion.span
            key={`l2-${i}`}
            variants={letterVariants}
            className="inline-block"
            style={{
              background: "linear-gradient(135deg, #F0D080 0%, #C9A84C 50%, #E8C060 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              textShadow: "none",
              display: "inline-block",
            }}
          >
            {lettre}
          </motion.span>
        ))}
      </motion.div>

      {/* Ligne décorative bas */}
      <motion.div
        variants={lineVariants}
        initial="hidden"
        animate="visible"
        className="mx-auto mt-4 h-px w-16 origin-center"
        style={{
          background: "linear-gradient(90deg, transparent, #C9A84C, transparent)",
        }}
      />

      {/* Sous-titre */}
      {showSubtitle && subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.5 }}
          className="mt-3 text-sm font-medium"
          style={{ color: "rgba(201,168,76,0.55)", letterSpacing: "0.12em" }}
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}
