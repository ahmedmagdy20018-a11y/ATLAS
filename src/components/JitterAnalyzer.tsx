/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Waves, 
  Activity, 
  Tv, 
  Gamepad2, 
  PhoneCall, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle,
  HelpCircle,
  Info
} from 'lucide-react';
import { NetworkMetrics } from '../types';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface JitterAnalyzerProps {
  metrics: NetworkMetrics | null;
  history: NetworkMetrics[];
}

export const JitterAnalyzer: React.FC<JitterAnalyzerProps> = ({ metrics, history }) => {
  const { i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';

  const [simulatedJolt, setSimulatedJolt] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  // Derive active jitter
  const activeJitter = simulatedJolt 
    ? 18.45 
    : (metrics?.jitter || 1.8);

  const getJitterStatus = (val: number) => {
    if (val < 2) return { labelEn: "EXCELLENT (STUDIO STABLE)", labelAr: "ممتاز (ثبات مطلق)", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" };
    if (val < 5) return { labelEn: "GOOD (STANDARD)", labelAr: "جيد (معياري)", color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" };
    if (val < 10) return { labelEn: "MODERATE FLUX", labelAr: "تقلب متوسط", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" };
    return { labelEn: "CRITICAL REORDERING THREAT", labelAr: "خطر حرج (إعادة ترتيب الحزم)", color: "text-rose-500 font-black", bg: "bg-rose-500/10", border: "border-rose-500/20" };
  };

  const statusInfo = getJitterStatus(activeJitter);

  // Map history to Recharts format
  // Reconstruct standard trend
  const trendData = history.slice().reverse().map((m, idx) => {
    let jitterVal = m.jitter;
    // Layer simulation on top of current metrics if simulated
    if (simulatedJolt && idx === history.length - 1) {
      jitterVal = 18.45;
    }
    return {
      name: `${new Date(m.timestamp).getHours()}:${new Date(m.timestamp).getMinutes()}`,
      jitter: Number(jitterVal.toFixed(2)),
      latency: Math.round(m.latency)
    };
  });

  // If there's no trend data, create a baseline
  const chartData = trendData.length > 0 ? trendData : [
    { name: '12:00', jitter: 1.5, latency: 15 },
    { name: '13:00', jitter: 1.8, latency: 16 },
    { name: '14:00', jitter: 2.1, latency: 18 },
    { name: '15:00', jitter: 1.2, latency: 14 },
    { name: '16:00', jitter: 1.6, latency: 15 },
    { name: '17:00', jitter: activeJitter, latency: simulatedJolt ? 65 : 16 }
  ];

  const handleJoltTest = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setSimulatedJolt(true);
    setTimeout(() => {
      setIsSimulating(false);
    }, 1200);
  };

  const resetJoltTest = () => {
    setSimulatedJolt(false);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-2 flex items-center gap-3">
            <Waves className="w-8 h-8 text-blue-500 shrink-0" />
            {isRtl ? "تحليل تقطع الإشارة (Jitter)" : "Jitter & Phase Stability Analysis"}
          </h2>
          <p className="text-white/40 font-medium text-sm">
            {isRtl 
              ? "تفحص مدى ثبات الفواصل الزمنية بين تدفق حزم البيانات. تقطع الإشارة المنخفض يضمن تصفح مريح وألعاب سريعة وخالية من اللقطات."
              : "Locates latency gaps and phase deviations in raw network packages. Sustained low Jitter enforces perfect streaming parity."}
          </p>
        </div>

        {/* Action button */}
        <div className="flex gap-2.5">
          {simulatedJolt ? (
            <button
              onClick={resetJoltTest}
              className="px-4 py-2.5 bg-rose-950 border border-rose-500/30 text-rose-300 text-xs font-black uppercase rounded-2xl hover:bg-rose-900 transition-all"
            >
              {isRtl ? "إيقاف المحاكاة" : "Clear Simulation"}
            </button>
          ) : (
            <button
              onClick={handleJoltTest}
              disabled={isSimulating}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 font-black text-white text-xs uppercase rounded-2xl transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
            >
              {isSimulating ? (isRtl ? "جاري الاختبار..." : "Simulating...") : (isRtl ? "محاكاة اضطراب الشبكة" : "Inject Jitter Pulse")}
            </button>
          )}
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-[#111111]/80 backdrop-blur-md p-8 lg:p-10 rounded-[2.5rem] border border-white/5 shadow-2xl space-y-8">
          <div>
            <h3 className="text-lg font-black text-white uppercase tracking-tight mb-1">
              {isRtl ? "مخطط تذبذب زمن الاستجابة والـ Jitter" : "Dynamic Latency & Jitter Jittersphere Trend"}
            </h3>
            <p className="text-xs text-white/40 font-medium">
              {isRtl ? "تفاعل الزمن الحقيقي وعلاقة Jitter بالزمن المنقضي لكل حزمة." : "Comparative graph tracking actual jitter levels paired with packet round-trip times."}
            </p>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                <XAxis dataKey="name" stroke="#ffffff30" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff30" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #222', borderRadius: '1rem', color: '#fff', fontSize: '11px' }} />
                <Line type="monotone" dataKey="jitter" stroke="#F59E0B" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Jitter (ms)" />
                <Line type="monotone" dataKey="latency" stroke="#3B82F6" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Latency (ms)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Real-time Stability Grade Console */}
        <div className="lg:col-span-4 space-y-6">
          <div className={`p-8 rounded-[2.5rem] border ${statusInfo.border} ${statusInfo.bg}`}>
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-1">
              {isRtl ? "حالة ثبات الاستجابة" : "Stabilization Tier"}
            </span>
            <div className={`text-2xl font-black uppercase tracking-tight ${statusInfo.color}`}>
              {isRtl ? statusInfo.labelAr : statusInfo.labelEn}
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-xs font-bold text-white/50">{isRtl ? "تقلب الإشارة الفعلي" : "Active Delta"}</span>
                <span className="text-lg font-extrabold text-white font-mono">{activeJitter.toFixed(2)} ms</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-xs font-bold text-white/50">{isRtl ? "انحراف مرحلي تقديري" : "Phase Deviation"}</span>
                <span className="text-xs font-extrabold text-blue-400 font-mono">±{(activeJitter * 0.4).toFixed(1)} ms</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-xs font-bold text-white/50">{isRtl ? "توصية ATLAS" : "ATLAS Flag"}</span>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-white/10 text-white">
                  {activeJitter < 3 ? (isRtl ? "اتصال ذهبي" : "Safe Zone") : (isRtl ? "يحتاج موازنة" : "Optimize Queue")}
                </span>
              </div>
            </div>
          </div>

          {/* Alert of SLA Risk */}
          {simulatedJolt && (
            <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-3xl flex gap-3 text-rose-300 animate-bounce">
              <ShieldAlert className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider">{isRtl ? "تحذير: خطورة انتفاخ المخازن مؤقتة" : "High Jitter / Out-of-Order Risk"}</h4>
                <p className="text-[10px] font-medium leading-relaxed uppercase mt-1">
                  {isRtl ? "تم حقن تشويش افتراضي. انخفضت جودة البث والألعاب." : "UDP jitter exceeds SLA limit (> 5ms). Audio/Video handshakes are suffering retransmissions."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SLA Matrix Hops and Use Case Ratings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 p-6 rounded-3xl border border-white/5 flex gap-4">
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center shrink-0">
            <Gamepad2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-black text-white uppercase tracking-tight">{isRtl ? "تجربة الألعاب والتفاعل" : "Competitive Gaming (FPS)"}</h4>
            <div className="text-base font-black text-emerald-400 mt-1 select-none">
              {activeJitter < 2 ? "100/100 (PREMIUM)" : activeJitter < 5 ? "85/100 (GOOD)" : "35/100 (DISRUPTIVE)"}
            </div>
            <p className="text-[10px] font-medium text-white/40 mt-1">{isRtl ? "أدنى معدل تأخير للتصويت بالخواديم." : "Guaranteed server-side parity tickrate feedback."}</p>
          </div>
        </div>

        <div className="bg-white/5 p-6 rounded-3xl border border-white/5 flex gap-4">
          <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center shrink-0">
            <PhoneCall className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-black text-white uppercase tracking-tight">{isRtl ? "الاتصال الصوتي والبث" : "VoIP & Video Call (MOS)"}</h4>
            <div className="text-base font-black text-blue-400 mt-1 select-none">
              {activeJitter < 2 ? "4.8 (EXCELLENT)" : activeJitter < 5 ? "4.2 (GOOD)" : "2.9 (CHOPPY AUDIO)"}
            </div>
            <p className="text-[10px] font-medium text-white/40 mt-1">{isRtl ? "مؤشر جودة نقل الصوت المنقح." : "Mean Opinion Score simulation for Zoom & WebRTC calls."}</p>
          </div>
        </div>

        <div className="bg-white/5 p-6 rounded-3xl border border-white/5 flex gap-4">
          <div className="w-12 h-12 bg-yellow-500/10 text-yellow-400 rounded-2xl flex items-center justify-center shrink-0">
            <Tv className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-black text-white uppercase tracking-tight">{isRtl ? "بث الفيديو فائق الدقة (4K)" : "4K Ultra-HD Streaming"}</h4>
            <div className="text-base font-black text-yellow-400 mt-1 select-none">
              {activeJitter < 5 ? "99.9% STABLE" : "75.1% (BUFFER RISKS)"}
            </div>
            <p className="text-[10px] font-medium text-white/40 mt-1">{isRtl ? "حجم تفادي الفقد وتعبئة الذاكرة." : "Frame buffer caching compliance indexes."}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
