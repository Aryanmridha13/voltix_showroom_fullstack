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
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import { useTheme } from '../context/ThemeContext';

/**
 * Navbar Component
 * Dual High-Key Studio & Dark Cyber Navigation matching Tesla / Porsche design language.
 */
export default function Navbar() {
  const { user, isAuthenticated, isAdmin, isCustomer, logout } = useAuth();
  const { success } = useAlert();
  const { isDarkMode, toggleTheme } = useTheme();
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
      isDarkMode
        ? isActive
          ? 'text-emerald-400 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-emerald-400'
          : 'text-slate-300 hover:text-white'
        : isActive
        ? 'text-neutral-950 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-neutral-950'
        : 'text-neutral-600 hover:text-neutral-950'
    }`;

  return (
    <header
      className={`sticky top-0 z-40 w-full border-b transition-colors duration-500 backdrop-blur-md shadow-xs ${
        isDarkMode
          ? 'border-emerald-950/80 bg-[#030d08]/90 text-white'
          : 'border-neutral-200/90 bg-white/90 text-neutral-900'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-full bg-neutral-950 flex items-center justify-center shadow-md shadow-neutral-900/20 group-hover:scale-105 transition-transform border border-emerald-900/40">
            <Zap className="w-5 h-5 text-emerald-400 fill-emerald-400" />
          </div>
          <div>
            <span
              className={`text-2xl font-display font-black tracking-tight block ${
                isDarkMode ? 'text-white' : 'text-neutral-950'
              }`}
            >
              VOLTIX
            </span>
            <span className="text-[10px] font-bold tracking-widest text-emerald-500 block -mt-1.5 uppercase">
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
        <div className="hidden md:flex items-center gap-3">
          {/* Global Theme Switcher */}
          <button
            onClick={toggleTheme}
            className={`p-2.5 rounded-full border transition-all cursor-pointer ${
              isDarkMode
                ? 'bg-slate-900 border-emerald-950 text-amber-400 hover:text-amber-300 shadow-sm'
                : 'bg-neutral-100 border-neutral-300 text-neutral-800 hover:bg-neutral-200 shadow-xs'
            }`}
            title={isDarkMode ? 'Switch to Studio Light Mode' : 'Switch to Cyber Dark Mode'}
            aria-label="Toggle Global Theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-emerald-600" />}
          </button>

          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border transition-colors shadow-xs cursor-pointer ${
                  isDarkMode
                    ? 'bg-[#06180f] border-emerald-950 hover:border-emerald-700 text-white'
                    : 'bg-white border-neutral-300 hover:border-neutral-500 text-neutral-900'
                }`}
              >
                <div className="w-7 h-7 rounded-full bg-neutral-950 text-white flex items-center justify-center font-bold text-xs uppercase border border-emerald-500/40">
                  {user?.first_name ? user.first_name[0] : (user?.username?.[0] || 'U')}
                </div>
                <span className="text-xs font-bold max-w-[120px] truncate uppercase tracking-wider">
                  {user?.first_name || user?.username || 'Rider'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
              </button>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <div
                  className={`absolute right-0 mt-2 w-56 rounded-3xl border shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 ${
                    isDarkMode
                      ? 'bg-[#06180f] border-emerald-950 text-white'
                      : 'bg-white border-neutral-200/90 text-neutral-900'
                  }`}
                  onMouseLeave={() => setProfileDropdownOpen(false)}
                >
                  <div className={`px-5 py-3 border-b ${isDarkMode ? 'border-emerald-950/80' : 'border-neutral-200'}`}>
                    <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">Signed in as</p>
                    <p className="text-xs font-bold truncate">{user?.email}</p>
                    <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {user?.role}
                    </span>
                  </div>

                  {isCustomer && (
                    <Link
                      to="/my-bookings"
                      onClick={() => setProfileDropdownOpen(false)}
                      className={`flex items-center gap-2.5 px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                        isDarkMode ? 'text-slate-300 hover:bg-emerald-950/40 hover:text-white' : 'text-neutral-700 hover:bg-neutral-50 hover:text-neutral-950'
                      }`}
                    >
                      <Calendar className="w-4 h-4 text-emerald-500" />
                      My Test Rides
                    </Link>
                  )}

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setProfileDropdownOpen(false)}
                      className={`flex items-center gap-2.5 px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                        isDarkMode ? 'text-slate-300 hover:bg-emerald-950/40 hover:text-white' : 'text-neutral-950 hover:bg-neutral-50'
                      }`}
                    >
                      <ShieldAlert className="w-4 h-4 text-emerald-500" />
                      Admin Control Panel
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className={`w-full flex items-center gap-2.5 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-rose-500 hover:bg-rose-500/10 transition-colors border-t mt-1 ${
                      isDarkMode ? 'border-emerald-950/80' : 'border-neutral-200'
                    }`}
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
                className={`text-xs font-bold uppercase tracking-wider px-5 py-2 rounded-full border transition-all shadow-xs ${
                  isDarkMode
                    ? 'text-slate-200 border-slate-700 hover:border-emerald-400 hover:text-white bg-slate-900/60'
                    : 'text-neutral-800 hover:text-black border-neutral-300 hover:bg-neutral-100'
                }`}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className={`text-xs font-bold uppercase tracking-wider px-5 py-2 rounded-full transition-all shadow-md active:scale-95 ${
                  isDarkMode
                    ? 'bg-gradient-to-r from-emerald-500 to-lime-400 text-slate-950 font-black shadow-emerald-500/25'
                    : 'bg-neutral-950 hover:bg-black text-white shadow-neutral-900/20'
                }`}
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
