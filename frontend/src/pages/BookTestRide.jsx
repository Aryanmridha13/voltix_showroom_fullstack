import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Phone,
  CheckCircle2,
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

/**
 * BookTestRide Page
 * High-key White Studio Booking experience matching Tesla / Porsche design language.
 */
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
    } catch (_err) {
      showError('Could not check slot availability for selected date.');
    } finally {
      setLoadingSlots(false);
    }
  }, [showError]);

  useEffect(() => {
    if (selectedVariantId && selectedDate) {
      fetchSlots(selectedVariantId, selectedDate);
    }
  }, [selectedVariantId, selectedDate, fetchSlots]);

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/book-test-ride' } } });
      return;
    }

    if (!selectedVariantId) {
      showError('Please select a vehicle model.');
      return;
    }
    if (!selectedSlot) {
      showError('Please select an available test ride time slot.');
      return;
    }
    if (!contactPhone.trim()) {
      showError('Please enter your contact phone number.');
      return;
    }
    if (!licenseNumber.trim()) {
      showError('Driving license number is mandatory for test rides.');
      return;
    }
    if (!safetyAgreed) {
      showError('Please accept the safety declaration to proceed.');
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
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-neutral-200/90 shadow-xl text-center space-y-6 relative overflow-hidden">
          <div className="w-16 h-16 rounded-full bg-neutral-950 text-white flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase font-bold tracking-widest text-emerald-700">
              Booking Confirmed
            </span>
            <h1 className="text-3xl sm:text-4xl font-display font-black text-neutral-950 uppercase">
              Get Ready to Ride!
            </h1>
            <p className="text-xs text-neutral-500 max-w-md mx-auto font-medium">
              Your 45-minute experiential test ride has been locked into the showroom schedule.
            </p>
          </div>

          {/* Booking Summary Box */}
          <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200 text-left space-y-3 font-medium">
            <div className="flex justify-between items-center border-b border-neutral-200 pb-2">
              <span className="text-xs text-neutral-500">Booking Reference</span>
              <span className="text-sm font-mono font-bold text-neutral-950">
                {confirmedBooking.booking_reference}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-neutral-200 pb-2">
              <span className="text-xs text-neutral-500">Vehicle</span>
              <span className="text-sm font-bold text-neutral-950">
                {confirmedBooking.variant_name}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-neutral-200 pb-2">
              <span className="text-xs text-neutral-500">Scheduled Date</span>
              <span className="text-sm font-bold text-neutral-950">
                {confirmedBooking.booking_date}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-neutral-200 pb-2">
              <span className="text-xs text-neutral-500">Time Slot</span>
              <span className="text-sm font-bold text-emerald-700">
                {confirmedBooking.time_slot}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-neutral-500">Showroom Hub</span>
              <span className="text-xs font-bold text-neutral-800 text-right">
                Plot 42, Electric Ave, Bangalore
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              to="/my-bookings"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-neutral-950 text-white font-bold text-xs uppercase tracking-wider hover:bg-neutral-800 shadow-md shadow-neutral-900/20"
            >
              <Calendar className="w-4 h-4" />
              View My Bookings
            </Link>
            <Link
              to="/vehicles"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white hover:bg-neutral-100 border border-neutral-300 text-neutral-900 font-bold text-xs uppercase tracking-wider shadow-xs"
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
      <div className="border-b border-neutral-200 pb-8 space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider shadow-sm">
          <Calendar className="w-3.5 h-3.5 text-emerald-400" />
          Experiential Test Ride
        </div>
        <h1 className="text-4xl sm:text-6xl font-display font-black text-neutral-950 tracking-tight uppercase">
          Schedule Your Test Ride
        </h1>
        <p className="text-sm text-neutral-500 max-w-2xl font-medium">
          Feel the instant electric torque, ultra-smooth throttle response, and regenerative braking
          firsthand on our dedicated urban test track.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Side: Vehicle Selection & Slot Scheduling */}
        <div className="lg:col-span-7 space-y-8">
          {/* Step 1: Select Vehicle */}
          <div className="p-6 rounded-3xl bg-white border border-neutral-200/90 shadow-md space-y-4">
            <h3 className="text-sm font-display font-black text-neutral-950 uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-neutral-950 text-white flex items-center justify-center text-xs font-bold">
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
                    className={`p-3.5 rounded-2xl text-left flex items-center gap-3 transition-all ${
                      isSelected
                        ? 'border-neutral-950 bg-neutral-50 ring-2 ring-neutral-950/20 shadow-sm'
                        : 'border border-neutral-200 hover:border-neutral-400 bg-white'
                    }`}
                  >
                    <div className="w-14 h-12 bg-neutral-100 rounded-xl overflow-hidden flex items-center justify-center p-1 shrink-0">
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
                      <p className="text-xs font-bold text-neutral-950 truncate">{v.name}</p>
                      <span className="text-[11px] text-emerald-700 block font-semibold">
                        {v.model_name}
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
          </div>

          {/* Step 2: Choose Date & Time Slot */}
          <div className="p-6 rounded-3xl bg-white border border-neutral-200/90 shadow-md space-y-6">
            <h3 className="text-sm font-display font-black text-neutral-950 uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-neutral-950 text-white flex items-center justify-center text-xs font-bold">
                2
              </span>
              Choose Date & Available Time Slot
            </h3>

            {/* Date Picker */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-neutral-700 uppercase">
                Select Test Ride Date
              </label>
              <input
                type="date"
                min={getTomorrowString()}
                max={getMaxDateString()}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full sm:w-64 px-4 py-2.5 rounded-full bg-neutral-50 border border-neutral-300 text-sm text-neutral-900 focus:outline-none focus:border-neutral-900 shadow-xs"
              />
            </div>

            {/* Slots Grid */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-600 uppercase">
                  Available 45-Min Showroom Slots
                </span>
                {loadingSlots && (
                  <span className="text-xs text-neutral-600 flex items-center gap-1 font-medium">
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
                      className={`p-3 rounded-2xl text-center text-xs font-bold transition-all ${
                        !isAvailable
                          ? 'bg-neutral-100 border border-neutral-200 text-neutral-400 cursor-not-allowed line-through'
                          : isSelected
                          ? 'bg-neutral-950 text-white shadow-md shadow-neutral-900/20 ring-2 ring-neutral-950/40'
                          : 'bg-white border border-neutral-300 text-neutral-800 hover:border-neutral-500 hover:bg-neutral-50 shadow-xs'
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
          <div className="p-6 rounded-3xl bg-white border border-neutral-200/90 shadow-md space-y-6">
            <h3 className="text-sm font-display font-black text-neutral-950 uppercase tracking-wider flex items-center gap-2 border-b border-neutral-200 pb-3">
              <span className="w-6 h-6 rounded-full bg-neutral-950 text-white flex items-center justify-center text-xs font-bold">
                3
              </span>
              Rider Verification & Confirmation
            </h3>

            {/* Selected Summary Pill */}
            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2 text-xs font-medium">
              <div className="flex justify-between">
                <span className="text-neutral-500">Selected Model:</span>
                <span className="font-bold text-neutral-950">
                  {selectedVariant ? `${selectedVariant.model_name} ${selectedVariant.name}` : 'Not selected'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Date:</span>
                <span className="font-bold text-neutral-950">{selectedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Time Slot:</span>
                <span className="font-bold text-emerald-700">
                  {selectedSlot || 'Select from grid'}
                </span>
              </div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmitBooking} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase">
                  Contact Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+919876543210"
                    required
                    className="w-full pl-11 pr-4 py-2.5 rounded-full bg-neutral-50 border border-neutral-300 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase">
                  Driving License Number
                </label>
                <div className="relative">
                  <FileCheck2 className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    placeholder="DL-0420220012345"
                    required
                    className="w-full pl-11 pr-4 py-2.5 rounded-full bg-neutral-50 border border-neutral-300 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 uppercase"
                  />
                </div>
              </div>

              {/* Safety Declaration Checkbox */}
              <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={safetyAgreed}
                  onChange={(e) => setSafetyAgreed(e.target.checked)}
                  className="mt-0.5 rounded border-neutral-300 text-neutral-950 focus:ring-neutral-900"
                />
                <span className="text-xs text-neutral-600 leading-relaxed font-medium">
                  I hold an active Driving License and agree to wear a helmet and follow showroom safety guidelines.
                </span>
              </label>

              {/* Submit CTA */}
              {isAuthenticated ? (
                <button
                  type="submit"
                  disabled={submitting || !selectedSlot}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full bg-neutral-950 text-white font-bold text-xs uppercase tracking-wider hover:bg-neutral-800 transition-all disabled:opacity-40 shadow-md shadow-neutral-900/20 active:scale-98"
                >
                  {submitting ? 'Locking Slot...' : 'Confirm Test Ride Booking'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="space-y-2 pt-2">
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full bg-neutral-950 text-white font-bold text-xs uppercase tracking-wider hover:bg-neutral-800 transition-colors shadow-sm"
                  >
                    Sign In to Confirm Slot
                  </button>
                  <p className="text-[11px] text-center text-neutral-500 font-medium">
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
