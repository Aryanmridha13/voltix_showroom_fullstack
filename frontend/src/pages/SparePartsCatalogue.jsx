import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  Wrench,
  Battery,
  Disc,
  CircleGauge,
  Cpu,
  Zap,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Check,
  ShieldCheck,
  Truck,
  Sparkles,
  X,
  ArrowUpDown,
  RotateCcw,
  Send,
  Phone,
  User,
  MessageSquare,
} from 'lucide-react';
import { partsService } from '../services/partsService';
import { useAlert } from '../context/AlertContext';
import { useAuth } from '../context/AuthContext';

// Dynamic category icon matcher
const getCategoryIcon = (categoryName = '') => {
  const lower = categoryName.toLowerCase();
  if (lower.includes('batter') || lower.includes('charger')) {
    return <Battery className="w-4 h-4 text-emerald-600" />;
  }
  if (lower.includes('brak')) {
    return <Disc className="w-4 h-4 text-neutral-900" />;
  }
  if (lower.includes('tyre') || lower.includes('wheel')) {
    return <CircleGauge className="w-4 h-4 text-neutral-900" />;
  }
  if (lower.includes('motor') || lower.includes('controller')) {
    return <Cpu className="w-4 h-4 text-emerald-700" />;
  }
  if (lower.includes('electric') || lower.includes('light')) {
    return <Zap className="w-4 h-4 text-neutral-900" />;
  }
  return <Wrench className="w-4 h-4 text-neutral-500" />;
};

// High-tech decorative SVG illustration fallback per category
const PartGraphic = ({ categoryName = '' }) => {
  const lower = categoryName.toLowerCase();
  if (lower.includes('batter') || lower.includes('charger')) {
    return (
      <svg className="w-20 h-20 text-neutral-900/60 drop-shadow-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <rect x="2" y="7" width="16" height="12" rx="2" strokeDasharray="3 3" />
        <path d="M6 11v4M10 11v4M14 11v4" strokeWidth="2" strokeLinecap="round" />
        <path d="M18 10h2a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-2" fill="currentColor" fillOpacity="0.2" />
      </svg>
    );
  }
  if (lower.includes('brak')) {
    return (
      <svg className="w-20 h-20 text-neutral-900/60 drop-shadow-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <circle cx="12" cy="12" r="9" strokeDasharray="4 2" />
        <circle cx="12" cy="12" r="4" strokeWidth="1.5" />
        <path d="M12 3v3M12 18v3M3 12h3M18 12h3" strokeLinecap="round" />
      </svg>
    );
  }
  if (lower.includes('tyre') || lower.includes('wheel')) {
    return (
      <svg className="w-20 h-20 text-neutral-900/60 drop-shadow-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="5" strokeDasharray="2 2" />
        <path d="M12 2a10 10 0 0 1 10 10M12 22a10 10 0 0 1-10-10" strokeWidth="2" />
      </svg>
    );
  }
  if (lower.includes('motor') || lower.includes('controller')) {
    return (
      <svg className="w-20 h-20 text-neutral-900/60 drop-shadow-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <rect x="9" y="9" width="6" height="6" />
        <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg className="w-20 h-20 text-neutral-900/60 drop-shadow-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
};

/**
 * SparePartsCatalogue Page
 * High-key White Studio Automotive Spare Parts & OEM Inventory.
 */
export default function SparePartsCatalogue() {
  const { user } = useAuth();
  const { error: showAlertError, success: showAlertSuccess } = useAlert();

  const [parts, setParts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter and Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStockStatus, setSelectedStockStatus] = useState('');
  const [sortBy, setSortBy] = useState('name'); // 'name', 'price_asc', 'price_desc', 'stock_desc'

  // Modal / Interaction State
  const [selectedPart, setSelectedPart] = useState(null);
  const [copiedSku, setCopiedSku] = useState(null);
  const [inquirySubmitting, setInquirySubmitting] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(null);
  const [inquiryForm, setInquiryForm] = useState({
    customer_name: user?.name || user?.username || '',
    phone: user?.phone_number || '',
    preferred_model: '',
    notes: '',
  });

  const loadCatalogue = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [partsData, catsData] = await Promise.all([
        partsService.getParts(),
        partsService.getCategories(),
      ]);
      setParts(partsData || []);
      setCategories(catsData || []);
    } catch (err) {
      const msg = err.customMessage || 'Could not load genuine spare parts inventory.';
      setError(msg);
      showAlertError(msg);
    } finally {
      setLoading(false);
    }
  }, [showAlertError]);

  useEffect(() => {
    loadCatalogue();
  }, [loadCatalogue]);

  // Copy SKU action
  const handleCopySku = (sku, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(sku);
    setCopiedSku(sku);
    showAlertSuccess(`Copied SKU ${sku} to clipboard.`);
    setTimeout(() => setCopiedSku(null), 2000);
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedStockStatus('');
    setSortBy('name');
  };

  // Submit Part Inquiry / Hold Request
  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    if (!selectedPart) return;

    if (!inquiryForm.customer_name || !inquiryForm.phone) {
      showAlertError('Please provide your name and phone number for part reservation.');
      return;
    }

    setInquirySubmitting(true);
    try {
      const payload = {
        part: selectedPart.id,
        customer_name: inquiryForm.customer_name,
        phone: inquiryForm.phone,
        preferred_model: inquiryForm.preferred_model,
        notes: inquiryForm.notes,
      };
      const res = await partsService.submitInquiry(payload);
      setInquirySuccess(res);
      showAlertSuccess(`Hold token ${res.code || 'RESERVED'} generated! Showroom notified.`);
    } catch (err) {
      showAlertError(err.customMessage || 'Failed to submit part inquiry.');
    } finally {
      setInquirySubmitting(false);
    }
  };

  // Filter & Sort Logic
  const filteredParts = useMemo(() => {
    let result = [...parts];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.part_number.toLowerCase().includes(q) ||
          (p.category_name && p.category_name.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    if (selectedCategory) {
      result = result.filter((p) => p.category_slug === selectedCategory);
    }

    if (selectedStockStatus) {
      result = result.filter((p) => p.stock_status === selectedStockStatus);
    }

    result.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'price_asc') {
        return parseFloat(a.price) - parseFloat(b.price);
      }
      if (sortBy === 'price_desc') {
        return parseFloat(b.price) - parseFloat(a.price);
      }
      if (sortBy === 'stock_desc') {
        return (b.stock_quantity || 0) - (a.stock_quantity || 0);
      }
      return 0;
    });

    return result;
  }, [parts, searchQuery, selectedCategory, selectedStockStatus, sortBy]);

  const formatCurrency = (amt) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amt);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Top Hero Section */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          100% Genuine OEM Certified Inventory
        </div>
        <h1 className="text-4xl sm:text-6xl font-section-title font-black tracking-section text-neutral-950 uppercase">
          EV Spare Parts & <span className="text-emerald-700">Components</span>
        </h1>
        <p className="text-neutral-500 text-sm font-medium leading-relaxed">
          High-density lithium battery modules, high-torque BLDC motors, smart digital clusters, and regenerative brake calipers engineered specifically for Voltix electric platforms.
        </p>

        {/* Quick Assurance Badges */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs font-bold text-neutral-700">
          <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white border border-neutral-300 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            1-Year Factory Warranty
          </div>
          <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white border border-neutral-300 shadow-xs">
            <Truck className="w-4 h-4 text-neutral-950" />
            Express Showroom Dispatch
          </div>
          <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white border border-neutral-300 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            Original Voltix Fitment
          </div>
        </div>
      </div>

      {/* Filter & Search Bar Card */}
      <div className="bg-white border border-neutral-200/90 rounded-3xl p-6 shadow-md space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by part name, SKU (e.g. VOLT-BAT), or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-full text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 shadow-xs transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-950 text-xs"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Stock Status Selector */}
          <div className="md:col-span-3">
            <select
              value={selectedStockStatus}
              onChange={(e) => setSelectedStockStatus(e.target.value)}
              aria-label="Filter by inventory status"
              className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-full text-sm text-neutral-800 font-medium focus:outline-none focus:border-neutral-900 shadow-xs cursor-pointer"
            >
              <option value="">All Inventory Statuses</option>
              <option value="IN_STOCK">In Stock</option>
              <option value="LOW_STOCK">Low Stock (Alert)</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
            </select>
          </div>

          {/* Sort Selector */}
          <div className="md:col-span-3">
            <div className="relative">
              <ArrowUpDown className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort parts order"
                className="w-full pl-11 pr-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-full text-sm text-neutral-800 font-medium focus:outline-none focus:border-neutral-900 shadow-xs cursor-pointer"
              >
                <option value="name">Sort: Name (A to Z)</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="stock_desc">Highest Stock First</option>
              </select>
            </div>
          </div>

          {/* Reset Button */}
          <div className="md:col-span-1 flex items-center justify-end">
            <button
              onClick={handleResetFilters}
              title="Reset all filters"
              className="w-full h-full flex items-center justify-center p-2.5 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-neutral-800 rounded-full text-xs font-bold shadow-xs transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category Horizontal Filter Pills */}
        <div className="pt-4 border-t border-neutral-200 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
              selectedCategory === ''
                ? 'bg-neutral-950 text-white shadow-sm'
                : 'bg-white text-neutral-700 hover:text-neutral-950 border border-neutral-300 shadow-xs'
            }`}
          >
            All Categories ({parts.length})
          </button>
          {categories.map((cat) => {
            const count = parts.filter((p) => p.category_slug === cat.slug).length;
            const isSelected = selectedCategory === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap flex items-center gap-1.5 transition-all ${
                  isSelected
                    ? 'bg-neutral-950 text-white shadow-sm'
                    : 'bg-white text-neutral-700 hover:text-neutral-950 border border-neutral-300 shadow-xs'
                }`}
              >
                {cat.name}
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${isSelected ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-600'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="py-24 text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-neutral-950 mb-4" />
          <p className="text-neutral-500 font-bold uppercase tracking-wider text-sm">Querying live inventory from showroom database...</p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="p-8 rounded-3xl bg-white border border-rose-200 text-center max-w-xl mx-auto shadow-sm">
          <AlertTriangle className="w-8 h-8 text-rose-600 mx-auto mb-2" />
          <h3 className="text-lg font-display font-black text-neutral-950 uppercase mb-1">Inventory Synchronization Error</h3>
          <p className="text-sm text-neutral-500 mb-4 font-medium">{error}</p>
          <button
            onClick={loadCatalogue}
            className="px-5 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-sm"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Active Parts Grid */}
      {!loading && !error && filteredParts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredParts.map((part) => {
            const isLowStock = part.stock_status === 'LOW_STOCK';
            const isOutOfStock = part.stock_status === 'OUT_OF_STOCK';
            const isInStock = part.stock_status === 'IN_STOCK';

            return (
              <div
                key={part.id}
                onClick={() => setSelectedPart(part)}
                className="group relative bg-white hover:border-neutral-400 border border-neutral-200/90 rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 shadow-md hover:shadow-2xl cursor-pointer overflow-hidden"
              >
                {/* Header: Category Badge & Stock Status */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-xs font-bold text-neutral-800">
                      {getCategoryIcon(part.category_name)}
                      <span>{part.category_name}</span>
                    </div>

                    {/* Stock Badge */}
                    {isInStock && (
                      <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        In Stock ({part.stock_quantity})
                      </span>
                    )}
                    {isLowStock && (
                      <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300 animate-pulse">
                        <AlertTriangle className="w-3 h-3" />
                        Low Stock ({part.stock_quantity})
                      </span>
                    )}
                    {isOutOfStock && (
                      <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <XCircle className="w-3 h-3" />
                        Out of Stock
                      </span>
                    )}
                  </div>

                  {/* Graphic Preview Container */}
                  <div className="h-40 bg-gradient-to-b from-[#fafafa] to-[#f2f2f4] rounded-2xl border border-neutral-200/80 flex items-center justify-center p-4 mb-4 group-hover:border-neutral-300 transition-colors overflow-hidden">
                    {part.image ? (
                      <img
                        src={part.image}
                        alt={part.name}
                        className="max-h-full max-w-full object-contain filter group-hover:scale-105 transition-transform duration-300 drop-shadow-sm"
                      />
                    ) : (
                      <div className="transform group-hover:scale-110 transition-transform duration-300">
                        <PartGraphic categoryName={part.category_name} />
                      </div>
                    )}
                  </div>

                  {/* Part Name & SKU */}
                  <h3 className="text-lg sm:text-xl font-card-title text-neutral-950 group-hover:text-emerald-700 transition-colors line-clamp-2 mb-1.5 uppercase tracking-card">
                    {part.name}
                  </h3>

                  {/* SKU with Copy Action */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-neutral-100 border border-neutral-200 text-[11px] font-mono font-bold text-neutral-700 mb-3 shadow-xs">
                    <span>SKU: {part.part_number}</span>
                    <button
                      onClick={(e) => handleCopySku(part.part_number, e)}
                      title="Copy SKU code"
                      className="hover:text-black transition-colors p-0.5"
                    >
                      {copiedSku === part.part_number ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>

                  <p className="text-neutral-500 text-xs line-clamp-2 mb-4 leading-relaxed font-medium">
                    {part.description}
                  </p>
                </div>

                {/* Card Bottom: Price & Quick Action */}
                <div className="pt-3 border-t border-neutral-200 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Showroom MRP</div>
                    <div className="text-2xl font-display font-black text-neutral-950">
                      {formatCurrency(part.price)}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPart(part);
                    }}
                    className="px-4 py-2 rounded-full bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm active:scale-95"
                  >
                    Inquire
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty Search Result State */}
      {!loading && !error && filteredParts.length === 0 && (
        <div className="bg-white border border-neutral-200 rounded-3xl p-12 text-center max-w-lg mx-auto shadow-sm">
          <Wrench className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-xl font-display font-black text-neutral-950 uppercase mb-2">No Spare Parts Match Your Criteria</h3>
          <p className="text-xs text-neutral-500 mb-6 font-medium">
            We couldn't find any OEM components matching "{searchQuery}" under the selected category or stock status filters.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-6 py-2.5 rounded-full bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Part Details & Inquiry / Hold Modal */}
      {selectedPart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white border border-neutral-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
              <div className="flex items-center gap-2">
                {getCategoryIcon(selectedPart.category_name)}
                <span className="text-xs font-bold text-neutral-600 uppercase tracking-wider">
                  {selectedPart.category_name}
                </span>
              </div>
              <button
                onClick={() => {
                  setSelectedPart(null);
                  setInquirySuccess(null);
                }}
                className="text-neutral-500 hover:text-black p-1 rounded-full hover:bg-neutral-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Product overview header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-display font-black text-neutral-950 uppercase mb-1">{selectedPart.name}</h2>
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-neutral-600">
                    <span>SKU: {selectedPart.part_number}</span>
                    <button
                      onClick={(e) => handleCopySku(selectedPart.part_number, e)}
                      className="text-neutral-900 hover:text-emerald-700"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <div className="text-xs text-neutral-500 uppercase font-bold">Showroom Price</div>
                  <div className="text-3xl font-display font-black text-neutral-950">
                    {formatCurrency(selectedPart.price)}
                  </div>
                  <div className="text-[11px] text-neutral-500 font-medium">Incl. 18% GST & 1-Year Warranty</div>
                </div>
              </div>

              {/* Status and Stock level badge */}
              <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-between text-xs">
                <span className="text-neutral-600 font-bold">Stock Availability:</span>
                <span className="font-bold flex items-center gap-1.5">
                  {selectedPart.stock_status === 'IN_STOCK' && (
                    <span className="text-emerald-700 flex items-center gap-1 font-bold">
                      <CheckCircle2 className="w-4 h-4" /> Ready for Immediate Dispatch ({selectedPart.stock_quantity} units)
                    </span>
                  )}
                  {selectedPart.stock_status === 'LOW_STOCK' && (
                    <span className="text-amber-800 flex items-center gap-1 font-bold">
                      <AlertTriangle className="w-4 h-4" /> Limited Units Left ({selectedPart.stock_quantity} units)
                    </span>
                  )}
                  {selectedPart.stock_status === 'OUT_OF_STOCK' && (
                    <span className="text-rose-700 flex items-center gap-1 font-bold">
                      <XCircle className="w-4 h-4" /> Back-order Available
                    </span>
                  )}
                </span>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold uppercase text-neutral-700 mb-2">Technical Description</h4>
                <p className="text-xs text-neutral-600 leading-relaxed bg-neutral-50 p-4 rounded-2xl border border-neutral-200 font-medium">
                  {selectedPart.description}
                </p>
              </div>

              {/* Reservation / Inquiry Form */}
              <div className="border-t border-neutral-200 pt-5">
                {inquirySuccess ? (
                  <div className="p-6 rounded-3xl bg-neutral-50 border border-neutral-200 text-center space-y-2">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                    <h3 className="text-lg font-display font-black text-neutral-950 uppercase mb-1">Reservation Hold Confirmed!</h3>
                    <p className="text-xs text-neutral-600 mb-3 font-medium">
                      Your part inquiry has been logged with the Voltix Service & Spare Parts Department.
                    </p>
                    <div className="inline-block px-4 py-1.5 bg-neutral-950 text-white rounded-full text-xs font-mono font-bold mb-3 shadow-xs">
                      Hold Token: {inquirySuccess.code}
                    </div>
                    <p className="text-[11px] text-neutral-500 font-medium">
                      Our service technician will contact you on your registered phone within 2 showroom hours to arrange pickup or installation.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleInquirySubmit} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase text-neutral-700 flex items-center gap-1.5">
                        <Send className="w-3.5 h-3.5 text-neutral-950" />
                        Reserve / Inquire for Service Installation
                      </h4>
                      <span className="text-[11px] text-neutral-500 font-bold">No payment required now</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-neutral-700 mb-1">Your Full Name *</label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                          <input
                            type="text"
                            required
                            placeholder="e.g. Rahul Sharma"
                            value={inquiryForm.customer_name}
                            onChange={(e) => setInquiryForm({ ...inquiryForm, customer_name: e.target.value })}
                            className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-300 rounded-full text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-neutral-700 mb-1">Phone Number (10 Digits) *</label>
                        <div className="relative">
                          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                          <input
                            type="tel"
                            required
                            placeholder="e.g. 9876543210"
                            value={inquiryForm.phone}
                            onChange={(e) => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
                            className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-300 rounded-full text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-neutral-700 mb-1">Voltix EV Model You Own (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. Voltix Pulse Pro or Voltix Glide City"
                        value={inquiryForm.preferred_model}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, preferred_model: e.target.value })}
                        className="w-full px-4 py-2 bg-neutral-50 border border-neutral-300 rounded-full text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-neutral-700 mb-1">Special Note or Fitment Question</label>
                      <div className="relative">
                        <MessageSquare className="absolute left-3.5 top-3 w-3.5 h-3.5 text-neutral-400" />
                        <textarea
                          rows="2"
                          placeholder="e.g. I need showroom technician installation service at the Connaught Place branch."
                          value={inquiryForm.notes}
                          onChange={(e) => setInquiryForm({ ...inquiryForm, notes: e.target.value })}
                          className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-300 rounded-2xl text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={inquirySubmitting}
                      className="w-full py-3 bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider rounded-full transition-all shadow-md shadow-neutral-900/20 disabled:opacity-50"
                    >
                      {inquirySubmitting ? 'Registering Hold...' : 'Confirm Part Reservation & Inquiry'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
