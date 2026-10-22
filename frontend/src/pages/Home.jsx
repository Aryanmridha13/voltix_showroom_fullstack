import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  Sparkles,
  Calendar,
  Gauge,
  Battery,
  ShieldCheck,
  ArrowRight,
  Activity,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import api from '../services/api';
import ThreeVehicleStage from '../components/ThreeVehicleStage';
import HorizontalVehicleShowcase from '../components/HorizontalVehicleShowcase';
import AngleShowcase from '../components/AngleShowcase';

/**
 * Home Page
 * Luxury Automotive Experience inspired by Tesla Model 3, Porsche New Era,
 * and Roadster interactive 3D showcases. Powered by Three.js & Framer Motion.
 */
export default function Home() {
  const [health, setHealth] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);

  // Hero flagship options (Directly mirrors Tesla & Porsche reference layouts)
  const heroFleet = [
    {
      title: 'VOLTIX APEX',
      subtitle: 'TRACK-TUNED HYPER SCOOTER',
      modelName: 'Apex Hyper 01 Edition',
      desc: 'Unleash peak permanent-magnet power. Instant 0-RPM torque fused with intelligent vector telemetry. Redefining high-speed urban dynamics.',
      image: '/vehicles/scooter_blue.png',
      watermark: 'HYPER APEX',
      range: '160 KM',
      topSpeed: '90 KM/H',
      accel: '2.9s',
      accent: '#06b6d4',
      glow: 'from-cyan-500/20 via-emerald-500/10',
      variantId: 10,
    },
    {
      title: 'SE ULTRA',
      subtitle: 'METROPOLITAN COMMUTER',
      modelName: 'SE Ultra Pro Edition',
      desc: 'Sleek, aerodynamic, and engineered for high-density city streets. Zero emissions, whisper-quiet motor, and modular fast-swapping battery.',
      image: '/vehicles/scooter_red.png',
      watermark: 'SE ULTRA',
      range: '135 KM',
      topSpeed: '75 KM/H',
      accel: '3.4s',
      accent: '#ef4444',
      glow: 'from-rose-500/20 via-orange-500/10',
      variantId: 6,
    },
    {
      title: 'X-ONE RUGGED',
      subtitle: 'ALL-TERRAIN GRAPHENE',
      modelName: 'X-One Graphene Plus',
      desc: 'Heavy-duty dual suspension, tubular exoskeleton cage, and military-grade graphene cell matrix built to conquer any gradient.',
      image: '/vehicles/scooter_grey.png',
      watermark: 'X-ONE 01',
      range: '115 KM',
      topSpeed: '65 KM/H',
      accel: '3.8s',
      accent: '#10b981',
      glow: 'from-emerald-500/25 via-lime-500/10',
      variantId: 1,
    },
  ];

  const currentHero = heroFleet[activeHeroIndex];

  useEffect(() => {
    // Check backend health
    const checkSystemHealth = async () => {
      try {
        const res = await api.get('/health/');
        setHealth(res.data?.data || null);
      } catch {
        setHealth({ status: 'offline', database: { status: 'disconnected' } });
      }
    };

    // Fetch vehicles for showcase
    const fetchVehicles = async () => {
      try {
        const res = await api.get('/vehicles/variants/');
        setVehicles(res.data?.data || []);
      } catch {
        // Fallbacks in component will handle gracefully
      }
    };

    checkSystemHealth();
    fetchVehicles();
  }, []);

  return (
    <div className="space-y-24 pb-20 overflow-hidden">
      {/* =========================================================================
          HERO STAGE: Inspired by Reference 1 ("MODEL THREE") & Reference 4 ("ROADSTER")
          Features: Three.js 3D Particles, Massive Behind-Vehicle Text, Tesla Dot Nav
          ========================================================================= */}
      <section className="relative min-h-[90vh] flex flex-col justify-between pt-8 pb-16 overflow-hidden">
        {/* Three.js 3D Ambient Particle Constellation & Pedestal Floor */}
        <ThreeVehicleStage accentColor={currentHero.accent} />

        {/* Ambient Radial Spotlight */}
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-gradient-to-tr ${currentHero.glow} blur-[140px] rounded-full pointer-events-none transition-all duration-1000`}
        />

        {/* Top Tagline */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 pt-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider animate-in fade-in">
            <Zap className="w-3.5 h-3.5 text-lime-400 fill-lime-400" />
            Next-Gen Eco-Performance Velocity
          </div>
        </div>

        {/* Center Stage: Massive Background Typography + Floating Transparent Vehicle */}
        <div className="relative w-full my-auto flex items-center justify-center min-h-[420px] sm:min-h-[520px]">
          {/* Giant Behind-the-Vehicle Typography (Reference 1 & Reference 3) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center select-none pointer-events-none z-0">
            <AnimatePresence mode="wait">
              <motion.h1
                key={currentHero.watermark}
                initial={{ opacity: 0, scale: 0.92, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.05, y: -15 }}
                transition={{ duration: 0.6 }}
                className="text-[12vw] sm:text-[14vw] font-black uppercase tracking-tighter leading-none text-white/[0.045] whitespace-nowrap"
              >
                {currentHero.watermark}
              </motion.h1>
            </AnimatePresence>
          </div>

          {/* Floating Vehicle Cutout */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentHero.image}
              initial={{ opacity: 0, scale: 0.88, x: 60 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.92, x: -60 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="relative z-10 flex items-center justify-center px-4"
            >
              <img
                src={currentHero.image}
                alt={currentHero.title}
                className="max-h-[340px] sm:max-h-[460px] lg:max-h-[520px] w-auto object-contain drop-shadow-[0_30px_45px_rgba(0,0,0,0.98)] hover:scale-105 transition-transform duration-700"
              />
            </motion.div>
          </AnimatePresence>

          {/* Vertical Step Indicator Dots on the Right (Tesla Model 3 Reference 1 style) */}
          <div className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-4">
            {heroFleet.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveHeroIndex(idx)}
                aria-label={`Select vehicle ${idx + 1}`}
                className="relative group flex items-center justify-center p-2 focus:outline-none"
              >
                {activeHeroIndex === idx ? (
                  <motion.div
                    layoutId="activeDotRing"
                    className="w-7 h-7 rounded-full border border-emerald-400 flex items-center justify-center"
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  >
                    <span className="text-[10px] font-bold text-emerald-300">{idx + 1}</span>
                  </motion.div>
                ) : (
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-600 group-hover:bg-emerald-400/80 transition-colors" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Hero Bottom Bar: Editorial Brief + Quick Specs + CTAs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end border-t border-emerald-950/60 pt-6">
            {/* Left: Model Title & Description (Reference 1 style) */}
            <div className="lg:col-span-6 space-y-2">
              <div className="border-l-2 border-emerald-400 pl-3">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block">
                  {currentHero.subtitle}
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                  {currentHero.modelName}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-xl">
                {currentHero.desc}
              </p>
            </div>

            {/* Middle: Performance Badges */}
            <div className="lg:col-span-3 flex items-center gap-4 sm:gap-6">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Range</p>
                <p className="text-xl sm:text-2xl font-black text-white">{currentHero.range}</p>
              </div>
              <div className="h-8 w-px bg-emerald-950" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Top Speed</p>
                <p className="text-xl sm:text-2xl font-black text-white">{currentHero.topSpeed}</p>
              </div>
              <div className="h-8 w-px bg-emerald-950" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">0-40 KM/H</p>
                <p className="text-xl sm:text-2xl font-black text-lime-400">{currentHero.accel}</p>
              </div>
            </div>

            {/* Right: Action Pills */}
            <div className="lg:col-span-3 flex flex-wrap lg:justify-end gap-3">
              <Link
                to="/vehicles"
                className="px-5 py-2.5 rounded-full border border-slate-700 hover:border-emerald-400 text-white font-bold text-xs uppercase tracking-wider transition-colors glass-panel"
              >
                Lineup
              </Link>
              <Link
                to={`/customizer?variant=${currentHero.variantId}`}
                className="px-5 py-2.5 rounded-full border border-emerald-500/50 hover:bg-emerald-500/20 text-emerald-300 font-bold text-xs uppercase tracking-wider transition-all"
              >
                Configure
              </Link>
              <Link
                to="/book-test-ride"
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-lime-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/25 hover:scale-105 transition-all"
              >
                Book Ride
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          HORIZONTAL DRAGGABLE SHOWCASE: Framer Motion Left-Right Scroll Carousel
          ========================================================================= */}
      <HorizontalVehicleShowcase vehicles={vehicles} />

      {/* =========================================================================
          ANGLE SHOWCASE: Directly inspired by Reference Image 5 ("BUILT TO EVERY ANGLE")
          ========================================================================= */}
      <AngleShowcase />

      {/* =========================================================================
          EDITORIAL STATS COUNTERS: Inspired by Reference Image 2 ("FLAWLESS CLEAN")
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="p-8 sm:p-14 rounded-3xl glass-card border border-emerald-950/80 bg-gradient-to-b from-[#04140b] via-[#030d07] to-[#020b05] relative overflow-hidden shadow-2xl">
          <div className="text-center space-y-3 mb-12">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
              Automotive Engineering Integrity
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
              Flawless Performance. <span className="text-gradient-emerald">Zero Compromise.</span>
            </h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto">
              Every Voltix drivetrain undergoes rigorous 2,000-cycle torture testing and climate simulation.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-emerald-950/80">
            <motion.div whileHover={{ scale: 1.05 }} className="space-y-2 pt-4 md:pt-0">
              <span className="text-4xl sm:text-6xl font-black text-white tracking-tight block">160K+</span>
              <p className="text-xs text-slate-400 uppercase font-semibold">Electric Km Logged</p>
              <span className="text-[11px] text-emerald-400 block font-medium">By Verified Riders</span>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} className="space-y-2 pt-4 md:pt-0 md:pl-6">
              <span className="text-4xl sm:text-6xl font-black text-white tracking-tight block">0.18₹</span>
              <p className="text-xs text-slate-400 uppercase font-semibold">Per KM Operating Cost</p>
              <span className="text-[11px] text-lime-400 block font-medium">92% Petrol Savings</span>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} className="space-y-2 pt-4 md:pt-0 md:pl-6">
              <span className="text-4xl sm:text-6xl font-black text-white tracking-tight block">45 Min</span>
              <p className="text-xs text-slate-400 uppercase font-semibold">Fast Charge Window</p>
              <span className="text-[11px] text-emerald-400 block font-medium">CCS2 Compatible</span>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} className="space-y-2 pt-4 md:pt-0 md:pl-6">
              <span className="text-4xl sm:text-6xl font-black text-white tracking-tight block">98%</span>
              <p className="text-xs text-slate-400 uppercase font-semibold">Customer Trust Score</p>
              <span className="text-[11px] text-lime-400 block font-medium">5-Year BMS Warranty</span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SHOWROOM STATUS & HEALTH BANNER
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-[#030e08] border border-emerald-950 text-xs text-slate-400 shadow-xl">
          <Activity className="w-4 h-4 text-lime-400" />
          <span className="font-semibold text-white">Live Showroom Engine:</span>
          {health?.status === 'healthy' ? (
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              Active (MySQL 8.0 Concurrency - {health.database?.latency_ms || 1.1}ms)
            </span>
          ) : (
            <span className="text-amber-400 font-bold">Connecting Live Node...</span>
          )}
        </div>
      </section>
    </div>
  );
}
