import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Zap, Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';

/**
 * Login Page
 * High-key White Studio Automotive Login matching Tesla clean studio design.
 */
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
      setEmail('');
      setPassword('');
    } else {
      setEmail('vikram.rao@example.com');
      setPassword('Customer@123');
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-neutral-200/90 shadow-xl relative overflow-hidden">
        {/* Background Watermark - Visible Black Contrast */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 font-display text-8xl font-black text-neutral-950/10 uppercase tracking-tighter select-none pointer-events-none whitespace-nowrap z-0">
          ACCESS
        </div>

        <div className="text-center space-y-2 relative z-10">
          <div className="w-12 h-12 rounded-full bg-neutral-950 flex items-center justify-center shadow-md shadow-neutral-900/20 mx-auto">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <h2 className="text-3xl font-section-title text-neutral-950 uppercase tracking-section">Sign In to Voltix</h2>
          <p className="text-xs text-neutral-500 font-medium">
            Access your test ride bookings, custom configurations, and orders.
          </p>
        </div>

        {/* Clear Field Error Alert Banner */}
        {formError && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 animate-in fade-in relative z-10">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-bold">{formError}</span>
          </div>
        )}

        {/* Quick Demo Autofill Bar */}
        <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs space-y-2 relative z-10">
          <p className="font-bold text-neutral-500 text-[11px] uppercase tracking-wider">1-Click Demo Accounts:</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleFillDemo('customer')}
              className="flex-1 py-1.5 px-3 rounded-full bg-white hover:bg-neutral-100 text-neutral-900 border border-neutral-300 font-bold transition-colors text-[11px] shadow-xs"
            >
              Rider Demo
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('admin')}
              className="flex-1 py-1.5 px-3 rounded-full bg-white hover:bg-neutral-100 text-neutral-900 border border-neutral-300 font-bold transition-colors text-[11px] shadow-xs"
            >
              Admin Demo
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase tracking-wider">
              Email or Username
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full pl-11 pr-4 py-2.5 rounded-full bg-neutral-50 border border-neutral-300 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-11 pr-4 py-2.5 rounded-full bg-neutral-50 border border-neutral-300 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-neutral-950 text-white font-bold text-xs uppercase tracking-wider hover:bg-neutral-800 transition-all disabled:opacity-50 shadow-md shadow-neutral-900/20 active:scale-98 mt-2"
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
        <p className="text-center text-xs text-neutral-500 pt-2 font-medium relative z-10">
          Don't have an account yet?{' '}
          <Link to="/register" className="text-neutral-950 hover:underline font-bold">
            Register now
          </Link>
        </p>
      </div>
    </div>
  );
}
