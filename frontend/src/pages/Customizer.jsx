import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
import { useTheme } from '../context/ThemeContext';

/**
 * Customizer Page
 * Dual Studio & Cyber 3D Vehicle Customizer matching Tesla / Porsche design language.
 */
export default function Customizer() {
  const { isDarkMode } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const { success, error: showError } = useAlert();

  const [variants, setVariants] = useState([]);
  const [selectedVariantId, setSelectedVariantId] = useState(
    searchParams.get('variant') ? parseInt(searchParams.get('variant'), 10) : null
  );

  const selectedVariant = variants.find((v) => v.id === selectedVariantId);

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
          const params = new URLSearchParams(window.location.search);
          const paramVarId = params.get('variant');
          const matched = items.find((v) => v.id.toString() === paramVarId);
          setSelectedVariantId(matched ? matched.id : items[0].id);
        }
      } catch (_err) {
        showError('Could not load vehicle variants for customization.');
      }
    };
    fetchVariants();
  }, [showError]);

  // 2. Fetch customization options when selectedVariantId changes
  const fetchOptions = useCallback(async (variantId) => {
    if (!variantId) return;
    setLoading(true);
    try {
      const data = await customizerService.getOptions(variantId);
      setOptionsData(data);

      // Preselect first option or preselect from query parameter 'finish'
      const opts = data.options || [];
      const params = new URLSearchParams(window.location.search);
      const finishParam = params.get('finish');
      let initialChoice = opts.find((o) => o.combination_id.toString() === finishParam);
      if (!initialChoice && opts.length > 0) {
        initialChoice = opts[0];
      }
      setSelectedOption(initialChoice || null);

      if (initialChoice) {
        recalculatePrice(variantId, initialChoice.combination_id);
      } else {
        setPriceData({
          base_price: parseFloat(data.base_price || '0'),
          price_adjustment: 0,
          total_price: parseFloat(data.base_price || '0'),
        });
      }
    } catch (_err) {
      showError('Could not load finish configurations for this model.');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    if (selectedVariantId) {
      fetchOptions(selectedVariantId);
    }
  }, [selectedVariantId, fetchOptions]);

  // 3. Recalculate price dynamically with backend
  const recalculatePrice = async (variantId, combinationId) => {
    setCalculating(true);
    try {
      const pData = await customizerService.calculatePrice(variantId, combinationId);
      setPriceData(pData);
    } catch (_err) {
      // Fallback locally
      const base = parseFloat(optionsData?.base_price || '99999');
      const opt = optionsData?.options?.find(
        (o) => o.combination_id === combinationId || o.id === combinationId
      );
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

  // Instant single-click selection (no searchParams state loop)
  const handleSelectOption = (opt) => {
    setSelectedOption(opt);
    recalculatePrice(selectedVariantId, opt.combination_id);
    const url = new URL(window.location.href);
    url.searchParams.set('variant', selectedVariantId.toString());
    url.searchParams.set('finish', opt.combination_id.toString());
    window.history.replaceState({}, '', url.toString());
  };

  const handleVariantChange = (e) => {
    const newId = parseInt(e.target.value, 10);
    setSelectedVariantId(newId);
    const url = new URL(window.location.href);
    url.searchParams.set('variant', newId.toString());
    url.searchParams.delete('finish');
    window.history.replaceState({}, '', url.toString());
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

  const resolveCustomizerImage = () => {
    // 1. Explicit image from option
    if (selectedOption?.image) {
      if (selectedOption.image.startsWith('http')) return selectedOption.image;
      const filename = selectedOption.image.split('/').pop();
      return `/vehicles/customizer/${filename}`;
    }

    // 2. Map combination name or ID to exact finish cutout for all vehicles
    const name = (selectedOption?.combination_name || '').toLowerCase();
    const vid = selectedVariantId;

    // KTM RC 390
    if (vid === 15) {
      if (name.includes('gp') || name.includes('factory')) return '/vehicles/customizer/ktm_factory_gp.png';
      if (name.includes('stealth') || name.includes('carbon')) return '/vehicles/customizer/ktm_stealth_carbon.png';
      if (name.includes('whiteout') || name.includes('arctic')) return '/vehicles/customizer/ktm_arctic_white.png';
      if (name.includes('pure') || name.includes('orange')) return '/vehicles/customizer/ktm_racing_orange.png';
    }

    // BMW S1000RR
    if (vid === 14) {
      if (name.includes('m-sport') || name.includes('tricolour')) return '/vehicles/customizer/bmw_msport_tricolour.png';
      if (name.includes('black') || name.includes('storm')) return '/vehicles/customizer/bmw_black_storm.png';
      if (name.includes('passion') || name.includes('red')) return '/vehicles/customizer/bmw_passion_red.png';
    }

    // Ducati Panigale 899
    if (vid === 13) {
      if (name.includes('corse') || (name.includes('red') && name.includes('monotone'))) return '/vehicles/customizer/ducati_corse_red.png';
      if (name.includes('white') || name.includes('silk')) return '/vehicles/customizer/ducati_arctic_white.png';
      if (name.includes('stealth') || name.includes('dark')) return '/vehicles/customizer/ducati_dark_stealth.png';
    }

    // RE Continental GT 650
    if (vid === 12) {
      if (name.includes('clean') || name.includes('chrome')) return '/vehicles/customizer/re_gt650_chrome.png';
      if (name.includes('green') || name.includes('racing')) return '/vehicles/customizer/re_gt650_green.png';
      if (name.includes('black') || name.includes('dux')) return '/vehicles/customizer/re_gt650_black.png';
    }

    // Suzuki Access 125 (Variant 19)
    if (vid === 19 || (selectedVariant?.model_name || '').toLowerCase().includes('access')) {
      return '/vehicles/customizer/suzuki_access_125_green.png';
    }

    // Vespa VXL 125 (Variant 20)
    if (vid === 20 || (selectedVariant?.model_name || '').toLowerCase().includes('vespa')) {
      return '/vehicles/customizer/vespa_vxl_125_yellow.png';
    }

    // Honda Activa 125 (Variant 21)
    if (vid === 21 || (selectedVariant?.model_name || '').toLowerCase().includes('activa')) {
      return '/vehicles/customizer/honda_activa_125_blue.png';
    }

    // Honda CB300R (Variant 17)
    if (vid === 17 || (selectedVariant?.model_name || '').toLowerCase().includes('cb300r') || (selectedVariant?.name || '').toLowerCase().includes('cb300r')) {
      return '/vehicles/customizer/honda_cb300r_red.png';
    }

    // Yamaha MT-15 V2 (Variant 18)
    if (vid === 18 || (selectedVariant?.model_name || '').toLowerCase().includes('mt-15') || (selectedVariant?.model_name || '').toLowerCase().includes('mt15') || (selectedVariant?.name || '').toLowerCase().includes('mt-15') || (selectedVariant?.name || '').toLowerCase().includes('mt15')) {
      return '/vehicles/customizer/yamaha_mt15_cyan.png';
    }

    // RE Classic 350
    if (vid === 16) {
      if (name.includes('red') || name.includes('crimson')) return '/vehicles/customizer/re_classic350_red.png';
      if (name.includes('sand') || name.includes('desert')) return '/vehicles/customizer/re_classic350_desert.png';
      if (name.includes('green') || name.includes('forest')) return '/vehicles/customizer/re_classic350_green.png';
    }

    // X-One Models (Variants 1, 2, 3)
    if (vid === 1 || vid === 2 || vid === 3 || (selectedVariant?.model_name || '').toLowerCase().includes('x-one')) {
      if (name.includes('black')) return '/vehicles/customizer/scooter_jet_black.png';
      if (name.includes('blue')) return '/vehicles/customizer/scooter_electric_blue.png';
      if (name.includes('red')) return '/vehicles/customizer/scooter_crimson_red.png';
      if (name.includes('grey') || name.includes('gray') || name.includes('metallic')) return '/vehicles/customizer/scooter_metallic_grey.png';
    }

    // X3 High-Speed Scooter (Variant 10)
    if (vid === 10 || (selectedVariant?.model_name || '').toLowerCase() === 'x3' || (selectedVariant?.name || '').toLowerCase().includes('x3')) {
      if (name.includes('blue')) return '/vehicles/customizer/x3_electric_blue.png';
      if (name.includes('black')) return '/vehicles/customizer/x3_jet_black.png';
      if (name.includes('red') || name.includes('crimson')) return '/vehicles/customizer/x3_crimson_red.png';
      if (name.includes('grey') || name.includes('metallic')) return '/vehicles/customizer/x3_metallic_grey.png';
    }

    // MG Pro High-Speed Scooters (Variants 4, 5, 6)
    if (vid === 4 || vid === 5 || vid === 6 || (selectedVariant?.model_name || '').toLowerCase().includes('mg') || (selectedVariant?.name || '').toLowerCase().includes('mg')) {
      if (name.includes('red') || name.includes('crimson')) return '/vehicles/customizer/mgpro_crimson_red.png';
      if (name.includes('black') || name.includes('jet')) return '/vehicles/customizer/mgpro_jet_black.png';
      if (name.includes('blue') || name.includes('electric') || name.includes('teal')) return '/vehicles/customizer/mgpro_electric_blue.png';
      if (name.includes('white') || name.includes('pearl')) return '/vehicles/customizer/mgpro_pearl_white.png';
    }

    // Ranger Cruiser Bikes (Variants 7, 8)
    if (vid === 7 || vid === 8 || (selectedVariant?.model_name || '').toLowerCase().includes('ranger') || (selectedVariant?.name || '').toLowerCase().includes('ranger')) {
      return '/vehicles/customizer/ranger_bike_black.png';
    }

    // MX16 Cruiser Bike (Variant 9)
    if (vid === 9 || (selectedVariant?.model_name || '').toLowerCase().includes('mx16') || (selectedVariant?.name || '').toLowerCase().includes('mx16')) {
      return '/vehicles/customizer/mx16_bike_black.png';
    }

    // CAT 3.0 Cargo Vehicle (Variant 11)
    if (vid === 11 || (selectedVariant?.model_name || '').toLowerCase().includes('cat') || (selectedVariant?.name || '').toLowerCase().includes('cat')) {
      return '/vehicles/customizer/cat_cargo_black.png';
    }

    // Electric Scooters (Variants 1-11)
    if (name.includes('crimson red monotone')) {
      return '/vehicles/customizer/scooter_crimson_red.png';
    }
    if (name.includes('pearl white monotone')) {
      return '/vehicles/customizer/scooter_pearl_white.png';
    }
    if (name.includes('jet black monotone')) {
      return '/vehicles/customizer/scooter_jet_black.png';
    }
    if (name.includes('electric blue monotone')) {
      return '/vehicles/customizer/scooter_electric_blue.png';
    }
    if (name.includes('metallic grey monotone') || name.includes('metallic grey')) {
      return '/vehicles/customizer/scooter_metallic_grey.png';
    }
    if (name.includes('pearl white & electric blue')) {
      return '/vehicles/customizer/scooter_pearl_white_electric_blue.png';
    }
    if (name.includes('crimson red & jet black')) {
      return '/vehicles/customizer/scooter_crimson_red_jet_black.png';
    }
    if (name.includes('jet black & metallic grey')) {
      return '/vehicles/customizer/scooter_jet_black_metallic_grey.png';
    }

    // 3. Fallback to vehicle default image
    return selectedVariant?.default_image || '/vehicles/scooter_blue.png';
  };

  const activeImage = resolveCustomizerImage();

  const filteredOptions = (optionsData?.options || []).filter((opt) => {
    // If MX16, Ranger, or CAT 3.0, only show black color option
    const isMX16 = selectedVariantId === 9 || (selectedVariant?.model_name || '').toLowerCase().includes('mx16') || (selectedVariant?.name || '').toLowerCase().includes('mx16');
    const isRanger = selectedVariantId === 7 || selectedVariantId === 8 || (selectedVariant?.model_name || '').toLowerCase().includes('ranger') || (selectedVariant?.name || '').toLowerCase().includes('ranger');
    const isCat = selectedVariantId === 11 || (selectedVariant?.model_name || '').toLowerCase().includes('cat') || (selectedVariant?.name || '').toLowerCase().includes('cat');
    if (isMX16 || isRanger || isCat) {
      const name = (opt.combination_name || '').toLowerCase();
      if (!name.includes('black')) return false;
    }

    // Suzuki Access 125: only default Solid Ice Green color option
    const isAccess = selectedVariantId === 19 || (selectedVariant?.model_name || '').toLowerCase().includes('access');
    if (isAccess) {
      const name = (opt.combination_name || '').toLowerCase();
      if (!name.includes('green') && !name.includes('ice') && !name.includes('sage')) return false;
    }

    // Vespa VXL 125: only default Giallo Tuscan Yellow color option
    const isVespa = selectedVariantId === 20 || (selectedVariant?.model_name || '').toLowerCase().includes('vespa');
    if (isVespa) {
      const name = (opt.combination_name || '').toLowerCase();
      if (!name.includes('yellow') && !name.includes('giallo')) return false;
    }

    // Honda Activa 125: only default Mat Marvel Blue Metallic color option
    const isActiva = selectedVariantId === 21 || (selectedVariant?.model_name || '').toLowerCase().includes('activa');
    if (isActiva) {
      const name = (opt.combination_name || '').toLowerCase();
      if (!name.includes('blue') && !name.includes('marvel')) return false;
    }

    // Honda CB300R: only default Candy Chromosphere Red color option
    const isHonda = selectedVariantId === 17 || (selectedVariant?.model_name || '').toLowerCase().includes('cb300r') || (selectedVariant?.name || '').toLowerCase().includes('cb300r');
    if (isHonda) {
      const name = (opt.combination_name || '').toLowerCase();
      if (!name.includes('red')) return false;
    }

    // Yamaha MT-15 V2: only default Cyan Storm color option
    const isYamaha = selectedVariantId === 18 || (selectedVariant?.model_name || '').toLowerCase().includes('mt-15') || (selectedVariant?.model_name || '').toLowerCase().includes('mt15');
    if (isYamaha) {
      const name = (opt.combination_name || '').toLowerCase();
      if (!name.includes('cyan') && !name.includes('storm')) return false;
    }

    if (activeTab === 'SINGLE') return !opt.is_dual_tone;
    if (activeTab === 'DUAL') return opt.is_dual_tone;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 transition-colors duration-500">
      {/* Top Header & Variant Selector */}
      <div className={`flex flex-col md:flex-row md:items-end justify-between gap-6 border-b pb-8 ${isDarkMode ? 'border-emerald-950/80' : 'border-neutral-200'}`}>
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider mb-2 shadow-sm border border-emerald-900/40">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Interactive Studio
          </div>
          <h1 className={`text-4xl sm:text-6xl font-section-title font-black tracking-section uppercase ${isDarkMode ? 'text-white' : 'text-neutral-950'}`}>
            Vehicle Finish Studio
          </h1>
          <p className={`text-sm mt-1 font-medium max-w-2xl ${isDarkMode ? 'text-slate-400' : 'text-neutral-500'}`}>
            Personalize your electric vehicle with factory single and dual-tone finishes and real-time pricing recalculation.
          </p>
        </div>

        {/* Variant Dropdown Switcher */}
        <div className="w-full md:w-80 space-y-1.5">
          <label className={`block text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-300' : 'text-neutral-700'}`}>
            Select Vehicle Model
          </label>
          <select
            value={selectedVariantId || ''}
            onChange={handleVariantChange}
            className={`w-full px-4 py-2.5 rounded-full text-sm font-bold focus:outline-none shadow-xs transition-colors cursor-pointer ${
              isDarkMode
                ? 'bg-[#06180f] border border-emerald-950 text-white focus:border-emerald-500'
                : 'bg-white border border-neutral-300 text-neutral-900 focus:border-neutral-900'
            }`}
          >
            {variants.map((v) => (
              <option key={v.id} value={v.id} className={isDarkMode ? 'bg-[#06180f] text-white' : 'bg-white text-neutral-900'}>
                {v.model_name} {v.name} ({formatINR(v.base_price)})
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-neutral-900 text-white flex items-center justify-center mx-auto animate-spin shadow-md border border-emerald-900/40">
            <RotateCw className="w-6 h-6 text-emerald-400" />
          </div>
          <p className={`text-sm font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-neutral-500'}`}>Loading customizer textures & options...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Canvas: Live Vehicle Render */}
          <div className="lg:col-span-7 space-y-4">
            <div className={`rounded-3xl border shadow-md p-8 h-[420px] sm:h-[500px] flex items-center justify-center relative overflow-hidden group ${
              isDarkMode
                ? 'bg-gradient-to-b from-[#06180f] to-[#020905] border-emerald-950/80'
                : 'bg-gradient-to-b from-[#fafafa] to-[#f2f2f4] border-neutral-200/90'
            }`}>
              {/* Dynamic ambient color glow matching active finish */}
              <div
                style={{
                  background: `radial-gradient(circle at center, ${selectedOption?.primary_colour?.hex_code || '#10b981'}30 0%, transparent 68%)`,
                }}
                className="absolute inset-0 pointer-events-none transition-all duration-700 z-0"
              />

              {/* Anton Watermark Behind Vehicle */}
              <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-8xl sm:text-9xl font-black uppercase tracking-tighter select-none pointer-events-none whitespace-nowrap z-0 ${
                isDarkMode ? 'text-emerald-500/10' : 'text-neutral-950/15'
              }`}>
                {optionsData?.model_name || 'STUDIO'}
              </div>

              {/* Soft ground shadow ellipse */}
              <div className="absolute bottom-6 w-72 h-8 rounded-[100%] bg-neutral-950/30 blur-lg pointer-events-none" />

              {/* Animated Render Image with seamless crossfade on color change */}
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImage}
                  src={activeImage}
                  alt={selectedOption?.combination_name || selectedVariant?.name || 'Vehicle Customizer'}
                  initial={{ opacity: 0.82, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0.82, scale: 0.98 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className="max-h-full max-w-full object-contain relative z-10 transition-transform duration-500 group-hover:scale-105 drop-shadow-[0_20px_35px_rgba(0,0,0,0.4)] select-none"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = selectedVariant?.default_image || '/vehicles/customizer/scooter_jet_black.png';
                  }}
                />
              </AnimatePresence>

              {/* Badges on Canvas */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
                <span className={`px-3.5 py-1.5 rounded-full text-xs font-bold border shadow-xs ${
                  isDarkMode
                    ? 'bg-[#030d08]/90 text-white border-emerald-950'
                    : 'bg-white/95 text-neutral-900 border-neutral-300'
                }`}>
                  {optionsData?.model_name} {optionsData?.variant_name}
                </span>
                <span className={`px-3.5 py-1.5 rounded-full text-xs font-bold border shadow-xs flex items-center gap-1.5 ${
                  isDarkMode
                    ? 'bg-[#030d08]/90 text-white border-emerald-950'
                    : 'bg-white/95 text-neutral-900 border-neutral-300'
                }`}>
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block border border-neutral-400 shadow-xs"
                    style={{ backgroundColor: selectedOption?.primary_colour?.hex_code || '#fff' }}
                  />
                  {selectedOption?.is_dual_tone ? 'Dual-Tone Special' : 'Single Tone Finish'}
                </span>
              </div>

              {/* Share button on canvas */}
              <button
                onClick={handleCopyLink}
                className={`absolute top-4 right-4 p-2.5 rounded-full border shadow-xs transition-colors z-20 cursor-pointer ${
                  isDarkMode
                    ? 'bg-[#030d08]/90 hover:bg-emerald-950 border-emerald-950 text-white'
                    : 'bg-white hover:bg-neutral-100 border-neutral-300 text-neutral-900'
                }`}
                title="Share this configuration"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {/* Selected Color Headline Card */}
            <div className={`p-4 rounded-2xl border shadow-sm flex items-center justify-between ${
              isDarkMode
                ? 'bg-[#06180f] border-emerald-950 text-white'
                : 'bg-white border-neutral-200/90 text-neutral-950'
            }`}>
              <div className="flex items-center gap-3">
                {/* Swatch indicator */}
                {selectedOption?.is_dual_tone ? (
                  <div className="w-9 h-9 rounded-full border border-neutral-400 flex overflow-hidden shadow-sm">
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
                    className="w-9 h-9 rounded-full border border-neutral-400 shadow-sm"
                    style={{ backgroundColor: selectedOption?.primary_colour?.hex_code }}
                  />
                )}
                <div>
                  <h3 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-neutral-950'}`}>{selectedOption?.combination_name}</h3>
                  <p className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-neutral-500'}`}>
                    {selectedOption?.is_dual_tone
                      ? `${selectedOption.primary_colour?.name} + ${selectedOption.secondary_colour?.name}`
                      : selectedOption?.primary_colour?.name}
                  </p>
                </div>
              </div>

              {parseFloat(selectedOption?.price_adjustment || '0') > 0 ? (
                <span className={`text-xs font-bold px-3 py-1 rounded-full border shadow-xs ${
                  isDarkMode
                    ? 'bg-slate-900 text-amber-300 border-amber-500/30'
                    : 'bg-neutral-100 text-neutral-900 border-neutral-300'
                }`}>
                  +{formatINR(selectedOption.price_adjustment)} Premium
                </span>
              ) : (
                <span className="text-xs font-bold text-emerald-400 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800 shadow-xs">
                  Standard Finish
                </span>
              )}
            </div>
          </div>

          {/* Right Panel: Swatches Selection & Live Pricing */}
          <div className="lg:col-span-5 space-y-6">
            {/* Tone Filter Tabs */}
            <div className="space-y-3">
              <label className={`block text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-300' : 'text-neutral-700'}`}>
                Select Finish Palette ({filteredOptions.length})
              </label>
              <div className={`grid grid-cols-3 gap-1.5 p-1.5 rounded-full border text-xs font-bold shadow-xs ${
                isDarkMode ? 'bg-[#04120b] border-emerald-950' : 'bg-white border-neutral-300'
              }`}>
                <button
                  onClick={() => setActiveTab('ALL')}
                  className={`py-2 rounded-full transition-all cursor-pointer ${
                    activeTab === 'ALL'
                      ? (isDarkMode ? 'bg-gradient-to-r from-emerald-500 to-lime-400 text-slate-950 font-black shadow-sm' : 'bg-neutral-950 text-white shadow-sm')
                      : (isDarkMode ? 'text-slate-400 hover:text-white' : 'text-neutral-600 hover:text-neutral-950')
                  }`}
                >
                  All Finishes
                </button>
                <button
                  onClick={() => setActiveTab('SINGLE')}
                  className={`py-2 rounded-full transition-all cursor-pointer ${
                    activeTab === 'SINGLE'
                      ? (isDarkMode ? 'bg-gradient-to-r from-emerald-500 to-lime-400 text-slate-950 font-black shadow-sm' : 'bg-neutral-950 text-white shadow-sm')
                      : (isDarkMode ? 'text-slate-400 hover:text-white' : 'text-neutral-600 hover:text-neutral-950')
                  }`}
                >
                  Single Tone
                </button>
                <button
                  onClick={() => setActiveTab('DUAL')}
                  className={`py-2 rounded-full transition-all cursor-pointer ${
                    activeTab === 'DUAL'
                      ? (isDarkMode ? 'bg-gradient-to-r from-emerald-500 to-lime-400 text-slate-950 font-black shadow-sm' : 'bg-neutral-950 text-white shadow-sm')
                      : (isDarkMode ? 'text-slate-400 hover:text-white' : 'text-neutral-600 hover:text-neutral-950')
                  }`}
                >
                  Dual Tone
                </button>
              </div>
            </div>

            {/* Colour Swatches Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[340px] overflow-y-auto pr-1 scrollbar-none">
              {filteredOptions.length === 0 && (
                <div className="col-span-1 sm:col-span-2 py-6 text-center text-xs font-semibold text-neutral-400">
                  No finishes match this filter. Please select "Single Tone" or "All Finishes".
                </div>
              )}
              {filteredOptions.map((opt) => {
                const isSelected = selectedOption?.id === opt.id;
                const adjustmentNum = parseFloat(opt.price_adjustment || '0');

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(opt)}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl text-left transition-all cursor-pointer ${
                      isSelected
                        ? (isDarkMode
                            ? 'border border-emerald-500 bg-emerald-950/50 ring-2 ring-emerald-500/30'
                            : 'border border-neutral-950 bg-neutral-50 ring-2 ring-neutral-950/20 shadow-sm')
                        : (isDarkMode
                            ? 'border border-emerald-950/80 bg-[#06180f] hover:border-emerald-700'
                            : 'border border-neutral-200 hover:border-neutral-400 bg-white')
                    }`}
                  >
                    {/* Swatch Circle */}
                    {opt.is_dual_tone ? (
                      <div className="w-9 h-9 rounded-full border border-neutral-400 flex overflow-hidden shrink-0 shadow-sm">
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
                        className="w-9 h-9 rounded-full border border-neutral-400 shrink-0 shadow-sm"
                        style={{ backgroundColor: opt.primary_colour?.hex_code }}
                      />
                    )}

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold truncate ${isDarkMode ? 'text-white' : 'text-neutral-950'}`}>{opt.combination_name}</p>
                      <span className={`text-[11px] font-medium block ${isDarkMode ? 'text-slate-400' : 'text-neutral-500'}`}>
                        {adjustmentNum > 0 ? `+${formatINR(adjustmentNum)}` : 'Standard'}
                      </span>
                    </div>

                    {isSelected && (
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${isDarkMode ? 'bg-emerald-400 text-black' : 'bg-neutral-950 text-white'}`}>
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Authoritative Price Recalculation Engine Card */}
            <div className={`p-6 rounded-3xl border shadow-md space-y-4 ${
              isDarkMode ? 'bg-[#06180f] border-emerald-950' : 'bg-white border-neutral-200/90'
            }`}>
              <div className={`flex items-center justify-between pb-3 border-b ${isDarkMode ? 'border-emerald-950/80' : 'border-neutral-200'}`}>
                <span className={`text-xs uppercase font-bold ${isDarkMode ? 'text-slate-400' : 'text-neutral-500'}`}>
                  Dynamic Price Breakdown
                </span>
                {calculating && (
                  <span className={`text-xs font-bold animate-pulse flex items-center gap-1 ${isDarkMode ? 'text-emerald-400' : 'text-neutral-800'}`}>
                    <RotateCw className="w-3 h-3 animate-spin" /> Recalculating...
                  </span>
                )}
              </div>

              <div className="space-y-2 text-xs font-medium">
                <div className={`flex justify-between ${isDarkMode ? 'text-slate-300' : 'text-neutral-600'}`}>
                  <span>Base Ex-Showroom ({optionsData?.variant_name})</span>
                  <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-neutral-950'}`}>{formatINR(priceData?.base_price || optionsData?.base_price)}</span>
                </div>

                <div className={`flex justify-between ${isDarkMode ? 'text-slate-300' : 'text-neutral-600'}`}>
                  <span>Custom Finish ({selectedOption?.combination_name})</span>
                  <span
                    className={
                      parseFloat(priceData?.price_adjustment || '0') > 0
                        ? `font-bold ${isDarkMode ? 'text-white' : 'text-neutral-950'}`
                        : 'font-bold text-emerald-500'
                    }
                  >
                    {parseFloat(priceData?.price_adjustment || '0') > 0
                      ? `+${formatINR(priceData?.price_adjustment)}`
                      : 'Included'}
                  </span>
                </div>

                <div className={`flex justify-between text-sm pt-3 border-t font-black items-baseline ${
                  isDarkMode ? 'border-emerald-950/80 text-white' : 'border-neutral-200 text-neutral-950'
                }`}>
                  <span>Total Configuration Price</span>
                  <span className={`text-2xl font-display font-black ${isDarkMode ? 'text-emerald-400' : 'text-neutral-950'}`}>
                    {formatINR(priceData?.total_price || optionsData?.base_price)}
                  </span>
                </div>
              </div>

              <div className={`p-3.5 rounded-2xl border text-[11px] flex items-center gap-2 font-medium ${
                isDarkMode ? 'bg-[#030d08] border-emerald-950 text-slate-300' : 'bg-neutral-50 border-neutral-200 text-neutral-600'
              }`}>
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Price verified by backend showroom configuration engine. Includes 5-year battery warranty.</span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <Link
                  to={`/book-test-ride?variant=${selectedVariantId}&finish=${selectedOption?.combination_id}`}
                  className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-full font-bold text-xs uppercase tracking-wider shadow-md active:scale-98 transition-all ${
                    isDarkMode
                      ? 'bg-gradient-to-r from-emerald-500 to-lime-400 text-slate-950 font-black shadow-emerald-500/20 hover:opacity-90'
                      : 'bg-neutral-950 text-white hover:bg-neutral-800 shadow-neutral-900/20'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  Book Test Ride in This Configuration
                </Link>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleCopyLink}
                    className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full border text-xs font-bold transition-colors shadow-xs cursor-pointer ${
                      isDarkMode
                        ? 'bg-[#030d08] hover:bg-slate-900 border-emerald-950 text-white'
                        : 'bg-white hover:bg-neutral-50 border-neutral-300 text-neutral-900'
                    }`}
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    Share Link
                  </button>

                  <Link
                    to={`/vehicles/${selectedVariantId}`}
                    className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full border text-xs font-bold transition-colors shadow-xs ${
                      isDarkMode
                        ? 'bg-[#030d08] hover:bg-slate-900 border-emerald-950 text-white'
                        : 'bg-white hover:bg-neutral-50 border-neutral-300 text-neutral-900'
                    }`}
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
