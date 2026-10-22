import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Phone,
  FileCheck2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCw,
  Plus,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import bookingService from '../services/bookingService';
import { useAlert } from '../context/AlertContext';

export default function MyBookings() {
  const { success, error: showError } = useAlert();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [cancellingId, setCancellingId] = useState(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await bookingService.getMyBookings();
      setBookings(data.items || []);
    } catch (err) {
      showError(err.customMessage || 'Failed to load your test ride bookings.');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this scheduled test ride?')) {
      return;
    }

    setCancellingId(bookingId);
    try {
      await bookingService.cancelBooking(bookingId, 'Cancelled by customer via portal');
      success('Booking cancelled successfully.');
      fetchBookings();
    } catch (err) {
      showError(err.customMessage || 'Could not cancel booking.');
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Completed
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Pending Confirmation
          </span>
        );
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filterStatus === 'ACTIVE') return b.status === 'PENDING' || b.status === 'CONFIRMED';
    if (filterStatus === 'COMPLETED') return b.status === 'COMPLETED';
    if (filterStatus === 'CANCELLED') return b.status === 'CANCELLED';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Calendar className="w-3.5 h-3.5" />
            Rider Dashboard
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            My Test Ride Bookings
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Track status, reschedule, or cancel your scheduled experiential test rides.
          </p>
        </div>

        <Link
          to="/book-test-ride"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20"
        >
          <Plus className="w-4 h-4" />
          Schedule New Ride
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {['ALL', 'ACTIVE', 'COMPLETED', 'CANCELLED'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterStatus(tab)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              filterStatus === tab
                ? 'bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase()} ({
              tab === 'ALL'
                ? bookings.length
                : tab === 'ACTIVE'
                ? bookings.filter((b) => b.status === 'PENDING' || b.status === 'CONFIRMED').length
                : bookings.filter((b) => b.status === tab).length
            })
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="py-24 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto animate-spin">
            <RotateCw className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-slate-400">Loading your test ride history...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="p-12 rounded-3xl glass-panel border border-slate-800 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto">
            <Calendar className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white">No test rides in this section</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Ready to experience electric performance? Book a 45-minute ride on any of our models.
          </p>
          <Link
            to="/book-test-ride"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 font-bold text-xs"
          >
            Book Test Ride Now
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredBookings.map((b) => {
            const isCancellable = b.status === 'PENDING' || b.status === 'CONFIRMED';

            return (
              <div
                key={b.id}
                className="p-6 rounded-3xl glass-card border border-slate-800/90 flex flex-col justify-between space-y-5"
              >
                {/* Header Row: Reference & Status */}
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Booking Reference
                    </span>
                    <span className="text-sm font-mono font-bold text-cyan-400">
                      {b.booking_reference}
                    </span>
                  </div>
                  {getStatusBadge(b.status)}
                </div>

                {/* Vehicle & Slot Details */}
                <div className="flex items-center gap-4">
                  <div className="w-20 h-16 rounded-xl bg-slate-900 border border-slate-800 p-1 flex items-center justify-center shrink-0">
                    <img
                      src={b.variant_image || '/vehicles/scooter_blue.png'}
                      alt={b.variant_name}
                      className="max-h-full object-contain drop-shadow"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/vehicles/scooter_blue.png';
                      }}
                    />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                      {b.model_name || 'Voltix Model'}
                    </span>
                    <h3 className="text-base font-bold text-white truncate">{b.variant_name}</h3>
                  </div>
                </div>

                {/* Metadata Pills */}
                <div className="grid grid-cols-2 gap-2 text-xs py-2 px-3 rounded-2xl bg-slate-950/60 border border-slate-800/60">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{b.booking_date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="font-semibold text-emerald-400">{b.time_slot}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 truncate">
                    <FileCheck2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>DL: {b.driving_license_number}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 truncate">
                    <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{b.contact_phone}</span>
                  </div>
                </div>

                {/* Showroom Hub Note */}
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  📍 Showroom Hub: Plot 42, Electric Avenue, Outer Ring Road, Bangalore. Please arrive 10 minutes prior with physical license & helmet.
                </p>

                {/* Cancellation / Actions */}
                {isCancellable && (
                  <div className="pt-2 border-t border-slate-800/80 flex justify-end">
                    <button
                      onClick={() => handleCancelBooking(b.id)}
                      disabled={cancellingId === b.id}
                      className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-colors disabled:opacity-40"
                    >
                      {cancellingId === b.id ? 'Cancelling...' : 'Cancel Reservation'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
