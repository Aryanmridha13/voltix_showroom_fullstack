import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md w-full space-y-6 glass-panel p-8 sm:p-10 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
          <Zap className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <span className="text-6xl font-black text-gradient-cyan block">404</span>
          <h2 className="text-xl font-bold text-white">Route Off-Grid</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            The page or vehicle configuration you are looking for has been relocated or does not exist.
          </p>
        </div>
        <div className="flex gap-3 justify-center pt-2">
          <Link
            to="/"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 text-xs font-bold shadow-md shadow-cyan-500/20"
          >
            <Home className="w-4 h-4" />
            Back to Showroom
          </Link>
        </div>
      </div>
    </div>
  );
}
