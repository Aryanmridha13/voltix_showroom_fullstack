import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { Sparkles, Sun, Moon, Rotate3d, Compass } from 'lucide-react';
import ThreeVehicleStage from './ThreeVehicleStage';

/**
 * InteractiveTeslaStage
 * 100% faithful implementation of the user's reference image:
 * - Massive blocky "MODEL THREE" font behind the vehicle
 * - Real-time mouse rotation & drag physics (vehicle rotates and pitches in 3D)
 * - Deep multi-layer parallax for background typography and stage
 * - Right-side vertical dot indicator (1, 2, 3, 4) with active circular ring
 * - Bottom-left accent bar with editorial brief
 * - Bottom-right action pills: COMPARE NOW, CONFIGURE, ORDER NOW
 * - Dual High-Key Studio (Reference photo style) & Dark Cyber mode
 */
export default function InteractiveTeslaStage() {
  const [activeModelIndex, setActiveModelIndex] = useState(2); // Default to Model Three (Index 2)
  const [isDarkMode, setIsDarkMode] = useState(false); // High-key studio like reference by default
  const containerRef = useRef(null);

  const models = [
    {
      id: 'model-one',
      displayTitle: 'MODEL ONE',
      editionLabel: 'VOLTIX MODEL ONE EDITION',
      desc: 'Engineered for all-terrain resilience and high-density urban utility. Reinforced tubular chassis, dual front hydraulic suspension, and military-grade graphene cell matrix for effortless daily commutes.',
      image: '/vehicles/scooter_grey.png',
      badge: 'Urban Graphene',
      accentColor: '#10b981',
      variantId: 1,
    },
    {
      id: 'model-two',
      displayTitle: 'MODEL TWO',
      editionLabel: 'VOLTIX MODEL TWO EDITION',
      desc: 'Precision urban agility meets aerodynamic modern flair. Whisper-quiet permanent magnet motor, instant torque delivery, and modular quick-swap battery architecture tailored for modern commuters.',
      image: '/vehicles/scooter_red.png',
      badge: 'City Velocity',
      accentColor: '#ef4444',
      variantId: 5,
    },
    {
      id: 'model-three',
      displayTitle: 'MODEL THREE',
      editionLabel: 'VOLTIX MODEL THREE EDITION',
      desc: 'Unleash the future of driving in the Voltix Model Three Edition. A leap in innovation that fuses instant acceleration with intelligent control. This all-electric performance machine is built for those who pursue progress and precision, delivering a seamless fusion of range and elegance that redefines every mile into an experience.',
      image: '/vehicles/scooter_blue.png',
      badge: 'Track Hyper 01',
      accentColor: '#06b6d4',
      variantId: 10,
    },
    {
      id: 'model-four',
      displayTitle: 'ROADSTER',
      editionLabel: 'VOLTIX ROADSTER XR7 EDITION',
      desc: 'The pinnacle of electric speed. Dual-vector hyper controllers, active aerodynamic posture, zero-to-sixty acceleration under 3 seconds, and uncompromising structural integrity.',
      image: '/vehicles/scooter_blue.png',
      badge: 'Flagship Aero',
      accentColor: '#84cc16',
      variantId: 9,
    },
  ];

  const current = models[activeModelIndex];

  // Mouse Movement & Drag Spring Physics for 3D Rotation
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for high-end automotive feel
  const springConfig = { damping: 25, stiffness: 180, mass: 0.6 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // 3D Vehicle Rotation & Translation Transforms
  const vehicleRotateY = useTransform(smoothX, [-0.5, 0.5], [-26, 26]); // Yaw
  const vehicleRotateX = useTransform(smoothY, [-0.5, 0.5], [14, -14]); // Pitch
  const vehicleTranslateX = useTransform(smoothX, [-0.5, 0.5], [-35, 35]);
  const vehicleTranslateY = useTransform(smoothY, [-0.5, 0.5], [-15, 15]);

  // Background Typography Opposite Parallax (Creates incredible depth!)
  const textTranslateX = useTransform(smoothX, [-0.5, 0.5], [30, -30]);
  const textTranslateY = useTransform(smoothY, [-0.5, 0.5], [10, -10]);
  const textRotateY = useTransform(smoothX, [-0.5, 0.5], [8, -8]);

  // Track cursor relative to stage container
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(xPct);
    mouseY.set(yPct);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative min-h-[92vh] flex flex-col justify-between p-6 sm:p-10 lg:p-14 overflow-hidden transition-colors duration-700 select-none ${
        isDarkMode
          ? 'bg-[#030d08] text-white'
          : 'bg-[#f4f4f6] text-neutral-900'
      }`}
    >
      {/* 3D Three.js Ambient Particle Constellation & Pedestal (Subtle in Background) */}
      <ThreeVehicleStage accentColor={current.accentColor} />

      {/* Top Floating Controls Bar */}
      <div className="relative z-30 flex items-center justify-between w-full">
        {/* Brand Tag */}
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest ${
              isDarkMode
                ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                : 'bg-neutral-900 text-white shadow-sm'
            }`}
          >
            VOLTIX MOTORS
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium opacity-60">
            <Compass className="w-3.5 h-3.5" /> Move mouse to rotate in 3D
          </span>
        </div>

        {/* Studio / Cyber Theme Switcher */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm ${
            isDarkMode
              ? 'bg-slate-900 border border-emerald-950 text-slate-300 hover:text-white'
              : 'bg-white border border-neutral-300 text-neutral-800 hover:bg-neutral-100 shadow-sm'
          }`}
          title="Toggle High-Key Studio / Dark Cyber stage"
        >
          {isDarkMode ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400" /> Studio Light
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-emerald-600" /> Cyber Dark
            </>
          )}
        </button>
      </div>

      {/* =========================================================================
          CENTER 3D STAGE:
          1. Massive Background Typography ("MODEL THREE")
          2. 3D Moveable / Rotatable Vehicle Model
          3. Right-Side Vertical 4-Dot Step Indicator with Ring
          ========================================================================= */}
      <div className="relative my-auto w-full flex items-center justify-center min-h-[360px] sm:min-h-[480px] lg:min-h-[540px] perspective-1200">
        {/* 1. Massive Background Typography (Reference Image 1: "MODEL THREE") */}
        <motion.div
          style={{
            x: textTranslateX,
            y: textTranslateY,
            rotateY: textRotateY,
          }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
        >
          <AnimatePresence mode="wait">
            <motion.h1
              key={current.displayTitle}
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.06, y: -20 }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
              className={`font-display font-black tracking-tight text-[15vw] sm:text-[18vw] lg:text-[19vw] leading-none uppercase select-none transition-colors duration-700 whitespace-nowrap ${
                isDarkMode ? 'text-white/[0.08]' : 'text-neutral-900'
              }`}
            >
              {current.displayTitle}
            </motion.h1>
          </AnimatePresence>
        </motion.div>

        {/* 2. Realistic Floor Contact Shadow (Tire Shadow Grounding) */}
        <motion.div
          style={{
            x: vehicleTranslateX,
            scaleX: useTransform(smoothY, [-0.5, 0.5], [1.1, 0.9]),
          }}
          className={`absolute bottom-6 sm:bottom-10 w-72 sm:w-[480px] lg:w-[580px] h-10 sm:h-14 rounded-[100%] blur-xl pointer-events-none transition-opacity duration-700 ${
            isDarkMode ? 'bg-black/90' : 'bg-neutral-800/25'
          }`}
        />

        {/* 3. Interactive Moveable / Rotatable Vehicle (3D Mouse Pitch & Yaw) */}
        <motion.div
          style={{
            rotateY: vehicleRotateY,
            rotateX: vehicleRotateX,
            x: vehicleTranslateX,
            y: vehicleTranslateY,
          }}
          className="relative z-10 flex items-center justify-center cursor-grab active:cursor-grabbing preserve-3d"
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={current.image + current.id}
              src={current.image}
              alt={current.displayTitle}
              initial={{ opacity: 0, scale: 0.88, x: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.92, x: -50 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="max-h-[300px] sm:max-h-[440px] lg:max-h-[500px] w-auto object-contain drop-shadow-[0_25px_40px_rgba(0,0,0,0.5)] select-none pointer-events-none"
            />
          </AnimatePresence>
        </motion.div>

        {/* 4. Right-Side Vertical Step Dots with Active Ring (Tesla Model 3 Reference style) */}
        <div className="absolute right-0 sm:right-2 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-5 sm:gap-6">
          {models.map((m, idx) => {
            const isActive = activeModelIndex === idx;
            return (
              <button
                key={m.id}
                onClick={() => setActiveModelIndex(idx)}
                aria-label={`Select ${m.displayTitle}`}
                className="relative group p-1.5 focus:outline-none transition-transform hover:scale-110"
              >
                {isActive ? (
                  <motion.div
                    layoutId="activeTeslaRing"
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs ${
                      isDarkMode
                        ? 'border-emerald-400 text-emerald-300 shadow-md shadow-emerald-500/30'
                        : 'border-neutral-900 text-neutral-950 font-black'
                    }`}
                    transition={{ type: 'spring', stiffness: 380, damping: 25 }}
                  >
                    <span>{idx + 1}</span>
                  </motion.div>
                ) : (
                  <div
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                      isDarkMode
                        ? 'bg-slate-700 group-hover:bg-emerald-400 group-hover:scale-125'
                        : 'bg-neutral-400 group-hover:bg-neutral-800 group-hover:scale-125'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          BOTTOM BAR: Exact Reference Layout
          Left: Vertical Black Accent Line + Title + Paragraph
          Right: 3 Pill Buttons (COMPARE NOW, CONFIGURE, ORDER NOW)
          ========================================================================= */}
      <div className="relative z-20 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end pt-4">
        {/* Left: Editorial Paragraph with Vertical Line (Exact match to reference) */}
        <div className="lg:col-span-7 flex items-start gap-4 sm:gap-5">
          {/* Vertical Accent Line */}
          <div
            className={`w-1 sm:w-1.5 self-stretch rounded-full shrink-0 transition-colors duration-500 ${
              isDarkMode ? 'bg-emerald-400' : 'bg-neutral-900'
            }`}
          />

          <div className="space-y-1.5 max-w-2xl">
            <h3
              className={`font-black text-sm sm:text-base tracking-wider uppercase ${
                isDarkMode ? 'text-white' : 'text-neutral-950'
              }`}
            >
              {current.editionLabel}
            </h3>
            <p
              className={`text-xs sm:text-[13px] leading-relaxed font-medium ${
                isDarkMode ? 'text-slate-400' : 'text-neutral-600'
              }`}
            >
              {current.desc}
            </p>
          </div>
        </div>

        {/* Right: 3 Rounded Action Pills (COMPARE NOW, CONFIGURE, ORDER NOW) */}
        <div className="lg:col-span-5 flex flex-wrap items-center justify-start lg:justify-end gap-3 sm:gap-4">
          {/* 1. COMPARE NOW (Pill Outline) */}
          <Link
            to="/vehicles"
            className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-200 border active:scale-95 ${
              isDarkMode
                ? 'border-slate-700 hover:border-emerald-400 text-slate-200 hover:text-white glass-panel'
                : 'border-neutral-800 hover:bg-neutral-200/60 text-neutral-900 bg-transparent'
            }`}
          >
            Compare Now
          </Link>

          {/* 2. CONFIGURE (Pill Outline) */}
          <Link
            to={`/customizer?variant=${current.variantId}`}
            className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-200 border active:scale-95 ${
              isDarkMode
                ? 'border-emerald-500/60 hover:bg-emerald-500/20 text-emerald-300'
                : 'border-neutral-800 hover:bg-neutral-200/60 text-neutral-900 bg-transparent'
            }`}
          >
            Configure
          </Link>

          {/* 3. ORDER NOW (Solid Dark Pill) */}
          <Link
            to="/book-test-ride"
            className={`px-7 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-200 shadow-lg active:scale-95 hover:scale-105 ${
              isDarkMode
                ? 'bg-gradient-to-r from-emerald-500 to-lime-400 text-slate-950 shadow-emerald-500/25'
                : 'bg-neutral-950 text-white hover:bg-neutral-800 shadow-neutral-900/30'
            }`}
          >
            Order Now
          </Link>
        </div>
      </div>
    </div>
  );
}
