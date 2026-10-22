import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, ShieldCheck, BatteryCharging, Clock, Mail, Phone, MapPin, ExternalLink } from 'lucide-react';

/**
 * Footer Component
 * High-key White Studio Automotive Footer matching Tesla / Porsche editorial aesthetic.
 * Clean white guarantee cards, Anton display typography, and clear contrast.
 */
export default function Footer() {
  return (
    <footer className="border-t border-neutral-200/90 bg-[#f4f4f6] text-neutral-600 mt-auto">
      {/* Feature Guarantee Badges */}
      <div className="border-b border-neutral-200/80 bg-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-neutral-200/90 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center shrink-0">
              <BatteryCharging className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h4 className="text-sm font-display font-black text-neutral-950 uppercase tracking-tight">5-Year Battery Warranty</h4>
              <p className="text-xs text-neutral-500 font-medium">Up to 80% capacity guarantee over 100,000 km.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-neutral-200/90 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-neutral-950" />
            </div>
            <div>
              <h4 className="text-sm font-display font-black text-neutral-950 uppercase tracking-tight">100% Genuine Spare Parts</h4>
              <p className="text-xs text-neutral-500 font-medium">Direct from factory inventory with full traceability.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-neutral-200/90 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6 text-emerald-700" />
            </div>
            <div>
              <h4 className="text-sm font-display font-black text-neutral-950 uppercase tracking-tight">Instant Slot Booking</h4>
              <p className="text-xs text-neutral-500 font-medium">Guaranteed 45-min experiential test ride booking.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Summary */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-neutral-950 flex items-center justify-center shadow-md shadow-neutral-900/20">
              <Zap className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-display text-2xl font-black tracking-tight text-neutral-950 uppercase">VOLTIX</span>
          </div>
          <p className="text-xs text-neutral-500 leading-relaxed font-medium">
            Pioneering sustainable, zero-emission urban mobility with high-performance hyper-scooters
            and electric cruisers engineered for Indian roads.
          </p>
          <div className="pt-1">
            <a
              href="http://127.0.0.1:8000/api/docs/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-900 hover:text-emerald-700 transition-colors"
            >
              OpenAPI Swagger UI <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-sm font-display font-black text-neutral-950 uppercase tracking-wider mb-4">Showroom</h3>
          <ul className="space-y-2.5 text-xs font-medium">
            <li>
              <Link to="/vehicles" className="hover:text-neutral-950 transition-colors">
                Vehicle Catalogue
              </Link>
            </li>
            <li>
              <Link to="/customizer" className="hover:text-neutral-950 transition-colors">
                3D Vehicle Customizer
              </Link>
            </li>
            <li>
              <Link to="/book-test-ride" className="hover:text-neutral-950 transition-colors">
                Book a Test Ride
              </Link>
            </li>
            <li>
              <Link to="/parts" className="hover:text-neutral-950 transition-colors">
                Spare Parts & Inventory
              </Link>
            </li>
          </ul>
        </div>

        {/* Support & Trust */}
        <div>
          <h3 className="text-sm font-display font-black text-neutral-950 uppercase tracking-wider mb-4">Support & Trust</h3>
          <ul className="space-y-2.5 text-xs font-medium text-neutral-600">
            <li>
              <span>Roadside Assistance (24/7)</span>
            </li>
            <li>
              <span>FAME-II Subsidy Guidance</span>
            </li>
            <li>
              <span>Battery Care & Fast Charging Guide</span>
            </li>
            <li>
              <span>Showroom Terms of Service</span>
            </li>
          </ul>
        </div>

        {/* Showroom Contact */}
        <div>
          <h3 className="text-sm font-display font-black text-neutral-950 uppercase tracking-wider mb-4">Flagship Experience Hub</h3>
          <ul className="space-y-3 text-xs font-medium">
            <li className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <span>Plot 42, Electric Avenue, Outer Ring Road, Bangalore, KA - 560103</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-neutral-950 shrink-0" />
              <span>+91 1800-VOLTIX-EV (Toll-Free)</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-neutral-950 shrink-0" />
              <span>experience@voltixev.in</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-neutral-200/90 py-6 text-center text-xs text-neutral-500 font-medium">
        <p>© 2026 Voltix EV Motors Ltd. All rights reserved. Zero Emission High Performance Systems.</p>
      </div>
    </footer>
  );
}
