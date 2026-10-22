import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, UserPlus, AlertCircle, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';

/**
 * Register Page
 * High-key White Studio Registration matching Tesla clean studio design.
 */
export default function Register() {
  const { register } = useAuth();
  const { success, error: showError } = useAlert();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    phone_number: '',
    password: '',
    password_confirm: '',
  });
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (formError) setFormError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (formData.password !== formData.password_confirm) {
      const err = 'Passwords do not match. Please verify.';
      setFormError(err);
      showError(err);
      return;
    }

    if (formData.password.length < 8) {
      const err = 'Password must be at least 8 characters long.';
      setFormError(err);
      showError(err);
      return;
    }

    setLoading(true);
    try {
      const registeredUser = await register({
        first_name: formData.first_name,
        last_name: formData.last_name,
        username: formData.username || formData.email.split('@')[0],
        email: formData.email,
        phone_number: formData.phone_number,
        password: formData.password,
        password_confirm: formData.password_confirm,
      });

      success(`Account registered! Welcome to the Voltix family, ${registeredUser.first_name || 'Rider'}!`);
      navigate('/vehicles');
    } catch (err) {
      const errorMsg = err.customMessage || 'Registration failed. Please check your information.';
      setFormError(errorMsg);
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-neutral-200/90 shadow-xl relative overflow-hidden">
        {/* Subtle Background Watermark */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 font-display text-8xl font-black text-neutral-950/[0.03] uppercase tracking-tighter select-none pointer-events-none whitespace-nowrap z-0">
          REGISTER
        </div>

        <div className="text-center space-y-2 relative z-10">
          <div className="w-12 h-12 rounded-full bg-neutral-950 flex items-center justify-center shadow-md shadow-neutral-900/20 mx-auto">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <h2 className="text-3xl font-display font-black text-neutral-950 uppercase tracking-tight">Create Voltix Account</h2>
          <p className="text-xs text-neutral-500 font-medium">
            Join the electric revolution. Book rides, customize trims, and track orders.
          </p>
        </div>

        {/* Clear Field Error Alert Banner */}
        {formError && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between gap-3 animate-in fade-in relative z-10">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="font-bold">{formError}</span>
            </div>
            {formError.toLowerCase().includes('already exists') && (
              <Link
                to="/login"
                className="px-3 py-1 rounded-full bg-rose-600 text-white font-bold whitespace-nowrap transition-colors flex items-center gap-1 shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </Link>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase tracking-wider">
                First Name
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="Rohan"
                required
                className="w-full px-4 py-2.5 rounded-full bg-neutral-50 border border-neutral-300 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase tracking-wider">
                Last Name
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Verma"
                required
                className="w-full px-4 py-2.5 rounded-full bg-neutral-50 border border-neutral-300 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="rohan@example.com"
                required
                className="w-full px-4 py-2.5 rounded-full bg-neutral-50 border border-neutral-300 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase tracking-wider">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="9876543210"
                className="w-full px-4 py-2.5 rounded-full bg-neutral-50 border border-neutral-300 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 8 chars"
                required
                className="w-full px-4 py-2.5 rounded-full bg-neutral-50 border border-neutral-300 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase tracking-wider">
                Confirm Password
              </label>
              <input
                type="password"
                name="password_confirm"
                value={formData.password_confirm}
                onChange={handleChange}
                placeholder="Repeat password"
                required
                className="w-full px-4 py-2.5 rounded-full bg-neutral-50 border border-neutral-300 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-neutral-950 text-white font-bold text-xs uppercase tracking-wider hover:bg-neutral-800 transition-all disabled:opacity-50 shadow-md shadow-neutral-900/20 active:scale-98 mt-4"
          >
            {loading ? (
              'Creating Account...'
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Complete Registration
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-neutral-500 pt-2 font-medium relative z-10">
          Already registered?{' '}
          <Link to="/login" className="text-neutral-950 hover:underline font-bold">
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
}
