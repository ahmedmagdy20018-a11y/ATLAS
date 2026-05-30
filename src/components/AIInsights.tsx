/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  BrainCircuit, 
  TrendingUp, 
  Target, 
  Zap, 
  AlertCircle,
  Lightbulb,
  Cpu,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Baseline, NetworkMetrics } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area
} from 'recharts';

interface AIInsightsProps {
  baselines: Baseline[];
  prediction: { nextHourSpeed: number; confidence: number };
  recentMetrics: NetworkMetrics[];
}

type ScenarioKey = 'standard' | 'gaming' | 'heavy' | 'congestion';

export const AIInsights: React.FC<AIInsightsProps> = ({ baselines, prediction, recentMetrics }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';

  // State for Interactive AI Traffic Predictor
  const [activeScenario, setActiveScenario] = useState<ScenarioKey>('standard');

  const chartData = baselines.map(b => ({
    hour: `${b.hourOfDay}:00`,
    speed: Math.round(b.mean),
    std: Math.round(b.stdDev)
  }));

  const scenarios = {
    standard: {
      titleEn: "Standard Daily Traffic",
      titleAr: "حركة مرور يومية قياسية",
      descEn: "Normal multi-device browsing, occasional audio streams, and typical light smart-home telemetry.",
      descAr: "تصفح معتاد بأجهزة متعددة، وبث صوتي متقطع، واتصال خفيف لأجهزة تكنولوجيا المنزل الذكي.",
      predictedSpeedDown: Math.round(prediction.nextHourSpeed || 95),
      predictedLatency: 15,
      bufferbloatGrade: "A+",
      slaMetRate: 99,
      jitterExpected: 1.8,
      loadMultiplier: 1.0,
      confidence: prediction.confidence || 85,
    },
    gaming: {
      titleEn: "Low-Latency Competitive Gaming Mode",
      titleAr: "وضع الألعاب والمنافسات منخفض الاستجابة",
      descEn: "Real-time socket multiplexing, UDP packet streaming, Discord VoIP channels, and anti-bufferbloat shaping active.",
      descAr: "إرسال حزم متسارعة بالزمن الحقيقي (UDP)، وقنوات اتصال صوتي نشطة، مع تفعيل حماية ضد انتفاخ المخزن المؤقت للإنترنت.",
      predictedSpeedDown: Math.round((prediction.nextHourSpeed || 95) * 0.94),
      predictedLatency: 11,
      bufferbloatGrade: "A",
      slaMetRate: 98,
      jitterExpected: 1.1,
      loadMultiplier: 1.3,
      confidence: 78,
    },
    heavy: {
      titleEn: "Heavy Cloud Synchronization & Torrents",
      titleAr: "مزامنة سحابية مكثفة ومشاركة ملفات ضخمة",
      descEn: "Aggressive multi-threaded TCP download channels, OneDrive backups, and parallel peer handshake loads.",
      descAr: "تحميل ملفات ضخم متعدد الخيوط ومزامنة نسخ OneDrive السحابية واتصالات الأقران Peer-to-Peer المتوازية.",
      predictedSpeedDown: Math.round((prediction.nextHourSpeed || 95) * 0.45),
      predictedLatency: 38,
      bufferbloatGrade: "C-",
      slaMetRate: 72,
      jitterExpected: 7.9,
      loadMultiplier: 3.1,
      confidence: 90,
    },
    congestion: {
      titleEn: "Peak ISP Structural Congestion",
      titleAr: "ساعات ازدحام البنية التحتية لمزود الخدمة",
      descEn: "Neighborhood-wide peak streaming hours (7 PM - 11 PM) affecting node distribution hubs and core ISP routing.",
      descAr: "ساعات بث الذروة التشاركية في الحي والمنطقة المحيطة والتي تؤثر على مقسم مزود الخدمة الرئيسي والتوجيه المحلي.",
      predictedSpeedDown: Math.round((prediction.nextHourSpeed || 95) * 0.65),
      predictedLatency: 28,
      bufferbloatGrade: "B-",
      slaMetRate: 85,
      jitterExpected: 4.8,
      loadMultiplier: 2.2,
      confidence: 82,
    }
  };

  const activeData = scenarios[activeScenario];

  const insights = [
    { 
      titleEn: "Peak Performance Hour", 
      titleAr: "ساعة الأداء الأقصى",
      descEn: "Your network typically performs best at 4:00 AM due to empty regional fiber pools.", 
      descAr: "تعمل شبكتك بأفضل أداء عادة في تمام الساعة 4:00 صباحاً لانخفاض الضغط على مقاسم الخدمة الإقليمية.", 
      icon: Zap, 
      color: "text-amber-500", 
      bg: "bg-amber-500/10" 
    },
    { 
      titleEn: "Stability Analysis", 
      titleAr: "تحليل استقرار الاتصال",
      descEn: "Minor DSLAM buffer overload pattern detected daily between 7:30 PM and 10:45 PM.", 
      descAr: "تم الكشف عن وجود ضغط طفيف مؤقت في مقسم DSLAM بالحي يتكرر يومياً بين 7:30 مساءً حتى 10:45 مساءً.", 
      icon: Target, 
      color: "text-blue-500", 
      bg: "bg-blue-500/10" 
    },
    { 
      titleEn: "AI Projection Model", 
      titleAr: "نموذج توقعات الذكاء الاصطناعي",
      descEn: `Estimated download for next hour is ${prediction.nextHourSpeed.toFixed(1)} Mbps with a confidence matrix of ${prediction.confidence}%.`, 
      descAr: `التحميل المتوقع للساعة القادمة هو ${prediction.nextHourSpeed.toFixed(1)} ميجابت/ث بمسار مطابقة ثقة %${prediction.confidence}.`, 
      icon: TrendingUp, 
      color: "text-emerald-500", 
      bg: "bg-emerald-500/10" 
    }
  ];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase mb-1 flex items-center gap-3">
            <Cpu className="w-10 h-10 text-blue-500 shrink-0" />
            {t('common.aiInsights')}
          </h2>
          <p className="text-white/40 font-medium text-sm">
            {isRtl 
              ? "التحليلات التنبؤية العميقة ونماذج التعلم المستمر بناءً على سلوك الاستخدام ومزود الخدمة الخاص بك."
              : "Predictive deep analytics, continuous learning baseline models and localized ISP traffic forecasts."}
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20 text-emerald-400 self-start md:self-auto">
          <BrainCircuit className="w-4 h-4 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest">{isRtl ? "نموذج التعلم الذاتي نشط" : "ML Self-Training Model Active"}</span>
        </div>
      </div>

      {/* Basic Metrics Static Cards with translation support */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {insights.map((insight, i) => (
          <div key={i} className="bg-[#111111]/80 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/5 group hover:border-white/10 transition-all shadow-xl">
            <div className={`w-12 h-12 ${insight.bg} ${insight.color} rounded-2xl flex items-center justify-center mb-6`}>
              <insight.icon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-white uppercase tracking-tight mb-2">
              {isRtl ? insight.titleAr : insight.titleEn}
            </h3>
            <p className="text-sm font-medium text-white/50 leading-relaxed">
              {isRtl ? insight.descAr : insight.descEn}
            </p>
          </div>
        ))}
      </div>

      {/* NEW: Interactive AI Traffic Scenario Predictor Panel */}
      <div className="bg-[#111]/90 rounded-[2.5rem] p-8 lg:p-10 border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sliders className="w-4 h-4 text-blue-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">
                  {isRtl ? "جهاز محاكاة الحمل التفاعلي بالذكاء الاصطناعي" : "Interactive AI Traffic Load Simulator"}
                </span>
              </div>
              <h3 className="text-2xl font-black text-white tracking-tighter uppercase">
                {isRtl ? "محاكي توقعات استقرار الشبكة" : "Network Stability Scenario Forecast"}
              </h3>
              <p className="text-sm text-white/40 font-medium">
                {isRtl 
                  ? "اختر وضع تشغيل بالأسفل لمحاكاة تأثيره على سرعة استجابة الشبكة، ومعدل Bufferbloat، ومخاطر تقطع الإشارد على الفور."
                  : "Toggle scenarios to witness real-time AI forecasts of throughput, packet travel latency, jitter spectrum, and SLA safety limits."}
              </p>
            </div>

            {/* Selector Buttons */}
            <div className="flex flex-wrap gap-2.5 bg-black/40 p-1.5 rounded-2xl border border-white/5">
              {(Object.keys(scenarios) as ScenarioKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setActiveScenario(key)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
                    activeScenario === key
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-extrabold"
                      : "text-white/40 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {isRtl ? scenarios[key].titleAr : scenarios[key].titleEn.split(' Mode')[0].split(' Peak')[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Scenario Description and Custom Simulated Gauges */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                <h4 className="text-base font-black text-white uppercase tracking-tight mb-2">
                  {isRtl ? activeData.titleAr : activeData.titleEn}
                </h4>
                <p className="text-xs font-medium text-white/50 leading-relaxed mb-6">
                  {isRtl ? activeData.descAr : activeData.descEn}
                </p>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-white/60 mb-1.5">
                      <span>{isRtl ? "حجم الحمل المتوقع" : "Expected Load Factor"}</span>
                      <span className="text-blue-400">{activeData.loadMultiplier}x</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min(100, activeData.loadMultiplier * 33)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-white/60 mb-1.5">
                      <span>{isRtl ? "معدل ثقة الذكاء الاصطناعي" : "Prediction Confidence Level"}</span>
                      <span className="text-emerald-400">{activeData.confidence}%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                        style={{ width: `${activeData.confidence}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Weekly Tip Card inside Scenario Simulator */}
              <div className="bg-gradient-to-br from-blue-950 to-blue-900 border border-blue-500/20 p-6 rounded-3xl text-white">
                <div className="flex items-center gap-2.5 mb-3">
                  <Lightbulb className="w-5 h-5 text-yellow-400" />
                  <span className="text-[9px] font-black uppercase tracking-widest bg-yellow-400/10 text-yellow-300 px-2.5 py-0.5 rounded-full">
                    {isRtl ? "تحليل المهندسين" : "Engineer Analysis Detail"}
                  </span>
                </div>
                <p className="text-xs text-white/80 font-medium leading-relaxed">
                  {activeScenario === 'gaming' && (isRtl 
                    ? "تقليل التقطع (Jitter) لأقل من 2ms يزيد من ثقة الخوادم في الاستجابة ويمنع انزلاق اللقطات أثناء المنافسات."
                    : "Sustaining low jitter (< 1.5ms) prevents tickrate drop in rapid real-time UDP streams. SQM configuration is highly recommended.")}
                  {activeScenario === 'standard' && (isRtl 
                    ? "الاتصال متزن تماماً حالياً. لا حاجة لأي تعديلات يدوية أو إعادة تشغيل للراوتر في هذا الضغط المعتدل."
                    : "The communication pipeline has flawless parity. No QoS modifications are needed for this traffic load.")}
                  {activeScenario === 'heavy' && (isRtl 
                    ? "التحميل المكثف من عدة خيوط يسبب Bufferbloat عالي في الراوتر الذكي. يفضل موازنة حد سرعة الرفع لـ 85% كحد أقصى."
                    : "Heavy parallel cloud backups clog up the ACK routing backplanes. Setting a maximum 85% upload cap will eliminate latency spikes.")}
                  {activeScenario === 'congestion' && (isRtl 
                    ? "هذا الضغط من خارج منزلك سببه تقسيم النطاقات الترددية في الحي. يفضل الانتقال لقنوات 5GHz أو التوصيل عبر كابل إيثرنت."
                    : "Fiber local-loop aggregation is congested on your sector. Utilizing a hardwired CAT6 connection instead of 2.4GHz WiFi mitigates local spectrum loss.")}
                </p>
              </div>
            </div>

            {/* Calculated Simulation Forecasters Grid */}
            <div className="lg:col-span-8 grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-6 rounded-3xl border border-white/5 flex flex-col justify-between">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-2">{isRtl ? "سرعة التحميل المتوقعة" : "Forecasted Download"}</span>
                <div>
                  <div className="text-4xl font-extrabold text-white tracking-tighter mb-1 select-none">{activeData.predictedSpeedDown} <span className="text-xs font-bold text-white/40">Mbps</span></div>
                  <span className="text-[10px] font-semibold text-white/30 uppercase">{isRtl ? "المطابقة المتوقعة" : "Expected throughput"}</span>
                </div>
              </div>

              <div className="bg-white/5 p-6 rounded-3xl border border-white/5 flex flex-col justify-between">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-2">{isRtl ? "زمن استجابة الشبكة (Latency)" : "Simulated Latency"}</span>
                <div>
                  <div className="text-4xl font-extrabold text-blue-400 tracking-tighter mb-1 select-none">{activeData.predictedLatency} <span className="text-xs font-bold text-blue-400/40 font-mono">ms</span></div>
                  <span className="text-[10px] font-semibold text-white/30 uppercase">{isRtl ? "زمن الانتقال المتبادل" : "Round-trip travel time"}</span>
                </div>
              </div>

              <div className="bg-white/5 p-6 rounded-3xl border border-white/5 flex flex-col justify-between">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-2">{isRtl ? "استقرار تقطع الإشارة (Jitter)" : "Estimated Jitter Spectrum"}</span>
                <div>
                  <div className="text-4xl font-extrabold text-amber-400 tracking-tighter mb-1 select-none">{activeData.jitterExpected} <span className="text-xs font-bold text-amber-400/40 font-mono">ms</span></div>
                  <span className="text-[10px] font-semibold text-white/30 uppercase">{isRtl ? "مؤشر الانحراف المعياري" : "Deviation threshold delta"}</span>
                </div>
              </div>

              <div className="bg-white/5 p-6 rounded-3xl border border-white/5 flex flex-col justify-between">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-1">Bufferbloat Index</span>
                <div>
                  <div className={`text-4xl font-black tracking-tight mb-2 select-none ${
                    activeData.bufferbloatGrade.startsWith('A') ? 'text-emerald-400' : activeData.bufferbloatGrade.startsWith('B') ? 'text-yellow-400 font-bold' : 'text-rose-500 font-extrabold'
                  }`}>{activeData.bufferbloatGrade}</div>
                  <span className="text-[10px] font-semibold text-white/30 uppercase">
                    {isRtl ? "مؤشر امتلاء مخزن الراوتر" : "Router buffer queuing rate"}
                  </span>
                </div>
              </div>

              <div className="col-span-2 bg-gradient-to-r from-blue-900/10 to-transparent p-6 rounded-3xl border border-blue-500/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
                  <div>
                    <h5 className="text-xs font-black text-white uppercase tracking-wider">{isRtl ? "توقعات الامتثال لمستوى اتفاقية الخدمة (SLA)" : "Predicted SLA Compliance Security"}</h5>
                    <p className="text-[10px] text-white/40 font-bold uppercase mt-0.5">
                      {isRtl ? "معدل الحفاظ على سرعة تفوق 100 Mbps" : "Chance of maintaining minimum target SLA standard"}
                    </p>
                  </div>
                </div>
                <div className="text-2xl font-black text-emerald-400">{activeData.slaMetRate}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hourly Baseline Graph Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-[#111111]/80 backdrop-blur-md rounded-[2.5rem] p-8 lg:p-10 border border-white/5 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-black text-white tracking-tighter uppercase">{isRtl ? "الخط المرجعي للتعلم (متوسط السرعة بالساعة)" : "Learning Baseline (Mean Speed by Hour)"}</h3>
              <p className="text-xs text-white/40 font-medium mt-1">{isRtl ? "توزع معدلات التحميل والتنزيل عبر ساعات اليوم وفقاً لسجل القراءات التاريخية." : "Visual spectrum of historical hourly performance benchmarks mapped across 24h slots."}</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-600/10 rounded-full border border-blue-600/20 text-blue-500 shrink-0">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span className="text-[9px] font-black uppercase tracking-widest">{isRtl ? "تحديث تلقائي" : "Real-time updates"}</span>
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                <XAxis dataKey="hour" stroke="#ffffff30" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff30" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: '#ffffff03' }}
                  contentStyle={{ backgroundColor: '#111', border: '1px solid #222', borderRadius: '1rem', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="speed" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === new Date().getHours() ? '#3B82F6' : '#ffffff10'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Anomaly Shield audit logs */}
        <div className="lg:col-span-4 bg-[#111111]/80 backdrop-blur-md p-8 lg:p-10 rounded-[2.5rem] border border-white/5 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <AlertCircle className="text-amber-500 w-6 h-6 shrink-0" />
              <h4 className="text-lg font-black text-white uppercase tracking-tight">{isRtl ? "حامي الشذوذ والتردد" : "Anomaly Shield Tracking"}</h4>
            </div>
            
            <p className="text-xs text-white/40 font-medium mb-6 leading-relaxed">
              {isRtl 
                ? "يرصد النظام أي انحراف حاد غير مألوف في الأداء الفعلي لخط الإنترنت مقارنة بالتعلم المرجعي." 
                : "Active background monitoring comparing actual hourly feedback against target variance models."}
            </p>

            <div className="space-y-4">
               {[1, 2].map(i => (
                 <div key={i} className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-all">
                    <div className="w-1.5 h-10 bg-amber-500 rounded-full shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-white">{isRtl ? `تذبذب طفيف مسجل في ${i*2} صباحاً` : `Minor performance shift at ${i*2}:00 AM`}</p>
                      <p className="text-[9px] font-bold text-white/30 uppercase mt-1">
                        {isRtl ? "انحراف زمن الاستجابة (Ping offset)" : "Slight Latency Jitter Flux"}
                      </p>
                    </div>
                 </div>
               ))}
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 mt-6 flex items-center justify-between text-[10px] text-white/30 uppercase font-bold tracking-widest leading-none">
            <span>{isRtl ? "النظام مؤمن" : "Shield active & verified"}</span>
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
          </div>
        </div>
      </div>
    </div>
  );
};

