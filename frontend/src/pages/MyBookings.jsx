import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Phone,
  FileCheck2,
  CheckCircle2,
  XCircle,
  RotateCw,
  Plus,
  ShieldCheck,
} from 'lucide-react';
import bookingService from '../services/bookingService';
import { useAlert } from '../context/AlertContext';

/**
 * MyBookings Page
 * High-key White Studio Rider Dashboard matching Tesla / Porsche design language.
 */
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
          <span className="px-3.5 py-1 rounded-full text-[11px] font-bold bg-neutral-950 text-white shadow-xs flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Confirmed
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="px-3.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-xs flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Completed
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-3.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-xs flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="px-3.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300 shadow-xs flex items-center gap-1">
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
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-neutral-200 pb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider mb-2 shadow-sm">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            Rider Dashboard
          </div>
          <h1 className="text-4xl sm:text-6xl font-display font-black text-neutral-950 tracking-tight uppercase">
            My Test Ride Bookings
          </h1>
          <p className="text-sm text-neutral-500 mt-1 font-medium max-w-2xl">
            Track status, reschedule, or cancel your scheduled experiential test rides.
          </p>
        </div>

        <Link
          to="/book-test-ride"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-neutral-950 text-white font-bold text-xs uppercase tracking-wider hover:bg-neutral-800 shadow-md shadow-neutral-900/20 active:scale-98 transition-all"
        >
          <Plus className="w-4 h-4 text-emerald-400" />
          Schedule New Ride
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {['ALL', 'ACTIVE', 'COMPLETED', 'CANCELLED'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterStatus(tab)}
            className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              filterStatus === tab
                ? 'bg-neutral-950 text-white shadow-sm'
                : 'bg-white text-neutral-700 hover:text-neutral-950 border border-neutral-300 hover:border-neutral-400 shadow-xs'
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
          <div className="w-12 h-12 rounded-full bg-neutral-900 text-white flex items-center justify-center mx-auto animate-spin shadow-md">
            <RotateCw className="w-6 h-6 text-emerald-400" />
          </div>
          <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider">Loading your test ride history...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-neutral-200 shadow-sm text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-neutral-100 text-neutral-900 flex items-center justify-center mx-auto border border-neutral-200">
            <Calendar className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-display font-black text-neutral-950 uppercase">No test rides in this section</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto font-medium">
            Ready to experience electric performance? Book a 45-minute ride on any of our models.
          </p>
          <Link
            to="/book-test-ride"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-neutral-950 text-white font-bold text-xs uppercase tracking-wider hover:bg-neutral-800 shadow-sm"
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
                className="p-6 rounded-3xl bg-white border border-neutral-200/90 shadow-md flex flex-col justify-between space-y-5 group hover:shadow-xl hover:border-neutral-400 transition-all"
              >
                {/* Header Row: Reference & Status */}
                <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                      Booking Reference
                    </span>
                    <span className="text-sm font-mono font-black text-neutral-950">
                      {b.booking_reference}
                    </span>
                  </div>
                  {getStatusBadge(b.status)}
                </div>

                {/* Vehicle & Slot Details */}
                <div className="flex items-center gap-4">
                  <div className="w-20 h-16 rounded-2xl bg-neutral-100 border border-neutral-200 p-1 flex items-center justify-center shrink-0">
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
                    <span className="text-[10px] uppercase font-bold text-emerald-700 block">
                      {b.model_name || 'Voltix Model'}
                    </span>
                    <h3 className="text-xl font-display font-black text-neutral-950 truncate uppercase tracking-tight">{b.variant_name}</h3>
                  </div>
                </div>

                {/* Metadata Pills */}
                <div className="grid grid-cols-2 gap-2 text-xs py-2.5 px-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 font-medium">
                  <div className="flex items-center gap-2 text-neutral-800">
                    <Calendar className="w-3.5 h-3.5 text-neutral-900 shrink-0" />
                    <span>{b.booking_date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-900 font-bold">
                    <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{b.time_slot}</span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-500 truncate">
                    <FileCheck2 className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span>DL: {b.driving_license_number}</span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-500 truncate">
                    <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span>{b.contact_phone}</span>
                  </div>
                </div>

                {/* Showroom Hub Note */}
                <p className="text-[11px] text-neutral-500 leading-relaxed font-medium">
                  📍 Showroom Hub: Plot 42, Electric Avenue, Outer Ring Road, Bangalore. Please arrive 10 minutes prior with physical license & helmet.
                </p>

                {/* Cancellation / Actions */}
                {isCancellable && (
                  <div className="pt-2 border-t border-neutral-200 flex justify-end">
                    <button
                      onClick={() => handleCancelBooking(b.id)}
                      disabled={cancellingId === b.id}
                      className="px-4 py-2 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors disabled:opacity-40"
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
