import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Zap, Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';

export default function Login() {
  const { login } = useAuth();
  const { success, error: showError } = useAlert();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!email || !password) {
      const err = 'Please enter both your email/username and password.';
      setFormError(err);
      showError(err);
      return;
    }

    setLoading(true);
    try {
      const loggedUser = await login(email, password);
      success(`Welcome back, ${loggedUser.first_name || loggedUser.username}!`);
      navigate(from, { replace: true });
    } catch (err) {
      const errorMsg = err.customMessage || 'Invalid credentials. Please verify your email and password.';
      setFormError(errorMsg);
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (type) => {
    setFormError(null);
    if (type === 'admin') {
      setEmail('admin@voltix.com');
      setPassword('Admin@12345');
    } else {
      setEmail('vikram.rao@example.com');
      setPassword('Customer@123');
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6 glass-panel p-8 sm:p-10 rounded-3xl border border-emerald-950/80 shadow-2xl relative overflow-hidden bg-[#05140e]/90">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-lime-400 flex items-center justify-center shadow-lg shadow-emerald-500/25 mx-auto">
            <Zap className="w-6 h-6 text-slate-950 fill-slate-950" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Sign In to Voltix</h2>
          <p className="text-xs text-slate-400">
            Access your test ride bookings, custom configurations, and orders.
          </p>
        </div>

        {/* Clear Field Error Alert Banner */}
        {formError && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="font-medium">{formError}</span>
          </div>
        )}

        {/* Quick Demo Autofill Bar */}
        <div className="p-3 rounded-2xl bg-[#030d09] border border-emerald-950 text-xs space-y-2">
          <p className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider">1-Click Demo Accounts:</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleFillDemo('customer')}
              className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium transition-colors text-[11px]"
            >
              Rider Demo
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('admin')}
              className="flex-1 py-1.5 px-2 rounded-lg bg-lime-500/10 hover:bg-lime-500/20 text-lime-300 border border-lime-500/30 font-medium transition-colors text-[11px]"
            >
              Admin Demo
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Email or Username
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/90 border border-emerald-950 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/90 border border-emerald-950 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-lime-400 text-slate-950 font-bold text-sm hover:opacity-95 transition-opacity disabled:opacity-50 shadow-lg shadow-emerald-500/25 mt-2"
          >
            {loading ? (
              'Authenticating...'
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Sign In
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <p className="text-center text-xs text-slate-400 pt-2">
          Don't have an account yet?{' '}
          <Link to="/register" className="text-lime-400 hover:underline font-semibold">
            Register now
          </Link>
        </p>
      </div>
    </div>
  );
}
