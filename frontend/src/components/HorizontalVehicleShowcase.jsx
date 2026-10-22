import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, BatteryCharging, Gauge, Sparkles, Tag } from 'lucide-react';

/**
 * HorizontalVehicleShowcase
 * High-key White Studio Automotive Showcase inspired by Tesla and Porsche design languages.
 * Features massive Anton watermark typography, clean white studio cards, and smooth horizontal scrolling.
 */
export default function HorizontalVehicleShowcase({ vehicles = [] }) {
  const containerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Fallback vehicles
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
      watermark: 'MODEL 01',
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
      watermark: 'MODEL 02',
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
      watermark: 'MODEL 03',
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
    <div className="relative py-14 overflow-hidden space-y-8 bg-transparent">
      {/* Header with Navigation Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Performance Lineup
          </div>
          <h2 className="text-3xl sm:text-5xl font-display font-black text-neutral-950 tracking-tight uppercase">
            Engineered <span className="text-emerald-600">Fleet</span>
          </h2>
          <p className="text-sm text-neutral-500 max-w-xl font-medium">
            Swipe or use controls to explore precision-tuned electric variants built for speed, range, and zero-compromise endurance.
          </p>
        </div>

        {/* Scroll Arrows */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            aria-label="Scroll left"
            className="w-12 h-12 rounded-full bg-white border border-neutral-300 flex items-center justify-center text-neutral-900 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-100 transition-all shadow-sm active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            aria-label="Scroll right"
            className="w-12 h-12 rounded-full bg-white border border-neutral-300 flex items-center justify-center text-neutral-900 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-100 transition-all shadow-sm active:scale-95"
          >
            <ArrowRight className="w-5 h-5" />
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
          const watermark = variant.watermark || `MODEL 0${index + 1}`;

          return (
            <motion.div
              key={variant.id || index}
              whileHover={{ y: -8, transition: { duration: 0.25 } }}
              className="min-w-[340px] sm:min-w-[420px] max-w-[420px] rounded-3xl bg-white border border-neutral-200/90 shadow-lg hover:shadow-2xl hover:border-neutral-400 overflow-hidden flex flex-col justify-between relative group snap-start transition-all"
            >
              {/* Massive Watermark Typography Behind Vehicle (Reference Image 1 style) */}
              <div className="absolute top-10 left-1/2 -translate-x-1/2 font-display text-7xl sm:text-8xl font-black text-neutral-950/[0.045] uppercase tracking-tighter select-none pointer-events-none whitespace-nowrap z-0">
                {watermark}
              </div>

              {/* Card Header & Badges */}
              <div className="p-6 relative z-10 flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-widest block">
                    {variant.model_name || 'Voltix Series'}
                  </span>
                  <h3 className="text-2xl font-display font-black text-neutral-950 tracking-tight group-hover:text-emerald-700 transition-colors">
                    {variant.name}
                  </h3>
                </div>

                {variant.original_price && (
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-neutral-100 text-neutral-900 border border-neutral-300 flex items-center gap-1 shadow-xs">
                    <Tag className="w-3 h-3 text-emerald-600" /> Special
                  </span>
                )}
              </div>

              {/* Center Floating Cutout */}
              <div className="h-60 relative flex items-center justify-center px-6 my-2 z-10">
                {/* Soft ground shadow ellipse */}
                <div className="absolute bottom-4 w-48 h-6 rounded-[100%] bg-neutral-900/15 blur-md pointer-events-none" />

                <motion.img
                  src={variant.default_image || '/vehicles/scooter_blue.png'}
                  alt={variant.name}
                  whileHover={{ scale: 1.1, rotate: -1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="max-h-full w-auto object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.35)]"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/vehicles/scooter_blue.png';
                  }}
                />
              </div>

              {/* Specs & Pricing Footer */}
              <div className="p-6 pt-2 relative z-10 space-y-5 bg-gradient-to-t from-neutral-50 via-white to-transparent">
                {/* Performance Pill Grid */}
                <div className="grid grid-cols-2 gap-3 py-3 px-4 rounded-2xl bg-neutral-100/80 border border-neutral-200">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-900 shrink-0 shadow-xs">
                      <BatteryCharging className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-[10px] text-neutral-500 uppercase font-bold">Certified Range</p>
                      <p className="text-sm font-black text-neutral-950">{variant.driving_range_km || 140} km</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-900 shrink-0 shadow-xs">
                      <Gauge className="w-4 h-4 text-neutral-950" />
                    </div>
                    <div>
                      <p className="text-[10px] text-neutral-500 uppercase font-bold">Top Speed</p>
                      <p className="text-sm font-black text-neutral-950">{variant.top_speed_kmh || 80} km/h</p>
                    </div>
                  </div>
                </div>

                {/* Price and Actions */}
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <span className="text-[11px] text-neutral-500 block font-medium">Ex-Showroom Price</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl sm:text-2xl font-display font-black text-neutral-950">
                        ₹{Number(variant.base_price || 99999).toLocaleString('en-IN')}
                      </span>
                      {variant.original_price && (
                        <span className="text-xs text-neutral-400 line-through">
                          ₹{Number(variant.original_price).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/vehicles/${variant.id}`}
                      className="px-5 py-2.5 rounded-full bg-neutral-950 text-white font-bold text-xs uppercase tracking-wider hover:bg-neutral-800 transition-all shadow-md shadow-neutral-900/20 active:scale-95"
                    >
                      Details
                    </Link>
                    <Link
                      to={`/customizer?variant=${variant.id}`}
                      className="p-2.5 rounded-full border border-neutral-300 text-neutral-800 hover:text-black hover:bg-neutral-100 transition-colors"
                      title="Customize 3D Finish"
                    >
                      <Sparkles className="w-4 h-4 text-emerald-600" />
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
