/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, CheckCircle2, ChevronRight, Filter } from 'lucide-react';
import { Fault, Severity } from '../types';
import { cn } from '../lib/utils';

interface FaultMonitorProps {
  faults: Fault[];
}

export const FaultMonitor: React.FC<FaultMonitorProps> = ({ faults }) => {
  const { t } = useTranslation();

  const getSeverityStyles = (severity: Severity) => {
    if (severity >= 9) return "bg-red-500/10 border-red-500/20 text-red-500";
    if (severity >= 7) return "bg-orange-500/10 border-orange-500/20 text-orange-500";
    if (severity >= 4) return "bg-yellow-500/10 border-yellow-500/20 text-yellow-500";
    return "bg-blue-500/10 border-blue-500/20 text-blue-500";
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase mb-1">
            {t('common.faultMonitor')}
          </h2>
          <p className="text-white/40 font-medium">Real-time anomaly tracking & diagnostic history.</p>
        </div>
        <button className="p-3 bg-white/5 border border-white/10 rounded-xl text-white/50 hover:text-white transition-all">
          <Filter className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {faults.length === 0 ? (
          <div className="bg-white/5 border border-white/10 border-dashed rounded-[2.5rem] p-20 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="text-2xl font-black text-white uppercase tracking-tighter">System All Green</h3>
            <p className="text-white/40 font-medium mt-2">ATLAS hasn't detected any network anomalies recently.</p>
          </div>
        ) : (
          faults.map((fault) => (
            <div 
              key={fault.id}
              className={cn(
                "p-8 rounded-[2rem] border transition-all hover:scale-[1.01] flex flex-col md:flex-row gap-8 items-start md:items-center",
                getSeverityStyles(fault.severity)
              )}
            >
              <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                <AlertCircle className="w-8 h-8" />
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-md bg-white/10">
                    {fault.code}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">
                    {new Date(fault.timestamp).toLocaleString()}
                  </span>
                </div>
                <h3 className="text-2xl font-black tracking-tight">{fault.nameEn} / {fault.nameAr}</h3>
                <p className="text-sm font-medium opacity-70 leading-relaxed max-w-2xl">
                  {fault.descriptionEn}
                  <br />
                  <span className="text-xs opacity-50 block mt-1">{fault.descriptionAr}</span>
                </p>
              </div>

              <div className="bg-black/20 p-6 rounded-3xl border border-white/5 w-full md:w-80">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-50">Recommended Action</p>
                <p className="text-sm font-bold leading-tight">{fault.recommendedActionEn}</p>
                <p className="text-xs font-medium opacity-50 mt-1">{fault.recommendedActionAr}</p>
              </div>

              <button className="p-4 bg-white/10 rounded-2xl hover:bg-white/20 transition-all shrink-0">
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
