import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  BatteryCharging,
  Gauge,
  Sparkles,
  Calendar,
  ArrowRight,
  RotateCcw,
  Tag,
  Zap,
} from 'lucide-react';
import { motion } from 'framer-motion';
import vehicleService from '../services/vehicleService';
import { useAlert } from '../context/AlertContext';

/**
 * VehicleCatalogue Page
 * High-key White Studio Automotive Catalogue matching the Tesla / Porsche clean studio aesthetic.
 * Clean white cards, bold Anton display typography, rounded pill filters and buttons.
 */
export default function VehicleCatalogue() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { error: showError } = useAlert();

  const [categories, setCategories] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [meta, setMeta] = useState({ page: 1, total_pages: 1, total_records: 0 });
  const [loading, setLoading] = useState(true);

  // Filter States initialized from URL params
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [minRange, setMinRange] = useState(searchParams.get('min_range') || '');
  const [ordering, setOrdering] = useState(searchParams.get('ordering') || 'base_price');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  // Load Categories on mount
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const catData = await vehicleService.getCategories();
        setCategories(catData || []);
      } catch (_err) {
        showError('Could not load vehicle categories.');
      }
    };
    fetchCats();
  }, [showError]);

  // Load Variants whenever filters change
  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        ordering,
      };
      if (selectedCategory) params.category = selectedCategory;
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (minRange) params.min_range = minRange;

      const data = await vehicleService.getVariants(params);
      setVehicles(data.items);
      setMeta(data.meta);
    } catch (err) {
      showError(err.customMessage || 'Failed to load vehicle catalogue.');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery, minRange, ordering, page, showError]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  // Sync state changes with URL query parameters
  useEffect(() => {
    const nextParams = {};
    if (selectedCategory) nextParams.category = selectedCategory;
    if (searchQuery.trim()) nextParams.search = searchQuery.trim();
    if (minRange) nextParams.min_range = minRange;
    if (ordering && ordering !== 'base_price') nextParams.ordering = ordering;
    if (page > 1) nextParams.page = page.toString();

    setSearchParams(nextParams, { replace: true });
  }, [selectedCategory, searchQuery, minRange, ordering, page, setSearchParams]);

  const handleResetFilters = () => {
    setSelectedCategory('');
    setSearchQuery('');
    setMinRange('');
    setOrdering('base_price');
    setPage(1);
  };

  const formatINR = (value) => {
    if (!value) return '₹0';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Catalogue Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-200/90 pb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider mb-2 shadow-sm">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            Zero-Emission Fleet
          </div>
          <h1 className="text-4xl sm:text-6xl font-display font-black text-neutral-950 tracking-tight uppercase">
            Vehicle Catalogue
          </h1>
          <p className="text-sm text-neutral-500 mt-1 font-medium max-w-2xl">
            Engineered for pure electric performance, intelligent range, and unmatched acceleration.
          </p>
        </div>
        <div className="text-xs font-semibold text-neutral-500">
          Showing <span className="text-neutral-950 font-bold">{vehicles.length}</span> of{' '}
          <span className="text-neutral-950 font-bold">{meta.total_records}</span> configured models
        </div>
      </div>

      {/* Filter and Search Control Bar */}
      <div className="space-y-4">
        {/* Top Controls: Search, Minimum Range, Sort */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search by vehicle name, model, or variant..."
              className="w-full pl-11 pr-4 py-2.5 rounded-full bg-white border border-neutral-300 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 shadow-xs transition-colors"
            />
          </div>

          {/* Driving Range Filter */}
          <div className="sm:w-52">
            <select
              value={minRange}
              onChange={(e) => {
                setMinRange(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2.5 rounded-full bg-white border border-neutral-300 text-sm text-neutral-800 focus:outline-none focus:border-neutral-900 shadow-xs cursor-pointer"
            >
              <option value="">All Driving Ranges</option>
              <option value="100">100+ KM Range</option>
              <option value="130">130+ KM Range</option>
              <option value="150">150+ KM Range</option>
              <option value="180">180+ KM Long-Haul</option>
            </select>
          </div>

          {/* Sort Order Dropdown */}
          <div className="sm:w-52">
            <select
              value={ordering}
              onChange={(e) => {
                setOrdering(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2.5 rounded-full bg-white border border-neutral-300 text-sm text-neutral-800 focus:outline-none focus:border-neutral-900 shadow-xs cursor-pointer"
            >
              <option value="base_price">Price: Low to High</option>
              <option value="-base_price">Price: High to Low</option>
              <option value="-created_at">Latest Releases</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {(selectedCategory || searchQuery || minRange || ordering !== 'base_price') && (
            <button
              onClick={handleResetFilters}
              className="px-5 py-2.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold flex items-center justify-center gap-1.5 border border-neutral-300 shadow-xs transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          )}
        </div>

        {/* Category Pill Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => {
              setSelectedCategory('');
              setPage(1);
            }}
            className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
              selectedCategory === ''
                ? 'bg-neutral-950 text-white shadow-md shadow-neutral-900/20 scale-102'
                : 'bg-white text-neutral-700 hover:text-neutral-950 border border-neutral-300 hover:border-neutral-400 shadow-xs'
            }`}
          >
            All Categories ({meta.total_records})
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.slug);
                setPage(1);
              }}
              className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedCategory === cat.slug
                  ? 'bg-neutral-950 text-white shadow-md shadow-neutral-900/20 scale-102'
                  : 'bg-white text-neutral-700 hover:text-neutral-950 border border-neutral-300 hover:border-neutral-400 shadow-xs'
              }`}
            >
              <span>{cat.name}</span>
              {cat.models_count !== undefined && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    selectedCategory === cat.slug
                      ? 'bg-white/20 text-white'
                      : 'bg-neutral-100 text-neutral-600'
                  }`}
                >
                  {cat.models_count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Vehicle Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div
              key={idx}
              className="rounded-3xl bg-white border border-neutral-200 p-6 h-96 animate-pulse flex flex-col justify-between shadow-sm"
            >
              <div className="h-44 bg-neutral-100 rounded-2xl" />
              <div className="space-y-3 pt-4">
                <div className="h-4 bg-neutral-200 rounded w-1/3" />
                <div className="h-6 bg-neutral-200 rounded w-3/4" />
                <div className="h-4 bg-neutral-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : vehicles.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-neutral-200 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-neutral-100 text-neutral-900 flex items-center justify-center mx-auto border border-neutral-200">
            <SlidersHorizontal className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-display font-black text-neutral-950 uppercase">No vehicles found matching filters</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto font-medium">
            Try adjusting your search criteria, clearing the minimum range, or selecting a different category.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-5 py-2.5 rounded-full bg-neutral-950 text-white text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors shadow-sm"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {vehicles.map((variant, index) => (
            <motion.div
              key={variant.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: index * 0.06 }}
              whileHover={{ y: -8, transition: { duration: 0.25 } }}
              className="rounded-3xl bg-white border border-neutral-200/90 shadow-md hover:shadow-2xl hover:border-neutral-400 overflow-hidden flex flex-col justify-between group transition-all relative"
            >
              {/* Image Container with Watermark Typography and Ground Shadow */}
              <div className="h-60 bg-gradient-to-b from-[#fafafa] to-[#f2f2f4] relative flex items-center justify-center p-6 overflow-hidden border-b border-neutral-200/80">
                {/* Background Watermark Model Name (Tesla Reference 1 style) */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 font-display text-5xl sm:text-6xl font-black text-neutral-950/[0.045] uppercase tracking-tighter select-none pointer-events-none whitespace-nowrap z-0">
                  {variant.model_name}
                </div>

                {/* Soft ground shadow ellipse beneath wheels */}
                <div className="absolute bottom-4 w-48 h-6 rounded-[100%] bg-neutral-900/15 blur-md pointer-events-none" />

                <img
                  src={
                    variant.default_image ||
                    '/vehicles/scooter_blue.png'
                  }
                  alt={`${variant.model_name} ${variant.name}`}
                  className="max-h-full w-auto object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.3)] group-hover:scale-108 transition-all duration-500 relative z-10"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/vehicles/scooter_blue.png';
                  }}
                />
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-[11px] font-bold bg-white/95 text-neutral-900 border border-neutral-300 shadow-xs z-20">
                  {variant.category_name}
                </span>
                {variant.original_price && (
                  <span className="absolute top-4 right-4 px-3 py-1 rounded-full text-[11px] font-bold bg-neutral-950 text-white shadow-xs flex items-center gap-1 z-20">
                    <Tag className="w-3 h-3 text-emerald-400" /> Special
                  </span>
                )}
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-5 bg-gradient-to-t from-neutral-50/50 via-white to-transparent">
                <div>
                  <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-widest">
                    {variant.model_name}
                  </p>
                  <h3 className="text-2xl font-display font-black text-neutral-950 group-hover:text-emerald-700 transition-colors uppercase tracking-tight">
                    {variant.name}
                  </h3>
                </div>

                {/* Key Spec Badges */}
                <div className="grid grid-cols-3 gap-2 py-3 px-3 rounded-2xl bg-neutral-100/80 border border-neutral-200 text-center">
                  <div>
                    <div className="flex items-center justify-center gap-1 text-emerald-700 text-xs font-black">
                      <BatteryCharging className="w-3.5 h-3.5" />
                      {variant.driving_range_km || 140} km
                    </div>
                    <span className="text-[10px] text-neutral-500 uppercase font-bold">True Range</span>
                  </div>

                  <div className="border-x border-neutral-300">
                    <div className="flex items-center justify-center gap-1 text-neutral-950 text-xs font-black">
                      <Gauge className="w-3.5 h-3.5" />
                      {variant.top_speed_kmh || 90} km/h
                    </div>
                    <span className="text-[10px] text-neutral-500 uppercase font-bold">Top Speed</span>
                  </div>

                  <div>
                    <div className="text-neutral-900 text-xs font-black truncate px-1">
                      {variant.battery_type || 'LiFePO4'}
                    </div>
                    <span className="text-[10px] text-neutral-500 uppercase font-bold">Chemistry</span>
                  </div>
                </div>

                {/* Pricing & CTAs */}
                <div className="pt-2 border-t border-neutral-200 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-neutral-500 block">
                        Ex-Showroom Price
                      </span>
                      <span className="text-2xl font-display font-black text-neutral-950">
                        {formatINR(variant.base_price)}
                      </span>
                    </div>
                    {variant.original_price && (
                      <span className="text-xs text-neutral-400 line-through font-medium">
                        {formatINR(variant.original_price)}
                      </span>
                    )}
                  </div>

                  {/* Actions Grid */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Link
                      to={`/vehicles/${variant.id}`}
                      className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full bg-white hover:bg-neutral-100 border border-neutral-300 text-neutral-900 text-xs font-bold transition-colors shadow-xs"
                    >
                      Full Specs
                      <ArrowRight className="w-3.5 h-3.5 text-neutral-950" />
                    </Link>

                    <Link
                      to={`/customizer?variant=${variant.id}`}
                      className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full bg-white hover:bg-neutral-100 border border-neutral-300 text-neutral-900 text-xs font-bold transition-colors shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      Customizer
                    </Link>
                  </div>

                  <Link
                    to={`/book-test-ride?variant=${variant.id}`}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-neutral-950 text-white font-bold text-xs uppercase tracking-wider hover:bg-neutral-800 shadow-md shadow-neutral-900/20 active:scale-98 transition-all"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    Book Experiential Test Ride
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {meta.total_pages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-8 border-t border-neutral-200">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-5 py-2 rounded-full bg-white border border-neutral-300 text-xs font-bold text-neutral-800 disabled:opacity-40 hover:border-neutral-500 shadow-xs transition-colors"
          >
            Previous
          </button>
          <span className="text-xs font-bold text-neutral-500">
            Page <span className="text-neutral-950 font-black">{page}</span> of {meta.total_pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(meta.total_pages, p + 1))}
            disabled={page === meta.total_pages}
            className="px-5 py-2 rounded-full bg-white border border-neutral-300 text-xs font-bold text-neutral-800 disabled:opacity-40 hover:border-neutral-500 shadow-xs transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
