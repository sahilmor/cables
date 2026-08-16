import React from 'react';
import Link from 'next/link';
import { Cpu, ShieldCheck, Activity, Terminal } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-[#070a0f] text-slate-400 text-xs py-10">
      <div className="container mx-auto px-4 sm:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <div className="h-6 w-6 rounded bg-blue-600 flex items-center justify-center">
              <Cpu className="h-4 w-4 text-white" />
            </div>
            <span>CABLECRAFT SYSTEMS</span>
          </div>
          <p className="text-slate-500 leading-relaxed">
            Industrial-grade custom cable engineering, automated pin mapping, and on-demand fabrication.
          </p>
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-[11px]">
            <Activity className="h-3.5 w-3.5 animate-pulse" />
            <span>FABRICATION QUEUE: ONLINE</span>
          </div>
        </div>

        <div>
          <h4 className="text-slate-200 font-semibold mb-3">CONFIGURATOR</h4>
          <ul className="space-y-2">
            <li><Link href="/custom-cable" className="hover:text-blue-400 transition">Visual Wiring Canvas</Link></li>
            <li><Link href="/saved-cables" className="hover:text-blue-400 transition">Saved Specifications</Link></li>
            <li><Link href="/products" className="hover:text-blue-400 transition">Standard Cable Catalog</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-slate-200 font-semibold mb-3">INTERNAL DASHBOARDS</h4>
          <ul className="space-y-2">
            <li><Link href="/admin/manufacturing" className="hover:text-amber-400 transition">Manufacturing Shop Floor</Link></li>
            <li><Link href="/admin" className="hover:text-purple-400 transition">Connector & Pin Admin</Link></li>
            <li><Link href="/admin/orders" className="hover:text-purple-400 transition">Production Orders</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-slate-200 font-semibold mb-3">ENGINEERING COMPLIANCE</h4>
          <div className="space-y-2 text-slate-500">
            <p>• ISO 9001:2015 Cable Harness Standards</p>
            <p>• IPC/WHMA-A-620 Class 3 Soldering</p>
            <p>• 100% Automated Pin Continuity Testing</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-8 mt-8 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-slate-600">
        <p>© 2026 CableCraft Inc. All rights reserved.</p>
        <div className="flex items-center gap-4 mt-2 sm:mt-0">
          <span className="font-mono">API v1.0 • GST Ready</span>
        </div>
      </div>
    </footer>
  );
}
