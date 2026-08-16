import Link from 'next/link';
import { Sliders, ShieldCheck, Zap, ArrowRight, Cpu, Layers } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center max-w-5xl mx-auto">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono mb-6">
        <Zap className="w-3.5 h-3.5" />
        <span>PRECISION CABLE MANUFACTURING & CONFIGURATION</span>
      </div>

      <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white max-w-3xl leading-tight">
        Engineered Custom Cables. <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-400">
          Visual Wiring Configurator.
        </span>
      </h1>

      <p className="mt-4 text-lg text-slate-400 max-w-2xl">
        Select connectors, wire individual pins with instant electrical rule validation, calculate dynamic pricing, and send specifications straight to production.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/custom-cable"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-lg shadow-blue-600/25 transition"
        >
          <Sliders className="w-4 h-4" />
          Launch Visual Builder
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition"
        >
          Browse Standard Cables
        </Link>
      </div>

      <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left w-full">
        <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-white">Pin-to-Pin Visual Canvas</h3>
          <p className="mt-2 text-sm text-slate-400">
            Interactive React Flow canvas with click and drag connection modes, real-time pin highlighting, and wire coloring.
          </p>
        </div>

        <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-white">Server-Side Wiring Engine</h3>
          <p className="mt-2 text-sm text-slate-400">
            Automated verification of required pins, signal compatibility, multi-connect constraints, and short-circuit prevention.
          </p>
        </div>

        <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-white">Manufacturing Job Tickets</h3>
          <p className="mt-2 text-sm text-slate-400">
            Generates immutable wiring snapshots and printable specification documents for direct shop-floor fabrication.
          </p>
        </div>
      </div>
    </main>
  );
}
