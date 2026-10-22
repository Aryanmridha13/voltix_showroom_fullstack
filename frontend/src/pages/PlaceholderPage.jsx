import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export default function PlaceholderPage({ title, phase, description, actionText, actionLink }) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
        <Sparkles className="w-3.5 h-3.5" />
        {phase}
      </div>
      <h1 className="text-3xl sm:text-4xl font-extrabold text-white">{title}</h1>
      <p className="max-w-md mx-auto text-sm text-slate-400 leading-relaxed">
        {description}
      </p>
      {actionLink && (
        <div className="pt-4">
          <Link
            to={actionLink}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20"
          >
            {actionText || 'Continue'}
          </Link>
        </div>
      )}
    </div>
  );
}
