import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cpu,
  Battery,
  Shield,
  Wind,
  Layers,
  Zap,
  Eye,
  CheckCircle2,
} from 'lucide-react';

/**
 * AngleShowcase
 * Directly inspired by Reference Image 5 ("BUILT TO EVERY ANGLE"):
 * Center showcase with interactive perspective switching, flanked by
 * 6 floating glassmorphic engineering specification cards.
 */
export default function AngleShowcase() {
  const [selectedAngle, setSelectedAngle] = useState('sport');

  const angles = [
    {
      id: 'sport',
      label: 'Sport Profile',
      tagline: 'Track aerodynamic posture with low drag coefficient',
      image: '/vehicles/scooter_blue.png',
      badge: 'Aggressive Stance',
      accent: '#06b6d4',
    },
    {
      id: 'urban',
      label: 'Urban Commuter',
      labelShort: 'Urban',
      tagline: 'High visibility dual LED array with city ergonomics',
      image: '/vehicles/scooter_red.png',
      badge: 'City Agility',
      accent: '#ef4444',
    },
    {
      id: 'rugged',
      label: 'Rugged Utility',
      labelShort: 'Utility',
      tagline: 'Reinforced crash bars and heavy payload suspension',
      image: '/vehicles/scooter_grey.png',
      badge: 'Reinforced Chassis',
      accent: '#10b981',
    },
  ];

  const current = angles.find((a) => a.id === selectedAngle) || angles[0];

  const leftCards = [
    {
      icon: Cpu,
      title: 'Vector FOC Controller',
      desc: '32-bit dual-core DSP processor delivering instant 0-RPM torque with zero stuttering.',
    },
    {
      icon: Battery,
      title: 'Smart LFP Cell Pack',
      desc: 'Tested to 2,000 charge cycles with integrated BMS 3.0 multi-stage thermal cutoffs.',
    },
    {
      icon: Shield,
      title: 'Progressive CBS Braking',
      desc: 'Hydraulic dual-caliper disc brakes coupled with dynamic regenerative kinetic recovery.',
    },
  ];

  const rightCards = [
    {
      icon: Wind,
      title: 'Convective Aero Cooling',
      desc: 'Channeled underbody airflow keeps battery and controller cool even in 48°C extreme climates.',
    },
    {
      icon: Layers,
      title: 'Ultra-Torsional Chassis',
      desc: 'High-tensile tubular steel frame maintains absolute rigidity during sharp urban cornering.',
    },
    {
      icon: Zap,
      title: 'Turbo Charge Architecture',
      desc: 'High-voltage smart charging replenishes 0 to 80% range in just 55 minutes.',
    },
  ];

  return (
    <section className="relative py-20 overflow-hidden bg-gradient-to-b from-[#020b06] via-[#04120a] to-[#020b06] border-y border-emerald-950/60">
      {/* Background Ambient Spotlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* Title & Perspective Tabs (Reference Image 5 style) */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Eye className="w-3.5 h-3.5 text-lime-400" />
            360 Architecture
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
            Built to <span className="text-gradient-emerald">Every Angle</span>
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Explore the structural engineering and smart components handcrafted for zero-emission velocity.
          </p>

          {/* Interactive Perspective Selector Pills */}
          <div className="inline-flex p-1.5 rounded-2xl glass-panel border border-emerald-950 bg-[#030d07] mt-2">
            {angles.map((a) => (
              <button
                key={a.id}
                onClick={() => setSelectedAngle(a.id)}
                className={`px-4 sm:px-6 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedAngle === a.id
                    ? 'bg-gradient-to-r from-emerald-500 to-lime-400 text-slate-950 shadow-lg shadow-emerald-500/25 scale-105'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3-Column Layout: Left Cards | Center Vehicle Stage | Right Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Feature Column */}
          <div className="lg:col-span-3 space-y-5 order-2 lg:order-1">
            {leftCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.15 }}
                  className="p-5 rounded-2xl glass-card border border-emerald-950/80 bg-[#030e08]/90 hover:border-emerald-500/40 transition-all space-y-2 group shadow-xl"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5 text-emerald-300" />
                  </div>
                  <h4 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {card.title}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{card.desc}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Center Stage: Vehicle Cutout with Dynamic Backlight */}
          <div className="lg:col-span-6 relative flex flex-col items-center justify-center min-h-[380px] sm:min-h-[460px] order-1 lg:order-2">
            {/* Massive Behind-Vehicle Text (Tesla style) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-7xl sm:text-9xl font-black text-white/[0.03] uppercase tracking-tighter select-none pointer-events-none whitespace-nowrap">
              {current.badge}
            </div>

            {/* Glowing Ground Disk */}
            <div className="absolute bottom-6 w-72 sm:w-96 h-16 rounded-[100%] bg-emerald-500/20 blur-2xl pointer-events-none" />

            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, scale: 0.85, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="relative z-10 flex flex-col items-center"
              >
                <img
                  src={current.image}
                  alt={current.label}
                  className="max-h-[320px] sm:max-h-[420px] w-auto object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,0.95)] hover:scale-105 transition-transform duration-500"
                />

                <div className="text-center mt-4 space-y-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5 text-lime-400" />
                    {current.badge}
                  </span>
                  <p className="text-xs text-slate-400 max-w-sm">{current.tagline}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Feature Column */}
          <div className="lg:col-span-3 space-y-5 order-3">
            {rightCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.15 }}
                  className="p-5 rounded-2xl glass-card border border-emerald-950/80 bg-[#030e08]/90 hover:border-lime-400/40 transition-all space-y-2 group shadow-xl"
                >
                  <div className="w-10 h-10 rounded-xl bg-lime-500/10 border border-lime-500/20 text-lime-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5 text-lime-300" />
                  </div>
                  <h4 className="text-base font-bold text-white group-hover:text-lime-300 transition-colors">
                    {card.title}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{card.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
