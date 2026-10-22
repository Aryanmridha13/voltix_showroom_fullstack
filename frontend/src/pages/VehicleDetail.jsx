import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  BatteryCharging,
  Gauge,
  Sparkles,
  Calendar,
  ShieldCheck,
  Star,
  CheckCircle2,
  Clock,
  Zap,
  ArrowLeft,
  MessageSquare,
  Send,
} from 'lucide-react';
import vehicleService from '../services/vehicleService';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';

/**
 * VehicleDetail Page
 * High-key White Studio Automotive Detail Page matching Tesla / Porsche design aesthetics.
 * Pure white cards, bold Anton display typography, clean spec matrix, and rounded pill CTAs.
 */
export default function VehicleDetail() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const { success, error: showError } = useAlert();

  const [variant, setVariant] = useState(null);
  const [stats, setStats] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');

  // Review Form State
  const [rating, setRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [variantData, statsData, reviewsData] = await Promise.all([
        vehicleService.getVariantById(id),
        vehicleService.getVariantStats(id),
        vehicleService.getVariantReviews(id),
      ]);

      setVariant(variantData);
      setStats(statsData);
      setReviews(reviewsData);
      setActiveImage(
        variantData?.default_image || '/vehicles/scooter_blue.png'
      );
    } catch (err) {
      showError(err.customMessage || 'Failed to load vehicle details.');
    } finally {
      setLoading(false);
    }
  }, [id, showError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewTitle.trim() || !reviewComment.trim()) {
      showError('Please provide both a title and comments for your review.');
      return;
    }

    setSubmittingReview(true);
    try {
      await vehicleService.submitReview({
        variant_id: parseInt(id, 10),
        rating,
        title: reviewTitle.trim(),
        comment: reviewComment.trim(),
      });
      success('Your review was submitted successfully!');
      setReviewTitle('');
      setReviewComment('');
      // Reload stats & review list
      loadData();
    } catch (err) {
      showError(err.customMessage || 'Could not submit review.');
    } finally {
      setSubmittingReview(false);
    }
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-28 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-neutral-900 text-white flex items-center justify-center mx-auto animate-bounce shadow-md">
          <Zap className="w-5 h-5 fill-emerald-400 text-emerald-400" />
        </div>
        <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider animate-pulse">
          Loading vehicle specifications & telemetry...
        </p>
      </div>
    );
  }

  if (!variant) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4 bg-white rounded-3xl border border-neutral-200 shadow-sm mt-10">
        <h2 className="text-2xl font-display font-black text-neutral-950 uppercase">Vehicle Not Found</h2>
        <p className="text-xs text-neutral-500 font-medium">The vehicle variant you requested is unavailable.</p>
        <Link
          to="/vehicles"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-neutral-950 text-white font-bold text-xs uppercase tracking-wider hover:bg-neutral-800 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Catalogue
        </Link>
      </div>
    );
  }

  const specs = variant.specification || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-neutral-500">
        <Link to="/" className="hover:text-neutral-950 transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link to="/vehicles" className="hover:text-neutral-950 transition-colors">
          Catalogue
        </Link>
        <span>/</span>
        <span className="text-neutral-700">{variant.model_details?.name}</span>
        <span>/</span>
        <span className="text-neutral-950 font-black">{variant.name}</span>
      </nav>

      {/* Top Section: Showcase Gallery & Pricing / Action Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left: Image Display & Thumbnails */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-3xl bg-gradient-to-b from-[#fafafa] to-[#f2f2f4] border border-neutral-200/90 shadow-md p-8 h-[400px] sm:h-[480px] flex items-center justify-center relative overflow-hidden group">
            {/* Watermark Behind Vehicle (Tesla style) - Visible Black Contrast */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-8xl sm:text-9xl font-black text-neutral-950/15 uppercase tracking-tighter select-none pointer-events-none whitespace-nowrap z-0">
              {variant.model_details?.name || 'VOLTIX'}
            </div>

            {/* Soft ground shadow ellipse beneath wheels */}
            <div className="absolute bottom-6 w-72 h-8 rounded-[100%] bg-neutral-900/15 blur-lg pointer-events-none" />

            <img
              src={activeImage || '/vehicles/scooter_blue.png'}
              alt={`${variant.name} showcase`}
              className="max-h-full w-auto object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.3)] hover:scale-105 transition-transform duration-500 relative z-10"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/vehicles/scooter_blue.png';
              }}
            />
            <div className="absolute top-4 left-4 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/95 text-neutral-900 border border-neutral-300 shadow-xs z-20">
              {variant.model_details?.category_name || 'Electric Vehicle'}
            </div>
          </div>

          {/* Thumbnails (if gallery exists) */}
          {variant.gallery_images && variant.gallery_images.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
              <button
                onClick={() => setActiveImage(variant.default_image)}
                className={`w-20 h-16 rounded-2xl bg-white p-1.5 overflow-hidden border transition-all shadow-xs ${
                  activeImage === variant.default_image
                    ? 'border-neutral-950 ring-2 ring-neutral-950/20'
                    : 'border-neutral-300 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={variant.default_image || '/vehicles/scooter_blue.png'} alt="Thumbnail default" className="w-full h-full object-contain" />
              </button>
              {variant.gallery_images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(img.image)}
                  className={`w-20 h-16 rounded-2xl bg-white p-1.5 overflow-hidden border transition-all shadow-xs ${
                    activeImage === img.image
                      ? 'border-neutral-950 ring-2 ring-neutral-950/20'
                      : 'border-neutral-300 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img.image} alt={img.caption || 'Thumbnail'} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Technical Summary & Purchase/Customizer Actions */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <span className="text-xs uppercase font-bold text-emerald-700 tracking-wider">
              {variant.model_details?.tagline || 'Voltix Pure Electric'}
            </span>
            <h1 className="text-3xl sm:text-5xl font-section-title font-black text-neutral-950 uppercase tracking-section">
              {variant.model_details?.name} {variant.name}
            </h1>
            <p className="text-xs text-neutral-500 font-mono font-medium">SKU: {variant.sku}</p>
          </div>

          {/* Rating Summary Pill */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-neutral-300 text-neutral-900 text-sm font-black shadow-xs">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              {stats?.average_rating ? stats.average_rating.toFixed(1) : '5.0'}
            </div>
            <span className="text-xs text-neutral-500 font-medium">
              Based on <span className="text-neutral-950 font-bold">{stats?.total_reviews || reviews.length}</span> customer reviews
            </span>
            {stats?.verified_riders_count > 0 && (
              <span className="text-[11px] text-emerald-700 flex items-center gap-1 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {stats.verified_riders_count} Verified Riders
              </span>
            )}
          </div>

          {/* Price Card */}
          <div className="p-6 rounded-3xl bg-white border border-neutral-200/90 shadow-md space-y-2">
            <span className="text-xs uppercase font-bold text-neutral-500 block">
              Ex-Showroom Price
            </span>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-display font-black text-neutral-950">
                {formatINR(variant.base_price)}
              </span>
              {variant.original_price && (
                <span className="text-base text-neutral-400 line-through font-medium">
                  {formatINR(variant.original_price)}
                </span>
              )}
            </div>
            <p className="text-[11px] text-emerald-700 font-semibold leading-relaxed pt-1">
              *Eligible for State EV Subsidies & Zero Road-Tax registration benefits.
            </p>
          </div>

          {/* Key Specs Highlights Row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-neutral-100/80 border border-neutral-200 text-center space-y-1">
              <div className="flex items-center justify-center gap-1 text-emerald-700 text-sm font-black">
                <BatteryCharging className="w-4 h-4" />
                {specs.driving_range_km || 140} km
              </div>
              <span className="text-[10px] text-neutral-500 uppercase font-bold">True Range</span>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-100/80 border border-neutral-200 text-center space-y-1">
              <div className="flex items-center justify-center gap-1 text-neutral-950 text-sm font-black">
                <Gauge className="w-4 h-4" />
                {specs.top_speed_kmh || 95} km/h
              </div>
              <span className="text-[10px] text-neutral-500 uppercase font-bold">Top Speed</span>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-100/80 border border-neutral-200 text-center space-y-1">
              <div className="flex items-center justify-center gap-1 text-neutral-900 text-sm font-black">
                <Clock className="w-4 h-4" />
                {specs.charging_time_hours || 4.5} hrs
              </div>
              <span className="text-[10px] text-neutral-500 uppercase font-bold">Fast Charge</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-3 pt-2">
            <Link
              to={`/customizer?variant=${variant.id}`}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full bg-neutral-950 text-white font-bold text-xs uppercase tracking-wider hover:bg-neutral-800 shadow-md shadow-neutral-900/20 active:scale-98 transition-all"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Configure Dual-Tone Finish in 3D
            </Link>

            <Link
              to={`/book-test-ride?variant=${variant.id}`}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full bg-white hover:bg-neutral-50 border border-neutral-300 text-neutral-900 font-bold text-xs uppercase tracking-wider shadow-xs transition-colors"
            >
              <Calendar className="w-4 h-4" />
              Schedule 45-Min Test Ride
            </Link>
          </div>
        </div>
      </div>

      {/* Technical Specifications Matrix */}
      <section className="space-y-6 pt-8 border-t border-neutral-200">
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-4xl font-section-title font-black text-neutral-950 uppercase tracking-section">Full Technical Specifications</h2>
          <p className="text-xs text-neutral-500 font-medium">
            Certified technical benchmarks, motor architecture, and safety ratings.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Powertrain & Battery */}
          <div className="p-6 rounded-3xl bg-white border border-neutral-200/90 shadow-md space-y-4">
            <div className="flex items-center gap-2 text-neutral-950 font-card-title text-sm uppercase tracking-card">
              <Zap className="w-4 h-4 text-emerald-600" />
              Powertrain & Battery
            </div>
            <dl className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-neutral-200/80">
                <dt className="text-neutral-500 font-medium">Battery Chemistry</dt>
                <dd className="text-neutral-950 font-bold">{specs.battery_type || 'LiFePO4 Safe Cells'}</dd>
              </div>
              <div className="flex justify-between py-2 border-b border-neutral-200/80">
                <dt className="text-neutral-500 font-medium">Battery Capacity</dt>
                <dd className="text-neutral-950 font-bold">{specs.battery_capacity || '3.7 kWh'}</dd>
              </div>
              <div className="flex justify-between py-2 border-b border-neutral-200/80">
                <dt className="text-neutral-500 font-medium">Motor Peak Power</dt>
                <dd className="text-neutral-950 font-bold">{specs.motor_power_watt || 6000} W</dd>
              </div>
              <div className="flex justify-between py-2">
                <dt className="text-neutral-500 font-medium">Full Charge Time</dt>
                <dd className="text-neutral-950 font-bold">{specs.charging_time_hours || 4.5} Hours</dd>
              </div>
            </dl>
          </div>

          {/* Performance & Dynamics */}
          <div className="p-6 rounded-3xl bg-white border border-neutral-200/90 shadow-md space-y-4">
            <div className="flex items-center gap-2 text-neutral-950 font-card-title text-sm uppercase tracking-card">
              <Gauge className="w-4 h-4 text-neutral-950" />
              Performance & Dynamics
            </div>
            <dl className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-neutral-200/80">
                <dt className="text-neutral-500 font-medium">Certified Range</dt>
                <dd className="text-neutral-950 font-bold">{specs.driving_range_km || 140} KM</dd>
              </div>
              <div className="flex justify-between py-2 border-b border-neutral-200/80">
                <dt className="text-neutral-500 font-medium">Top Speed</dt>
                <dd className="text-neutral-950 font-bold">{specs.top_speed_kmh || 95} KM/H</dd>
              </div>
              <div className="flex justify-between py-2 border-b border-neutral-200/80">
                <dt className="text-neutral-500 font-medium">Braking System</dt>
                <dd className="text-neutral-950 font-bold">{specs.brakes_type || 'Dual Disc with CBS'}</dd>
              </div>
              <div className="flex justify-between py-2">
                <dt className="text-neutral-500 font-medium">Tyres</dt>
                <dd className="text-neutral-950 font-bold">{specs.tyres_type || '90/90-12 Tubeless'}</dd>
              </div>
            </dl>
          </div>

          {/* Warranty & Resilience */}
          <div className="p-6 rounded-3xl bg-white border border-neutral-200/90 shadow-md space-y-4">
            <div className="flex items-center gap-2 text-neutral-950 font-card-title text-sm uppercase tracking-card">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Warranty & Resilience
            </div>
            <dl className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-neutral-200/80">
                <dt className="text-neutral-500 font-medium">Vehicle Warranty</dt>
                <dd className="text-neutral-950 font-bold">{specs.warranty_years || 3} Years / 50,000 KM</dd>
              </div>
              <div className="flex justify-between py-2 border-b border-neutral-200/80">
                <dt className="text-neutral-500 font-medium">Battery Warranty</dt>
                <dd className="text-neutral-950 font-bold">5 Years / 100,000 KM</dd>
              </div>
              <div className="flex justify-between py-2 border-b border-neutral-200/80">
                <dt className="text-neutral-500 font-medium">Payload Capacity</dt>
                <dd className="text-neutral-950 font-bold">{specs.carrying_capacity_kg || 150} KG</dd>
              </div>
              <div className="flex justify-between py-2">
                <dt className="text-neutral-500 font-medium">Water Resistance</dt>
                <dd className="text-neutral-950 font-bold">IP67 Battery & Motor</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* Customer Reviews & Feedback Section */}
      <section className="space-y-10 pt-8 border-t border-neutral-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider">
            <MessageSquare className="w-4 h-4" />
            Rider Community Feedback
          </div>
          <h2 className="text-2xl sm:text-4xl font-section-title font-black text-neutral-950 uppercase tracking-section">Owner Reviews & Experiences</h2>
        </div>

        {/* Reviews Breakdown Card */}
        <div className="p-8 rounded-3xl bg-white border border-neutral-200/90 shadow-md grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Average Score */}
          <div className="md:col-span-4 text-center md:text-left space-y-2 border-b md:border-b-0 md:border-r border-neutral-200 pb-6 md:pb-0 md:pr-6">
            <span className="text-6xl font-display font-black text-neutral-950">
              {stats?.average_rating ? stats.average_rating.toFixed(1) : '5.0'}
            </span>
            <div className="flex items-center justify-center md:justify-start gap-1 text-amber-400">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-5 h-5 ${
                    s <= Math.round(stats?.average_rating || 5)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-neutral-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-neutral-500 font-medium">
              Based on {stats?.total_reviews || reviews.length} verified ratings
            </p>
          </div>

          {/* Star Distribution Bars */}
          <div className="md:col-span-8 space-y-2.5">
            {[5, 4, 3, 2, 1].map((starNum) => {
              const key = `${starNum}_star`;
              const count = stats?.rating_distribution?.[key] || 0;
              const pct = stats?.percentage_distribution?.[key] || 0;

              return (
                <div key={starNum} className="flex items-center gap-3 text-xs">
                  <span className="w-14 text-neutral-600 font-bold">{starNum} Stars</span>
                  <div className="flex-1 h-2 rounded-full bg-neutral-100 overflow-hidden">
                    <div
                      className="h-full bg-neutral-950 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-neutral-500 font-mono font-bold">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Submit Review Box */}
        <div className="p-8 rounded-3xl bg-white border border-neutral-200/90 shadow-md space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-display font-black text-neutral-950 uppercase">Write a Review</h3>
            <p className="text-xs text-neutral-500 font-medium">
              Share your test ride experience or owner feedback with prospective EV buyers.
            </p>
          </div>

          {isAuthenticated ? (
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase">
                  Star Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-neutral-300 hover:text-neutral-400'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs text-neutral-500 ml-2 font-bold">{rating} of 5 Stars</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase">
                  Headline / Title
                </label>
                <input
                  type="text"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="e.g. Unbelievable acceleration in Hyper Mode!"
                  required
                  className="w-full px-4 py-2.5 rounded-2xl bg-neutral-50 border border-neutral-300 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase">
                  Detailed Feedback
                </label>
                <textarea
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Tell us about the riding comfort, regen braking, and battery performance..."
                  required
                  className="w-full px-4 py-2.5 rounded-2xl bg-neutral-50 border border-neutral-300 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900"
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="flex items-center gap-2 px-7 py-3 rounded-full bg-neutral-950 text-white font-bold text-xs uppercase tracking-wider hover:bg-neutral-800 shadow-md shadow-neutral-900/20 transition-all disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {submittingReview ? 'Submitting...' : 'Post Review'}
              </button>
            </form>
          ) : (
            <div className="p-6 rounded-2xl bg-neutral-100/70 border border-neutral-200 text-center space-y-2">
              <p className="text-xs text-neutral-600 font-medium">
                You must be logged in to author a review for this vehicle.
              </p>
              <Link
                to="/login"
                className="inline-block text-xs font-bold text-neutral-950 hover:underline"
              >
                Sign In to Post Review →
              </Link>
            </div>
          )}
        </div>

        {/* Existing Reviews List */}
        <div className="space-y-4">
          <h3 className="text-lg font-display font-black text-neutral-950 uppercase">
            Community Feedback ({reviews.length})
          </h3>

          {reviews.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white border border-neutral-200 shadow-sm text-center text-xs text-neutral-500 font-medium">
              No reviews posted yet for this variant. Be the first to share your riding feedback!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((rev) => (
                <div key={rev.id} className="p-6 rounded-3xl bg-white border border-neutral-200/90 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-900 flex items-center justify-center font-black text-xs">
                        {rev.customer?.name?.[0] || 'R'}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-neutral-950">{rev.customer?.name}</span>
                          {rev.is_verified_rider && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold flex items-center gap-0.5">
                              <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-neutral-400 font-medium">
                          {new Date(rev.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5 text-amber-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-neutral-950">{rev.title}</h4>
                  <p className="text-xs text-neutral-600 leading-relaxed font-medium">{rev.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
