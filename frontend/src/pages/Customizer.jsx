import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Sparkles,
  Calendar,
  Check,
  Share2,
  ArrowRight,
  ShieldCheck,
  RotateCw,
} from 'lucide-react';
import vehicleService from '../services/vehicleService';
import customizerService from '../services/customizerService';
import { useAlert } from '../context/AlertContext';

export default function Customizer() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { success, error: showError } = useAlert();

  const [variants, setVariants] = useState([]);
  const [selectedVariantId, setSelectedVariantId] = useState(
    searchParams.get('variant') ? parseInt(searchParams.get('variant'), 10) : null
  );

  const [optionsData, setOptionsData] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [priceData, setPriceData] = useState(null);
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'SINGLE' | 'DUAL'
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

  // 1. Fetch available variants on mount
  useEffect(() => {
    const fetchVariants = async () => {
      try {
        const data = await vehicleService.getVariants({ page_size: 50 });
        const items = data.items || [];
        setVariants(items);

        // Preselect variant from query param or default to first variant
        if (items.length > 0) {
          const paramVarId = searchParams.get('variant');
          const matched = items.find((v) => v.id.toString() === paramVarId);
          setSelectedVariantId(matched ? matched.id : items[0].id);
        }
      } catch (_err) {
        showError('Could not load vehicle variants for customization.');
      }
    };
    fetchVariants();
  }, [searchParams, showError]);

  // 2. Fetch customization options when selectedVariantId changes
  const fetchOptions = useCallback(async (variantId) => {
    if (!variantId) return;
    setLoading(true);
    try {
      const data = await customizerService.getOptions(variantId);
      setOptionsData(data);

      const opts = data.options || [];
      if (opts.length > 0) {
        // Check if combination is in URL query
        const queryCombId = searchParams.get('combination');
        const matched = opts.find((o) => o.combination_id.toString() === queryCombId);
        const defaultChoice = matched || opts[0];
        setSelectedOption(defaultChoice);

        // Calculate initial price
        const calc = await customizerService.calculatePrice(variantId, defaultChoice.combination_id);
        setPriceData(calc);
      }
    } catch (_err) {
      showError('Failed to load customizer finishes for this vehicle.');
    } finally {
      setLoading(false);
    }
  }, [searchParams, showError]);

  useEffect(() => {
    if (selectedVariantId) {
      fetchOptions(selectedVariantId);
    }
  }, [selectedVariantId, fetchOptions]);

  // 3. Handle Color Selection
  const handleSelectOption = async (option) => {
    setSelectedOption(option);
    setCalculating(true);
    try {
      const calc = await customizerService.calculatePrice(selectedVariantId, option.combination_id);
      setPriceData(calc);

      // Update URL query parameters seamlessly
      setSearchParams(
        {
          variant: selectedVariantId.toString(),
          combination: option.combination_id.toString(),
        },
        { replace: true }
      );
    } catch (err) {
      showError(err.customMessage || 'Price recalculation failed.');
    } finally {
      setCalculating(false);
    }
  };

  // 4. Handle Variant Change from dropdown
  const handleVariantChange = (e) => {
    const newId = parseInt(e.target.value, 10);
    setSelectedVariantId(newId);
    setSearchParams({ variant: newId.toString() }, { replace: true });
  };

  // 5. Copy configuration share link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    success('Configuration link copied to clipboard!');
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

  const filteredOptions = (optionsData?.options || []).filter((opt) => {
    if (activeTab === 'SINGLE') return !opt.is_dual_tone;
    if (activeTab === 'DUAL') return opt.is_dual_tone;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Top Header & Variant Selector */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800 pb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Interactive Studio
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Vehicle Finish Studio
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Personalize your electric vehicle with factory dual-tone finishes and real-time pricing recalculation.
          </p>
        </div>

        {/* Variant Dropdown Switcher */}
        <div className="w-full md:w-80 space-y-1">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Select Vehicle Model
          </label>
          <select
            value={selectedVariantId || ''}
            onChange={handleVariantChange}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white font-medium focus:outline-none focus:border-cyan-500 transition-colors"
          >
            {variants.map((v) => (
              <option key={v.id} value={v.id}>
                {v.model_name} {v.name} ({formatINR(v.base_price)})
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto animate-spin">
            <RotateCw className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-slate-400">Loading customizer textures & options...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Canvas: Live Vehicle Render */}
          <div className="lg:col-span-7 space-y-4">
            <div className="rounded-3xl glass-card p-8 h-[420px] sm:h-[500px] flex items-center justify-center bg-slate-900/70 border border-slate-800 relative overflow-hidden group">
              {/* Subtle radial ambient glow matching color */}
              <div
                className="absolute w-72 h-72 rounded-full blur-[100px] opacity-25 pointer-events-none transition-all duration-700"
                style={{
                  backgroundColor: selectedOption?.primary_colour?.hex_code || '#06b6d4',
                }}
              />

              {/* Render Image */}
              <img
                src={
                  selectedOption?.image ||
                  'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=80'
                }
                alt={selectedOption?.combination_name || 'Vehicle Customizer'}
                className="max-h-full max-w-full object-contain relative z-10 transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=80';
                }}
              />

              {/* Badges on Canvas */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-950/80 text-cyan-300 border border-slate-800 backdrop-blur-md">
                  {optionsData?.model_name} {optionsData?.variant_name}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-950/80 text-slate-300 border border-slate-800 backdrop-blur-md flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block"
                    style={{ backgroundColor: selectedOption?.primary_colour?.hex_code || '#fff' }}
                  />
                  {selectedOption?.is_dual_tone ? 'Dual-Tone Special' : 'Single Finish'}
                </span>
              </div>

              {/* Share button on canvas */}
              <button
                onClick={handleCopyLink}
                className="absolute top-4 right-4 p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors backdrop-blur-md z-20"
                title="Share this configuration"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {/* Selected Color Headline Card */}
            <div className="p-4 rounded-2xl glass-panel border border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Swatch indicator */}
                {selectedOption?.is_dual_tone ? (
                  <div className="w-8 h-8 rounded-full border border-slate-700 flex overflow-hidden shadow-inner">
                    <div
                      className="w-1/2 h-full"
                      style={{ backgroundColor: selectedOption.primary_colour?.hex_code }}
                    />
                    <div
                      className="w-1/2 h-full"
                      style={{ backgroundColor: selectedOption.secondary_colour?.hex_code }}
                    />
                  </div>
                ) : (
                  <div
                    className="w-8 h-8 rounded-full border border-slate-700 shadow-inner"
                    style={{ backgroundColor: selectedOption?.primary_colour?.hex_code }}
                  />
                )}
                <div>
                  <h3 className="text-sm font-bold text-white">{selectedOption?.combination_name}</h3>
                  <p className="text-xs text-slate-400">
                    {selectedOption?.is_dual_tone
                      ? `${selectedOption.primary_colour?.name} + ${selectedOption.secondary_colour?.name}`
                      : selectedOption?.primary_colour?.name}
                  </p>
                </div>
              </div>

              {parseFloat(selectedOption?.price_adjustment || '0') > 0 ? (
                <span className="text-xs font-bold text-amber-400 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                  +{formatINR(selectedOption.price_adjustment)} Premium
                </span>
              ) : (
                <span className="text-xs font-bold text-emerald-400 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  Standard Finish
                </span>
              )}
            </div>
          </div>

          {/* Right Panel: Swatches Selection & Live Pricing */}
          <div className="lg:col-span-5 space-y-6">
            {/* Tone Filter Tabs */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Select Finish Palette ({filteredOptions.length})
              </label>
              <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold">
                <button
                  onClick={() => setActiveTab('ALL')}
                  className={`py-2 rounded-lg transition-all ${
                    activeTab === 'ALL'
                      ? 'bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All Finishes
                </button>
                <button
                  onClick={() => setActiveTab('SINGLE')}
                  className={`py-2 rounded-lg transition-all ${
                    activeTab === 'SINGLE'
                      ? 'bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Single Tone
                </button>
                <button
                  onClick={() => setActiveTab('DUAL')}
                  className={`py-2 rounded-lg transition-all ${
                    activeTab === 'DUAL'
                      ? 'bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Dual Tone
                </button>
              </div>
            </div>

            {/* Colour Swatches Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[340px] overflow-y-auto pr-1">
              {filteredOptions.map((opt) => {
                const isSelected = selectedOption?.id === opt.id;
                const adjustmentNum = parseFloat(opt.price_adjustment || '0');

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(opt)}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl glass-card text-left transition-all ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-950/20 ring-2 ring-cyan-400/30'
                        : 'border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    {/* Swatch Circle */}
                    {opt.is_dual_tone ? (
                      <div className="w-9 h-9 rounded-full border border-slate-700 flex overflow-hidden shrink-0 shadow-inner">
                        <div
                          className="w-1/2 h-full"
                          style={{ backgroundColor: opt.primary_colour?.hex_code }}
                        />
                        <div
                          className="w-1/2 h-full"
                          style={{ backgroundColor: opt.secondary_colour?.hex_code }}
                        />
                      </div>
                    ) : (
                      <div
                        className="w-9 h-9 rounded-full border border-slate-700 shrink-0 shadow-inner"
                        style={{ backgroundColor: opt.primary_colour?.hex_code }}
                      />
                    )}

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">{opt.combination_name}</p>
                      <span className="text-[11px] text-slate-400 block">
                        {adjustmentNum > 0 ? `+${formatINR(adjustmentNum)}` : 'Standard'}
                      </span>
                    </div>

                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Authoritative Price Recalculation Engine Card */}
            <div className="p-6 rounded-3xl glass-card border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs uppercase font-semibold text-slate-400">
                  Dynamic Price Breakdown
                </span>
                {calculating && (
                  <span className="text-xs font-medium text-cyan-400 animate-pulse flex items-center gap-1">
                    <RotateCw className="w-3 h-3 animate-spin" /> Recalculating...
                  </span>
                )}
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Base Ex-Showroom ({optionsData?.variant_name})</span>
                  <span className="font-semibold">{formatINR(priceData?.base_price || optionsData?.base_price)}</span>
                </div>

                <div className="flex justify-between text-slate-300">
                  <span>Custom Finish ({selectedOption?.combination_name})</span>
                  <span
                    className={
                      parseFloat(priceData?.price_adjustment || '0') > 0
                        ? 'font-bold text-amber-400'
                        : 'font-semibold text-emerald-400'
                    }
                  >
                    {parseFloat(priceData?.price_adjustment || '0') > 0
                      ? `+${formatINR(priceData?.price_adjustment)}`
                      : 'Included'}
                  </span>
                </div>

                <div className="flex justify-between text-sm pt-3 border-t border-slate-800 text-white font-extrabold">
                  <span>Total Configuration Price</span>
                  <span className="text-xl text-gradient-cyan">
                    {formatINR(priceData?.total_price || optionsData?.base_price)}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Price verified by backend showroom configuration engine. Includes 5-year battery warranty.</span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <Link
                  to={`/book-test-ride?variant=${selectedVariantId}&finish=${selectedOption?.combination_id}`}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 font-bold text-xs hover:opacity-95 transition-opacity shadow-lg shadow-cyan-500/20"
                >
                  <Calendar className="w-4 h-4" />
                  Book Test Ride in This Configuration
                </Link>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-white text-xs font-semibold transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    Share Link
                  </button>

                  <Link
                    to={`/vehicles/${selectedVariantId}`}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                  >
                    View Specs
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
