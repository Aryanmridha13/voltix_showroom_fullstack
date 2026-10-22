import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldAlert,
  Layers,
  Wrench,
  Calendar,
  MessageSquare,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Plus,
  Minus,
  Edit3,
  Clock,
  Phone,
  User,
  Star,
  Check,
  X,
  FileText,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import { adminService } from '../services/adminService';

export default function AdminDashboard() {
  const { user, isAdmin } = useAuth();
  const { addAlert } = useAlert();

  // Active Tab: 'overview' | 'inventory' | 'bookings' | 'reviews'
  const [activeTab, setActiveTab] = useState('overview');

  // Metrics state
  const [metrics, setMetrics] = useState({
    totalVehicles: 0,
    lowStockCount: 0,
    pendingBookingsCount: 0,
    totalBookingsCount: 0,
    pendingReviewsCount: 0,
    lowStockItems: [],
  });
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  // Tab data states
  const [inventory, setInventory] = useState([]);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [bookingFilter, setBookingFilter] = useState('ALL');
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewFilter, setReviewFilter] = useState('PENDING');
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Stock Adjustment Modal state
  const [stockModalPart, setStockModalPart] = useState(null);
  const [stockAction, setStockAction] = useState('ADD'); // 'ADD' | 'DEDUCT' | 'SET'
  const [stockQuantity, setStockQuantity] = useState(1);
  const [stockReason, setStockReason] = useState('');
  const [submittingStock, setSubmittingStock] = useState(false);

  // Booking Update Modal state
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [newBookingStatus, setNewBookingStatus] = useState('CONFIRMED');
  const [adminNotes, setAdminNotes] = useState('');
  const [submittingBooking, setSubmittingBooking] = useState(false);

  // Review Moderation Modal state
  const [selectedReview, setSelectedReview] = useState(null);
  const [modStatus, setModStatus] = useState('APPROVED');
  const [modNotes, setModNotes] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Load KPI metrics
  const loadMetrics = useCallback(async () => {
    try {
      setLoadingMetrics(true);
      const data = await adminService.getDashboardMetrics();
      setMetrics(data);
    } catch (err) {
      console.error('Failed to load metrics:', err);
      addAlert('Could not synchronize command center metrics.', 'error');
    } finally {
      setLoadingMetrics(false);
    }
  }, [addAlert]);

  // Load Inventory
  const loadInventory = useCallback(async () => {
    try {
      setLoadingInventory(true);
      const data = await adminService.getInventory();
      setInventory(data.items || []);
    } catch (err) {
      console.error('Failed to load inventory:', err);
      addAlert('Failed to load spare parts inventory.', 'error');
    } finally {
      setLoadingInventory(false);
    }
  }, [addAlert]);

  // Load Bookings
  const loadBookings = useCallback(async () => {
    try {
      setLoadingBookings(true);
      const params = bookingFilter !== 'ALL' ? { status: bookingFilter } : {};
      const data = await adminService.getAllBookings(params);
      setBookings(data.items || []);
    } catch (err) {
      console.error('Failed to load bookings:', err);
      addAlert('Failed to load test ride bookings.', 'error');
    } finally {
      setLoadingBookings(false);
    }
  }, [bookingFilter, addAlert]);

  // Load Reviews
  const loadReviews = useCallback(async () => {
    try {
      setLoadingReviews(true);
      const params = reviewFilter !== 'ALL' ? { moderation_status: reviewFilter } : {};
      const data = await adminService.getReviews(params);
      setReviews(data.items || []);
    } catch (err) {
      console.error('Failed to load reviews:', err);
      addAlert('Failed to load customer reviews.', 'error');
    } finally {
      setLoadingReviews(false);
    }
  }, [reviewFilter, addAlert]);

  // Initial load
  useEffect(() => {
    if (isAdmin) {
      loadMetrics();
    }
  }, [isAdmin, loadMetrics]);

  // Lazy tab loader
  useEffect(() => {
    if (!isAdmin) return;
    if (activeTab === 'inventory') loadInventory();
    if (activeTab === 'bookings') loadBookings();
    if (activeTab === 'reviews') loadReviews();
  }, [activeTab, isAdmin, loadInventory, loadBookings, loadReviews]);

  // Handle stock adjustment
  const handleStockSubmit = async (e) => {
    e.preventDefault();
    if (!stockModalPart) return;

    try {
      setSubmittingStock(true);
      await adminService.adjustStock(stockModalPart.id, {
        action: stockAction,
        quantity: stockQuantity,
        reason: stockReason,
      });
      addAlert(`Stock updated for ${stockModalPart.name}!`, 'success');
      setStockModalPart(null);
      setStockReason('');
      setStockQuantity(1);
      loadInventory();
      loadMetrics();
    } catch (err) {
      const errMsg = err.response?.data?.quantity?.[0] || 'Failed to adjust inventory stock.';
      addAlert(errMsg, 'error');
    } finally {
      setSubmittingStock(false);
    }
  };

  // Handle booking status update
  const handleBookingStatusSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBooking) return;

    try {
      setSubmittingBooking(true);
      await adminService.updateBookingStatus(selectedBooking.id, {
        status: newBookingStatus,
        admin_notes: adminNotes,
      });
      addAlert(`Booking ${selectedBooking.booking_reference} marked as ${newBookingStatus}!`, 'success');
      setSelectedBooking(null);
      setAdminNotes('');
      loadBookings();
      loadMetrics();
    } catch (err) {
      addAlert('Failed to update booking status.', 'error');
    } finally {
      setSubmittingBooking(false);
    }
  };

  // Handle review moderation
  const handleReviewModSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReview) return;

    try {
      setSubmittingReview(true);
      await adminService.moderateReview(selectedReview.id, {
        status: modStatus,
        notes: modNotes,
      });
      addAlert(`Review by ${selectedReview.customer_name || 'Customer'} marked as ${modStatus}!`, 'success');
      setSelectedReview(null);
      setModNotes('');
      loadReviews();
      loadMetrics();
    } catch (err) {
      addAlert('Failed to moderate review.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Quick 1-click review action
  const handleQuickModerate = async (review, status) => {
    try {
      await adminService.moderateReview(review.id, {
        status,
        notes: `Quick action by ${user?.email}`,
      });
      addAlert(`Review marked as ${status}!`, 'success');
      loadReviews();
      loadMetrics();
    } catch (err) {
      addAlert('Failed to update review status.', 'error');
    }
  };

  // If not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-rose-500/30 rounded-2xl p-8 text-center shadow-2xl">
          <ShieldAlert className="w-16 h-16 text-rose-500 mx-auto mb-4 animate-bounce" />
          <h2 className="text-xl font-bold text-white mb-2">Restricted Access</h2>
          <p className="text-sm text-slate-400 mb-6">
            The Showroom Command Center requires verified Administrator role credentials. Please log in with an administrator account to view fleet operations.
          </p>
          <a
            href="/login"
            className="inline-block px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 font-bold rounded-xl text-sm"
          >
            Switch to Admin Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030d09] text-slate-100 pt-24 pb-20">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-10 right-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 left-1/4 w-96 h-96 bg-lime-500/10 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Command Center Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <ShieldAlert className="w-3.5 h-3.5 text-lime-400" />
              Administrative Level 1 Access
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              Showroom <span className="text-gradient-emerald">Command Center</span>
            </h1>
            <p className="text-slate-400 text-sm">
              Live fleet telemetry, inventory allocation, test ride dispatch, and verified rider moderation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Operator: {user?.email}</span>
            </div>
            <button
              onClick={() => {
                loadMetrics();
                if (activeTab === 'inventory') loadInventory();
                if (activeTab === 'bookings') loadBookings();
                if (activeTab === 'reviews') loadReviews();
                addAlert('Showroom data refreshed!', 'info');
              }}
              title="Refresh telemetry"
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${loadingMetrics ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* 4 Executive KPI Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Card 1: Fleet */}
          <div
            onClick={() => setActiveTab('overview')}
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase text-slate-400">EV Fleet Variants</span>
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white">{metrics.totalVehicles}</div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-cyan-400" />
              Active showroom models
            </div>
          </div>

          {/* Card 2: Low Stock */}
          <div
            onClick={() => setActiveTab('inventory')}
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase text-slate-400">Low Stock Alerts</span>
              <div className={`p-2 rounded-lg ${metrics.lowStockCount > 0 ? 'bg-amber-500/20 text-amber-400 animate-pulse' : 'bg-slate-800 text-slate-400'}`}>
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white">{metrics.lowStockCount}</div>
            <div className="text-[11px] text-slate-400 mt-1">
              {metrics.lowStockCount > 0 ? 'Urgent PO order required' : 'Inventory levels optimal'}
            </div>
          </div>

          {/* Card 3: Pending Test Rides */}
          <div
            onClick={() => {
              setActiveTab('bookings');
              setBookingFilter('PENDING');
            }}
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase text-slate-400">Pending Test Rides</span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white">{metrics.pendingBookingsCount}</div>
            <div className="text-[11px] text-slate-400 mt-1">
              {metrics.totalBookingsCount} total lifetime bookings
            </div>
          </div>

          {/* Card 4: Pending Reviews */}
          <div
            onClick={() => {
              setActiveTab('reviews');
              setReviewFilter('PENDING');
            }}
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase text-slate-400">Review Moderation</span>
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white">{metrics.pendingReviewsCount}</div>
            <div className="text-[11px] text-slate-400 mt-1">
              Customer ratings awaiting approval
            </div>
          </div>
        </div>

        {/* Tab Navigation Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-800 mb-8 overflow-x-auto pb-1 scrollbar-thin">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-slate-900 border-t-2 border-cyan-400 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
            }`}
          >
            <Layers className="w-4 h-4 text-cyan-400" />
            Control Overview
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'inventory'
                ? 'bg-slate-900 border-t-2 border-amber-400 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
            }`}
          >
            <Wrench className="w-4 h-4 text-amber-400" />
            Inventory & Stock Adjuster
            {metrics.lowStockCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px]">
                {metrics.lowStockCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'bookings'
                ? 'bg-slate-900 border-t-2 border-emerald-400 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
            }`}
          >
            <Calendar className="w-4 h-4 text-emerald-400" />
            Test Ride Dispatch Desk
            {metrics.pendingBookingsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px]">
                {metrics.pendingBookingsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'reviews'
                ? 'bg-slate-900 border-t-2 border-purple-400 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-purple-400" />
            Feedback Moderation Queue
            {metrics.pendingReviewsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 text-[10px]">
                {metrics.pendingReviewsCount}
              </span>
            )}
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Critical Low Stock Alert Card */}
              <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                    Urgent Inventory Alerts
                  </h3>
                  <button
                    onClick={() => setActiveTab('inventory')}
                    className="text-xs text-cyan-400 hover:underline"
                  >
                    View All Parts →
                  </button>
                </div>

                {metrics.lowStockItems.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-950/60 text-center text-xs text-slate-400">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
                    All spare part quantities exceed safety alert thresholds.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {metrics.lowStockItems.slice(0, 4).map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-white">{item.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">SKU: {item.part_number}</div>
                        </div>
                        <div className="text-right">
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300">
                            {item.stock_quantity} / min {item.low_stock_threshold}
                          </span>
                          <button
                            onClick={() => {
                              setStockModalPart(item);
                              setActiveTab('inventory');
                            }}
                            className="block text-[11px] text-cyan-400 hover:underline mt-1"
                          >
                            Add Stock
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Action Station */}
              <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800">
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-cyan-400" />
                  Quick Dispatch Actions
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setActiveTab('bookings');
                      setBookingFilter('PENDING');
                    }}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-left transition-all group"
                  >
                    <div className="text-emerald-400 font-black text-xl mb-1">
                      {metrics.pendingBookingsCount}
                    </div>
                    <div className="text-xs font-bold text-white group-hover:text-emerald-300">Confirm Rides</div>
                    <div className="text-[10px] text-slate-500">Awaiting showroom call</div>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('reviews');
                      setReviewFilter('PENDING');
                    }}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-purple-500/50 text-left transition-all group"
                  >
                    <div className="text-purple-400 font-black text-xl mb-1">
                      {metrics.pendingReviewsCount}
                    </div>
                    <div className="text-xs font-bold text-white group-hover:text-purple-300">Moderate Feedback</div>
                    <div className="text-[10px] text-slate-500">Unapproved submissions</div>
                  </button>

                  <button
                    onClick={() => setActiveTab('inventory')}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 text-left transition-all group col-span-2"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-amber-300">
                          Adjust Parts Stock
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Receive shipment POs or log fitted workshop spares
                        </div>
                      </div>
                      <Plus className="w-5 h-5 text-amber-400" />
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: INVENTORY & STOCK ADJUSTER */}
        {activeTab === 'inventory' && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Spare Parts Stock Telemetry</h3>
                <p className="text-xs text-slate-400">Direct write access to MySQL `spare_parts` inventory table</p>
              </div>
              <button
                onClick={loadInventory}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Refresh List
              </button>
            </div>

            {loadingInventory ? (
              <div className="py-16 text-center text-xs text-slate-400">Loading spare parts database...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="px-5 py-3.5">Part Name & SKU</th>
                      <th className="px-5 py-3.5">Category</th>
                      <th className="px-5 py-3.5">Showroom Price</th>
                      <th className="px-5 py-3.5">Stock Level</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {inventory.map((part) => (
                      <tr key={part.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-5 py-3.5 font-medium text-white">
                          <div>{part.name}</div>
                          <span className="font-mono text-[10px] text-slate-500">{part.part_number}</span>
                        </td>
                        <td className="px-5 py-3.5 text-slate-400">{part.category_name}</td>
                        <td className="px-5 py-3.5 font-semibold text-white">₹ {Number(part.price).toLocaleString('en-IN')}</td>
                        <td className="px-5 py-3.5">
                          <span className="font-bold text-white text-sm">{part.stock_quantity}</span>
                          <span className="text-[10px] text-slate-500 ml-1">(min {part.low_stock_threshold})</span>
                        </td>
                        <td className="px-5 py-3.5">
                          {part.stock_status === 'IN_STOCK' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              In Stock
                            </span>
                          )}
                          {part.stock_status === 'LOW_STOCK' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/40">
                              Low Stock
                            </span>
                          )}
                          {part.stock_status === 'OUT_OF_STOCK' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                              Out of Stock
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => {
                              setStockModalPart(part);
                              setStockAction('ADD');
                              setStockQuantity(5);
                            }}
                            className="px-3 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 font-bold text-xs transition-colors"
                          >
                            Adjust Stock
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: TEST RIDE DISPATCH DESK */}
        {activeTab === 'bookings' && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white">Test Ride Scheduling Telemetry</h3>
                <p className="text-xs text-slate-400">Confirm slot bookings and log showroom vehicle test rides</p>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setBookingFilter(st)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      bookingFilter === st
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {loadingBookings ? (
              <div className="py-16 text-center text-xs text-slate-400">Querying test ride bookings...</div>
            ) : bookings.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-400">
                No bookings found with status filter "{bookingFilter}".
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="px-5 py-3.5">Ref Code</th>
                      <th className="px-5 py-3.5">Customer & Contact</th>
                      <th className="px-5 py-3.5">Vehicle Variant</th>
                      <th className="px-5 py-3.5">Date & Time Slot</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Update Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-5 py-3.5 font-mono text-cyan-400 font-bold">
                          {b.booking_reference}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="text-white font-semibold">{b.customer_name || b.customer_email}</div>
                          <div className="text-slate-400 text-[11px] flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {b.contact_phone}
                          </div>
                          <div className="text-slate-500 text-[10px]">Lic: {b.driving_license_number}</div>
                        </td>
                        <td className="px-5 py-3.5 text-white font-medium">
                          {b.variant_name}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="text-white font-semibold">{b.booking_date}</div>
                          <div className="text-cyan-400 text-[11px] font-mono">{b.time_slot}</div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              b.status === 'CONFIRMED'
                                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                                : b.status === 'COMPLETED'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : b.status === 'PENDING'
                                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => {
                              setSelectedBooking(b);
                              setNewBookingStatus(b.status === 'PENDING' ? 'CONFIRMED' : 'COMPLETED');
                            }}
                            className="px-3 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 font-bold text-xs transition-colors"
                          >
                            Manage Status
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: FEEDBACK MODERATION QUEUE */}
        {activeTab === 'reviews' && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white">Verified Customer Feedback Moderation</h3>
                <p className="text-xs text-slate-400">Protect showroom integrity and approve authentic rider reviews</p>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5">
                {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setReviewFilter(st)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      reviewFilter === st
                        ? 'bg-purple-500 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {loadingReviews ? (
              <div className="py-16 text-center text-xs text-slate-400">Loading customer reviews...</div>
            ) : reviews.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-400">
                No reviews found with status "{reviewFilter}".
              </div>
            ) : (
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3.5 h-3.5 ${
                                star <= rev.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'
                              }`}
                            />
                          ))}
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            rev.moderation_status === 'APPROVED'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : rev.moderation_status === 'REJECTED'
                              ? 'bg-rose-500/10 text-rose-400'
                              : 'bg-amber-500/15 text-amber-300'
                          }`}
                        >
                          {rev.moderation_status}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white mb-1">{rev.title}</h4>
                      <p className="text-xs text-slate-300 mb-3 italic">"{rev.comment}"</p>

                      <div className="text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-900 pt-2 mb-4">
                        <span>Variant: <b className="text-white">{rev.variant_name}</b></span>
                        <span>By: {rev.customer_name || 'Rider'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQuickModerate(rev, 'APPROVED')}
                        className="flex-1 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 text-xs font-bold transition-all flex items-center justify-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleQuickModerate(rev, 'REJECTED')}
                        className="flex-1 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        Reject
                      </button>
                      <button
                        onClick={() => {
                          setSelectedReview(rev);
                          setModStatus(rev.moderation_status);
                          setModNotes(rev.moderation_notes || '');
                        }}
                        title="Add moderation note"
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL 1: Adjust Stock */}
      {stockModalPart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Wrench className="w-4 h-4 text-cyan-400" />
                Adjust Stock: {stockModalPart.name}
              </h3>
              <button onClick={() => setStockModalPart(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl mb-4 text-xs border border-slate-800 flex justify-between">
              <span className="text-slate-400">Current In-Stock:</span>
              <span className="font-bold text-white">{stockModalPart.stock_quantity} units</span>
            </div>

            <form onSubmit={handleStockSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Adjustment Action</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'ADD', label: '+ Add Stock' },
                    { key: 'DEDUCT', label: '- Deduct' },
                    { key: 'SET', label: '= Set Exact' },
                  ].map((act) => (
                    <button
                      type="button"
                      key={act.key}
                      onClick={() => setStockAction(act.key)}
                      className={`py-2 text-xs font-bold rounded-lg transition-all ${
                        stockAction === act.key
                          ? 'bg-cyan-500 text-slate-950'
                          : 'bg-slate-950 text-slate-400 border border-slate-800'
                      }`}
                    >
                      {act.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Quantity Units</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Audit Reason / PO Number</label>
                <input
                  type="text"
                  placeholder="e.g. Inward Shipment PO#1082"
                  value={stockReason}
                  onChange={(e) => setStockReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <button
                type="submit"
                disabled={submittingStock}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50"
              >
                {submittingStock ? 'Recording Inward...' : 'Confirm Stock Adjustment'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Booking Status Update */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                Update Booking: {selectedBooking.booking_reference}
              </h3>
              <button onClick={() => setSelectedBooking(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl mb-4 text-xs border border-slate-800">
              <div className="text-white font-bold">{selectedBooking.variant_name}</div>
              <div className="text-slate-400">
                {selectedBooking.booking_date} at {selectedBooking.time_slot}
              </div>
              <div className="text-slate-500 mt-1">Customer: {selectedBooking.contact_phone}</div>
            </div>

            <form onSubmit={handleBookingStatusSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">New Ride Status</label>
                <select
                  value={newBookingStatus}
                  onChange={(e) => setNewBookingStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="CONFIRMED">CONFIRMED (Ready for Showroom Visit)</option>
                  <option value="COMPLETED">COMPLETED (Rider Finished Test Ride)</option>
                  <option value="CANCELLED">CANCELLED (Slot Forfeited)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Showroom Internal Remarks</label>
                <textarea
                  rows="2"
                  placeholder="e.g. Customer verified license, conducted 5km circuit ride."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={submittingBooking}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50"
              >
                {submittingBooking ? 'Saving Status...' : 'Apply Status Change'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Review Moderation Notes */}
      {selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" />
                Moderate Review #{selectedReview.id}
              </h3>
              <button onClick={() => setSelectedReview(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl mb-4 text-xs border border-slate-800">
              <div className="font-bold text-white mb-1">"{selectedReview.title}"</div>
              <div className="text-slate-400 italic">"{selectedReview.comment}"</div>
            </div>

            <form onSubmit={handleReviewModSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Moderation Status</label>
                <select
                  value={modStatus}
                  onChange={(e) => setModStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  <option value="APPROVED">APPROVED (Publish to Showroom Page)</option>
                  <option value="REJECTED">REJECTED (Hide from Public View)</option>
                  <option value="PENDING">PENDING (Hold for Audit)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Moderator Audit Notes</label>
                <textarea
                  rows="2"
                  placeholder="e.g. Verified ride history on database; language approved."
                  value={modNotes}
                  onChange={(e) => setModNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50"
              >
                {submittingReview ? 'Updating Moderation...' : 'Save Moderation Verdict'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
