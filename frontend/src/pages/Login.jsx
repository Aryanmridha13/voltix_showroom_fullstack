import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Zap, Mail, Lock, LogIn } from 'lucide-react';
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

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showError('Please enter both your email/username and password.');
      return;
    }

    setLoading(true);
    try {
      const loggedUser = await login(email, password);
      success(`Welcome back, ${loggedUser.first_name || loggedUser.username}!`);
      navigate(from, { replace: true });
    } catch (err) {
      showError(err.customMessage || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (type) => {
    if (type === 'admin') {
      setEmail('admin@voltix.test');
      setPassword('AdminPassword123');
    } else {
      setEmail('aarav.patel@example.com');
      setPassword('Customer@123');
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8 glass-panel p-8 sm:p-10 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-cyan-500/20 mx-auto">
            <Zap className="w-6 h-6 text-slate-950 fill-slate-950" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Sign In to Voltix</h2>
          <p className="text-xs text-slate-400">
            Access your test ride bookings, custom configurations, and orders.
          </p>
        </div>

        {/* Quick Demo Autofill Bar */}
        <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs space-y-2">
          <p className="font-semibold text-slate-300">Quick Demo Access:</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleFillDemo('customer')}
              className="flex-1 py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-cyan-400 font-medium transition-colors text-[11px]"
            >
              Customer Demo
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('admin')}
              className="flex-1 py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-emerald-400 font-medium transition-colors text-[11px]"
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
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/90 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
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
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/90 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 font-bold text-sm hover:opacity-95 transition-opacity disabled:opacity-50 shadow-lg shadow-cyan-500/20 mt-2"
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
          <Link to="/register" className="text-cyan-400 hover:underline font-semibold">
            Register now
          </Link>
        </p>
      </div>
    </div>
  );
}
