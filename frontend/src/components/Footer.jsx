import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, ShieldCheck, BatteryCharging, Clock, Mail, Phone, MapPin, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 text-slate-400 mt-auto">
      {/* Feature Guarantee Badges */}
      <div className="border-b border-slate-900 bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-4 p-4 rounded-2xl glass-card">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
              <BatteryCharging className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">5-Year Battery Warranty</h4>
              <p className="text-xs text-slate-400">Up to 80% capacity guarantee over 100,000 km.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl glass-card">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">100% Genuine Spare Parts</h4>
              <p className="text-xs text-slate-400">Direct from factory inventory with full traceability.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl glass-card">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Instant Slot Booking</h4>
              <p className="text-xs text-slate-400">Guaranteed 45-min experiential test ride booking.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Summary */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center shadow-md shadow-cyan-500/20">
              <Zap className="w-5 h-5 text-slate-950 fill-slate-950" />
            </div>
            <span className="text-lg font-bold tracking-wider text-white">VOLTIX EV</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Pioneering sustainable, zero-emission urban mobility with high-performance hyper-scooters
            and electric cruisers engineered for Indian roads.
          </p>
          <div className="pt-2">
            <a
              href="http://127.0.0.1:8000/api/docs/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              OpenAPI Swagger UI <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Showroom</h3>
          <ul className="space-y-2.5 text-xs">
            <li>
              <Link to="/vehicles" className="hover:text-white transition-colors">
                Vehicle Catalogue
              </Link>
            </li>
            <li>
              <Link to="/customizer" className="hover:text-white transition-colors">
                3D Vehicle Customizer
              </Link>
            </li>
            <li>
              <Link to="/book-test-ride" className="hover:text-white transition-colors">
                Book a Test Ride
              </Link>
            </li>
            <li>
              <Link to="/parts" className="hover:text-white transition-colors">
                Spare Parts & Inventory
              </Link>
            </li>
          </ul>
        </div>

        {/* Support & Legal */}
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Support & Trust</h3>
          <ul className="space-y-2.5 text-xs">
            <li>
              <span className="text-slate-400">Roadside Assistance (24/7)</span>
            </li>
            <li>
              <span className="text-slate-400">FAME-II Subsidy Guidance</span>
            </li>
            <li>
              <span className="text-slate-400">Battery Care & Fast Charging Guide</span>
            </li>
            <li>
              <span className="text-slate-400">Showroom Terms of Service</span>
            </li>
          </ul>
        </div>

        {/* Showroom Contact */}
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Flagship Experience Hub</h3>
          <ul className="space-y-3 text-xs">
            <li className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>Plot 42, Electric Avenue, Outer Ring Road, Bangalore, KA - 560103</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>+91 1800-VOLTIX-EV (Toll-Free)</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-purple-400 shrink-0" />
              <span>experience@voltixev.in</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <p>© 2026 Voltix EV Motors Ltd. All rights reserved. Zero Emission High Performance Systems.</p>
      </div>
    </footer>
  );
}
