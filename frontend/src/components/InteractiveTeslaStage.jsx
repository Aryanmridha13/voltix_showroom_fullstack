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
import { useTheme } from '../context/ThemeContext';

export default function InteractiveTeslaStage() {
  const [activeModelIndex, setActiveModelIndex] = useState(2); // Default to Model Three (Index 2 - KTM RC 390)
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const { isDarkMode, toggleTheme } = useTheme();
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
      secondaryColor: '#064e3b',
      variantId: 1,
      colorCombinations: [
        { id: 'emerald-graphene', name: 'Emerald Graphene', primary: '#10b981', secondary: '#064e3b' },
        { id: 'phantom-slate', name: 'Phantom Slate', primary: '#34d399', secondary: '#1e293b' },
      ],
    },
    {
      id: 'model-two',
      displayTitle: 'MODEL TWO',
      editionLabel: 'VOLTIX MODEL TWO EDITION',
      desc: 'Precision urban agility meets aerodynamic modern flair. Whisper-quiet permanent magnet motor, instant torque delivery, and modular quick-swap battery architecture tailored for modern commuters.',
      image: '/vehicles/scooter_red.png',
      badge: 'City Velocity',
      accentColor: '#ef4444',
      secondaryColor: '#7f1d1d',
      variantId: 5,
      colorCombinations: [
        { id: 'velocity-crimson', name: 'Velocity Crimson', primary: '#ef4444', secondary: '#7f1d1d' },
        { id: 'obsidian-flare', name: 'Obsidian Flare', primary: '#f87171', secondary: '#0f172a' },
      ],
    },
    {
      id: 'model-three',
      displayTitle: 'MODEL THREE',
      editionLabel: 'KTM RC 390 GP RACING EDITION',
      desc: 'Moto3-inspired engineering engineered for maximum track agility and high-octane velocity. Powered by a high-revving 373cc liquid-cooled single-cylinder powerhouse, ultralight trellis subframe in signature racing orange, WP APEX inverted cartridge suspension, and dual-channel Bosch cornering ABS.',
      image: '/vehicles/ktm_rc_390.png',
      badge: 'Ready to Race',
      accentColor: '#FF5500',
      secondaryColor: '#FFFFFF',
      variantId: 15,
      colorCombinations: [
        {
          id: 'ktm-gp-orange',
          name: 'Factory GP Orange & White',
          primary: '#FF5500',
          secondary: '#FFFFFF',
          label: 'Orange / White',
        },
        {
          id: 'ktm-stealth-carbon',
          name: 'Stealth Carbon & Orange',
          primary: '#FF5500',
          secondary: '#18181B',
          label: 'Orange / Carbon',
        },
        {
          id: 'ktm-arctic-white',
          name: 'Arctic Whiteout & GP Orange',
          primary: '#FFFFFF',
          secondary: '#FF5500',
          label: 'White / Orange',
        },
      ],
    },
    {
      id: 'model-four',
      displayTitle: 'ROADSTER',
      editionLabel: 'VOLTIX ROADSTER X3 EDITION',
      desc: 'The pinnacle of electric speed. Dual-vector hyper controllers, active aerodynamic posture, zero-to-sixty acceleration under 3 seconds, and uncompromising structural integrity.',
      image: '/vehicles/scooter_blue.png',
      badge: 'Flagship Aero',
      accentColor: '#84cc16',
      secondaryColor: '#365314',
      variantId: 9,
      colorCombinations: [
        { id: 'hyper-lime', name: 'Hyper Lime Aero', primary: '#84cc16', secondary: '#365314' },
        { id: 'cyber-acid', name: 'Cyber Acid Green', primary: '#a3e635', secondary: '#09090b' },
      ],
    },
  ];

  const current = models[activeModelIndex] || models[0];

  // Reset color combo index when model changes
  useEffect(() => {
    setSelectedColorIndex(0);
  }, [activeModelIndex]);

  const activeCombo =
    current?.colorCombinations?.[selectedColorIndex] || {
      primary: current?.accentColor || '#FF5500',
      secondary: current?.secondaryColor || '#FFFFFF',
      name: 'Default',
    };

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
      className={`relative min-h-[90vh] flex flex-col justify-between p-5 sm:p-8 lg:p-10 overflow-hidden transition-colors duration-700 select-none ${
        isDarkMode
          ? 'bg-[#030d08] text-white'
          : 'bg-[#f4f4f6] text-neutral-900'
      }`}
    >
      {/* 3D Three.js Ambient Particle Constellation & Pedestal (Subtle in Background) */}
      <ThreeVehicleStage
        accentColor={activeCombo.primary}
        secondaryColor={activeCombo.secondary}
      />

      {/* Ambient Radial Spotlight Illuminating Vehicle & Stage Background with active bike color combination */}
      <div
        style={{
          background: isDarkMode
            ? `radial-gradient(ellipse at center, ${activeCombo.primary}33 0%, ${
                activeCombo.secondary === '#FFFFFF' ? 'rgba(255,255,255,0.08)' : activeCombo.secondary + '25'
              } 45%, transparent 75%)`
            : `radial-gradient(ellipse at center, ${activeCombo.primary}20 0%, rgba(255,255,255,0.85) 50%, transparent 80%)`,
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[88vw] max-w-[1050px] h-[520px] rounded-full blur-[100px] pointer-events-none transition-all duration-700 z-0"
      />

      {/* Studio Showroom Floor Horizon Seam */}
      <div
        className={`absolute bottom-0 inset-x-0 h-1/3 pointer-events-none transition-opacity duration-700 z-0 ${
          isDarkMode
            ? 'bg-gradient-to-t from-emerald-950/25 to-transparent'
            : 'bg-gradient-to-t from-neutral-200/50 to-transparent'
        }`}
      />

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
          onClick={toggleTheme}
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
          2. Dynamic Animated Underglow Halo & Synchronized Breathing Shadow
          3. 3D Moveable / Rotatable Vehicle Model with Floating Levitation
          4. Color Combination Livery Swatch Selector
          5. Right-Side Vertical 4-Dot Step Indicator with Ring
          ========================================================================= */}
      <div className="relative my-auto w-full flex items-center justify-center min-h-[340px] sm:min-h-[420px] lg:min-h-[480px] perspective-1200 py-2">
        {/* 1. Massive Background Typography (Reference Image 1: "MODEL THREE") */}
        <motion.div
          style={{
            x: textTranslateX,
            y: textTranslateY,
            rotateY: textRotateY,
          }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden"
        >
          <AnimatePresence mode="wait">
            <motion.h1
              key={current.displayTitle}
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.06, y: -20 }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
              style={{ letterSpacing: '-0.025em', wordSpacing: 'normal' }}
              className={`font-display font-black text-[12vw] sm:text-[14vw] lg:text-[15vw] leading-none uppercase select-none transition-colors duration-700 whitespace-nowrap ${
                isDarkMode
                  ? 'text-white/20 drop-shadow-[0_0_40px_rgba(255,255,255,0.06)]'
                  : 'text-neutral-900'
              }`}
            >
              {current.displayTitle}
            </motion.h1>
          </AnimatePresence>
        </motion.div>

        {/* 2. Dynamic Underglow Halo matching active bike color combination with breathing animation */}
        <motion.div
          animate={{
            scale: [1, 1.08, 1],
            opacity: [0.35, 0.65, 0.35],
          }}
          transition={{
            duration: 3.4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            x: vehicleTranslateX,
            backgroundColor: activeCombo.primary,
          }}
          className="absolute bottom-10 sm:bottom-14 w-60 sm:w-[420px] lg:w-[540px] h-8 sm:h-12 rounded-[100%] blur-2xl pointer-events-none transition-colors duration-500"
        />

        {/* 3. Realistic Floor Contact Shadow with synchronized breathing */}
        <motion.div
          style={{
            x: vehicleTranslateX,
            scaleX: useTransform(smoothY, [-0.5, 0.5], [1.1, 0.9]),
          }}
          className="absolute bottom-6 sm:bottom-10 w-72 sm:w-[480px] lg:w-[580px] h-10 sm:h-14 flex items-center justify-center pointer-events-none z-0"
        >
          <motion.div
            animate={{
              scale: [1, 0.93, 1],
              opacity: [0.75, 0.52, 0.75],
            }}
            transition={{
              duration: 3.4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className={`w-full h-full rounded-[100%] blur-xl transition-opacity duration-700 ${
              isDarkMode ? 'bg-black/95' : 'bg-neutral-900/30'
            }`}
          />
        </motion.div>

        {/* 4. Interactive Moveable / Rotatable Vehicle (3D Mouse Pitch & Yaw + Suspension Hover) */}
        <motion.div
          style={{
            rotateY: vehicleRotateY,
            rotateX: vehicleRotateX,
            x: vehicleTranslateX,
            y: vehicleTranslateY,
          }}
          className="relative z-10 flex items-center justify-center cursor-grab active:cursor-grabbing preserve-3d"
        >
          {/* Smooth floating / suspension levitation idle animation */}
          <motion.div
            animate={{
              y: [0, -12, 0],
              rotateZ: [0, 0.4, 0, -0.4, 0],
            }}
            transition={{
              duration: 3.4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="relative flex items-center justify-center"
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={current.image + current.id}
                src={current.image}
                alt={current.displayTitle}
                initial={{ opacity: 0, scale: 0.88, x: 50, filter: 'blur(6px)' }}
                animate={{ opacity: 1, scale: 1, x: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.92, x: -50, filter: 'blur(6px)' }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="max-h-[300px] sm:max-h-[440px] lg:max-h-[500px] w-auto object-contain drop-shadow-[0_25px_40px_rgba(0,0,0,0.5)] select-none pointer-events-none"
              />
            </AnimatePresence>
          </motion.div>
        </motion.div>

        {/* 5. Interactive Color Combination Livery Selector */}
        {current.colorCombinations && current.colorCombinations.length > 0 && (
          <div className="absolute -bottom-2 sm:bottom-0 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-full backdrop-blur-md border shadow-xl transition-all duration-300 bg-white/80 dark:bg-black/75 border-neutral-200/90 dark:border-white/10">
            <span className="text-[10px] font-black tracking-widest uppercase opacity-60 px-1 hidden sm:inline-block">
              Livery:
            </span>
            {current.colorCombinations.map((combo, idx) => {
              const isSelected = selectedColorIndex === idx;
              return (
                <button
                  key={combo.id || idx}
                  onClick={() => setSelectedColorIndex(idx)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all duration-300 active:scale-95 ${
                    isSelected
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-md scale-105 ring-1 ring-neutral-400 dark:ring-white/40'
                      : 'hover:bg-neutral-200/60 dark:hover:bg-white/10 text-neutral-700 dark:text-neutral-300'
                  }`}
                  title={combo.name}
                >
                  {/* Split circular swatch showing dual color combination */}
                  <span className="relative w-3.5 h-3.5 rounded-full overflow-hidden border border-black/30 dark:border-white/30 shrink-0 inline-block shadow-inner">
                    <span
                      className="absolute inset-0 right-1/2"
                      style={{ backgroundColor: combo.primary }}
                    />
                    <span
                      className="absolute inset-0 left-1/2"
                      style={{ backgroundColor: combo.secondary }}
                    />
                  </span>
                  <span className="truncate max-w-[120px] sm:max-w-none">{combo.name}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* 6. Right-Side Vertical Step Dots with Active Ring (Tesla Model 3 Reference style) */}
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
                    style={{ borderColor: activeCombo.primary }}
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-black text-xs shadow-md ${
                      isDarkMode ? 'text-white' : 'text-neutral-950'
                    }`}
                    transition={{ type: 'spring', stiffness: 380, damping: 25 }}
                  >
                    <span>{idx + 1}</span>
                  </motion.div>
                ) : (
                  <div
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                      isDarkMode
                        ? 'bg-slate-700 group-hover:bg-white group-hover:scale-125'
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
          Left: Vertical Accent Line + Title + Paragraph
          Right: 3 Pill Buttons (COMPARE NOW, CONFIGURE, ORDER NOW)
          ========================================================================= */}
      <div className="relative z-20 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end pt-4 pb-2">
        {/* Left: Editorial Paragraph with Vertical Line (Exact match to reference) */}
        <div className="lg:col-span-7 flex items-start gap-4 sm:gap-5">
          {/* Vertical Accent Line themed with bike's primary color */}
          <div
            style={{ backgroundColor: activeCombo.primary }}
            className="w-1.5 sm:w-2 self-stretch rounded-full shrink-0 transition-colors duration-500 shadow-sm"
          />

          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <h3
                className={`font-black text-sm sm:text-base tracking-wider uppercase ${
                  isDarkMode ? 'text-white' : 'text-neutral-950'
                }`}
              >
                {current.editionLabel}
              </h3>
              <span
                style={{
                  backgroundColor: `${activeCombo.primary}20`,
                  color: activeCombo.primary,
                  borderColor: `${activeCombo.primary}40`,
                }}
                className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border"
              >
                {current.badge}
              </span>
            </div>
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
          {/* 1. COMPARE NOW (White Pill Button with bold black text) */}
          <Link
            to="/vehicles"
            className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-200 border active:scale-95 shadow-md ${
              isDarkMode
                ? 'bg-white hover:bg-neutral-100 text-neutral-950 hover:text-black border-white'
                : 'bg-white hover:bg-neutral-100 text-neutral-950 hover:text-black border-neutral-300'
            }`}
          >
            Compare Now
          </Link>

          <Link
            to={`/customizer?variant=${current.variantId}`}
            style={{
              borderColor: isDarkMode ? `${activeCombo.primary}80` : activeCombo.primary,
              color: isDarkMode ? '#FFFFFF' : '#000000',
            }}
            className="px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-200 border hover:opacity-85 active:scale-95 bg-transparent"
          >
            Configure
          </Link>

          {/* 3. ORDER NOW (Solid Pill themed with bike color accent) */}
          <Link
            to="/book-test-ride"
            style={{
              backgroundColor: isDarkMode ? activeCombo.primary : '#0a0a0a',
              color: '#FFFFFF',
              boxShadow: `0 8px 24px ${activeCombo.primary}40`,
            }}
            className="px-7 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-200 shadow-lg active:scale-95 hover:scale-105"
          >
            Order Now
          </Link>
        </div>
      </div>
    </div>
  );
}
