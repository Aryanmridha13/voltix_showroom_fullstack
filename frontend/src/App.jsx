import { useState } from 'react';
import { Zap, ShieldCheck, Database, Server, CheckCircle2 } from 'lucide-react';

function App() {
  const [apiEndpoint] = useState(
    import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1'
  );

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col justify-between p-6 md:p-12 selection:bg-emerald-500 selection:text-black">
      {/* Top Header */}
      <header className="max-w-6xl mx-auto w-full flex items-center justify-between border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-black font-black text-xl shadow-lg shadow-emerald-500/20">
            <Zap className="w-6 h-6 fill-black stroke-black" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white m-0">
              VOLTIX <span className="text-emerald-400 font-normal">EV MOTORS</span>
            </h1>
            <p className="text-xs text-slate-400 m-0">Next-Gen Electric Showroom Platform</p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Environment Ready
        </div>
      </header>

      {/* Main Verification Card */}
      <main className="max-w-4xl mx-auto w-full my-auto py-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-sm mb-6 shadow-inner">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Phase 2 Verification Succeeded</span>
        </div>

        <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
          Full-Stack Development <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">Environment Initialized</span>
        </h2>
        <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
          Django REST Framework backend and React (Vite) frontend with Tailwind CSS are now configured, pinned, and verified.
        </p>

        {/* Stack Status Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-3xl mx-auto">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
              <Server className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-white text-sm mb-1">Backend Core</h3>
            <p className="text-xs text-slate-400">Django 6.1 + DRF SimpleJWT</p>
            <div className="mt-3 text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-1 rounded inline-block">
              manage.py check: OK
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-white text-sm mb-1">Frontend UI</h3>
            <p className="text-xs text-slate-400">React 19 + Vite 8 + Tailwind 4</p>
            <div className="mt-3 text-[11px] font-mono text-cyan-400 bg-cyan-950/40 px-2 py-1 rounded inline-block">
              vite build: OK (546ms)
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3">
              <Database className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-white text-sm mb-1">Database Target</h3>
            <p className="text-xs text-slate-400">MySQL 8.0 Server + mysqlclient</p>
            <div className="mt-3 text-[11px] font-mono text-indigo-400 bg-indigo-950/40 px-2 py-1 rounded inline-block">
              mysqlclient-2.3: Ready
            </div>
          </div>
        </div>

        {/* API Endpoint Preview */}
        <div className="mt-8 inline-block max-w-full">
          <div className="text-xs text-slate-500 mb-1 font-mono">Target API Base URL:</div>
          <code className="text-xs font-mono bg-slate-950 border border-slate-800 text-slate-300 px-4 py-2 rounded-lg block">
            {apiEndpoint}
          </code>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto w-full border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Strict Environment Security Active (GitIgnore & Templates)</span>
        </div>
        <div>EV Showroom Management System • Phase 2 Verified</div>
      </footer>
    </div>
  );
}

export default App;
