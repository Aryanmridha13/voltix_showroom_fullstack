import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Phone,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Zap,
  ArrowRight,
  FileCheck2,
  Check,
  RotateCw,
} from 'lucide-react';
import vehicleService from '../services/vehicleService';
import bookingService from '../services/bookingService';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';

export default function BookTestRide() {
  const [searchParams] = useSearchParams();
  const { isAuthenticated, user } = useAuth();
  const { success, error: showError } = useAlert();
  const navigate = useNavigate();

  const [variants, setVariants] = useState([]);
  const [selectedVariantId, setSelectedVariantId] = useState(
    searchParams.get('variant') ? parseInt(searchParams.get('variant'), 10) : null
  );

  // Date selection (default to tomorrow)
  const getTomorrowString = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const getMaxDateString = () => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  };

  const [selectedDate, setSelectedDate] = useState(getTomorrowString());
  const [slotsData, setSlotsData] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Form inputs
  const [contactPhone, setContactPhone] = useState(user?.phone_number || '');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [safetyAgreed, setSafetyAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // 1. Fetch available variants
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const data = await vehicleService.getVariants({ page_size: 50 });
        const items = data.items || [];
        setVariants(items);
        if (items.length > 0 && !selectedVariantId) {
          setSelectedVariantId(items[0].id);
        }
      } catch (_err) {
        showError('Could not load vehicles for booking.');
      }
    };
    fetchVehicles();
  }, [selectedVariantId, showError]);

  // 2. Fetch available slots when variant or date changes
  const fetchSlots = useCallback(async (vId, dateStr) => {
    if (!vId || !dateStr) return;
    setLoadingSlots(true);
    setSelectedSlot('');
    try {
      const res = await bookingService.getAvailableSlots(vId, dateStr);
      setSlotsData(res.slots || []);
    } catch (err) {
      showError(err.customMessage || 'Failed to check slot availability.');
    } finally {
      setLoadingSlots(false);
    }
  }, [showError]);

  useEffect(() => {
    if (selectedVariantId && selectedDate) {
      fetchSlots(selectedVariantId, selectedDate);
    }
  }, [selectedVariantId, selectedDate, fetchSlots]);

  // Sync phone if user logs in
  useEffect(() => {
    if (user?.phone_number && !contactPhone) {
      setContactPhone(user.phone_number);
    }
  }, [user, contactPhone]);

  // 3. Handle Booking Submission
  const handleSubmitBooking = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/book-test-ride' } } });
      return;
    }

    if (!selectedSlot) {
      showError('Please choose an available time slot.');
      return;
    }

    if (!safetyAgreed) {
      showError('Please confirm the driving license and helmet safety terms.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        variant_id: selectedVariantId,
        booking_date: selectedDate,
        time_slot: selectedSlot,
        contact_phone: contactPhone.trim(),
        driving_license_number: licenseNumber.trim().toUpperCase(),
      };

      const booking = await bookingService.createBooking(payload);
      setConfirmedBooking(booking);
      success(`Test ride scheduled! Reference: ${booking.booking_reference}`);
    } catch (err) {
      showError(err.customMessage || 'Booking failed. This slot may have just been reserved.');
      // Refresh slot availability
      fetchSlots(selectedVariantId, selectedDate);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedVariant = variants.find((v) => v.id === selectedVariantId);

  // If booking is successfully confirmed, show confirmation card
  if (confirmedBooking) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-emerald-500/40 shadow-2xl text-center space-y-6 relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase font-bold tracking-widest text-emerald-400">
              Booking Confirmed
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Get Ready to Ride!
            </h1>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Your 45-minute experiential test ride has been locked into the showroom schedule.
            </p>
          </div>

          {/* Booking Summary Box */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 text-left space-y-3">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="text-xs text-slate-400">Booking Reference</span>
              <span className="text-sm font-mono font-bold text-cyan-400">
                {confirmedBooking.booking_reference}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="text-xs text-slate-400">Vehicle</span>
              <span className="text-sm font-bold text-white">
                {confirmedBooking.variant_name}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="text-xs text-slate-400">Scheduled Date</span>
              <span className="text-sm font-bold text-white">
                {confirmedBooking.booking_date}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="text-xs text-slate-400">Time Slot</span>
              <span className="text-sm font-bold text-emerald-400">
                {confirmedBooking.time_slot}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400">Showroom Hub</span>
              <span className="text-xs font-medium text-slate-300 text-right">
                Plot 42, Electric Ave, Bangalore
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              to="/my-bookings"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20"
            >
              <Calendar className="w-4 h-4" />
              View My Bookings
            </Link>
            <Link
              to="/vehicles"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-semibold text-xs"
            >
              Explore Other Vehicles
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="border-b border-slate-800 pb-8 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
          <Calendar className="w-3.5 h-3.5" />
          Experiential Test Ride
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Schedule Your Test Ride
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl">
          Feel the instant 38 Nm electric torque, ultra-smooth throttle response, and regenerative braking
          firsthand on our dedicated urban test track.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Side: Vehicle Selection & Slot Scheduling */}
        <div className="lg:col-span-7 space-y-8">
          {/* Step 1: Select Vehicle */}
          <div className="p-6 rounded-3xl glass-panel border border-slate-800/80 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-bold">
                1
              </span>
              Select Vehicle Variant
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {variants.map((v) => {
                const isSelected = v.id === selectedVariantId;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVariantId(v.id)}
                    className={`p-3.5 rounded-2xl glass-card text-left flex items-center gap-3 transition-all ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-950/20 ring-2 ring-cyan-400/30'
                        : 'border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="w-14 h-12 bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center p-1 shrink-0">
                      <img
                        src={v.default_image || '/vehicles/scooter_blue.png'}
                        alt={v.name}
                        className="max-h-full object-contain drop-shadow"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/vehicles/scooter_blue.png';
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">{v.name}</p>
                      <span className="text-[11px] text-lime-400 block font-medium">
                        {v.model_name}
                      </span>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-lime-400 text-slate-950 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

            {/* Step 2: Choose Date & Time Slot */}
          <div className="p-6 rounded-3xl glass-panel border border-emerald-950/80 space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">
                2
              </span>
              Choose Date & Available Time Slot
            </h3>

            {/* Date Picker */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Select Test Ride Date
              </label>
              <input
                type="date"
                min={getTomorrowString()}
                max={getMaxDateString()}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full sm:w-64 px-4 py-2.5 rounded-xl bg-slate-900 border border-emerald-950 text-sm text-white focus:outline-none focus:border-emerald-400"
              />
            </div>

            {/* Slots Grid */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 uppercase">
                  Available 45-Min Showroom Slots
                </span>
                {loadingSlots && (
                  <span className="text-xs text-lime-400 flex items-center gap-1">
                    <RotateCw className="w-3 h-3 animate-spin" /> Checking live availability...
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {slotsData.map((slot) => {
                  const isSelected = selectedSlot === slot.slot;
                  const isAvailable = slot.is_available;

                  return (
                    <button
                      key={slot.slot}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => setSelectedSlot(slot.slot)}
                      className={`p-3 rounded-xl text-center text-xs font-bold transition-all ${
                        !isAvailable
                          ? 'bg-slate-900/40 border border-slate-800/40 text-slate-600 cursor-not-allowed line-through'
                          : isSelected
                          ? 'bg-gradient-to-r from-emerald-500 via-emerald-400 to-lime-400 text-slate-950 shadow-md shadow-emerald-500/25 ring-2 ring-lime-400/60'
                          : 'bg-slate-900 border border-emerald-950 text-slate-200 hover:border-emerald-500/50 hover:bg-[#05140e]'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5 mx-auto mb-1 opacity-70" />
                      {slot.slot}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Rider Verification Form & Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl glass-card border border-slate-800 space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
              <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-bold">
                3
              </span>
              Rider Verification & Confirmation
            </h3>

            {/* Selected Summary Pill */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Selected Model:</span>
                <span className="font-bold text-white">
                  {selectedVariant ? `${selectedVariant.model_name} ${selectedVariant.name}` : 'Not selected'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Date:</span>
                <span className="font-semibold text-white">{selectedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Time Slot:</span>
                <span className="font-bold text-emerald-400">
                  {selectedSlot || 'Select from grid'}
                </span>
              </div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmitBooking} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase">
                  Contact Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+919876543210"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase">
                  Driving License Number
                </label>
                <div className="relative">
                  <FileCheck2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    placeholder="DL-0420220012345"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 uppercase"
                  />
                </div>
              </div>

              {/* Safety Declaration Checkbox */}
              <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={safetyAgreed}
                  onChange={(e) => setSafetyAgreed(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-cyan-500 focus:ring-cyan-500"
                />
                <span className="text-xs text-slate-400 leading-relaxed">
                  I hold an active Driving License and agree to wear a helmet and follow showroom safety guidelines.
                </span>
              </label>

              {/* Submit CTA */}
              {isAuthenticated ? (
                <button
                  type="submit"
                  disabled={submitting || !selectedSlot}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-lime-400 text-slate-950 font-bold text-xs hover:opacity-95 transition-opacity disabled:opacity-40 shadow-lg shadow-emerald-500/25"
                >
                  {submitting ? 'Locking Slot...' : 'Confirm Test Ride Booking'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="space-y-2 pt-2">
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#05140e] border border-emerald-900/60 text-emerald-400 font-bold text-xs hover:bg-[#082218] transition-colors"
                  >
                    Sign In to Confirm Slot
                  </button>
                  <p className="text-[11px] text-center text-slate-500">
                    Registration takes less than 30 seconds.
                  </p>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
