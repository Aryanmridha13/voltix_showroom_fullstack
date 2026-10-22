import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { ArrowLeft, ArrowRight, BatteryCharging, Gauge, Sparkles, Tag } from 'lucide-react';

/**
 * HorizontalVehicleShowcase
 * Draggable and scrollable Framer Motion horizontal carousel inspired by
 * modern automotive brand showcases (Porsche, Tesla, Lucid).
 */
export default function HorizontalVehicleShowcase({ vehicles = [] }) {
  const containerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Fallback vehicles if database fetch is empty
  const displayVehicles = vehicles.length > 0 ? vehicles : [
    {
      id: 1,
      name: 'Apex Hyper 01',
      model_name: 'Apex Series',
      category_name: 'High Speed Sport EV',
      base_price: 139999,
      original_price: 154999,
      default_image: '/vehicles/scooter_blue.png',
      driving_range_km: 160,
      top_speed_kmh: 90,
      tag: 'Track Edition',
      watermark: 'APEX',
      accent: '#06b6d4',
    },
    {
      id: 2,
      name: 'SE Ultra Pro',
      model_name: 'SE Series',
      category_name: 'Urban Commuter',
      base_price: 94999,
      original_price: 104999,
      default_image: '/vehicles/scooter_red.png',
      driving_range_km: 125,
      top_speed_kmh: 75,
      tag: 'Best Seller',
      watermark: 'URBAN',
      accent: '#ef4444',
    },
    {
      id: 3,
      name: 'X-One Graphene Plus',
      model_name: 'X-One Series',
      category_name: 'Utility All-Terrain',
      base_price: 84999,
      original_price: 92999,
      default_image: '/vehicles/scooter_grey.png',
      driving_range_km: 110,
      top_speed_kmh: 65,
      tag: 'Heavy Duty',
      watermark: 'ROBUST',
      accent: '#10b981',
    },
  ];

  const scroll = (direction) => {
    if (containerRef.current) {
      const scrollAmount = 420;
      containerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  return (
    <div className="relative py-12 overflow-hidden space-y-8">
      {/* Header with Navigation Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-lime-400" />
            Lineup Showcase
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
            Performance <span className="text-gradient-emerald">Fleet</span>
          </h2>
          <p className="text-sm text-slate-400 max-w-xl">
            Swipe or use controls to explore precision-tuned electric variants built for speed, range, and endurance.
          </p>
        </div>

        {/* Scroll Arrows */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            aria-label="Scroll left"
            className="w-12 h-12 rounded-2xl glass-panel border border-emerald-950/80 flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-all shadow-lg active:scale-95"
          >
            <ArrowLeft className="w-5 h-5 text-emerald-300" />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            aria-label="Scroll right"
            className="w-12 h-12 rounded-2xl glass-panel border border-emerald-950/80 flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-all shadow-lg active:scale-95"
          >
            <ArrowRight className="w-5 h-5 text-emerald-300" />
          </button>
        </div>
      </div>

      {/* Horizontal Track */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex gap-6 overflow-x-auto px-4 sm:px-8 lg:px-12 py-6 scrollbar-none snap-x snap-mandatory cursor-grab active:cursor-grabbing"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {displayVehicles.map((variant, index) => {
          const watermark = variant.watermark || `EV 0${index + 1}`;
          const isBlue = (variant.default_image || '').includes('blue');
          const isRed = (variant.default_image || '').includes('red');
          const glowClass = isRed
            ? 'from-rose-500/20 via-orange-500/10'
            : isBlue
            ? 'from-cyan-500/20 via-teal-500/10'
            : 'from-emerald-500/20 via-lime-500/10';

          return (
            <motion.div
              key={variant.id || index}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="min-w-[340px] sm:min-w-[420px] max-w-[420px] rounded-3xl glass-card border border-emerald-950/80 overflow-hidden flex flex-col justify-between relative group snap-start bg-[#04120a]/80 shadow-2xl"
            >
              {/* Massive Watermark Typography Behind Vehicle (Reference 1 & 3 style) */}
              <div className="absolute top-8 left-1/2 -translate-x-1/2 text-7xl sm:text-8xl font-black text-white/[0.04] uppercase tracking-tighter select-none pointer-events-none whitespace-nowrap z-0">
                {watermark}
              </div>

              {/* Ambient Radial Spotlight */}
              <div
                className={`absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-gradient-to-tr ${glowClass} blur-3xl group-hover:scale-125 transition-transform duration-700 pointer-events-none`}
              />

              {/* Card Header & Badges */}
              <div className="p-6 relative z-10 flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest block">
                    {variant.model_name || 'Voltix Series'}
                  </span>
                  <h3 className="text-2xl font-black text-white tracking-tight group-hover:text-emerald-300 transition-colors">
                    {variant.name}
                  </h3>
                </div>

                {variant.original_price && (
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-lime-500/15 text-lime-300 border border-lime-500/30 flex items-center gap-1 backdrop-blur-md">
                    <Tag className="w-3 h-3" /> Special
                  </span>
                )}
              </div>

              {/* Center Floating Cutout */}
              <div className="h-60 relative flex items-center justify-center px-6 my-2 z-10">
                <motion.img
                  src={variant.default_image || '/vehicles/scooter_blue.png'}
                  alt={variant.name}
                  whileHover={{ scale: 1.12, rotate: -1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="max-h-full w-auto object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.95)]"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/vehicles/scooter_blue.png';
                  }}
                />
              </div>

              {/* Specs & Pricing Footer */}
              <div className="p-6 pt-2 relative z-10 space-y-5 bg-gradient-to-t from-[#020b06] to-transparent">
                {/* Performance Pill Grid */}
                <div className="grid grid-cols-2 gap-3 py-3 px-4 rounded-2xl bg-[#030e08]/90 border border-emerald-950/70">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                      <BatteryCharging className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Certified Range</p>
                      <p className="text-sm font-black text-white">{variant.driving_range_km || 140} km</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-lime-500/10 flex items-center justify-center text-lime-400 shrink-0">
                      <Gauge className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Top Speed</p>
                      <p className="text-sm font-black text-white">{variant.top_speed_kmh || 80} km/h</p>
                    </div>
                  </div>
                </div>

                {/* Price and Actions */}
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Ex-Showroom Price</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl sm:text-2xl font-black text-white">
                        ₹{Number(variant.base_price || 99999).toLocaleString('en-IN')}
                      </span>
                      {variant.original_price && (
                        <span className="text-xs text-slate-500 line-through">
                          ₹{Number(variant.original_price).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/vehicles/${variant.id}`}
                      className="px-4 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20 active:scale-95"
                    >
                      Details
                    </Link>
                    <Link
                      to={`/customizer?variant=${variant.id}`}
                      className="p-2.5 rounded-xl glass-panel text-slate-300 hover:text-white hover:border-lime-400/50 transition-colors"
                      title="Customize 3D Finish"
                    >
                      <Sparkles className="w-4 h-4 text-lime-400" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
