'use client';

import React from 'react';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  onStepClick: (step: number) => void;
  maxStepReached: number;
}

const steps = [
  { id: 1, title: 'End 1', desc: 'Source Connector' },
  { id: 2, title: 'End 2', desc: 'Target Connector' },
  { id: 3, title: 'Cable', desc: 'Length & Specs' },
  { id: 4, title: 'Wiring', desc: 'Pin Mapping Canvas' },
  { id: 5, title: 'Review', desc: 'Validation & Order' },
];

export function StepIndicator({
  currentStep,
  onStepClick,
  maxStepReached,
}: StepIndicatorProps) {
  return (
    <div className="w-full py-4 border-b border-slate-800 bg-[#090d14]/70 backdrop-blur">
      <div className="container mx-auto px-4 sm:px-8">
        <nav aria-label="Progress">
          <ol className="flex items-center justify-between gap-2 overflow-x-auto py-2">
            {steps.map((step, idx) => {
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              const isClickable = step.id <= maxStepReached;

              return (
                <li key={step.id} className="relative flex-1 min-w-[120px]">
                  <button
                    type="button"
                    onClick={() => isClickable && onStepClick(step.id)}
                    disabled={!isClickable}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition ${
                      isCurrent
                        ? 'bg-blue-600/10 border border-blue-500/30'
                        : isClickable
                        ? 'hover:bg-slate-800/60 cursor-pointer'
                        : 'opacity-40 cursor-not-allowed'
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-mono font-bold transition ${
                        isCompleted
                          ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                          : isCurrent
                          ? 'bg-blue-600 text-white ring-4 ring-blue-500/20'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {isCompleted ? <Check className="h-4 w-4 stroke-[3]" /> : step.id}
                    </div>

                    <div className="hidden sm:block">
                      <p
                        className={`text-xs font-semibold uppercase tracking-wider ${
                          isCurrent ? 'text-blue-400' : isCompleted ? 'text-slate-200' : 'text-slate-500'
                        }`}
                      >
                        {step.title}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">{step.desc}</p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
}
