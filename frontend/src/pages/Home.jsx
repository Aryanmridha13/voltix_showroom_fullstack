import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import InteractiveTeslaStage from '../components/InteractiveTeslaStage';
import HorizontalVehicleShowcase from '../components/HorizontalVehicleShowcase';
import AngleShowcase from '../components/AngleShowcase';

/**
 * Home Page
 * Luxury Automotive Experience faithfully matching user's Tesla Model 3 reference image:
 * - 3D Mouse Rotatable Vehicle Model with Spring Physics & Depth Translation
 * - Deep Parallax Background Typography ("MODEL THREE")
 * - 4-Dot Vertical Stepper with Circular Active Ring
 * - Bottom Left Vertical Accent Line with Model Paragraph
 * - Bottom Right Pill Action Buttons: COMPARE NOW, CONFIGURE, ORDER NOW
 * - High-Key Studio / Cyber Dark Mode Switcher
 * - Horizontal Draggable Lineup & "Built to Every Angle" 360 Showcase
 */
export default function Home() {
  const [health, setHealth] = useState(null);
  const [vehicles, setVehicles] = useState([]);

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
          HERO SECTION: 100% Faithful to Reference Image ("MODEL THREE")
          3D Mouse Rotatable Model + Background Typography Parallax + Tesla Stepper
          ========================================================================= */}
      <InteractiveTeslaStage />

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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
