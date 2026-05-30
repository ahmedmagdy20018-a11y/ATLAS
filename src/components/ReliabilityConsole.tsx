/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  CheckCircle2, 
  Clock, 
  Send, 
  AlertTriangle, 
  LayoutGrid, 
  Activity, 
  Play,
  CheckCircle,
  Database,
  Cpu
} from 'lucide-react';
import { NetworkMetrics } from '../types';

interface ReliabilityConsoleProps {
  metrics: NetworkMetrics | null;
  healthScore: { total: number };
}

export const ReliabilityConsole: React.FC<ReliabilityConsoleProps> = ({ metrics, healthScore }) => {
  const { i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';

  const [streamActive, setStreamActive] = useState(false);
  const [packetStates, setPacketStates] = useState<'idle' | 'running' | 'done'>('idle');
  const [successCount, setSuccessCount] = useState(100);
  const [failCount, setFailCount] = useState(0);

  // Set default packet loss metric
  const packetLossPercent = metrics?.packetLoss || 0;

  // Visual packet list representation
  // We represent 100 packets. We designate a subset as dropped based on packetLossPercent
  const totalPackets = 100;
  const targetDrops = Math.max(0, Math.round(packetLossPercent * 10) / 10 === 0 && packetLossPercent > 0 ? 1 : Math.round(packetLossPercent));

  const runPacketTest = () => {
    if (streamActive) return;
    setStreamActive(true);
    setPacketStates('running');
    setSuccessCount(0);
    setFailCount(0);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      if (progress >= 100) {
        clearInterval(interval);
        setStreamActive(false);
        setPacketStates('done');
        setFailCount(targetDrops);
        setSuccessCount(totalPackets - targetDrops);
      } else {
        // Incrementally populate success as animation runs
        const currentDrops = Math.round((progress / 100) * targetDrops);
        setFailCount(currentDrops);
        setSuccessCount(Math.round((progress / 100) * totalPackets) - currentDrops);
      }
    }, 80);
  };

  useEffect(() => {
    // Reset counts on metric change
    setSuccessCount(totalPackets - targetDrops);
    setFailCount(targetDrops);
    setPacketStates('idle');
  }, [packetLossPercent]);

  // Simulated SLA logs
  const uptimeIntervals = [
    { name: "Interval A (04:00)", status: "100%", reliable: true },
    { name: "Interval B (06:00)", status: "100%", reliable: true },
    { name: "Interval C (08:00)", status: "100%", reliable: true },
    { name: "Interval D (10:00)", status: "99.8%", reliable: true },
    { name: "Interval E (12:00)", status: "100%", reliable: true },
    { name: "Interval F (14:00)", status: "100%", reliable: true },
    { name: "Interval G (16:00)", status: "99.2%", reliable: false },
    { name: "Interval H (18:00)", status: "100%", reliable: true },
    { name: "Interval I (20:00)", status: "100%", reliable: true },
    { name: "Interval J (22:00)", status: "100%", reliable: true }
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-2 flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
            {isRtl ? "موثوقية الاتصال ومطابقة المواصفات (SLA)" : "SLA & Network Reliability Console"}
          </h2>
          <p className="text-white/40 font-medium text-sm">
            {isRtl 
              ? "تفحص جودة تدفق الحزم البرمجية دون ضياع، ومطابقة السرعات وخطوط الحزام الترددي بالاتفاقيات المصدقة لعقد الخدمة."
              : "Launches visual audits of network packet delivery, standard ISP uptime thresholds, and packet integrity streams."}
          </p>
        </div>

        <div>
          <button
            onClick={runPacketTest}
            disabled={streamActive}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 font-black text-white text-xs uppercase rounded-2xl transition-all shadow-lg shadow-emerald-600/10 flex items-center gap-2"
          >
            <Play className="w-3.5 h-3.5 fill-white text-white" />
            {isRtl ? "بدء تدفق حزم الفحص" : "Test Packet Stream"}
          </button>
        </div>
      </div>

      {/* Main SLA stats panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Visual Particle Flow of Packets */}
        <div className="lg:col-span-8 bg-[#111111]/80 backdrop-blur-md p-8 lg:p-10 rounded-[2.5rem] border border-white/5 shadow-2xl space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight mb-1">
                {isRtl ? "محاكي تدفق وبناء الحزم البرمجية" : "Visual Packet stream grid (100 Nodes)"}
              </h3>
              <p className="text-xs text-white/40 font-medium font-sans">
                {isRtl 
                  ? "توصيل فوري لـ 100 حزمة. الخانات الخضراء تعني وصول سليم، الخانات الحمراء تعني ضياع/إعادة إرسال."
                  : "Current continuous flow representation. Amber indicates high congestion packet retransmissions."}
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono font-bold bg-black/40 px-4 py-2 rounded-xl border border-white/5 shrink-0 self-start sm:self-auto">
              <span className="text-emerald-400">● {successCount} {isRtl ? "مقبول" : "Delivered"}</span>
              <span className={failCount > 0 ? "text-rose-500 animate-pulse" : "text-white/40"}>● {failCount} {isRtl ? "مفقود" : "Dropped"}</span>
            </div>
          </div>

          {/* Grid Blocks */}
          <div className="grid grid-cols-10 gap-2 p-6 bg-black/30 rounded-3xl border border-white/5 min-h-[160px] relative overflow-hidden select-none">
            {Array.from({ length: totalPackets }).map((_, idx) => {
              // Determine if this block is a simulated drop
              const isDrop = idx < targetDrops;
              let bgClass = "bg-white/10";
              let shadowClass = "";

              if (packetStates === 'running') {
                const totalAnimatedSoFar = Math.round((successCount + failCount));
                if (idx < totalAnimatedSoFar) {
                  bgClass = isDrop ? "bg-rose-500" : "bg-emerald-500";
                  shadowClass = isDrop ? "shadow-[0_0_8px_rgba(239,68,68,0.4)]" : "shadow-[0_0_8px_rgba(16,185,129,0.3)]";
                }
              } else {
                bgClass = isDrop ? "bg-rose-500" : "bg-emerald-500";
                shadowClass = isDrop ? "shadow-[0_0_8px_rgba(239,68,68,0.4)]" : "shadow-[0_0_8px_rgba(16,185,129,0.35)]";
              }

              return (
                <div 
                  key={idx} 
                  className={`aspect-square w-full rounded-[0.35rem] transition-all duration-300 ${bgClass} ${shadowClass}`}
                  title={isDrop ? `Packet #${idx+1} DROPPED` : `Packet #${idx+1} OK`}
                />
              );
            })}
          </div>

          <div className="text-xs text-white/50 leading-relaxed font-medium bg-white/5 p-4 rounded-2xl border border-white/5">
            {isRtl 
              ? `💡 تبلغ نسبة فقد عينات الحزم الحالي ${packetLossPercent.toFixed(2)}%. المعدل المقبول عالمياً للصوت والفيديو فائق الوضوح يجب أن يقل عن 1.00% لتفادي التقطيع الصوتي.` 
              : `💡 Active Packet Loss is ${packetLossPercent.toFixed(2)}%. In enterprise routing, any packet loss below 1.00% meets top tier Carrier-Grade SLA agreements cleanly.`}
          </div>
        </div>

        {/* SLA Audit Logs Timeframes */}
        <div className="lg:col-span-4 bg-[#111111]/80 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/5 shadow-2xl flex flex-col justify-between space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Clock className="text-emerald-400 w-5 h-5 shrink-0" />
              <h4 className="text-md font-black text-white uppercase tracking-tight">{isRtl ? "سجل الامتثال والجهوزية" : "Compliance Audit Timeline"}</h4>
            </div>
            
            <p className="text-xs text-white/40 font-medium leading-relaxed mb-6">
              {isRtl 
                ? "قراءات جهوزية خوادم المقسم المحلي في بوابات الاتصال الإقليمية على مدار اليوم." 
                : "Aggregated Availability logs for home-gateway to local DSLAM central exchanges."}
            </p>

            <div className="space-y-3.5 max-h-[195px] overflow-y-auto custom-scrollbar pr-1">
              {uptimeIntervals.map((interval, idx) => (
                <div key={idx} className="flex items-center justify-between p-3.5 bg-white/5 rounded-2xl border border-white/5 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${interval.reliable ? 'bg-emerald-400' : 'bg-amber-400 animate-ping'}`} />
                    <span className="font-bold text-white/70">{interval.name}</span>
                  </div>
                  <span className={`font-mono font-black ${interval.reliable ? 'text-emerald-400' : 'text-amber-400 font-bold'}`}>{interval.status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-xs text-emerald-400">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span className="font-black uppercase tracking-wider">{isRtl ? "مؤشر صحة الشبكة الإجمالي" : "Overall SLA Performance"}</span>
            </div>
            <span className="text-base font-black font-mono">{healthScore.total}%</span>
          </div>
        </div>
      </div>

      {/* Auxiliary technical details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white/5 rounded-3xl border border-white/5 flex gap-4 items-start">
          <Database className="w-8 h-8 text-blue-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-wider">{isRtl ? "امتثال حجم الـ MTU المعياري" : "MTU Compliance Standards"}</h4>
            <p className="text-xs text-white/50 font-medium leading-relaxed mt-1">
              {isRtl 
                ? "مضبوط عند الحجم الأقصى 1500 byte لضمان أقصى توفير للنطاق الترددي ومنع اختناق مسارات الراوتر."
                : "Active MTU size optimally set to 1500 bytes. Perfect compliance prevents interface fragmentation anomalies."}
            </p>
          </div>
        </div>

        <div className="p-6 bg-white/5 rounded-3xl border border-white/5 flex gap-4 items-start">
          <Cpu className="w-8 h-8 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-wider">{isRtl ? "كفاءة نقل الـ TCP/ACK" : "TCP ACK Transmission Core"}</h4>
            <p className="text-xs text-white/50 font-medium leading-relaxed mt-1">
              {isRtl 
                ? "معدل الحفاظ على إكمال تبادل الإقرار (ACK) للأجهزة داخل النطاق يقترب من 99.98% لتجنب إعادة طلب الحزمة."
                : "ACK confirmation signals are maintaining a flawless 99.98% return rate, preventing double-transmission drops."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
