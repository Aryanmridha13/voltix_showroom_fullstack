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
    `text-sm font-medium transition-colors py-1 relative ${
      isActive
        ? 'text-emerald-400 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-emerald-400 after:to-lime-400'
        : 'text-slate-300 hover:text-white'
    }`;

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-emerald-950/60 bg-[#05140e]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-lime-400 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform">
            <Zap className="w-5 h-5 text-slate-950 fill-slate-950" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-wider text-white">VOLTIX</span>
            <span className="text-xs font-semibold tracking-widest text-lime-400 block -mt-1 uppercase">
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
              <Sparkles className="w-4 h-4 text-lime-400" />
              Customizer
            </span>
          </NavLink>
          <NavLink to="/book-test-ride" className={navLinkClass}>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-400" />
              Book Test Ride
            </span>
          </NavLink>
          <NavLink to="/parts" className={navLinkClass}>
            <span className="flex items-center gap-1.5">
              <Wrench className="w-4 h-4 text-teal-400" />
              Spare Parts
            </span>
          </NavLink>
          {isAdmin && (
            <NavLink
              to="/admin"
              className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/35 hover:border-lime-400/50 flex items-center gap-1"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
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
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-900 border border-emerald-900/60 hover:border-emerald-700 transition-colors text-slate-200"
              >
                <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs uppercase">
                  {user?.first_name ? user.first_name[0] : (user?.username?.[0] || 'U')}
                </div>
                <span className="text-sm font-medium max-w-[120px] truncate">
                  {user?.first_name || user?.username || 'Rider'}
                </span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-2xl glass-panel bg-[#05140e]/95 border border-emerald-900/50 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2"
                  onMouseLeave={() => setProfileDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-800">
                    <p className="text-xs font-semibold text-slate-400">Signed in as</p>
                    <p className="text-sm font-medium text-white truncate">{user?.email}</p>
                    <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                      {user?.role}
                    </span>
                  </div>

                  {isCustomer && (
                    <>
                      <Link
                        to="/my-bookings"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800/60 hover:text-emerald-400 transition-colors"
                      >
                        <Calendar className="w-4 h-4" />
                        My Test Rides
                      </Link>
                    </>
                  )}

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-emerald-400 hover:bg-slate-800/60 transition-colors"
                    >
                      <ShieldAlert className="w-4 h-4" />
                      Admin Control Panel
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors border-t border-slate-800 mt-1"
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
                className="text-sm font-medium text-slate-300 hover:text-emerald-400 px-3 py-1.5 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-sm font-bold px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-lime-400 text-slate-950 hover:opacity-95 transition-all shadow-md shadow-emerald-500/25"
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
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-b border-slate-800 px-4 pt-3 pb-6 space-y-3 bg-slate-950/95">
          <NavLink
            to="/vehicles"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-200 hover:text-emerald-400 text-base font-medium py-2"
          >
            Vehicles
          </NavLink>
          <NavLink
            to="/customizer"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-200 hover:text-lime-400 text-base font-medium py-2"
          >
            Customizer
          </NavLink>
          <NavLink
            to="/book-test-ride"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-200 hover:text-emerald-400 text-base font-medium py-2"
          >
            Book Test Ride
          </NavLink>
          <NavLink
            to="/parts"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-200 hover:text-teal-400 text-base font-medium py-2"
          >
            Spare Parts
          </NavLink>
          {isAdmin && (
            <NavLink
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-emerald-400 text-base font-semibold py-2"
            >
              Admin Portal
            </NavLink>
          )}

          <div className="pt-4 border-t border-slate-800">
            {isAuthenticated ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                    {user?.first_name?.[0] || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{user?.first_name || user?.username}</p>
                    <p className="text-xs text-slate-400">{user?.email}</p>
                  </div>
                </div>
                {isCustomer && (
                  <Link
                    to="/my-bookings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-sm text-slate-300 py-1.5"
                  >
                    My Test Rides
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left text-sm text-rose-400 py-1.5 font-medium"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl border border-slate-700 text-slate-200 font-medium"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-lime-400 text-slate-950 font-bold shadow-lg shadow-emerald-500/25"
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
