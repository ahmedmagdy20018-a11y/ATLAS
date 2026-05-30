/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FileText, 
  Calendar, 
  Clock, 
  Download, 
  Mail, 
  RefreshCcw,
  ShieldCheck,
  Zap,
  Activity
} from 'lucide-react';

interface ReportsProps {
  onDownloadDaily: () => void;
  onDownloadWeekly: () => void;
}

export const Reports: React.FC<ReportsProps> = ({ onDownloadDaily, onDownloadWeekly }) => {
  const { t } = useTranslation();

  const reportTypes = [
    { 
        title: "Daily Fault Report", 
        desc: "All anomalies detected in the last 24 hours.", 
        icon: Activity, 
        color: "bg-blue-600", 
        onClick: onDownloadDaily,
        meta: "Generated daily at 12:00 AM"
    },
    { 
        title: "Weekly Analysis", 
        desc: "7-day trend analysis and stability rating.", 
        icon: Zap, 
        color: "bg-purple-600", 
        onClick: onDownloadWeekly,
        meta: "Last generated 2 days ago"
    },
    { 
        title: "Executive Summary", 
        desc: "High-level overview for ISP disputes.", 
        icon: FileText, 
        color: "bg-orange-600", 
        onClick: onDownloadDaily,
        meta: "Manual triggers only"
    }
  ];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase mb-1">
            {t('common.reports')}
          </h2>
          <p className="text-white/40 font-medium">Professional network documentation for ISP evidence & monitoring.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-white font-bold text-sm transition-all hover:bg-white/10">
          <RefreshCcw className="w-4 h-4" />
          Sync Data
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {reportTypes.map((report, i) => (
          <div key={i} className="bg-white/5 p-10 rounded-[2.5rem] border border-white/10 flex flex-col items-start group hover:border-white/20 transition-all">
            <div className={`w-16 h-16 ${report.color} rounded-2xl flex items-center justify-center mb-10 shadow-2xl shadow-black/40 group-hover:scale-110 transition-all`}>
              <report.icon className="text-white w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-white tracking-tighter uppercase mb-4">{report.title}</h3>
            <p className="text-white/40 font-medium leading-relaxed mb-10 flex-1">{report.desc}</p>
            
            <div className="w-full space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/20">
                    <Clock className="w-3 h-3" />
                    {report.meta}
                </div>
                <button 
                  onClick={report.onClick}
                  className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                    <Download className="w-4 h-4" />
                    Download PDF
                </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-600/5 border border-blue-600/10 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center gap-10">
        <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center shrink-0">
          <Mail className="text-blue-500 w-10 h-10" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h4 className="text-2xl font-black text-white tracking-tighter uppercase mb-2">Automated Report Delivery</h4>
          <p className="text-white/40 font-medium leading-relaxed">Let ATLAS send professional PDF reports directly to your email or ISP technical support every Monday at 9:00 AM.</p>
        </div>
        <button className="px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black text-lg tracking-widest rounded-3xl transition-all shadow-xl shadow-blue-600/20 active:scale-95">
          Setup Auto-Email
        </button>
      </div>

      <div className="bg-white/5 rounded-[2.5rem] p-10 border border-white/10">
        <div className="flex items-center gap-4 mb-10">
          <ShieldCheck className="text-green-500 w-8 h-8" />
          <h4 className="text-xl font-black text-white uppercase tracking-tighter">Verified Logs Policy</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
          <div className="space-y-2">
            <p className="text-white/30 text-[10px] font-black uppercase tracking-widest">Tamper Proof</p>
            <p className="text-white font-bold">Every report is signed with a unique integrity hash.</p>
          </div>
          <div className="space-y-2">
            <p className="text-white/30 text-[10px] font-black uppercase tracking-widest">SLA Compliant</p>
            <p className="text-white font-bold">Matches standard telecom industry performance metrics.</p>
          </div>
          <div className="space-y-2">
            <p className="text-white/30 text-[10px] font-black uppercase tracking-widest">Export Options</p>
            <p className="text-white font-bold">Supports PDF, CSV, and Raw JSON formats for audits.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
