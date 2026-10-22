import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  Filter,
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
    return <Battery className="w-5 h-5 text-emerald-400" />;
  }
  if (lower.includes('brak')) {
    return <Disc className="w-5 h-5 text-cyan-400" />;
  }
  if (lower.includes('tyre') || lower.includes('wheel')) {
    return <CircleGauge className="w-5 h-5 text-amber-400" />;
  }
  if (lower.includes('motor') || lower.includes('controller')) {
    return <Cpu className="w-5 h-5 text-purple-400" />;
  }
  if (lower.includes('electric') || lower.includes('light')) {
    return <Zap className="w-5 h-5 text-blue-400" />;
  }
  return <Wrench className="w-5 h-5 text-slate-400" />;
};

// High-tech decorative SVG illustration fallback per category
const PartGraphic = ({ categoryName = '' }) => {
  const lower = categoryName.toLowerCase();
  if (lower.includes('batter') || lower.includes('charger')) {
    return (
      <svg className="w-24 h-24 text-emerald-400/80 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <rect x="2" y="7" width="16" height="12" rx="2" strokeDasharray="3 3" />
        <path d="M6 11v4M10 11v4M14 11v4" strokeWidth="2" strokeLinecap="round" />
        <path d="M18 10h2a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-2" fill="currentColor" fillOpacity="0.2" />
        <circle cx="10" cy="4" r="1.5" />
      </svg>
    );
  }
  if (lower.includes('brak')) {
    return (
      <svg className="w-24 h-24 text-cyan-400/80 drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="4" strokeDasharray="2 2" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
        <path d="M12 3v3M12 18v3M3 12h3M18 12h3M6 6l2 2M16 16l2 2M6 18l2-2M16 8l2-2" strokeLinecap="round" />
      </svg>
    );
  }
  if (lower.includes('tyre') || lower.includes('wheel')) {
    return (
      <svg className="w-24 h-24 text-amber-400/80 drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <circle cx="12" cy="12" r="9.5" strokeWidth="1.5" />
        <circle cx="12" cy="12" r="6" strokeWidth="1" strokeDasharray="3 2" />
        <circle cx="12" cy="12" r="2.5" fill="currentColor" fillOpacity="0.3" />
        <path d="M12 2.5v3.5M12 18v3.5M2.5 12h3.5M18 12h3.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (lower.includes('motor') || lower.includes('controller')) {
    return (
      <svg className="w-24 h-24 text-purple-400/80 drop-shadow-[0_0_15px_rgba(168,85,247,0.3)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <rect x="4" y="4" width="16" height="16" rx="3" strokeWidth="1.5" />
        <path d="M9 9h6v6H9z" fill="currentColor" fillOpacity="0.2" />
        <path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg className="w-24 h-24 text-blue-400/80 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinejoin="round" strokeLinecap="round" fill="currentColor" fillOpacity="0.15" />
    </svg>
  );
};

export default function SparePartsCatalogue() {
  const { user } = useAuth();
  const { addAlert } = useAlert();

  // State
  const [parts, setParts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStockStatus, setSelectedStockStatus] = useState('');
  const [sortBy, setSortBy] = useState('name'); // 'name', 'price_asc', 'price_desc', 'stock_desc'

  // Modal & Interaction state
  const [selectedPart, setSelectedPart] = useState(null);
  const [copiedSku, setCopiedSku] = useState(null);
  const [inquirySubmitting, setInquirySubmitting] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(null);
  const [inquiryForm, setInquiryForm] = useState({
    customer_name: user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : '',
    phone: user?.phone || '',
    preferred_model: '',
    notes: '',
  });

  // Fetch categories and parts from backend
  const loadCatalogue = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [catList, partsData] = await Promise.all([
        partsService.getCategories(),
        partsService.getParts({ is_active: true }),
      ]);

      setCategories(catList || []);
      setParts(partsData?.items || []);
    } catch (err) {
      console.error('Failed to load spare parts catalogue:', err);
      setError('Unable to load spare parts inventory from showroom database. Please ensure your backend is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCatalogue();
  }, [loadCatalogue]);

  // Update inquiry form if user logs in later
  useEffect(() => {
    if (user) {
      setInquiryForm((prev) => ({
        ...prev,
        customer_name: prev.customer_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
        phone: prev.phone || user.phone || '',
      }));
    }
  }, [user]);

  // Copy SKU to clipboard
  const handleCopySku = (sku, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(sku);
    setCopiedSku(sku);
    addAlert(`SKU ${sku} copied to clipboard!`, 'info');
    setTimeout(() => setCopiedSku(null), 2000);
  };

  // Client-side computed filtered & sorted parts
  const filteredParts = useMemo(() => {
    return parts
      .filter((part) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = part.name.toLowerCase().includes(q);
          const matchSku = part.part_number.toLowerCase().includes(q);
          const matchDesc = part.description?.toLowerCase().includes(q);
          const matchCat = part.category_name?.toLowerCase().includes(q);
          if (!matchName && !matchSku && !matchDesc && !matchCat) return false;
        }

        // Category filter
        if (selectedCategory && part.category_slug !== selectedCategory) {
          return false;
        }

        // Stock status filter
        if (selectedStockStatus && part.stock_status !== selectedStockStatus) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return parseFloat(a.price) - parseFloat(b.price);
        if (sortBy === 'price_desc') return parseFloat(b.price) - parseFloat(a.price);
        if (sortBy === 'stock_desc') return b.stock_quantity - a.stock_quantity;
        return a.name.localeCompare(b.name);
      });
  }, [parts, searchQuery, selectedCategory, selectedStockStatus, sortBy]);

  // Submit Part Reservation / Order Inquiry
  const handleInquirySubmit = (e) => {
    e.preventDefault();
    if (!inquiryForm.phone || !inquiryForm.customer_name) {
      addAlert('Please fill in your name and contact phone number.', 'error');
      return;
    }

    setInquirySubmitting(true);
    // Simulate instantaneous reservation dispatch to showroom desk
    setTimeout(() => {
      const reservationCode = `RES-PART-${Math.floor(100000 + Math.random() * 900000)}`;
      setInquirySuccess({
        code: reservationCode,
        partName: selectedPart.name,
        partSku: selectedPart.part_number,
        price: selectedPart.price,
      });
      setInquirySubmitting(false);
      addAlert(`Reservation hold registered! Reference code: ${reservationCode}`, 'success');
    }, 600);
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedStockStatus('');
    setSortBy('name');
  };

  // Formatting helpers
  const formatCurrency = (amt) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amt);
  };

  return (
    <div className="min-h-screen bg-[#030d09] text-slate-100 pt-24 pb-20">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-lime-500/10 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-lime-400 animate-pulse" />
            100% Genuine OEM Certified Inventory
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white mb-4">
            EV Spare Parts & <span className="text-gradient-emerald">Components</span>
          </h1>
          <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
            High-density lithium battery modules, high-torque BLDC motors, smart digital clusters, and regenerative brake calipers engineered specifically for Voltix electric platforms.
          </p>

          {/* Quick Assurance Badges */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-300">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              1-Year Factory Warranty
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800">
              <Truck className="w-4 h-4 text-cyan-400" />
              Express Showroom Dispatch
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-purple-400" />
              Original Voltix Fitment
            </div>
          </div>
        </div>

        {/* Filter & Search Bar Card */}
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-4 sm:p-6 mb-10 shadow-xl shadow-black/40">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Search Input */}
            <div className="md:col-span-5 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search by part name, SKU (e.g. VOLT-BAT), or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
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
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition-all cursor-pointer"
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
                <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  aria-label="Sort parts order"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition-all cursor-pointer"
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
                className="w-full h-full flex items-center justify-center p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-all"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Category Horizontal Filter Pills */}
          <div className="mt-5 pt-5 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === ''
                  ? 'bg-gradient-to-r from-emerald-500 via-emerald-400 to-lime-400 text-slate-950 font-bold shadow-md shadow-emerald-500/25'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
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
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1.5 transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-emerald-500 via-emerald-400 to-lime-400 text-slate-950 font-bold shadow-md shadow-emerald-500/25'
                      : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {cat.name}
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-slate-950/20 text-slate-950 font-black' : 'bg-slate-900 text-slate-400'}`}>
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
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-cyan-400 mb-4" />
            <p className="text-slate-400 text-sm">Querying live inventory from showroom database...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center max-w-xl mx-auto">
            <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
            <h3 className="text-lg font-bold text-rose-300 mb-1">Inventory Synchronization Error</h3>
            <p className="text-sm text-slate-400 mb-4">{error}</p>
            <button
              onClick={loadCatalogue}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-sm font-medium transition-all"
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
                  className="group relative bg-[#04120a]/80 hover:bg-[#06180d]/90 border border-emerald-950 hover:border-emerald-400/50 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/15 cursor-pointer overflow-hidden"
                >
                  {/* Neon Top Glow Effect */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-lime-400/0 group-hover:via-lime-400/90 to-transparent transition-all duration-500" />

                  {/* Header: Category Badge & Stock Status */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/60 text-xs font-medium text-slate-300">
                        {getCategoryIcon(part.category_name)}
                        <span>{part.category_name}</span>
                      </div>

                      {/* Stock Badge */}
                      {isInStock && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                          <CheckCircle2 className="w-3 h-3" />
                          In Stock ({part.stock_quantity})
                        </span>
                      )}
                      {isLowStock && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 border border-amber-500/40 text-amber-300 animate-pulse">
                          <AlertTriangle className="w-3 h-3" />
                          Low Stock ({part.stock_quantity} left)
                        </span>
                      )}
                      {isOutOfStock && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 border border-rose-500/30 text-rose-400">
                          <XCircle className="w-3 h-3" />
                          Out of Stock
                        </span>
                      )}
                    </div>

                    {/* Graphic Preview Container */}
                    <div className="h-36 bg-slate-950/70 rounded-xl border border-slate-800/80 flex items-center justify-center p-4 mb-4 group-hover:border-slate-700 transition-colors overflow-hidden">
                      {part.image ? (
                        <img
                          src={part.image}
                          alt={part.name}
                          className="max-h-full max-w-full object-contain filter group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="transform group-hover:scale-110 transition-transform duration-300">
                          <PartGraphic categoryName={part.category_name} />
                        </div>
                      )}
                    </div>

                    {/* Part Name & SKU */}
                    <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2 mb-1.5">
                      {part.name}
                    </h3>

                    {/* SKU with Copy Action */}
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400 mb-3">
                      <span>SKU: {part.part_number}</span>
                      <button
                        onClick={(e) => handleCopySku(part.part_number, e)}
                        title="Copy SKU code"
                        className="hover:text-cyan-400 transition-colors p-0.5"
                      >
                        {copiedSku === part.part_number ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>

                    <p className="text-slate-400 text-xs line-clamp-2 mb-4 leading-relaxed">
                      {part.description}
                    </p>
                  </div>

                  {/* Card Bottom: Price & Quick Action */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Showroom MRP</div>
                      <div className="text-lg font-black text-white">
                        {formatCurrency(part.price)}
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPart(part);
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500 border border-cyan-500/30 hover:border-cyan-500 text-cyan-300 hover:text-slate-950 text-xs font-bold transition-all duration-200"
                    >
                      Inquire & Reserve
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty Search Result State */}
        {!loading && !error && filteredParts.length === 0 && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center max-w-lg mx-auto">
            <Wrench className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">No Spare Parts Match Your Criteria</h3>
            <p className="text-sm text-slate-400 mb-6">
              We couldn't find any OEM components matching "{searchQuery}" under the selected category or stock status filters.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-all"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Part Details & Inquiry / Hold Modal */}
      {selectedPart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <div className="flex items-center gap-2">
                {getCategoryIcon(selectedPart.category_name)}
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {selectedPart.category_name}
                </span>
              </div>
              <button
                onClick={() => {
                  setSelectedPart(null);
                  setInquirySuccess(null);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Product overview header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">{selectedPart.name}</h2>
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                    <span>SKU: {selectedPart.part_number}</span>
                    <button
                      onClick={(e) => handleCopySku(selectedPart.part_number, e)}
                      className="text-cyan-400 hover:text-cyan-300"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <div className="text-xs text-slate-400 uppercase font-bold">Showroom Price</div>
                  <div className="text-2xl font-black text-cyan-400">
                    {formatCurrency(selectedPart.price)}
                  </div>
                  <div className="text-[11px] text-slate-500">Incl. 18% GST & 1-Year Warranty</div>
                </div>
              </div>

              {/* Status and Stock level badge */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">Stock Availability:</span>
                <span className="font-bold flex items-center gap-1.5">
                  {selectedPart.stock_status === 'IN_STOCK' && (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Ready for Immediate Dispatch ({selectedPart.stock_quantity} units)
                    </span>
                  )}
                  {selectedPart.stock_status === 'LOW_STOCK' && (
                    <span className="text-amber-400 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" /> Limited Units Left ({selectedPart.stock_quantity} units)
                    </span>
                  )}
                  {selectedPart.stock_status === 'OUT_OF_STOCK' && (
                    <span className="text-rose-400 flex items-center gap-1">
                      <XCircle className="w-4 h-4" /> Back-order Available
                    </span>
                  )}
                </span>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold uppercase text-slate-400 mb-2">Technical Description</h4>
                <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/50 p-3.5 rounded-xl border border-slate-800">
                  {selectedPart.description}
                </p>
              </div>

              {/* Reservation / Inquiry Form */}
              <div className="border-t border-slate-800 pt-5">
                {inquirySuccess ? (
                  <div className="p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                    <h3 className="text-base font-bold text-white mb-1">Reservation Hold Confirmed!</h3>
                    <p className="text-xs text-slate-300 mb-3">
                      Your part inquiry has been logged with the Voltix Service & Spare Parts Department.
                    </p>
                    <div className="inline-block px-3 py-1.5 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono text-cyan-400 mb-3">
                      Hold Token: {inquirySuccess.code}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Our service technician will contact you on your registered phone within 2 showroom hours to arrange pickup or installation.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleInquirySubmit} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase text-slate-400 flex items-center gap-1.5">
                        <Send className="w-3.5 h-3.5 text-cyan-400" />
                        Reserve / Inquire for Service Installation
                      </h4>
                      <span className="text-[11px] text-slate-500">No payment required now</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Your Full Name *</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                          <input
                            type="text"
                            required
                            placeholder="e.g. Rahul Sharma"
                            value={inquiryForm.customer_name}
                            onChange={(e) => setInquiryForm({ ...inquiryForm, customer_name: e.target.value })}
                            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Phone Number (10 Digits) *</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                          <input
                            type="tel"
                            required
                            placeholder="e.g. 9876543210"
                            value={inquiryForm.phone}
                            onChange={(e) => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
                            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Voltix EV Model You Own (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. Voltix Pulse Pro or Voltix Glide City"
                        value={inquiryForm.preferred_model}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, preferred_model: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Special Note or Fitment Question</label>
                      <div className="relative">
                        <MessageSquare className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                        <textarea
                          rows="2"
                          placeholder="e.g. I need showroom technician installation service at the Connaught Place branch."
                          value={inquiryForm.notes}
                          onChange={(e) => setInquiryForm({ ...inquiryForm, notes: e.target.value })}
                          className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={inquirySubmitting}
                      className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50"
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
