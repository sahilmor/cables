'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Wrench,
  ShieldCheck,
  Download,
  CheckCircle2,
  Clock,
  ArrowRight,
  Eye,
  Sliders,
  AlertCircle,
  FileText,
} from 'lucide-react';

export default function ManufacturingQueuePage() {
  const { user, token } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);

  const loadQueue = async () => {
    try {
      const data = await apiClient<any[]>('/manufacturing/queue', {
        token: token || undefined,
      });
      setJobs(data);
      if (data.length > 0 && !selectedJob) {
        setSelectedJob(data[0]);
      }
    } catch (err) {
      console.error('Failed to load manufacturing queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, [token]);

  const handleUpdateStatus = async (jobId: string, newStatus: string) => {
    try {
      await apiClient(`/manufacturing/jobs/${jobId}/status`, {
        method: 'PATCH',
        token: token || undefined,
        body: JSON.stringify({ status: newStatus }),
      });
      loadQueue();
      if (selectedJob?.id === jobId) {
        setSelectedJob((prev: any) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error('Update status failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const snap = selectedJob?.wiringSnapshot || {};
  const c1 = snap.connector1 || {};
  const c2 = snap.connector2 || {};
  const phys = snap.cablePhysicalSpecs || {};
  const pinMapping = snap.pinMapping || [];

  return (
    <div className="container mx-auto px-4 sm:px-8 py-10 max-w-7xl space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-amber-950/20 border border-amber-500/30">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-amber-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">Shop Floor Manufacturing Queue</h1>
          </div>
          <p className="text-xs text-slate-400">
            Real-time wire harness fabrication tickets with immutable continuity pinout specs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="warning" className="font-mono text-xs">
            {jobs.length} ACTIVE JOBS
          </Badge>
        </div>
      </div>

      {jobs.length === 0 ? (
        <div className="p-16 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
          <div className="h-16 w-16 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-slate-500">
            <CheckCircle2 className="h-8 w-8 text-emerald-400" />
          </div>
          <h3 className="text-base font-semibold text-white">Manufacturing Queue Clear</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            All custom cable fabrication orders have been completed and dispatched.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Job Tickets List (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <h3 className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider mb-2">
              FABRICATION TICKETS
            </h3>

            {jobs.map((job) => {
              const isSelected = selectedJob?.id === job.id;
              const jSnap = job.wiringSnapshot || {};
              const jC1 = jSnap.connector1?.name || 'End 1';
              const jC2 = jSnap.connector2?.name || 'End 2';

              return (
                <div
                  key={job.id}
                  onClick={() => setSelectedJob(job)}
                  className={`p-4 rounded-xl border cursor-pointer transition space-y-3 ${
                    isSelected
                      ? 'border-amber-500 bg-amber-950/20 ring-1 ring-amber-500'
                      : 'border-slate-800 bg-slate-900/60 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-sm text-white">{job.jobTicketNumber}</span>
                    <Badge
                      variant={
                        job.status === 'QUALITY_CHECK'
                          ? 'info'
                          : job.status === 'READY_TO_SHIP'
                          ? 'success'
                          : 'warning'
                      }
                      className="text-[10px] font-mono"
                    >
                      {job.status}
                    </Badge>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-slate-200 truncate">
                      {jC1} → {jC2}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Order: {job.order?.orderNumber} • Length: {jSnap.cablePhysicalSpecs?.finishedLengthMeters || 1}m
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Active Job Detailed Specification Document (7 cols) */}
          {selectedJob && (
            <div className="lg:col-span-7 space-y-6">
              <Card className="border-slate-800 bg-slate-900/90 shadow-2xl">
                <CardHeader className="border-b border-slate-800 pb-4 flex flex-row items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-lg text-amber-400">
                        {selectedJob.jobTicketNumber}
                      </span>
                      <Badge variant="outline" className="font-mono text-xs">
                        ORDER {selectedJob.order?.orderNumber}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Customer: {selectedJob.order?.user?.fullName || selectedJob.order?.user?.email}
                    </p>
                  </div>

                  <a
                    href={`http://localhost:4000/api/manufacturing/jobs/${selectedJob.id}/pdf`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button variant="outline" size="sm" className="gap-1.5 border-slate-700 hover:bg-slate-800">
                      <Download className="h-3.5 w-3.5 text-blue-400" />
                      <span>Print PDF Spec</span>
                    </Button>
                  </a>
                </CardHeader>

                <CardContent className="pt-6 space-y-6">
                  {/* Status Progression Buttons */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">
                      ADVANCE FABRICATION STAGE:
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        size="sm"
                        variant={selectedJob.status === 'MANUFACTURING' ? 'default' : 'outline'}
                        onClick={() => handleUpdateStatus(selectedJob.id, 'MANUFACTURING')}
                        className="text-xs h-8"
                      >
                        1. Fabrication
                      </Button>
                      <Button
                        size="sm"
                        variant={selectedJob.status === 'QUALITY_CHECK' ? 'default' : 'outline'}
                        onClick={() => handleUpdateStatus(selectedJob.id, 'QUALITY_CHECK')}
                        className="text-xs h-8 text-sky-400 border-sky-500/30"
                      >
                        2. QA Continuity
                      </Button>
                      <Button
                        size="sm"
                        variant={selectedJob.status === 'READY_TO_SHIP' ? 'default' : 'outline'}
                        onClick={() => handleUpdateStatus(selectedJob.id, 'READY_TO_SHIP')}
                        className="text-xs h-8 text-emerald-400 border-emerald-500/30"
                      >
                        3. Ready to Ship
                      </Button>
                    </div>
                  </div>

                  {/* Cut Specifications */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">CUT LENGTH</span>
                      <span className="font-mono font-bold text-amber-400 text-sm">
                        {phys.manufacturingCutLengthMeters}m
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">FINISHED LENGTH</span>
                      <span className="font-mono font-bold text-white text-sm">
                        {phys.finishedLengthMeters}m
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">STRIP ALLOWANCE</span>
                      <span className="font-mono font-semibold text-slate-300">
                        {phys.stripAllowancePerEndCm}cm / end
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">BULK CONDUCTOR</span>
                      <span className="font-mono font-semibold text-slate-300 truncate block">
                        {phys.gaugeAWG} AWG {phys.shielding}
                      </span>
                    </div>
                  </div>

                  {/* Pin Mapping Wiring Table */}
                  <div>
                    <h4 className="text-xs font-mono font-semibold text-slate-300 uppercase mb-2">
                      Pinout Soldering / Crimping Matrix
                    </h4>

                    <div className="rounded-lg border border-slate-800 overflow-hidden text-xs">
                      <div className="grid grid-cols-12 bg-slate-950 p-2.5 font-mono text-slate-400 border-b border-slate-800 text-[11px]">
                        <div className="col-span-1">#</div>
                        <div className="col-span-4">End 1 ({c1.name})</div>
                        <div className="col-span-3">Conductor Color</div>
                        <div className="col-span-4">End 2 ({c2.name})</div>
                      </div>

                      <div className="divide-y divide-slate-800/60 max-h-60 overflow-y-auto">
                        {pinMapping.map((conn: any, idx: number) => (
                          <div
                            key={idx}
                            className="grid grid-cols-12 p-2.5 items-center hover:bg-slate-800/40 text-slate-300"
                          >
                            <div className="col-span-1 font-mono text-slate-500">{idx + 1}</div>
                            <div className="col-span-4 font-medium text-white truncate">
                              Pin {conn.sourcePinNumber}: {conn.sourcePinName}
                            </div>
                            <div className="col-span-3 flex items-center gap-1.5 font-mono text-[11px]">
                              <span
                                className="h-2.5 w-2.5 rounded-full border border-slate-700"
                                style={{ backgroundColor: conn.wireColor || '#3B82F6' }}
                              />
                              <span>{conn.wireColor || '#3B82F6'}</span>
                            </div>
                            <div className="col-span-4 font-medium text-white truncate">
                              Pin {conn.targetPinNumber}: {conn.targetPinName}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
