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

/**
 * Customizer Page
 * High-key White Studio 3D Vehicle Customizer matching Tesla / Porsche design language.
 */
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

      // Preselect first option or preselect from query parameter 'finish'
      const opts = data.options || [];
      const finishParam = searchParams.get('finish');
      let initialChoice = opts.find((o) => o.combination_id === finishParam);
      if (!initialChoice && opts.length > 0) {
        initialChoice = opts[0];
      }
      setSelectedOption(initialChoice || null);

      if (initialChoice) {
        recalculatePrice(variantId, initialChoice.id);
      }
    } catch (_err) {
      showError('Could not load finish configurations for this model.');
    } finally {
      setLoading(false);
    }
  }, [searchParams, showError]);

  useEffect(() => {
    if (selectedVariantId) {
      fetchOptions(selectedVariantId);
    }
  }, [selectedVariantId, fetchOptions]);

  // 3. Recalculate price dynamically with backend
  const recalculatePrice = async (variantId, optionId) => {
    setCalculating(true);
    try {
      const pData = await customizerService.calculatePrice(variantId, optionId);
      setPriceData(pData);
    } catch (_err) {
      // Fallback locally
      const base = parseFloat(optionsData?.base_price || '99999');
      const opt = optionsData?.options?.find((o) => o.id === optionId);
      const adj = parseFloat(opt?.price_adjustment || '0');
      setPriceData({
        base_price: base,
        price_adjustment: adj,
        total_price: base + adj,
      });
    } finally {
      setCalculating(false);
    }
  };

  const handleSelectOption = (opt) => {
    setSelectedOption(opt);
    recalculatePrice(selectedVariantId, opt.id);
    setSearchParams(
      { variant: selectedVariantId.toString(), finish: opt.combination_id },
      { replace: true }
    );
  };

  const handleVariantChange = (e) => {
    const newId = parseInt(e.target.value, 10);
    setSelectedVariantId(newId);
    setSearchParams({ variant: newId.toString() }, { replace: true });
  };

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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-neutral-200 pb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider mb-2 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Interactive Studio
          </div>
          <h1 className="text-4xl sm:text-6xl font-display font-black text-neutral-950 tracking-tight uppercase">
            Vehicle Finish Studio
          </h1>
          <p className="text-sm text-neutral-500 mt-1 font-medium max-w-2xl">
            Personalize your electric vehicle with factory dual-tone finishes and real-time pricing recalculation.
          </p>
        </div>

        {/* Variant Dropdown Switcher */}
        <div className="w-full md:w-80 space-y-1.5">
          <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider">
            Select Vehicle Model
          </label>
          <select
            value={selectedVariantId || ''}
            onChange={handleVariantChange}
            className="w-full px-4 py-2.5 rounded-full bg-white border border-neutral-300 text-sm text-neutral-900 font-bold focus:outline-none focus:border-neutral-900 shadow-xs transition-colors cursor-pointer"
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
          <div className="w-12 h-12 rounded-full bg-neutral-900 text-white flex items-center justify-center mx-auto animate-spin shadow-md">
            <RotateCw className="w-6 h-6 text-emerald-400" />
          </div>
          <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider">Loading customizer textures & options...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Canvas: Live Vehicle Render */}
          <div className="lg:col-span-7 space-y-4">
            <div className="rounded-3xl bg-gradient-to-b from-[#fafafa] to-[#f2f2f4] border border-neutral-200/90 shadow-md p-8 h-[420px] sm:h-[500px] flex items-center justify-center relative overflow-hidden group">
              {/* Massive Anton Watermark Behind Vehicle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-8xl sm:text-9xl font-black text-neutral-950/[0.04] uppercase tracking-tighter select-none pointer-events-none whitespace-nowrap z-0">
                {optionsData?.model_name || 'STUDIO'}
              </div>

              {/* Soft ground shadow ellipse */}
              <div className="absolute bottom-6 w-72 h-8 rounded-[100%] bg-neutral-900/15 blur-lg pointer-events-none" />

              {/* Render Image */}
              <img
                src={
                  selectedOption?.image ||
                  '/vehicles/scooter_blue.png'
                }
                alt={selectedOption?.combination_name || 'Vehicle Customizer'}
                className="max-h-full max-w-full object-contain relative z-10 transition-transform duration-500 group-hover:scale-105 drop-shadow-[0_20px_35px_rgba(0,0,0,0.3)]"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/vehicles/scooter_blue.png';
                }}
              />

              {/* Badges on Canvas */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
                <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/95 text-neutral-900 border border-neutral-300 shadow-xs">
                  {optionsData?.model_name} {optionsData?.variant_name}
                </span>
                <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/95 text-neutral-900 border border-neutral-300 shadow-xs flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block border border-neutral-300 shadow-xs"
                    style={{ backgroundColor: selectedOption?.primary_colour?.hex_code || '#fff' }}
                  />
                  {selectedOption?.is_dual_tone ? 'Dual-Tone Special' : 'Single Finish'}
                </span>
              </div>

              {/* Share button on canvas */}
              <button
                onClick={handleCopyLink}
                className="absolute top-4 right-4 p-2.5 rounded-full bg-white hover:bg-neutral-100 border border-neutral-300 text-neutral-900 shadow-xs transition-colors z-20"
                title="Share this configuration"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {/* Selected Color Headline Card */}
            <div className="p-4 rounded-2xl bg-white border border-neutral-200/90 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Swatch indicator */}
                {selectedOption?.is_dual_tone ? (
                  <div className="w-9 h-9 rounded-full border border-neutral-300 flex overflow-hidden shadow-sm">
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
                    className="w-9 h-9 rounded-full border border-neutral-300 shadow-sm"
                    style={{ backgroundColor: selectedOption?.primary_colour?.hex_code }}
                  />
                )}
                <div>
                  <h3 className="text-sm font-bold text-neutral-950">{selectedOption?.combination_name}</h3>
                  <p className="text-xs text-neutral-500 font-medium">
                    {selectedOption?.is_dual_tone
                      ? `${selectedOption.primary_colour?.name} + ${selectedOption.secondary_colour?.name}`
                      : selectedOption?.primary_colour?.name}
                  </p>
                </div>
              </div>

              {parseFloat(selectedOption?.price_adjustment || '0') > 0 ? (
                <span className="text-xs font-bold text-neutral-900 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-300 shadow-xs">
                  +{formatINR(selectedOption.price_adjustment)} Premium
                </span>
              ) : (
                <span className="text-xs font-bold text-emerald-700 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 shadow-xs">
                  Standard Finish
                </span>
              )}
            </div>
          </div>

          {/* Right Panel: Swatches Selection & Live Pricing */}
          <div className="lg:col-span-5 space-y-6">
            {/* Tone Filter Tabs */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider">
                Select Finish Palette ({filteredOptions.length})
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1.5 rounded-full bg-white border border-neutral-300 text-xs font-bold shadow-xs">
                <button
                  onClick={() => setActiveTab('ALL')}
                  className={`py-2 rounded-full transition-all ${
                    activeTab === 'ALL'
                      ? 'bg-neutral-950 text-white shadow-sm'
                      : 'text-neutral-600 hover:text-neutral-950'
                  }`}
                >
                  All Finishes
                </button>
                <button
                  onClick={() => setActiveTab('SINGLE')}
                  className={`py-2 rounded-full transition-all ${
                    activeTab === 'SINGLE'
                      ? 'bg-neutral-950 text-white shadow-sm'
                      : 'text-neutral-600 hover:text-neutral-950'
                  }`}
                >
                  Single Tone
                </button>
                <button
                  onClick={() => setActiveTab('DUAL')}
                  className={`py-2 rounded-full transition-all ${
                    activeTab === 'DUAL'
                      ? 'bg-neutral-950 text-white shadow-sm'
                      : 'text-neutral-600 hover:text-neutral-950'
                  }`}
                >
                  Dual Tone
                </button>
              </div>
            </div>

            {/* Colour Swatches Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[340px] overflow-y-auto pr-1 scrollbar-none">
              {filteredOptions.map((opt) => {
                const isSelected = selectedOption?.id === opt.id;
                const adjustmentNum = parseFloat(opt.price_adjustment || '0');

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(opt)}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl text-left transition-all ${
                      isSelected
                        ? 'border-neutral-950 bg-neutral-50 ring-2 ring-neutral-950/20 shadow-sm'
                        : 'border border-neutral-200 hover:border-neutral-400 bg-white'
                    }`}
                  >
                    {/* Swatch Circle */}
                    {opt.is_dual_tone ? (
                      <div className="w-9 h-9 rounded-full border border-neutral-300 flex overflow-hidden shrink-0 shadow-sm">
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
                        className="w-9 h-9 rounded-full border border-neutral-300 shrink-0 shadow-sm"
                        style={{ backgroundColor: opt.primary_colour?.hex_code }}
                      />
                    )}

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-neutral-950 truncate">{opt.combination_name}</p>
                      <span className="text-[11px] text-neutral-500 font-medium block">
                        {adjustmentNum > 0 ? `+${formatINR(adjustmentNum)}` : 'Standard'}
                      </span>
                    </div>

                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-neutral-950 text-white flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Authoritative Price Recalculation Engine Card */}
            <div className="p-6 rounded-3xl bg-white border border-neutral-200/90 shadow-md space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
                <span className="text-xs uppercase font-bold text-neutral-500">
                  Dynamic Price Breakdown
                </span>
                {calculating && (
                  <span className="text-xs font-bold text-neutral-800 animate-pulse flex items-center gap-1">
                    <RotateCw className="w-3 h-3 animate-spin" /> Recalculating...
                  </span>
                )}
              </div>

              <div className="space-y-2 text-xs font-medium">
                <div className="flex justify-between text-neutral-600">
                  <span>Base Ex-Showroom ({optionsData?.variant_name})</span>
                  <span className="font-bold text-neutral-950">{formatINR(priceData?.base_price || optionsData?.base_price)}</span>
                </div>

                <div className="flex justify-between text-neutral-600">
                  <span>Custom Finish ({selectedOption?.combination_name})</span>
                  <span
                    className={
                      parseFloat(priceData?.price_adjustment || '0') > 0
                        ? 'font-bold text-neutral-950'
                        : 'font-bold text-emerald-700'
                    }
                  >
                    {parseFloat(priceData?.price_adjustment || '0') > 0
                      ? `+${formatINR(priceData?.price_adjustment)}`
                      : 'Included'}
                  </span>
                </div>

                <div className="flex justify-between text-sm pt-3 border-t border-neutral-200 text-neutral-950 font-black items-baseline">
                  <span>Total Configuration Price</span>
                  <span className="text-2xl font-display font-black text-neutral-950">
                    {formatINR(priceData?.total_price || optionsData?.base_price)}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 text-[11px] text-neutral-600 flex items-center gap-2 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Price verified by backend showroom configuration engine. Includes 5-year battery warranty.</span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <Link
                  to={`/book-test-ride?variant=${selectedVariantId}&finish=${selectedOption?.combination_id}`}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full bg-neutral-950 text-white font-bold text-xs uppercase tracking-wider hover:bg-neutral-800 shadow-md shadow-neutral-900/20 active:scale-98 transition-all"
                >
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  Book Test Ride in This Configuration
                </Link>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full bg-white hover:bg-neutral-50 border border-neutral-300 text-neutral-900 text-xs font-bold transition-colors shadow-xs"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    Share Link
                  </button>

                  <Link
                    to={`/vehicles/${selectedVariantId}`}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full bg-white hover:bg-neutral-50 border border-neutral-300 text-neutral-900 text-xs font-bold transition-colors shadow-xs"
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
