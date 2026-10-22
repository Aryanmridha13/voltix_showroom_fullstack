import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Home } from 'lucide-react';

/**
 * NotFound Page
 * High-key White Studio 404 page matching Tesla / Porsche design language.
 */
export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-neutral-200/90 shadow-xl relative overflow-hidden">
        {/* Watermark */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 font-display text-9xl font-black text-neutral-950/[0.04] uppercase select-none pointer-events-none whitespace-nowrap z-0">
          404
        </div>

        <div className="w-16 h-16 rounded-full bg-neutral-950 text-white flex items-center justify-center mx-auto shadow-md relative z-10">
          <Zap className="w-8 h-8 text-emerald-400" />
        </div>
        <div className="space-y-2 relative z-10">
          <span className="text-7xl font-display font-black text-neutral-950 block">404</span>
          <h2 className="text-2xl font-display font-black text-neutral-950 uppercase tracking-tight">Route Off-Grid</h2>
          <p className="text-xs text-neutral-500 font-medium leading-relaxed">
            The page or vehicle configuration you are looking for has been relocated or does not exist.
          </p>
        </div>
        <div className="flex gap-3 justify-center pt-2 relative z-10">
          <Link
            to="/"
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-neutral-950 text-white text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 shadow-md shadow-neutral-900/20 active:scale-98 transition-all"
          >
            <Home className="w-4 h-4 text-emerald-400" />
            Back to Showroom
          </Link>
        </div>
      </div>
    </div>
  );
}
