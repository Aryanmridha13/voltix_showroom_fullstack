import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Zap,
  Menu,
  X,
  LogOut,
  Calendar,
  Sparkles,
  Wrench,
  ShieldAlert,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';

/**
 * Navbar Component
 * High-key White Studio Automotive Navigation matching Tesla / Porsche design language.
 */
export default function Navbar() {
  const { user, isAuthenticated, isAdmin, isCustomer, logout } = useAuth();
  const { success } = useAlert();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    success('Logged out successfully. See you soon!');
    setProfileDropdownOpen(false);
    navigate('/');
  };

  const navLinkClass = ({ isActive }) =>
    `text-xs font-bold uppercase tracking-wider transition-colors py-1 relative ${
      isActive
        ? 'text-neutral-950 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-neutral-950'
        : 'text-neutral-600 hover:text-neutral-950'
    }`;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200/90 bg-white/90 backdrop-blur-md shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-full bg-neutral-950 flex items-center justify-center shadow-md shadow-neutral-900/20 group-hover:scale-105 transition-transform">
            <Zap className="w-5 h-5 text-emerald-400 fill-emerald-400" />
          </div>
          <div>
            <span className="text-2xl font-display font-black tracking-tight text-neutral-950 block">VOLTIX</span>
            <span className="text-[10px] font-bold tracking-widest text-emerald-700 block -mt-1.5 uppercase">
              EV Motors
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          <NavLink to="/vehicles" className={navLinkClass}>
            Vehicles
          </NavLink>
          <NavLink to="/customizer" className={navLinkClass}>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Customizer
            </span>
          </NavLink>
          <NavLink to="/book-test-ride" className={navLinkClass}>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-neutral-950" />
              Book Test Ride
            </span>
          </NavLink>
          <NavLink to="/parts" className={navLinkClass}>
            <span className="flex items-center gap-1.5">
              <Wrench className="w-4 h-4 text-neutral-600" />
              Spare Parts
            </span>
          </NavLink>
          {isAdmin && (
            <NavLink
              to="/admin"
              className="text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-neutral-100 text-neutral-950 border border-neutral-300 hover:border-neutral-500 flex items-center gap-1 shadow-xs"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-emerald-600" />
              Admin Portal
            </NavLink>
          )}
        </nav>

        {/* Right Action: User Menu / Auth Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white border border-neutral-300 hover:border-neutral-500 transition-colors text-neutral-900 shadow-xs cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-neutral-950 text-white flex items-center justify-center font-bold text-xs uppercase">
                  {user?.first_name ? user.first_name[0] : (user?.username?.[0] || 'U')}
                </div>
                <span className="text-xs font-bold max-w-[120px] truncate uppercase tracking-wider">
                  {user?.first_name || user?.username || 'Rider'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
              </button>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-3xl bg-white border border-neutral-200/90 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2"
                  onMouseLeave={() => setProfileDropdownOpen(false)}
                >
                  <div className="px-5 py-3 border-b border-neutral-200">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Signed in as</p>
                    <p className="text-xs font-bold text-neutral-950 truncate">{user?.email}</p>
                    <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-800 border border-neutral-200">
                      {user?.role}
                    </span>
                  </div>

                  {isCustomer && (
                    <Link
                      to="/my-bookings"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-neutral-700 hover:bg-neutral-50 hover:text-neutral-950 transition-colors"
                    >
                      <Calendar className="w-4 h-4 text-emerald-600" />
                      My Test Rides
                    </Link>
                  )}

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-neutral-950 hover:bg-neutral-50 transition-colors"
                    >
                      <ShieldAlert className="w-4 h-4 text-emerald-600" />
                      Admin Control Panel
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-rose-600 hover:bg-rose-50 transition-colors border-t border-neutral-200 mt-1"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-xs font-bold uppercase tracking-wider text-neutral-800 hover:text-black px-5 py-2 rounded-full border border-neutral-300 hover:bg-neutral-100 transition-all shadow-xs"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-xs font-bold uppercase tracking-wider px-5 py-2 rounded-full bg-neutral-950 hover:bg-black text-white transition-all shadow-md shadow-neutral-900/20 active:scale-95"
              >
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-full text-neutral-700 hover:text-black hover:bg-neutral-100 transition-colors"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-neutral-200 px-4 pt-3 pb-6 space-y-3 bg-white/95 backdrop-blur-md">
          <NavLink
            to="/vehicles"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-neutral-800 hover:text-neutral-950 text-sm font-bold uppercase tracking-wider py-2"
          >
            Vehicles
          </NavLink>
          <NavLink
            to="/customizer"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-neutral-800 hover:text-neutral-950 text-sm font-bold uppercase tracking-wider py-2"
          >
            Customizer
          </NavLink>
          <NavLink
            to="/book-test-ride"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-neutral-800 hover:text-neutral-950 text-sm font-bold uppercase tracking-wider py-2"
          >
            Book Test Ride
          </NavLink>
          <NavLink
            to="/parts"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-neutral-800 hover:text-neutral-950 text-sm font-bold uppercase tracking-wider py-2"
          >
            Spare Parts
          </NavLink>
          {isAdmin && (
            <NavLink
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-neutral-950 text-sm font-bold uppercase tracking-wider py-2"
            >
              Admin Portal
            </NavLink>
          )}

          <div className="pt-4 border-t border-neutral-200">
            {isAuthenticated ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-neutral-950 text-white flex items-center justify-center font-bold text-xs uppercase">
                    {user?.first_name?.[0] || 'U'}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-neutral-950">{user?.first_name || user?.username}</p>
                    <p className="text-[11px] text-neutral-500">{user?.email}</p>
                  </div>
                </div>
                {isCustomer && (
                  <Link
                    to="/my-bookings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-xs font-bold uppercase tracking-wider text-neutral-700 py-1.5"
                  >
                    My Test Rides
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left text-xs text-rose-600 py-1.5 font-bold uppercase tracking-wider"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-full border border-neutral-300 text-neutral-900 font-bold text-xs uppercase tracking-wider"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-full bg-neutral-950 text-white font-bold text-xs uppercase tracking-wider shadow-md"
                >
                  Register Account
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
