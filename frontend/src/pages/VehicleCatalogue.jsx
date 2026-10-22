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
import vehicleService from '../services/vehicleService';
import { useAlert } from '../context/AlertContext';

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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Zap className="w-3.5 h-3.5" />
            Zero-Emission Fleet
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Vehicle Catalogue
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Engineered for pure electric performance, intelligent range, and unmatched acceleration.
          </p>
        </div>
        <div className="text-xs font-medium text-slate-400">
          Showing <span className="text-cyan-400 font-bold">{vehicles.length}</span> of{' '}
          <span className="text-white font-bold">{meta.total_records}</span> configured models
        </div>
      </div>

      {/* Filter and Search Control Bar */}
      <div className="space-y-4">
        {/* Top Controls: Search, Minimum Range, Sort */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search by vehicle name, model, or variant..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* Driving Range Filter */}
          <div className="sm:w-48">
            <select
              value={minRange}
              onChange={(e) => {
                setMinRange(e.target.value);
                setPage(1);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
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
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
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
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
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
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === ''
                ? 'bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
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
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedCategory === cat.slug
                  ? 'bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <span>{cat.name}</span>
              {cat.models_count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    selectedCategory === cat.slug
                      ? 'bg-slate-950/20 text-slate-950'
                      : 'bg-slate-800 text-slate-400'
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
              className="rounded-3xl glass-card p-6 h-96 animate-pulse bg-slate-900/40 border border-slate-800 flex flex-col justify-between"
            >
              <div className="h-44 bg-slate-800/60 rounded-2xl" />
              <div className="space-y-3 pt-4">
                <div className="h-4 bg-slate-800/80 rounded w-1/3" />
                <div className="h-6 bg-slate-800 rounded w-3/4" />
                <div className="h-4 bg-slate-800/60 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : vehicles.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-3xl border border-slate-800 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto">
            <SlidersHorizontal className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">No vehicles found matching filters</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search criteria, clearing the minimum range, or selecting a different category.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-xl bg-slate-800 text-cyan-400 text-xs font-semibold hover:bg-slate-750 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {vehicles.map((variant) => (
            <div
              key={variant.id}
              className="rounded-3xl glass-card overflow-hidden flex flex-col border border-slate-800/90 group"
            >
              {/* Image Container */}
              <div className="h-52 bg-slate-900/80 relative flex items-center justify-center p-6 overflow-hidden">
                <img
                  src={
                    variant.default_image ||
                    'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80'
                  }
                  alt={`${variant.model_name} ${variant.name}`}
                  className="max-h-full object-contain group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <span className="absolute top-4 left-4 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-950/80 text-cyan-300 border border-slate-800 backdrop-blur-md">
                  {variant.category_name}
                </span>
                {variant.original_price && (
                  <span className="absolute top-4 right-4 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-md flex items-center gap-1">
                    <Tag className="w-3 h-3" /> Special Offer
                  </span>
                )}
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    {variant.model_name}
                  </p>
                  <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                    {variant.name}
                  </h3>
                </div>

                {/* Key Spec Badges */}
                <div className="grid grid-cols-3 gap-2 py-3 px-3 rounded-2xl bg-slate-950/60 border border-slate-800/60 text-center">
                  <div>
                    <div className="flex items-center justify-center gap-1 text-emerald-400 text-xs font-bold">
                      <BatteryCharging className="w-3.5 h-3.5" />
                      {variant.driving_range_km || 140} km
                    </div>
                    <span className="text-[10px] text-slate-400 uppercase">True Range</span>
                  </div>

                  <div className="border-x border-slate-800">
                    <div className="flex items-center justify-center gap-1 text-cyan-400 text-xs font-bold">
                      <Gauge className="w-3.5 h-3.5" />
                      {variant.top_speed_kmh || 90} km/h
                    </div>
                    <span className="text-[10px] text-slate-400 uppercase">Top Speed</span>
                  </div>

                  <div>
                    <div className="text-slate-200 text-xs font-bold truncate px-1">
                      {variant.battery_type || 'LiFePO4'}
                    </div>
                    <span className="text-[10px] text-slate-400 uppercase">Cell Chemistry</span>
                  </div>
                </div>

                {/* Pricing & CTAs */}
                <div className="pt-2 border-t border-slate-800/80 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                        Ex-Showroom Price
                      </span>
                      <span className="text-xl font-extrabold text-white">
                        {formatINR(variant.base_price)}
                      </span>
                    </div>
                    {variant.original_price && (
                      <span className="text-xs text-slate-500 line-through">
                        {formatINR(variant.original_price)}
                      </span>
                    )}
                  </div>

                  {/* Actions Grid */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Link
                      to={`/vehicles/${variant.id}`}
                      className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-white text-xs font-semibold transition-colors"
                    >
                      Full Specs
                      <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                    </Link>

                    <Link
                      to={`/customizer?variant=${variant.id}`}
                      className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-semibold transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Customizer
                    </Link>
                  </div>

                  <Link
                    to={`/book-test-ride?variant=${variant.id}`}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 font-bold text-xs hover:opacity-95 transition-opacity"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    Book Experiential Test Ride
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {meta.total_pages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-8 border-t border-slate-800">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 disabled:opacity-40 hover:border-slate-700 transition-colors"
          >
            Previous
          </button>
          <span className="text-xs font-medium text-slate-400">
            Page <span className="text-white font-bold">{page}</span> of {meta.total_pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(meta.total_pages, p + 1))}
            disabled={page === meta.total_pages}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 disabled:opacity-40 hover:border-slate-700 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
