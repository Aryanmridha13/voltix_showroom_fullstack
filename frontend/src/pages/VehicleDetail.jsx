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
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto animate-bounce">
          <Zap className="w-6 h-6 fill-cyan-400" />
        </div>
        <p className="text-sm font-medium text-slate-400 animate-pulse">
          Loading vehicle specifications & telemetry...
        </p>
      </div>
    );
  }

  if (!variant) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Vehicle Not Found</h2>
        <p className="text-xs text-slate-400">The vehicle variant you requested is unavailable.</p>
        <Link
          to="/vehicles"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 font-bold text-xs"
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
      <nav className="flex items-center gap-2 text-xs text-slate-400">
        <Link to="/" className="hover:text-white transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link to="/vehicles" className="hover:text-white transition-colors">
          Catalogue
        </Link>
        <span>/</span>
        <span className="text-slate-300 font-semibold">{variant.model_details?.name}</span>
        <span>/</span>
        <span className="text-cyan-400 font-bold">{variant.name}</span>
      </nav>

      {/* Top Section: Showcase Gallery & Pricing / Action Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left: Image Display & Thumbnails */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-3xl glass-card p-8 h-[400px] sm:h-[480px] flex items-center justify-center bg-gradient-to-b from-[#05140e] to-[#020b07] border border-emerald-950/80 relative overflow-hidden group">
            {/* Ambient Radial Glow */}
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
            <div className="absolute w-64 h-64 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />

            <img
              src={activeImage || '/vehicles/scooter_blue.png'}
              alt={`${variant.name} showcase`}
              className="max-h-full w-auto object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.9)] hover:scale-105 transition-transform duration-500 relative z-10"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/vehicles/scooter_blue.png';
              }}
            />
            <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-950/80 text-emerald-300 border border-emerald-900/60 backdrop-blur-md z-20">
              {variant.model_details?.category_name || 'Electric Vehicle'}
            </div>
          </div>

          {/* Thumbnails (if gallery exists) */}
          {variant.gallery_images && variant.gallery_images.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              <button
                onClick={() => setActiveImage(variant.default_image)}
                className={`w-20 h-16 rounded-xl glass-panel p-1.5 overflow-hidden border transition-all ${
                  activeImage === variant.default_image
                    ? 'border-emerald-400 ring-2 ring-emerald-400/20'
                    : 'border-slate-800 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={variant.default_image || '/vehicles/scooter_blue.png'} alt="Thumbnail default" className="w-full h-full object-contain" />
              </button>
              {variant.gallery_images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(img.image)}
                  className={`w-20 h-16 rounded-xl glass-panel p-1.5 overflow-hidden border transition-all ${
                    activeImage === img.image
                      ? 'border-emerald-400 ring-2 ring-emerald-400/20'
                      : 'border-slate-800 opacity-60 hover:opacity-100'
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
            <span className="text-xs uppercase font-semibold text-cyan-400 tracking-wider">
              {variant.model_details?.tagline || 'Voltix Pure Electric'}
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
              {variant.model_details?.name} {variant.name}
            </h1>
            <p className="text-xs text-slate-400 font-mono">SKU: {variant.sku}</p>
          </div>

          {/* Rating Summary Pill */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-bold">
              <Star className="w-4 h-4 fill-amber-400" />
              {stats?.average_rating ? stats.average_rating.toFixed(1) : '5.0'}
            </div>
            <span className="text-xs text-slate-400">
              Based on <span className="text-white font-semibold">{stats?.total_reviews || reviews.length}</span> customer reviews
            </span>
            {stats?.verified_riders_count > 0 && (
              <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {stats.verified_riders_count} Verified Riders
              </span>
            )}
          </div>

          {/* Price Card */}
          <div className="p-6 rounded-3xl glass-card border border-slate-800/90 space-y-2">
            <span className="text-xs uppercase font-semibold text-slate-400 block">
              Ex-Showroom Price
            </span>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-extrabold text-white">
                {formatINR(variant.base_price)}
              </span>
              {variant.original_price && (
                <span className="text-base text-slate-500 line-through">
                  {formatINR(variant.original_price)}
                </span>
              )}
            </div>
            <p className="text-[11px] text-emerald-400 leading-relaxed pt-1">
              *Eligible for State EV Subsidies & Zero Road-Tax registration benefits.
            </p>
          </div>

          {/* Key Specs Highlights Row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl glass-panel text-center space-y-1">
              <div className="flex items-center justify-center gap-1 text-emerald-400 text-sm font-bold">
                <BatteryCharging className="w-4 h-4" />
                {specs.driving_range_km || 140} km
              </div>
              <span className="text-[10px] text-slate-400 uppercase font-medium">True Range</span>
            </div>

            <div className="p-3.5 rounded-2xl glass-panel text-center space-y-1">
              <div className="flex items-center justify-center gap-1 text-cyan-400 text-sm font-bold">
                <Gauge className="w-4 h-4" />
                {specs.top_speed_kmh || 95} km/h
              </div>
              <span className="text-[10px] text-slate-400 uppercase font-medium">Top Speed</span>
            </div>

            <div className="p-3.5 rounded-2xl glass-panel text-center space-y-1">
              <div className="flex items-center justify-center gap-1 text-purple-400 text-sm font-bold">
                <Clock className="w-4 h-4" />
                {specs.charging_time_hours || 4.5} hrs
              </div>
              <span className="text-[10px] text-slate-400 uppercase font-medium">Fast Charge</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-3 pt-2">
            <Link
              to={`/customizer?variant=${variant.id}`}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 font-bold text-sm shadow-xl shadow-cyan-500/20 hover:scale-[1.01] transition-transform"
            >
              <Sparkles className="w-4 h-4" />
              Configure Dual-Tone Finish in 3D
            </Link>

            <Link
              to={`/book-test-ride?variant=${variant.id}`}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl glass-panel hover:bg-slate-900 border border-emerald-500/30 text-emerald-400 font-semibold text-sm transition-colors"
            >
              <Calendar className="w-4 h-4" />
              Schedule 45-Min Test Ride
            </Link>
          </div>
        </div>
      </div>

      {/* Technical Specifications Matrix */}
      <section className="space-y-6 pt-8 border-t border-slate-800">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-white">Full Technical Specifications</h2>
          <p className="text-xs text-slate-400">
            Certified technical benchmarks, motor architecture, and safety ratings.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Powertrain & Battery */}
          <div className="p-6 rounded-3xl glass-panel space-y-4 border border-slate-800/80">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm uppercase tracking-wider">
              <Zap className="w-4 h-4" />
              Powertrain & Battery
            </div>
            <dl className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <dt className="text-slate-400">Battery Chemistry</dt>
                <dd className="text-white font-semibold">{specs.battery_type || 'LiFePO4 Safe Cells'}</dd>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <dt className="text-slate-400">Battery Capacity</dt>
                <dd className="text-white font-semibold">{specs.battery_capacity || '3.7 kWh'}</dd>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <dt className="text-slate-400">Motor Peak Power</dt>
                <dd className="text-white font-semibold">{specs.motor_power_watt || 6000} W</dd>
              </div>
              <div className="flex justify-between py-1.5">
                <dt className="text-slate-400">Full Charge Time</dt>
                <dd className="text-white font-semibold">{specs.charging_time_hours || 4.5} Hours</dd>
              </div>
            </dl>
          </div>

          {/* Performance & Dynamics */}
          <div className="p-6 rounded-3xl glass-panel space-y-4 border border-slate-800/80">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm uppercase tracking-wider">
              <Gauge className="w-4 h-4" />
              Performance & Dynamics
            </div>
            <dl className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <dt className="text-slate-400">Certified Range</dt>
                <dd className="text-white font-semibold">{specs.driving_range_km || 140} KM</dd>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <dt className="text-slate-400">Top Speed</dt>
                <dd className="text-white font-semibold">{specs.top_speed_kmh || 95} KM/H</dd>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <dt className="text-slate-400">Braking System</dt>
                <dd className="text-white font-semibold">{specs.brakes_type || 'Dual Disc with CBS'}</dd>
              </div>
              <div className="flex justify-between py-1.5">
                <dt className="text-slate-400">Tyres</dt>
                <dd className="text-white font-semibold">{specs.tyres_type || '90/90-12 Tubeless'}</dd>
              </div>
            </dl>
          </div>

          {/* Warranty & Resilience */}
          <div className="p-6 rounded-3xl glass-panel space-y-4 border border-slate-800/80">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-sm uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              Warranty & Resilience
            </div>
            <dl className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <dt className="text-slate-400">Vehicle Warranty</dt>
                <dd className="text-white font-semibold">{specs.warranty_years || 3} Years / 50,000 KM</dd>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <dt className="text-slate-400">Battery Warranty</dt>
                <dd className="text-white font-semibold">5 Years / 100,000 KM</dd>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <dt className="text-slate-400">Payload Capacity</dt>
                <dd className="text-white font-semibold">{specs.carrying_capacity_kg || 150} KG</dd>
              </div>
              <div className="flex justify-between py-1.5">
                <dt className="text-slate-400">Water Resistance</dt>
                <dd className="text-white font-semibold">IP67 Battery & Motor</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* Customer Reviews & Feedback Section */}
      <section className="space-y-10 pt-8 border-t border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
            <MessageSquare className="w-4 h-4" />
            Rider Community Feedback
          </div>
          <h2 className="text-2xl font-bold text-white">Owner Reviews & Experiences</h2>
        </div>

        {/* Reviews Breakdown Card */}
        <div className="p-8 rounded-3xl glass-card grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Average Score */}
          <div className="md:col-span-4 text-center md:text-left space-y-2 border-b md:border-b-0 md:border-r border-slate-800 pb-6 md:pb-0 md:pr-6">
            <span className="text-5xl font-black text-white">
              {stats?.average_rating ? stats.average_rating.toFixed(1) : '5.0'}
            </span>
            <div className="flex items-center justify-center md:justify-start gap-1 text-amber-400">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-5 h-5 ${
                    s <= Math.round(stats?.average_rating || 5)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-700'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-slate-400">
              Based on {stats?.total_reviews || reviews.length} verified ratings
            </p>
          </div>

          {/* Star Distribution Bars */}
          <div className="md:col-span-8 space-y-2">
            {[5, 4, 3, 2, 1].map((starNum) => {
              const key = `${starNum}_star`;
              const count = stats?.rating_distribution?.[key] || 0;
              const pct = stats?.percentage_distribution?.[key] || 0;

              return (
                <div key={starNum} className="flex items-center gap-3 text-xs">
                  <span className="w-12 text-slate-400 font-medium">{starNum} Stars</span>
                  <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-slate-400 font-mono">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Submit Review Box */}
        <div className="p-8 rounded-3xl glass-panel space-y-6 border border-slate-800/80">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">Write a Review</h3>
            <p className="text-xs text-slate-400">
              Share your test ride experience or owner feedback with prospective EV buyers.
            </p>
          </div>

          {isAuthenticated ? (
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase">
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
                            : 'text-slate-600 hover:text-slate-400'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs text-slate-400 ml-2 font-medium">{rating} of 5 Stars</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase">
                  Headline / Title
                </label>
                <input
                  type="text"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="e.g. Unbelievable acceleration in Hyper Mode!"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase">
                  Detailed Feedback
                </label>
                <textarea
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Tell us about the riding comfort, regen braking, and battery performance..."
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 font-bold text-xs hover:opacity-95 transition-opacity disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {submittingReview ? 'Submitting...' : 'Post Review'}
              </button>
            </form>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
              <p className="text-xs text-slate-300">
                You must be logged in to author a review for this vehicle.
              </p>
              <Link
                to="/login"
                className="inline-block text-xs font-semibold text-cyan-400 hover:underline"
              >
                Sign In to Post Review →
              </Link>
            </div>
          )}
        </div>

        {/* Existing Reviews List */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white">
            Community Feedback ({reviews.length})
          </h3>

          {reviews.length === 0 ? (
            <div className="p-8 rounded-2xl glass-panel text-center text-xs text-slate-400">
              No reviews posted yet for this variant. Be the first to share your riding feedback!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((rev) => (
                <div key={rev.id} className="p-6 rounded-2xl glass-card border border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">
                        {rev.customer?.name?.[0] || 'R'}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white">{rev.customer?.name}</span>
                          {rev.is_verified_rider && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-0.5">
                              <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500">
                          {new Date(rev.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5 text-amber-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-white">{rev.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{rev.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
