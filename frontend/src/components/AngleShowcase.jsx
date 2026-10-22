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
 * High-key White Studio 360 Architecture Showcase directly inspired by Reference Image 5.
 * Features Anton watermark typography, crisp white cards, and interactive perspective switching.
 */
export default function AngleShowcase() {
  const [selectedAngle, setSelectedAngle] = useState('sport');

  const angles = [
    {
      id: 'sport',
      label: 'Sport Profile',
      tagline: 'Track aerodynamic posture with ultra-low drag coefficient',
      image: '/vehicles/scooter_blue.png',
      badge: 'AGGRESSIVE STANCE',
    },
    {
      id: 'urban',
      label: 'Urban Commuter',
      tagline: 'High visibility dual LED array with relaxed city ergonomics',
      image: '/vehicles/scooter_red.png',
      badge: 'CITY AGILITY',
    },
    {
      id: 'rugged',
      label: 'Rugged Utility',
      tagline: 'Reinforced crash bars and heavy payload all-terrain suspension',
      image: '/vehicles/scooter_grey.png',
      badge: 'REINFORCED CHASSIS',
    },
  ];

  const current = angles.find((a) => a.id === selectedAngle) || angles[0];

  const leftCards = [
    {
      icon: Cpu,
      title: 'Vector FOC Controller',
      desc: '32-bit dual-core DSP processor delivering instant 0-RPM torque with zero throttle lag.',
    },
    {
      icon: Battery,
      title: 'Smart LFP Cell Pack',
      desc: 'Tested to 2,000 charge cycles with integrated BMS 3.0 multi-stage thermal monitoring.',
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
      desc: 'Channeled underbody airflow keeps battery and motor cool even in 48°C extreme climates.',
    },
    {
      icon: Layers,
      title: 'Ultra-Torsional Chassis',
      desc: 'High-tensile tubular steel frame maintains absolute rigidity during sharp urban cornering.',
    },
    {
      icon: Zap,
      title: 'Turbo Charge Architecture',
      desc: 'High-voltage smart charging replenishes 0 to 80% range in just 45 minutes.',
    },
  ];

  return (
    <section className="relative py-20 overflow-hidden bg-[#f4f4f6] border-y border-neutral-200/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* Title & Perspective Tabs (Reference Image 5 style) */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider shadow-sm">
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
            360 Engineering Architecture
          </div>
          <h2 className="text-3xl sm:text-5xl font-section-title font-black text-neutral-950 tracking-section uppercase">
            Built to <span className="text-emerald-700">Every Angle</span>
          </h2>
          <p className="text-sm text-neutral-500 max-w-xl mx-auto font-medium">
            Explore the structural engineering, aerodynamics, and smart components handcrafted for sustainable velocity.
          </p>

          {/* Perspective Selector Pills */}
          <div className="inline-flex p-1.5 rounded-full bg-white border border-neutral-300 shadow-sm mt-2">
            {angles.map((a) => (
              <button
                key={a.id}
                onClick={() => setSelectedAngle(a.id)}
                className={`px-5 sm:px-7 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                  selectedAngle === a.id
                    ? 'bg-neutral-950 text-white shadow-md shadow-neutral-900/20 scale-105'
                    : 'text-neutral-600 hover:text-neutral-950'
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
                  transition={{ delay: idx * 0.12 }}
                  className="p-6 rounded-3xl bg-white border border-neutral-200/90 shadow-md hover:shadow-xl hover:border-neutral-400 transition-all space-y-2.5 group"
                >
                  <div className="w-10 h-10 rounded-2xl bg-neutral-100 border border-neutral-200 text-neutral-900 flex items-center justify-center group-hover:bg-neutral-950 group-hover:text-white transition-all shadow-xs">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm sm:text-base font-card-title text-neutral-950 group-hover:text-emerald-700 transition-colors uppercase tracking-card">
                    {card.title}
                  </h4>
                  <p className="text-xs text-neutral-500 leading-relaxed font-medium">{card.desc}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Center Stage: Vehicle Cutout with Dynamic Typography & Ground Shadow */}
          <div className="lg:col-span-6 relative flex flex-col items-center justify-center min-h-[380px] sm:min-h-[460px] order-1 lg:order-2">
            {/* Massive Behind-Vehicle Text (Tesla style) - Visible Black Contrast */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-7xl sm:text-9xl font-black text-neutral-950/15 uppercase tracking-tighter select-none pointer-events-none whitespace-nowrap">
              {current.badge}
            </div>

            {/* Glowing Floor Ground Shadow */}
            <div className="absolute bottom-6 w-72 sm:w-96 h-10 rounded-[100%] bg-neutral-900/15 blur-lg pointer-events-none" />

            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, scale: 0.88, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: -20 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="relative z-10 flex flex-col items-center"
              >
                <img
                  src={current.image}
                  alt={current.label}
                  className="max-h-[320px] sm:max-h-[420px] w-auto object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.35)] hover:scale-105 transition-transform duration-500"
                />

                <div className="text-center mt-5 space-y-1.5">
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-white border border-neutral-300 text-neutral-900 shadow-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    {current.badge}
                  </span>
                  <p className="text-xs text-neutral-500 max-w-sm font-medium">{current.tagline}</p>
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
                  transition={{ delay: idx * 0.12 }}
                  className="p-6 rounded-3xl bg-white border border-neutral-200/90 shadow-md hover:shadow-xl hover:border-neutral-400 transition-all space-y-2.5 group"
                >
                  <div className="w-10 h-10 rounded-2xl bg-neutral-100 border border-neutral-200 text-neutral-900 flex items-center justify-center group-hover:bg-neutral-950 group-hover:text-white transition-all shadow-xs">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm sm:text-base font-card-title text-neutral-950 group-hover:text-emerald-700 transition-colors uppercase tracking-card">
                    {card.title}
                  </h4>
                  <p className="text-xs text-neutral-500 leading-relaxed font-medium">{card.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
