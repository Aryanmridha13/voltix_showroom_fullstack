import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
} from 'lucide-react';
import api from '../services/api';

export default function Home() {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    const checkSystemHealth = async () => {
      try {
        const res = await api.get('/health/');
        setHealth(res.data?.data || null);
      } catch {
        setHealth({ status: 'offline', database: { status: 'disconnected' } });
      }
    };
    checkSystemHealth();
  }, []);

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 overflow-hidden">
        {/* Background Radial Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-500/20 to-emerald-500/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border border-cyan-500/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider animate-in fade-in">
            <Zap className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
            Next-Gen EV Engineering
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.1]">
            Unleash Pure Electric Power.{' '}
            <span className="text-gradient-cyan block mt-2">Zero Emissions. Total Control.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed">
            Experience peak torque from 0 RPM, hyper-tuned regenerative braking, and cloud-connected
            smart telemetry. Handcrafted for urban commuters and highway cruisers.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              to="/vehicles"
              className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 font-bold text-sm shadow-xl shadow-cyan-500/20 hover:scale-[1.02] transition-transform"
            >
              Explore Showroom
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/customizer"
              className="flex items-center gap-2 px-7 py-3.5 rounded-2xl glass-panel text-white font-semibold text-sm hover:border-cyan-500/50 hover:bg-slate-900/80 transition-all"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Configure in 3D
            </Link>

            <Link
              to="/book-test-ride"
              className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-emerald-400 font-semibold text-sm hover:border-emerald-500/40 transition-all"
            >
              <Calendar className="w-4 h-4" />
              Book Test Ride
            </Link>
          </div>

          {/* Backend Diagnostics Pill */}
          <div className="pt-8 flex justify-center">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-medium">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                Live Showroom Service:
              </span>
              {health?.status === 'healthy' ? (
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Online (MySQL 8.0 Connected - {health.database?.latency_ms || 1.2}ms)
                </span>
              ) : (
                <span className="text-amber-400 font-semibold">Connecting to Engine...</span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Core Performance Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Engineered Without Compromise</h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            State-of-the-art permanent magnet synchronous motors paired with intelligent thermal management.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl glass-card relative overflow-hidden space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Gauge className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">0-40 km/h in 2.9s</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Instant peak torque delivered seamlessly via precision FOC controllers. Hyper mode
              acceleration for effortless city overtaking.
            </p>
          </div>

          <div className="p-8 rounded-3xl glass-card relative overflow-hidden space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Battery className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">180 KM Certified Range</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              High energy density IP67-rated battery packs with multi-stage regenerative braking to maximize
              every kilowatt of energy.
            </p>
          </div>

          <div className="p-8 rounded-3xl glass-card relative overflow-hidden space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">BMS 3.0 Safety Guard</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Real-time thermal monitoring across individual cell groups with auto-cutoff and 5-year
              comprehensive warranty.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
