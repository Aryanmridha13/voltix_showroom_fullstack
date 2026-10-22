import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, ShieldCheck, BatteryCharging, Clock, Mail, Phone, MapPin, ExternalLink } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

/**
 * Footer Component
 * Dynamic Dual-Theme Automotive Footer matching Tesla / Porsche editorial aesthetic.
 * Seamlessly adapts between Studio White and Cyber Dark themes.
 */
export default function Footer() {
  const { isDarkMode } = useTheme();

  return (
    <footer className={`border-t transition-colors mt-auto ${
      isDarkMode
        ? 'border-emerald-950/80 bg-[#020905] text-slate-400'
        : 'border-neutral-200/90 bg-[#f4f4f6] text-neutral-600'
    }`}>
      {/* Feature Guarantee Badges */}
      <div className={`border-b transition-colors ${
        isDarkMode ? 'border-emerald-950/80 bg-black/40' : 'border-neutral-200/80 bg-white/60'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7">
          <div className={`flex items-center gap-5 p-6 rounded-2xl border transition-all ${
            isDarkMode
              ? 'bg-[#06180f] border-emerald-950/80 shadow-emerald-950/20 hover:border-emerald-500/40'
              : 'bg-white border-neutral-200/90 shadow-sm hover:shadow-md'
          }`}>
            <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center shrink-0 ${
              isDarkMode ? 'bg-[#030d08] border-emerald-950' : 'bg-neutral-100 border-neutral-200'
            }`}>
              <BatteryCharging className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <h4 className={`text-[16px] sm:text-[17px] font-bold font-sans tracking-tight leading-snug mb-1 transition-colors ${
                isDarkMode ? 'text-white' : 'text-neutral-950'
              }`}>5-Year Battery Warranty</h4>
              <p className={`text-xs sm:text-[13px] font-medium leading-relaxed transition-colors ${
                isDarkMode ? 'text-slate-400' : 'text-neutral-500'
              }`}>Up to 80% capacity guarantee over 100,000 km.</p>
            </div>
          </div>

          <div className={`flex items-center gap-5 p-6 rounded-2xl border transition-all ${
            isDarkMode
              ? 'bg-[#06180f] border-emerald-950/80 shadow-emerald-950/20 hover:border-emerald-500/40'
              : 'bg-white border-neutral-200/90 shadow-sm hover:shadow-md'
          }`}>
            <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center shrink-0 ${
              isDarkMode ? 'bg-[#030d08] border-emerald-950' : 'bg-neutral-100 border-neutral-200'
            }`}>
              <ShieldCheck className={`w-7 h-7 ${isDarkMode ? 'text-slate-200' : 'text-neutral-950'}`} />
            </div>
            <div>
              <h4 className={`text-[16px] sm:text-[17px] font-bold font-sans tracking-tight leading-snug mb-1 transition-colors ${
                isDarkMode ? 'text-white' : 'text-neutral-950'
              }`}>100% Genuine Spare Parts</h4>
              <p className={`text-xs sm:text-[13px] font-medium leading-relaxed transition-colors ${
                isDarkMode ? 'text-slate-400' : 'text-neutral-500'
              }`}>Direct from factory inventory with full traceability.</p>
            </div>
          </div>

          <div className={`flex items-center gap-5 p-6 rounded-2xl border transition-all ${
            isDarkMode
              ? 'bg-[#06180f] border-emerald-950/80 shadow-emerald-950/20 hover:border-emerald-500/40'
              : 'bg-white border-neutral-200/90 shadow-sm hover:shadow-md'
          }`}>
            <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center shrink-0 ${
              isDarkMode ? 'bg-[#030d08] border-emerald-950' : 'bg-neutral-100 border-neutral-200'
            }`}>
              <Clock className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <h4 className={`text-[16px] sm:text-[17px] font-bold font-sans tracking-tight leading-snug mb-1 transition-colors ${
                isDarkMode ? 'text-white' : 'text-neutral-950'
              }`}>Instant Slot Booking</h4>
              <p className={`text-xs sm:text-[13px] font-medium leading-relaxed transition-colors ${
                isDarkMode ? 'text-slate-400' : 'text-neutral-500'
              }`}>Guaranteed 45-min experiential test ride booking.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Summary */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md ${
              isDarkMode ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-neutral-950 shadow-neutral-900/20'
            }`}>
              <Zap className={`w-4 h-4 ${isDarkMode ? 'text-black fill-black' : 'text-white fill-white'}`} />
            </div>
            <span className={`font-display text-2xl font-black tracking-tight uppercase ${
              isDarkMode ? 'text-white' : 'text-neutral-950'
            }`}>VOLTIX</span>
          </div>
          <p className={`text-xs leading-relaxed font-medium ${
            isDarkMode ? 'text-slate-400' : 'text-neutral-500'
          }`}>
            Pioneering sustainable, zero-emission urban mobility with high-performance hyper-scooters
            and electric cruisers engineered for Indian roads.
          </p>
          <div className="pt-1">
            <a
              href="http://127.0.0.1:8000/api/docs/"
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1.5 text-xs font-bold transition-colors ${
                isDarkMode ? 'text-emerald-400 hover:text-emerald-300' : 'text-neutral-900 hover:text-emerald-700'
              }`}
            >
              OpenAPI Swagger UI <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className={`text-[16px] sm:text-[17px] font-bold font-sans tracking-tight leading-snug mb-4 ${
            isDarkMode ? 'text-white' : 'text-neutral-950'
          }`}>Showroom</h3>
          <ul className={`space-y-2.5 text-xs font-medium ${
            isDarkMode ? 'text-slate-400' : 'text-neutral-600'
          }`}>
            <li>
              <Link to="/vehicles" className={isDarkMode ? 'hover:text-emerald-400 transition-colors' : 'hover:text-neutral-950 transition-colors'}>
                Vehicle Catalogue
              </Link>
            </li>
            <li>
              <Link to="/customizer" className={isDarkMode ? 'hover:text-emerald-400 transition-colors' : 'hover:text-neutral-950 transition-colors'}>
                3D Vehicle Customizer
              </Link>
            </li>
            <li>
              <Link to="/book-test-ride" className={isDarkMode ? 'hover:text-emerald-400 transition-colors' : 'hover:text-neutral-950 transition-colors'}>
                Book a Test Ride
              </Link>
            </li>
            <li>
              <Link to="/parts" className={isDarkMode ? 'hover:text-emerald-400 transition-colors' : 'hover:text-neutral-950 transition-colors'}>
                Spare Parts & Inventory
              </Link>
            </li>
          </ul>
        </div>

        {/* Support & Trust */}
        <div>
          <h3 className={`text-[16px] sm:text-[17px] font-bold font-sans tracking-tight leading-snug mb-4 ${
            isDarkMode ? 'text-white' : 'text-neutral-950'
          }`}>Support & Trust</h3>
          <ul className={`space-y-2.5 text-xs font-medium ${
            isDarkMode ? 'text-slate-400' : 'text-neutral-600'
          }`}>
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
          <h3 className={`text-[16px] sm:text-[17px] font-bold font-sans tracking-tight leading-snug mb-4 ${
            isDarkMode ? 'text-white' : 'text-neutral-950'
          }`}>Flagship Experience Hub</h3>
          <ul className={`space-y-3 text-xs font-medium ${
            isDarkMode ? 'text-slate-400' : 'text-neutral-600'
          }`}>
            <li className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Plot 42, Electric Avenue, Outer Ring Road, Bangalore, KA - 560103</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className={`w-4 h-4 shrink-0 ${isDarkMode ? 'text-slate-300' : 'text-neutral-950'}`} />
              <span>+91 1800-VOLTIX-EV (Toll-Free)</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className={`w-4 h-4 shrink-0 ${isDarkMode ? 'text-slate-300' : 'text-neutral-950'}`} />
              <span>experience@voltixev.in</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className={`border-t py-6 text-center text-xs font-medium ${
        isDarkMode ? 'border-emerald-950/80 text-slate-500' : 'border-neutral-200/90 text-neutral-500'
      }`}>
        <p>© 2026 Voltix EV Motors Ltd. All rights reserved. Zero Emission High Performance Systems.</p>
      </div>
    </footer>
  );
}
