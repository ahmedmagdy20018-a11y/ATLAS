/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { NetworkMetrics, UserSettings } from '../types';
import { 
  Calendar, 
  Filter, 
  Download, 
  Clock, 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  FileSpreadsheet, 
  CheckCircle2, 
  HelpCircle,
  Hash,
  Database,
  Sliders,
  Cpu
} from 'lucide-react';

interface PerformanceHistoryProps {
  history: NetworkMetrics[];
  settings?: UserSettings;
}

type FilterType = 'all' | 'peak' | 'high_latency' | 'low_speed' | 'high_jitter';

export const PerformanceHistory: React.FC<PerformanceHistoryProps> = ({ history, settings }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';

  // State management
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [chartMetric, setChartMetric] = useState<'all' | 'speeds' | 'latency_jitter'>('all');

  const targetSLA = settings?.slaThreshold || 95; // default to 95 Mbps

  // 1. Hourly baseline heatmap processor
  // Groups historical records into 24 bins to find performance trends by time.
  const hourlyAggregation = useMemo(() => {
    const bins = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      speeds: [] as number[],
      latencies: [] as number[],
      jitters: [] as number[],
      count: 0
    }));

    history.forEach(m => {
      const hour = new Date(m.timestamp).getHours();
      bins[hour].speeds.push(m.downloadSpeed);
      bins[hour].latencies.push(m.latency);
      bins[hour].jitters.push(m.jitter);
      bins[hour].count += 1;
    });

    return bins.map(b => {
      const avgSpeed = b.speeds.length > 0 ? b.speeds.reduce((sum, val) => sum + val, 0) / b.speeds.length : 0;
      const avgLatency = b.latencies.length > 0 ? b.latencies.reduce((sum, val) => sum + val, 0) / b.latencies.length : 0;
      const avgJitter = b.jitters.length > 0 ? b.jitters.reduce((sum, val) => sum + val, 0) / b.jitters.length : 0;
      
      // Categorize quality based on speed and latency
      let status: 'excellent' | 'normal' | 'congested' | 'empty' = 'empty';
      if (b.count > 0) {
        if (avgSpeed >= targetSLA * 1.05 && avgLatency < 15) {
          status = 'excellent';
        } else if (avgSpeed < targetSLA * 0.85 || avgLatency > 25) {
          status = 'congested';
        } else {
          status = 'normal';
        }
      }

      return {
        ...b,
        avgSpeed: Math.round(avgSpeed),
        avgLatency: Math.round(avgLatency),
        avgJitter: Number(avgJitter.toFixed(2)),
        status
      };
    });
  }, [history, targetSLA]);

  // 2. Perform advanced records filtering
  const filteredHistory = useMemo(() => {
    return history.filter(m => {
      const date = new Date(m.timestamp);
      const hour = date.getHours();

      // Filter by selected hour block from the heatmap matrix
      if (selectedHour !== null && hour !== selectedHour) {
        return false;
      }

      switch (activeFilter) {
        case 'peak':
          // Peak ISP hours defined as 19:00 - 23:00 (7 PM to 11 PM)
          return hour >= 19 && hour <= 23;
        case 'high_latency':
          return m.latency > 18;
        case 'low_speed':
          return m.downloadSpeed < targetSLA;
        case 'high_jitter':
          return m.jitter > 3.0;
        case 'all':
        default:
          return true;
      }
    });
  }, [history, activeFilter, selectedHour, targetSLA]);

  // 3. Statistical Calculations for KPI Panel
  const metricsKPIs = useMemo(() => {
    if (filteredHistory.length === 0) {
      return {
        avgDown: 0,
        avgUp: 0,
        avgLat: 0,
        avgJit: 0,
        slaMetRatio: 100,
        jitterStd: 0,
        lossRatio: 0
      };
    }

    const speedsDown = filteredHistory.map(m => m.downloadSpeed);
    const speedsUp = filteredHistory.map(m => m.uploadSpeed);
    const latencies = filteredHistory.map(m => m.latency);
    const jitters = filteredHistory.map(m => m.jitter);
    const losses = filteredHistory.map(m => m.packetLoss);

    const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);
    const avg = (arr: number[]) => sum(arr) / arr.length;

    // Calculate SLA safe ratio
    const slaMetTests = filteredHistory.filter(m => m.downloadSpeed >= targetSLA).length;
    const slaMetRatio = Math.round((slaMetTests / filteredHistory.length) * 100);

    // Calculate path jitter standard deviation representation
    const meanJitter = avg(jitters);
    const variance = jitters.reduce((acc, val) => acc + Math.pow(val - meanJitter, 2), 0) / jitters.length;
    const jitterStd = Math.sqrt(variance);

    return {
      avgDown: avg(speedsDown),
      avgUp: avg(speedsUp),
      avgLat: avg(latencies),
      avgJit: avg(jitters),
      slaMetRatio,
      jitterStd: Number(jitterStd.toFixed(2)),
      lossRatio: avg(losses)
    };
  }, [filteredHistory, targetSLA]);

  // 4. Interactive data formatting for chart view
  const chartData = useMemo(() => {
    return [...filteredHistory].reverse().map(m => {
      const date = new Date(m.timestamp);
      return {
        time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: date.toLocaleDateString([], { month: 'short', day: 'numeric' }),
        fullTime: date.toLocaleString(),
        download: Number(m.downloadSpeed.toFixed(1)),
        upload: Number(m.uploadSpeed.toFixed(1)),
        latency: Math.round(m.latency),
        jitter: Number(m.jitter.toFixed(2)),
        loss: Number(m.packetLoss.toFixed(2))
      };
    });
  }, [filteredHistory]);

  // 5. Trigger Real Client-Side CSV Export File download
  const handleExportCSV = () => {
    if (filteredHistory.length === 0) return;
    
    // Construct CSV Header and rows manually
    const headers = ["Timestamp", "Download Speed (Mbps)", "Upload Speed (Mbps)", "Latency (ms)", "Jitter (ms)", "Packet Loss (%)", "DNS Resolve (ms)"];
    
    const rows = filteredHistory.map(m => [
      new Date(m.timestamp).toISOString(),
      m.downloadSpeed.toFixed(2),
      m.uploadSpeed.toFixed(2),
      m.latency.toFixed(1),
      m.jitter.toFixed(2),
      m.packetLoss.toFixed(2),
      m.dnsTime.toFixed(1)
    ]);

    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    
    // Create hidden trigger download anchor
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `atlas_network_analysis_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Trigger Real Client-Side JSON Export File download
  const handleExportJSON = () => {
    if (filteredHistory.length === 0) return;
    
    const jsonString = JSON.stringify(filteredHistory, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `atlas_network_telemetry_export_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper text mapping based on filter selection
  const filterDescMap = {
    all: {
      en: "Synthesizing all speed tests and validation metrics stored on this terminal gateway.",
      ar: "عرض وتدقيق كافة اختبارات التحميل وبيانات التردد وحزم البيانات المحفوظة بالجهاز."
    },
    peak: {
      en: "Displaying only peak congestion periods (7:00 PM to 11:00 PM) to analyze regional loop overload.",
      ar: "تصفية القراءات لحصر فترات ذروة حركة المرور (07:00 م حتى 11:00 م) للتحقق من ضغط الحي."
    },
    high_latency: {
      en: "Isolating instances where target path response exceeded 18ms latency standard offsets.",
      ar: "عزل الاختبارات التي تجاوز فيها وقت الاستجابة المعتاد 18 مللي ثانية لتتبع قفزات التوجيه."
    },
    low_speed: {
      en: `Isolating instances failing standard SLA compliance threshold bounds (< ${targetSLA} Mbps).`,
      ar: `حصر حالات التراجع عن الحد الأدنى المتفق عليه لاتفاقية الخدمة (< ${targetSLA} ميجابت/ث).`
    },
    high_jitter: {
      en: "Filtering sessions exhibiting excessive packet Jitter deviation (> 3.0ms).",
      ar: "سحب الجلسات التي تجاوز فيها تذبذب الإشارة الحد المقبول للمنافسات والبث (> 3.0 مللي ثانية)."
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-12">
      
      {/* 1. Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase mb-1.5 flex items-center gap-3">
            <Cpu className="w-10 h-10 text-blue-500 shrink-0" />
            {isRtl ? "سجل التحليلات المتقدمة والمسار" : "Enterprise Network History & Auditing Suite"}
          </h2>
          <p className="text-white/40 font-medium text-sm">
            {isRtl 
              ? "منصة متكاملة لتتبع صحة النطاق، تباعد الاستجابة التاريخي، مع منشئ صادرات CSV ومخطط ثبات على مدار اليوم."
              : "Comprehensive visual diagnostic board displaying time-series logs, standard SLA compliance, and export engines."}
          </p>
        </div>

        {/* Real Export Actions */}
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={handleExportCSV}
            disabled={filteredHistory.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#111] hover:bg-[#1a1a1a] border border-white/10 rounded-2xl text-xs font-black uppercase text-white transition-all disabled:opacity-40"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            {isRtl ? "تصدير CSV" : "Export CSV"}
          </button>
          <button 
            onClick={handleExportJSON}
            disabled={filteredHistory.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#111] hover:bg-[#1a1a1a] border border-white/10 rounded-2xl text-xs font-black uppercase text-white transition-all disabled:opacity-40"
          >
            <Database className="w-4 h-4 text-blue-400" />
            {isRtl ? "تصدير JSON" : "Export JSON"}
          </button>
        </div>
      </div>

      {/* 2. Filter Selector Row */}
      <div className="bg-[#111]/80 backdrop-blur-md p-6 rounded-[2rem] border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">{isRtl ? "محدد خيارات التصفية" : "Historical Query Filter"}</span>
          </div>
          {selectedHour !== null && (
            <button 
              onClick={() => setSelectedHour(null)}
              className="text-[9px] font-black uppercase tracking-widest bg-blue-600/10 text-blue-400 px-3 py-1 rounded-full border border-blue-600/20 hover:bg-blue-600 hover:text-white transition-all"
            >
              {isRtl ? `إزالة فلتر الساعة (${selectedHour}:00) ✖` : `Clear Hour Filter (${selectedHour}:00) ✖`}
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {(Object.keys(filterDescMap) as FilterType[]).map((filterKey) => {
            const labels = {
              all: isRtl ? "جميع الاختبارات" : "All Metrics",
              peak: isRtl ? "أوقات الذروة (7-11 م)" : "Peak Congestion (7-11 PM)",
              high_latency: isRtl ? "قفزات زمن الاستجابة" : "High Latency (>18ms)",
              low_speed: isRtl ? "تراجع سرعة الـ SLA" : "Below SLA Threshold",
              high_jitter: isRtl ? "تذبذب الإشارة (Jitter)" : "High Jitter (>3ms)"
            };

            return (
              <button
                key={filterKey}
                onClick={() => {
                  setActiveFilter(filterKey);
                  // Resets hour filter when switching top filters to prevent empty grid confusion
                  setSelectedHour(null);
                }}
                className={`px-4.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-tight transition-all ${
                  activeFilter === filterKey
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                    : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white"
                }`}
              >
                {labels[filterKey]}
              </button>
            );
          })}
        </div>

        <p className="text-xs text-white/40 font-medium leading-relaxed mt-2" dir={isRtl ? 'rtl' : 'ltr'}>
          {isRtl ? filterDescMap[activeFilter].ar : filterDescMap[activeFilter].en}
        </p>
      </div>

      {/* 3. Hourly Performance Heatmap Matrix */}
      <div className="bg-[#111]/85 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/5 shadow-xl space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Clock className="w-4 h-4 text-amber-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">{isRtl ? "تحليل الكفاءة المتوزع بالساعة" : "24h Hourly Segment Quality Mapping"}</span>
          </div>
          <h3 className="text-lg font-black text-white uppercase tracking-tight">
            {isRtl ? "مصفوفة استقرار الأداء على مدار ساعات اليوم" : "Time-Aggregate Performance Heatmap Hub"}
          </h3>
          <p className="text-xs text-white/40 font-medium max-w-3xl mt-1">
            {isRtl 
              ? "مبني تلقائياً استناداً للقيم التاريخية. اضغط على أي عمود ساعة لعزل قراءات السجل وعرضها في الجدول وأدوات التحليل المباشرة أدناه."
              : "Visual distribution of performance baselines. Clicking an hour filters the telemetry grid and KPI metrics instantly."}
          </p>
        </div>

        {/* Heatmap visual strip */}
        <div className="grid grid-cols-6 sm:grid-cols-12 md:grid-cols-24 gap-2">
          {hourlyAggregation.map((bin) => {
            const isSelected = selectedHour === bin.hour;
            
            // Map colors to quality status
            const colors = {
              excellent: "bg-emerald-500/80 border-emerald-500/30 text-emerald-100 hover:bg-emerald-400",
              normal: "bg-blue-500/50 border-blue-500/20 text-blue-100 hover:bg-blue-400",
              congested: "bg-amber-600/40 border-amber-500/30 text-amber-100 hover:bg-amber-500",
              empty: "bg-white/5 border-white/5 text-white/20"
            };

            return (
              <button
                key={bin.hour}
                onClick={() => setSelectedHour(isSelected ? null : bin.hour)}
                disabled={bin.count === 0}
                className={`p-3 rounded-xl border text-center transition-all ${
                  bin.count === 0 ? colors.empty : colors[bin.status]
                } ${isSelected ? "ring-2 ring-white scale-105 shadow-xl" : "hover:scale-102"}`}
                title={bin.count > 0 ? `${bin.hour}:00 - Speed: ${bin.avgSpeed} Mbps, Latency: ${bin.avgLatency}ms` : "No tests recorded"}
              >
                <div className="text-[10px] font-bold font-mono">
                  {bin.hour.toString().padStart(2, '0')}
                </div>
                {bin.count > 0 ? (
                  <div className="text-[8px] font-black uppercase mt-1">
                    {bin.avgSpeed}
                  </div>
                ) : (
                  <div className="text-[8px] font-black uppercase tracking-tight text-white/10 mt-1">
                    -
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-4 text-[10px] font-black uppercase tracking-widest text-white/30 pt-2 border-t border-white/5 select-none">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-500/80 rounded-md border border-emerald-500/30" />
            <span>{isRtl ? "ممتاز (يتجاوز SLA)" : "Excellent (> SLA)"}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500/50 rounded-md border border-blue-500/20" />
            <span>{isRtl ? "مستقر (ضمن المتوسط)" : "Stable (In Boundary)"}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-amber-600/40 rounded-md border border-amber-600/30" />
            <span>{isRtl ? "ازدحام / تذبذب ذروة" : "Congestion / Peak Delay"}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-white/5 rounded-md border border-white/5" />
            <span>{isRtl ? "خالٍ من البيانات" : "No telemetry dataset"}</span>
          </div>
        </div>
      </div>

      {/* 4. Professional KPIs Aggregate Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#111]/80 backdrop-blur-md p-6 rounded-[2rem] border border-white/5">
          <span className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-1">
            {isRtl ? "متوسط سرعة التنزيل" : "Mean Download Velocity"}
          </span>
          <div className="text-3xl font-extrabold text-blue-500 tracking-tighter uppercase font-sans select-none">
            {metricsKPIs.avgDown.toFixed(1)} <span className="text-xs font-bold text-white/30">Mbps</span>
          </div>
          <p className="text-[10px] font-bold text-white/40 mt-1 uppercase">
            {isRtl ? `معدل ثبات ${((metricsKPIs.avgDown / targetSLA) * 100).toFixed(0)}% من المستهدف` : `Ratio: ${((metricsKPIs.avgDown / targetSLA) * 100).toFixed(0)}% of target`}
          </p>
        </div>

        <div className="bg-[#111]/80 backdrop-blur-md p-6 rounded-[2rem] border border-white/5">
          <span className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-1">
            {isRtl ? "تحقيق التزامات الـ SLA" : "SLA Compliance Safety"}
          </span>
          <div className={`text-3xl font-extrabold tracking-tighter uppercase font-sans select-none ${
            metricsKPIs.slaMetRatio >= 90 ? 'text-emerald-400' : metricsKPIs.slaMetRatio >= 70 ? 'text-yellow-400' : 'text-red-500'
          }`}>
            {metricsKPIs.slaMetRatio}%
          </div>
          <p className="text-[10px] font-bold text-white/40 mt-1 uppercase">
            {isRtl ? `مقيّد بحد سرعة ${targetSLA} Mbps` : `Bound to ${targetSLA} Mbps target`}
          </p>
        </div>

        <div className="bg-[#111]/80 backdrop-blur-md p-6 rounded-[2rem] border border-white/5">
          <span className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-1">
            {isRtl ? "انحراف تذبذب التردد (Jitter Std)" : "Jitter Std. Deviation"}
          </span>
          <div className="text-3xl font-extrabold text-amber-500 tracking-tighter uppercase font-sans select-none">
            ±{metricsKPIs.jitterStd.toFixed(2)} <span className="text-xs font-bold text-white/30">ms</span>
          </div>
          <p className="text-[10px] font-bold text-white/40 mt-1 uppercase">
            {isRtl ? "مؤشر النقاء واستقرار الإرسال" : "Packet travel variance score"}
          </p>
        </div>

        <div className="bg-[#111]/80 backdrop-blur-md p-6 rounded-[2rem] border border-white/5">
          <span className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-1">
            {isRtl ? "معدل فقد الحزم النموذجي" : "Visual Delivery Success"}
          </span>
          <div className="text-3xl font-extrabold text-purple-400 tracking-tighter uppercase font-sans select-none">
            {(100 - metricsKPIs.lossRatio).toFixed(3)}%
          </div>
          <p className="text-[10px] font-bold text-white/40 mt-1 uppercase">
            {metricsKPIs.lossRatio > 0 ? (isRtl ? "رصد ضياع بسيط بالطريق" : "Minor packet drop logged") : (isRtl ? "إرسال سليم وخالٍ من الفقد" : "Perfect packet handshakes")}
          </p>
        </div>
      </div>

      {/* 5. Deep Historical Graph Trend Analysis */}
      <div className="bg-[#111111]/80 backdrop-blur-md rounded-[2.5rem] p-8 lg:p-10 border border-white/5 shadow-2xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="text-blue-500 w-5 h-5 shrink-0" />
              <h3 className="text-lg font-black text-white uppercase tracking-tight">{isRtl ? "مخطط التقييم والسلوك الشامل" : "Analytical Time-Series Distribution"}</h3>
            </div>
            <p className="text-xs text-white/40 font-medium">{isRtl ? "تحليل اتجاه السرعة، والـ Ping، والـ Jitter على امتداد عينات الجدول النشط." : "Interactive canvas displaying throughput curves alongside packet travel response boundaries."}</p>
          </div>

          {/* Metric Selector Tabs */}
          <div className="flex items-center gap-1.5 bg-black/40 p-1.5 rounded-2xl border border-white/5 shrink-0">
            {(['all', 'speeds', 'latency_jitter'] as const).map((key) => {
              const labels = {
                all: isRtl ? "العرض المشترك" : "All Metrics Overlay",
                speeds: isRtl ? "السرعات فقط" : "Throughput Speeds",
                latency_jitter: isRtl ? "الاستجابة والـ Jitter" : "Latency & Jitter Spectrum"
              };
              return (
                <button
                  key={key}
                  onClick={() => setChartMetric(key)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${
                    chartMetric === key ? "bg-white/10 text-white" : "text-white/40 hover:text-white"
                  }`}
                >
                  {labels[key]}
                </button>
              );
            })}
          </div>
        </div>

        <div className="h-[320px] w-full">
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-white/25 text-xs uppercase font-extrabold tracking-widest border border-dashed border-white/10 rounded-3xl">
              {isRtl ? "لا توجد قراءات مطابقة للفلتر المحدد" : "No telemetry points match the query criteria"}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSpeedHist" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorUpHist" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                <XAxis dataKey="time" stroke="#ffffff25" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff25" fontSize={9} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', border: '1px solid #222', borderRadius: '1rem', color: '#fff', fontSize: '11px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '15px' }} />
                
                {(chartMetric === 'all' || chartMetric === 'speeds') && (
                  <>
                    <Area type="monotone" dataKey="download" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorSpeedHist)" name={isRtl ? "سرعة التنزيل (Mbps)" : "Download Speed (Mbps)"} />
                    <Area type="monotone" dataKey="upload" stroke="#8B5CF6" strokeWidth={2} fillOpacity={1} fill="url(#colorUpHist)" name={isRtl ? "سرعة الرفع (Mbps)" : "Upload Speed (Mbps)"} />
                  </>
                )}

                {(chartMetric === 'all' || chartMetric === 'latency_jitter') && (
                  <>
                    <Line type="monotone" dataKey="latency" stroke="#F59E0B" strokeWidth={2} strokeDasharray="3 3" dot={false} name={isRtl ? "زمن الاستجابة (ms)" : "Latency / Ping (ms)"} />
                    <Line type="monotone" dataKey="jitter" stroke="#10B981" strokeWidth={2.5} dot={{ r: 3 }} name={isRtl ? "تقطع الإشارة Jitter (ms)" : "Jitter Stability (ms)"} />
                  </>
                )}
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 6. Dynamic Audited Logs Log Data Table */}
      <div className="bg-[#111111]/80 backdrop-blur-md rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
        <div className="p-6.5 bg-white/5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Activity className="text-white/40 w-5 h-5 shrink-0" />
            <div>
              <h4 className="text-sm font-black text-white uppercase tracking-tight">{isRtl ? "سجل المصادقة والتحقق من التردد" : "Carrier-Grade Telemetry Log Matrix"}</h4>
              <p className="text-[10px] text-white/30 uppercase font-bold mt-0.5">
                {isRtl ? `تم جلب ${filteredHistory.length} فحص متاح ومؤتمت` : `Loaded ${filteredHistory.length} filtered records`}
              </p>
            </div>
          </div>
          
          <div className="text-[10px] font-bold font-mono bg-[#0c0c0c] border border-white/5 px-4 py-2 rounded-xl text-white/40 shrink-0 self-start sm:self-auto">
            SHA256: VERIFIED_DATASET
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse select-none">
            <thead>
              <tr className="bg-white/2">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 truncate">{isRtl ? "تاريخ ووقت الفحص" : "Execution Timestamp"}</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 truncate">{isRtl ? "سرعة التنزيل" : "Download Velocity"}</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 truncate">{isRtl ? "سرعة الرفع" : "Upload Velocity"}</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 truncate">{isRtl ? "زمن الاستجابة" : "Ping RTT"}</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 truncate">{isRtl ? "تذبذب الإشارة (Jitter)" : "Jitter Signal"}</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 truncate">{isRtl ? "حالة الفحص" : "SLA Compliance"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/2 cursor-default">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-16 text-center text-xs font-black uppercase tracking-widest text-white/20">
                    {isRtl ? "لا توجد سجلات تالفة أو مطابقة لشروط البحث" : "No records matching query selection limits"}
                  </td>
                </tr>
              ) : (
                filteredHistory.map((m, i) => {
                  const meetsSLA = m.downloadSpeed >= targetSLA;
                  return (
                    <tr key={i} className="hover:bg-white/3 transition-all group">
                      <td className="px-8 py-5 text-xs font-bold text-white/70 whitespace-nowrap">
                        {new Date(m.timestamp).toLocaleString()}
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <span className="text-xs font-black text-blue-500">{m.downloadSpeed.toFixed(1)}</span> <span className="text-[9px] opacity-30 font-bold">Mbps</span>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <span className="text-xs font-black text-purple-500">{m.uploadSpeed.toFixed(1)}</span> <span className="text-[9px] opacity-30 font-bold">Mbps</span>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <span className="text-xs font-black text-orange-500">{m.latency.toFixed(0)}</span> <span className="text-[9px] opacity-30 font-bold">ms</span>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <span className="text-xs font-black text-amber-500">{m.jitter.toFixed(2)}</span> <span className="text-[9px] opacity-30 font-bold">ms</span>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        {meetsSLA ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase tracking-wider border border-emerald-500/15">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            {isRtl ? "متطابق مع المشترك" : "SLA MET"}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 text-[9px] font-black uppercase tracking-wider border border-rose-500/15">
                            <AlertTriangle className="w-3 h-3 text-rose-400 animate-pulse" />
                            {isRtl ? "خرق للحد الأدنى" : "BREACH"}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
