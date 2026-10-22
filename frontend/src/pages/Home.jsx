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
          EDITORIAL STATS COUNTERS: High-Key Studio Reference
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="p-8 sm:p-14 rounded-3xl bg-white border border-neutral-200/90 shadow-xl relative overflow-hidden">
          {/* Subtle Studio Watermark */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 font-display text-7xl sm:text-9xl font-black text-neutral-950/[0.03] uppercase tracking-tighter select-none pointer-events-none whitespace-nowrap z-0">
            INTEGRITY
          </div>

          <div className="text-center space-y-3 mb-12 relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider shadow-sm">
              Automotive Engineering Integrity
            </span>
            <h2 className="text-3xl sm:text-5xl font-section-title font-black text-neutral-950 uppercase tracking-section">
              Flawless Performance. <span className="text-emerald-700">Zero Compromise.</span>
            </h2>
            <p className="text-sm text-neutral-500 max-w-xl mx-auto font-medium">
              Every Voltix drivetrain undergoes rigorous 2,000-cycle torture testing and climate simulation.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-neutral-200 relative z-10">
            <motion.div whileHover={{ scale: 1.05 }} className="space-y-2 pt-4 md:pt-0">
              <span className="text-4xl sm:text-6xl font-section-title font-black text-neutral-950 tracking-wide block">160K+</span>
              <p className="text-xs text-neutral-500 uppercase font-bold tracking-wider">Electric Km Logged</p>
              <span className="text-[11px] text-emerald-700 block font-semibold">By Verified Riders</span>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} className="space-y-2 pt-4 md:pt-0 md:pl-6">
              <span className="text-4xl sm:text-6xl font-section-title font-black text-neutral-950 tracking-wide block">0.18₹</span>
              <p className="text-xs text-neutral-500 uppercase font-bold tracking-wider">Per KM Operating Cost</p>
              <span className="text-[11px] text-emerald-700 block font-semibold">92% Petrol Savings</span>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} className="space-y-2 pt-4 md:pt-0 md:pl-6">
              <span className="text-4xl sm:text-6xl font-section-title font-black text-neutral-950 tracking-wide block">45 Min</span>
              <p className="text-xs text-neutral-500 uppercase font-bold tracking-wider">Fast Charge Window</p>
              <span className="text-[11px] text-emerald-700 block font-semibold">CCS2 Compatible</span>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} className="space-y-2 pt-4 md:pt-0 md:pl-6">
              <span className="text-4xl sm:text-6xl font-section-title font-black text-neutral-950 tracking-wide block">98%</span>
              <p className="text-xs text-neutral-500 uppercase font-bold tracking-wider">Customer Trust Score</p>
              <span className="text-[11px] text-emerald-700 block font-semibold">5-Year BMS Warranty</span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SHOWROOM STATUS & HEALTH BANNER
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-white border border-neutral-300 text-xs text-neutral-600 shadow-sm">
          <Activity className="w-4 h-4 text-emerald-600" />
          <span className="font-bold text-neutral-950">Live Showroom Engine:</span>
          {health?.status === 'healthy' ? (
            <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              Active (MySQL 8.0 Concurrency - {health.database?.latency_ms || 1.1}ms)
            </span>
          ) : (
            <span className="text-amber-600 font-bold">Connecting Live Node...</span>
          )}
        </div>
      </section>
    </div>
  );
}
