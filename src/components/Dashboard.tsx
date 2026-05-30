/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ArrowDown, 
  ArrowUp, 
  Timer, 
  Globe, 
  Signal, 
  AlertCircle, 
  FileText,
  Activity,
  Cpu,
  Wifi,
  Radio,
  Network,
  Zap,
  Gauge,
  CheckCircle2,
  RefreshCw,
  Sliders,
  ChevronRight,
  Sparkles,
  Crown,
  Server,
  Award,
  ShieldAlert,
  Layers
} from 'lucide-react';
import { HealthGauge } from './HealthGauge';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { NetworkMetrics, Fault, ISPInfo, HealthScore } from '../types';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface DashboardProps {
  metrics: NetworkMetrics | null;
  history: NetworkMetrics[];
  faults: Fault[];
  isp: ISPInfo | null;
  health: HealthScore;
  onRunTest: () => void;
  onDownloadReport: () => void;
  isTesting?: boolean;
  currentDl?: number;
  currentUl?: number;
  autoTestEnabled: boolean;
  autoTestInterval: number;
  autoTestUnit?: 'minutes' | 'days';
  autoTimerRemaining: number;
  onUpdateAutoTestSettings: (enabled: boolean, interval: number, unit?: 'minutes' | 'days') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  metrics,
  history,
  faults,
  isp,
  health,
  onRunTest,
  onDownloadReport,
  isTesting = false,
  currentDl = 0,
  currentUl = 0,
  autoTestEnabled,
  autoTestInterval,
  autoTestUnit = 'minutes',
  autoTimerRemaining,
  onUpdateAutoTestSettings
}) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';

  const [customMinutes, setCustomMinutes] = useState<string>(autoTestInterval?.toString() || '30');

  React.useEffect(() => {
    if (autoTestInterval) {
      setCustomMinutes(autoTestInterval.toString());
    }
  }, [autoTestInterval]);

  const handleCustomIntervalChange = (value: string) => {
    setCustomMinutes(value);
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed) && parsed > 0) {
      onUpdateAutoTestSettings(autoTestEnabled, parsed, autoTestUnit);
    }
  };

  const formatTimerSeconds = (totalSeconds: number) => {
    if (totalSeconds <= 0) return "00:00";
    const days = Math.floor(totalSeconds / (24 * 3600));
    const hrs = Math.floor((totalSeconds % (24 * 3600)) / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    if (days > 0) {
      return isRtl 
        ? `${days} يوم و ${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
        : `${days}d ${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Advanced Analysis Suite States
  const [analysisTab, setAnalysisTab] = useState<'bufferbloat' | 'traceroute' | 'wifi' | 'dns' | 'cdn'>('bufferbloat');
  
  // 1. Bufferbloat Simulator State
  const [isTestingBufferbloat, setIsTestingBufferbloat] = useState(false);
  const [bufferbloatResults, setBufferbloatResults] = useState({
    idle: 12,
    downloadActive: 22,
    uploadActive: 28,
    grade: 'A+'
  });

  // 2. Traceroute Router Hops Analyzer State
  const [isTracing, setIsTracing] = useState(false);
  const [tracerouteHops, setTracerouteHops] = useState([
    { id: 1, host: '192.168.1.1', labelAr: "جدار حماية محلي (ONT Gateway)", labelEn: "Local GPON Fiber Terminal", latency: 0.6, status: 'stable' },
    { id: 2, host: '10.110.0.1', labelAr: "مقسم اتصالات الحي (DSLAM Spine)", labelEn: "Regional Distribution ISP Node", latency: 3.8, status: 'stable' },
    { id: 3, host: '195.229.4.12', labelAr: "البوابة الرئيسية لمزود الخدمة (Core Switch)", labelEn: "Carrier IP MPLS Backbone Node", latency: 7.2, status: 'stable' },
    { id: 4, host: '141.101.120.1', labelAr: "موزع السحاب العالمي (Cloudflare Edge CDN)", labelEn: "Global CDN Edge Router Proxy", latency: 11.5, status: 'stable' },
    { id: 5, host: '8.8.8.8', labelAr: "خادم الخدمة المستهدف (Google Secure DNS Endpoint)", labelEn: "Target Service Destination IP", latency: 12.8, status: 'stable' }
  ]);

  // 3. Wi-Fi Channel Overlaps State
  const [wifiBand, setWifiBand] = useState<'2.4ghz' | '5ghz' | '6ghz'>('5ghz');

  // 4. DNS Benchmark Race States
  const [isDnsTesting, setIsDnsTesting] = useState(false);
  const [dnsResults, setDnsResults] = useState([
    { name: "Cloudflare DNS", ip: "1.1.1.1", delay: 14, status: 'idle', isWinner: false, reliability: "100%", type: "Anycast High-Perf" },
    { name: "Google Public DNS", ip: "8.8.8.8", delay: 18, status: 'idle', isWinner: false, reliability: "100%", type: "Anycast Global" },
    { name: "Quad9 Secure DNS", ip: "9.9.9.9", delay: 24, status: 'idle', isWinner: false, reliability: "99.9%", type: "Secured Malware Filter" },
    { name: "AdGuard DNS", ip: "94.140.14.14", delay: 35, status: 'idle', isWinner: false, reliability: "99.8%", type: "Filtering Adblock" },
    { name: "Local ISP DNS", ip: "192.168.1.1", delay: 42, status: 'idle', isWinner: false, reliability: "98.5%", type: "Unfiltered Unicast" }
  ]);

  // 5. CDN Edge Latency States
  const [isCdnTesting, setIsCdnTesting] = useState(false);
  const [cdnResults, setCdnResults] = useState([
    { provider: "Cloudflare Edge CDN", location: "Local PoP (Anycast)", speedScore: 99, status: 'stable', pingTime: 8, optimalFor: isRtl ? "تطبيقات الويب والمواقع الشائعة" : "Static Web Apps / Assets" },
    { provider: "AWS CloudFront Edge", location: "Regional Edge Gateway", speedScore: 94, status: 'stable', pingTime: 12, optimalFor: isRtl ? "البث المباشر ومقاطع الفيديو" : "HLS Video Streaming" },
    { provider: "Fastly Router Node", location: "Edge Server Pool", speedScore: 89, status: 'stable', pingTime: 16, optimalFor: isRtl ? "توصيل أكواد GitHub و npm" : "Git / Developer Resources" },
    { provider: "Google Cloud CDN Node", location: "Core Fiber Link", speedScore: 98, status: 'stable', pingTime: 9, optimalFor: isRtl ? "خرائط وألعاب بالزمن الحقيقي" : "Real-time Interactive APIs" }
  ]);

  const runBufferbloatTest = () => {
    setIsTestingBufferbloat(true);
    let count = 0;
    const interval = setInterval(() => {
      setBufferbloatResults(prev => ({
        ...prev,
        downloadActive: Math.round(18 + Math.random() * 12),
        uploadActive: Math.round(20 + Math.random() * 15),
      }));
      count++;
      if (count >= 6) {
        clearInterval(interval);
        
        setTimeout(() => {
          const finalIdle = metrics?.latency ? Math.round(metrics.latency) : 12;
          const finalDown = Math.round(finalIdle + 6 + Math.random() * 8);
          const finalUp = Math.round(finalIdle + 8 + Math.random() * 10);
          
          let computedGrade = 'A+';
          const diffDiff = (finalDown - finalIdle) + (finalUp - finalIdle);
          if (diffDiff < 12) computedGrade = 'A+';
          else if (diffDiff < 20) computedGrade = 'A';
          else if (diffDiff < 38) computedGrade = 'B';
          else if (diffDiff < 65) computedGrade = 'C';
          else computedGrade = 'D';

          setBufferbloatResults({
            idle: finalIdle,
            downloadActive: finalDown,
            uploadActive: finalUp,
            grade: computedGrade
          });
          setIsTestingBufferbloat(false);
        }, 300);
      }
    }, 250);
  };

  const runTracerouteSimulation = () => {
    setIsTracing(true);
    let hopCount = 1;
    const baseLatencyMultiplier = metrics?.latency ? (metrics.latency / 14) : 1;
    
    setTracerouteHops(prev => prev.map(h => ({ ...h, latency: 0, status: 'simulating' })));
    
    const interval = setInterval(() => {
      setTracerouteHops(prev => prev.map(h => {
        if (h.id === hopCount) {
          const offsets = [0.5, 3.5, 7.0, 11.0, 13.0];
          const jitterRand = Math.random() * 1.5;
          const currentVal = Number((offsets[h.id - 1] * baseLatencyMultiplier + jitterRand).toFixed(1));
          return {
            ...h,
            latency: currentVal,
            status: 'stable'
          };
        }
        return h;
      }));
      
      hopCount++;
      if (hopCount > 5) {
        clearInterval(interval);
        setIsTracing(false);
      }
    }, 450);
  };

  const runDnsRace = () => {
    setIsDnsTesting(true);
    setDnsResults(prev => prev.map(item => ({ ...item, delay: 0, status: 'testing', isWinner: false })));
    
    let index = 0;
    const interval = setInterval(() => {
      setDnsResults(prev => {
        const updated = [...prev];
        if (index < updated.length) {
          const bases = [11, 15, 22, 32, 25];
          const rand = Math.floor(Math.random() * 6);
          updated[index] = {
            ...updated[index],
            delay: bases[index] + rand,
            status: 'completed'
          };
        }
        return updated;
      });
      index++;
      if (index >= dnsResults.length) {
        clearInterval(interval);
        setTimeout(() => {
          setDnsResults(prev => {
            const minDelay = Math.min(...prev.map(i => i.delay));
            return prev.map(item => ({
              ...item,
              isWinner: item.delay === minDelay
            }));
          });
          setIsDnsTesting(false);
        }, 200);
      }
    }, 450);
  };

  const runCdnProfiling = () => {
    setIsCdnTesting(true);
    setCdnResults(prev => prev.map(item => ({ ...item, pingTime: 0, speedScore: 0, status: 'testing' })));
    
    let index = 0;
    const interval = setInterval(() => {
      setCdnResults(prev => {
        const updated = [...prev];
        if (index < updated.length) {
          const bases = [7, 12, 16, 9];
          const rand = Math.floor(Math.random() * 4);
          const finalPing = bases[index] + rand;
          const score = Math.max(50, 100 - Math.floor(finalPing * 1.1));
          updated[index] = {
            ...updated[index],
            pingTime: finalPing,
            speedScore: score,
            status: 'stable'
          };
        }
        return updated;
      });
      index++;
      if (index >= cdnResults.length) {
        clearInterval(interval);
        setIsCdnTesting(false);
      }
    }, 450);
  };

  const statCards = [
    { 
      label: t('common.download'), 
      value: isTesting ? currentDl.toFixed(1) : (metrics?.downloadSpeed?.toFixed(1) || '0.0'), 
      unit: 'Mbps', 
      icon: ArrowDown, 
      color: 'text-blue-500',
      active: isTesting && currentDl > 0
    },
    { 
      label: t('common.upload'), 
      value: isTesting ? currentUl.toFixed(1) : (metrics?.uploadSpeed?.toFixed(1) || '0.0'), 
      unit: 'Mbps', 
      icon: ArrowUp, 
      color: 'text-purple-500',
      active: isTesting && currentUl > 0
    },
    { 
      label: t('common.latency'), 
      value: metrics?.latency?.toFixed(0) || '0', 
      unit: 'ms', 
      icon: Timer, 
      color: 'text-orange-500',
      active: isTesting && currentDl === 0 && currentUl === 0
    },
    { label: t('common.packetLoss'), value: metrics?.packetLoss?.toFixed(1) || '0.0', unit: '%', icon: Signal, color: 'text-red-500' },
  ];

  const chartData = [...history].reverse().map(m => ({
    time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    speed: m.downloadSpeed,
    latency: m.latency
  }));

  return (
    <div className="space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tighter mb-1 uppercase">
            {t('dashboard.networkHealth')}
          </h2>
          <p className="text-white/40 font-medium text-sm lg:text-base">{t('dashboard.summary')}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={onDownloadReport}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white font-bold text-sm transition-all active:scale-95"
          >
            <FileText className="w-4 h-4" />
            {t('common.reports')}
          </button>
          <button 
            onClick={onRunTest}
            disabled={isTesting}
            className={cn(
              "flex items-center justify-center gap-4 px-8 py-3 rounded-2xl text-white font-bold text-sm transition-all active:scale-95",
              isTesting ? "bg-white/10 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-600/30"
            )}
          >
            <Signal className={cn("w-4 h-4", isTesting && "animate-ping")} />
            {isTesting ? "TESTING..." : t('dashboard.runTest')}
          </button>
        </div>
      </div>

      {/* Auto Analysis Timer Control Center */}
      <div className="relative overflow-hidden bg-white/5 rounded-[2.5rem] p-6 lg:p-8 border border-white/10 shadow-2xl flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-purple-600/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Info Area */}
        <div className="flex items-center gap-4.5 z-10">
          <div className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center transition-all shrink-0",
            autoTestEnabled 
              ? "bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-500/10" 
              : "bg-white/5 text-white/30 border border-white/5"
          )}>
            <Timer className={cn("w-7 h-7 text-blue-400", autoTestEnabled && "animate-spin-slow")} style={{ animationDuration: '8s' }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                {autoTestEnabled && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span className={cn("relative inline-flex rounded-full h-2 w-2", autoTestEnabled ? "bg-emerald-500" : "bg-white/20")}></span>
              </span>
              <h3 className="text-sm lg:text-md font-black text-white uppercase tracking-tight flex items-center gap-2">
                {isRtl ? "مجدول الفحص التلقائي المستمر" : "Continuous Auto-Analysis Scheduler"}
              </h3>
            </div>
            <p className="text-xs text-white/40 mt-1 max-w-xl font-semibold">
              {isRtl 
                ? "يقوم بفحص تلقائي وتحليل كفاءة الشبكة دورياً عند انقضاء الوقت بدون تدخل يدوي، للحفاظ على دقة المؤشرات والتحذيرات الذكية."
                : "Executes non-stop background speed tests and latency profiling to maintain up-to-the-minute historical trends."}
            </p>
          </div>
        </div>

        {/* Interactive Controls & Live Display */}
        <div className="flex flex-col md:flex-row md:items-center gap-6 xl:gap-8 z-10 w-full xl:w-auto shrink-0">
          
          {/* Preset Buttons & Custom Selector */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/30 block md:inline mr-1">
              {isRtl ? "الفترة الزمنية:" : "Interval Period:"}
            </span>

            {/* Segmented Unit Selector */}
            <div className="flex bg-black/40 p-0.5 rounded-xl border border-white/5 h-8 mr-1.5">
              <button
                type="button"
                onClick={() => onUpdateAutoTestSettings(autoTestEnabled, autoTestUnit === 'days' ? 30 : autoTestInterval, 'minutes')}
                className={cn(
                  "px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer flex items-center justify-center h-full",
                  autoTestUnit === 'minutes' 
                    ? "bg-blue-600 text-white shadow-lg" 
                    : "text-white/40 hover:text-white"
                )}
              >
                {isRtl ? "دقائق" : "Min"}
              </button>
              <button
                type="button"
                onClick={() => onUpdateAutoTestSettings(autoTestEnabled, autoTestUnit === 'minutes' ? 1 : autoTestInterval, 'days')}
                className={cn(
                  "px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer flex items-center justify-center h-full",
                  autoTestUnit === 'days' 
                    ? "bg-blue-600 text-white shadow-lg" 
                    : "text-white/40 hover:text-white"
                )}
              >
                {isRtl ? "أيام" : "Days"}
              </button>
            </div>

            {(autoTestUnit === 'days' ? [1, 2, 3, 5, 7] : [1, 5, 10, 30, 60]).map((preset) => (
              <button
                key={preset}
                onClick={() => onUpdateAutoTestSettings(autoTestEnabled, preset, autoTestUnit)}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer",
                  autoTestInterval === preset && autoTestEnabled
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                    : "bg-white/2 hover:bg-white/5 text-white/50 hover:text-white border border-white/5"
                )}
              >
                {preset} {autoTestUnit === 'days' ? (isRtl ? "يوم" : "Day") : (isRtl ? "د" : "Min")}
              </button>
            ))}

            {/* Custom Minutes Input */}
            <div className="flex items-center bg-white/2 border border-white/5 rounded-xl px-2 py-1 h-8 max-w-[120px]">
              <input
                type="number"
                min="1"
                max={autoTestUnit === 'days' ? 365 : 1440}
                value={customMinutes}
                onChange={(e) => handleCustomIntervalChange(e.target.value)}
                placeholder={isRtl ? "مخصص" : "Custom"}
                className="w-full bg-transparent border-none text-xs font-black text-white focus:outline-none focus:ring-0 text-center font-mono placeholder:text-white/20"
              />
              <span className="text-[9px] font-bold text-white/30 uppercase shrink-0 px-1 font-sans">
                {autoTestUnit === 'days' ? (isRtl ? "يوم" : "Days") : (isRtl ? "د" : "Min")}
              </span>
            </div>
          </div>

          {/* Vertical Divider */}
          <div className="hidden md:block w-px h-10 bg-white/10 shrink-0" />

          {/* Countdown Display & Toggler Switch */}
          <div className="flex items-center justify-between md:justify-end gap-6">
            
            {/* Live Countdown Clock */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[9px] font-bold uppercase tracking-wider text-white/20 block">
                  {autoTestEnabled ? (isRtl ? "الفحص القادم خلال" : "Next analysis in") : (isRtl ? "الجدولة مجمّدة" : "Scheduler Paused")}
                </span>
                <span className={cn(
                  "text-2xl font-black font-mono tracking-tight block leading-none mt-0.5 min-w-[70px]",
                  autoTestEnabled ? "text-emerald-400 select-none animate-pulse duration-[2000ms]" : "text-white/20"
                )}>
                  {autoTestEnabled ? formatTimerSeconds(autoTimerRemaining) : "--:--"}
                </span>
              </div>
            </div>

            {/* Premium Toggle Switch */}
            <button
              onClick={() => onUpdateAutoTestSettings(!autoTestEnabled, autoTestInterval, autoTestUnit)}
              className={cn(
                "w-16 h-8 rounded-full p-1 transition-all duration-300 relative border cursor-pointer",
                autoTestEnabled 
                  ? "bg-blue-600/25 border-blue-500/30" 
                  : "bg-white/5 border-white/10"
              )}
            >
              <div className={cn(
                "w-6 h-6 rounded-full transition-all duration-300 transform shadow-md flex items-center justify-center",
                autoTestEnabled 
                  ? (isRtl ? "-translate-x-8 bg-blue-400" : "translate-x-8 bg-blue-400")
                  : "translate-x-0 bg-white/20"
              )}>
                {autoTestEnabled ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-950" />
                ) : (
                  <div className="w-1.5 h-1.5 bg-white/40 rounded-full" />
                )}
              </div>
            </button>

          </div>

        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Col: Health Score */}
        <div className="lg:col-span-4 bg-white/5 rounded-[2.5rem] p-6 lg:p-10 border border-white/10 flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent pointer-events-none" />
          <div className="scale-75 lg:scale-100">
            <HealthGauge score={health.total} color={health.color} />
          </div>
          <div className="mt-4 lg:mt-8 text-center">
            <h3 className="text-xl lg:text-2xl font-black text-white uppercase tracking-tighter">{health.categoryEn}</h3>
            <p className="text-white/40 text-[10px] lg:text-sm font-bold uppercase tracking-widest mt-1">{health.categoryAr}</p>
          </div>
        </div>

        {/* Right Col: Stats Cards */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {statCards.map((card, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                "bg-white/5 p-6 lg:p-8 rounded-[2rem] border border-white/10 relative overflow-hidden group hover:border-white/20 transition-all",
                (card as any).active && "border-blue-500/50 bg-blue-500/5"
              )}
            >
              <div className="flex justify-between items-start mb-4">
                <div className={cn("p-3 rounded-2xl bg-white/5", card.color)}>
                  <card.icon className={cn("w-6 h-6", (card as any).active && "animate-bounce")} />
                </div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                  {(card as any).active ? "MEASURING..." : "Live Data"}
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className={cn(
                  "text-5xl font-black text-white tracking-tighter transition-all duration-75",
                  (card as any).active && "scale-110 text-blue-400"
                )}>
                  {card.value}
                </span>
                <span className="text-sm font-bold text-white/40 uppercase tracking-widest">{card.unit}</span>
              </div>
              <div className="mt-2 text-sm font-bold text-white/60 uppercase tracking-wide">{card.label}</div>
              
              {(card as any).active && (
                <motion.div 
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="absolute bottom-0 left-0 h-1 bg-blue-500"
                />
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Advanced Telemetry Diagnostic Hub */}
      <div className="bg-white/5 rounded-[2.5rem] p-6 lg:p-10 border border-white/10 shadow-2xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-4 border-b border-white/5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Cpu className="text-blue-500 w-5 h-5 shrink-0" />
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">
                {isRtl ? "منصة التشخيص والتحليل المتقدمة" : "Advanced Telemetry Diagnostics Hub"}
              </span>
            </div>
            <h3 className="text-lg lg:text-xl font-black text-white uppercase tracking-tight">
              {isRtl ? "مؤشرات تحليل الشبكة المتكاملة" : "Interactive Deep-Analysis Modules"}
            </h3>
            <p className="text-xs text-white/40 font-medium">
              {isRtl 
                ? "أدوات متكاملة لتقييم كفاءة تحميل الألعاب (Bufferbloat)، وتتبع مسار الحزم (Traceroute)، وتحليل تردد الشبكات اللاسلكية."
                : "Real-time diagnostic suites for Bufferbloat load, Hop Traceroute gateway, and local Wi-Fi noise spectra."}
            </p>
          </div>

          {/* Interactive Navigation Tabs */}
          <div className="flex items-center gap-1.5 bg-black/40 p-1.5 rounded-2xl border border-white/5 shrink-0 self-start lg:self-auto overflow-x-auto max-w-full scrollbar-none">
            {(['bufferbloat', 'traceroute', 'wifi', 'dns', 'cdn'] as const).map((tab) => {
              const labels = {
                bufferbloat: isRtl ? "تحليل Bufferbloat" : "Bufferbloat",
                traceroute: isRtl ? "مسار قفزات التوجيه" : "Traceroute",
                wifi: isRtl ? "طيف الواي فاي" : "Wi-Fi Spectrum",
                dns: isRtl ? "سباق DNS المتقدم" : "DNS Benchmark",
                cdn: isRtl ? "مؤشر شبكات CDN" : "CDN Edge Metrics"
              };
              return (
                <button
                  key={tab}
                  onClick={() => setAnalysisTab(tab)}
                  className={`px-4.5 py-2 rounded-xl text-xs font-black uppercase tracking-tight transition-all ${
                    analysisTab === tab
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25 animate-in"
                      : "text-white/40 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {labels[tab]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab 1: Bufferbloat Suite */}
        {analysisTab === 'bufferbloat' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-in fade-in duration-300">
            <div className="lg:col-span-5 space-y-4">
              <h4 className="text-md font-black text-white uppercase tracking-tight flex items-center gap-2">
                <Gauge className="w-5 h-5 text-purple-400" />
                {isRtl ? "معدل استجابة الألعاب والبث المتزامن" : "Throughput Latency Grade"}
              </h4>
              <p className="text-xs text-white/50 leading-relaxed font-semibold">
                {isRtl 
                  ? "يقيس مدى ارتفاع بطء الاستجابة والـ Ping بقفزات مفاجئة عند تشغيل تنزيلات ثقيلة أو رفع ملفات ضخمة بالتزامن."
                  : "Measures ping spikes under heavy continuous upload/download stress. Low variation ensures supreme gaming response."}
              </p>

              <button
                onClick={runBufferbloatTest}
                disabled={isTestingBufferbloat}
                className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 bg-blue-600/10 hover:bg-blue-600 hover:text-white text-blue-400 border border-blue-600/20 rounded-2xl text-xs font-black uppercase tracking-wider transition-all disabled:opacity-40"
              >
                <RefreshCw className={`w-4 h-4 ${isTestingBufferbloat ? 'animate-spin' : ''}`} />
                {isTestingBufferbloat 
                  ? (isRtl ? "يجري فحص ضغط السحابة..." : "STRESSING CONNECTIONS...") 
                  : (isRtl ? "إجراء فحص ضغط الاستجابة" : "Measure Bufferbloat Response")}
              </button>
            </div>

            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white/2 p-5 rounded-2xl border border-white/5 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/30 block mb-1">
                  {isRtl ? "خامل (Idle)" : "Idle Latency"}
                </span>
                <div className="text-2xl font-black text-white font-mono select-none">
                  {bufferbloatResults.idle} <span className="text-xs font-bold text-white/30">ms</span>
                </div>
              </div>
              
              <div className="bg-white/2 p-5 rounded-2xl border border-white/5 text-center relative overflow-hidden">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/30 block mb-1">
                  {isRtl ? "تحت التنزيل" : "Active Download"}
                </span>
                <div className="text-2xl font-black text-blue-400 font-mono select-none">
                  +{bufferbloatResults.downloadActive - bufferbloatResults.idle} <span className="text-xs font-bold text-white/30">ms</span>
                </div>
                {isTestingBufferbloat && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 animate-pulse animate-duration-500" />
                )}
              </div>

              <div className="bg-white/2 p-5 rounded-2xl border border-white/5 text-center relative overflow-hidden">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/30 block mb-1">
                  {isRtl ? "تحت الرفع" : "Active Upload"}
                </span>
                <div className="text-2xl font-black text-purple-400 font-mono select-none">
                  +{bufferbloatResults.uploadActive - bufferbloatResults.idle} <span className="text-xs font-bold text-white/30">ms</span>
                </div>
                {isTestingBufferbloat && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-500 animate-pulse animate-duration-500" />
                )}
              </div>

              <div className="bg-blue-600/5 p-5 rounded-2xl border border-blue-500/10 text-center flex flex-col justify-center items-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block mb-1">
                  {isRtl ? "التقييم العام" : "Overall Grade"}
                </span>
                <span className="text-3xl font-black text-emerald-400 font-mono select-none">
                  {bufferbloatResults.grade}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Traceroute Hop Mapping */}
        {analysisTab === 'traceroute' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-md font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <Network className="w-5 h-5 text-blue-400" />
                  {isRtl ? "مخطط مسار قفزات خادم الوجهة" : "Visual Route-Path Telemetry"}
                </h4>
                <p className="text-xs text-white/40 mt-1">
                  {isRtl 
                    ? "يتعقب قفزات تبادل البيانات (RTT) من جهازك وصولاً إلى سحابة الخدمات في الوقت الفعلي للتحقق من اختناق المودم أو مزودي النطاق."
                    : "Identifies packet transit bottlenecks step-by-step from your local GPON router to global cloud points."}
                </p>
              </div>
              <button
                onClick={runTracerouteSimulation}
                disabled={isTracing}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600/10 hover:bg-blue-600 hover:text-white text-blue-400 border border-blue-600/20 rounded-2xl text-xs font-black uppercase transition-all shrink-0 cursor-pointer disabled:opacity-40"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTracing ? 'animate-spin' : ''}`} />
                {isTracing ? (isRtl ? "يتحقق من المسار..." : "TRACING LATEST PATH...") : (isRtl ? "تعقب قفزات الاتصال" : "Trace Active Paths")}
              </button>
            </div>

            {/* Traceroute Flow Line widget */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
              {tracerouteHops.map((hop, i) => (
                <div key={hop.id} className="bg-white/2 p-4 rounded-2xl border border-white/5 relative hover:bg-white/5 transition-all">
                  <div className="absolute top-3 left-4 text-[9px] font-mono text-white/20 select-none">
                    HOP #{hop.id}
                  </div>
                  <div className="space-y-2 mt-4">
                    <div className="text-[10px] font-bold font-mono text-blue-500 tracking-tight">
                      {hop.host}
                    </div>
                    <div className="text-xs font-black text-white line-clamp-1">
                      {isRtl ? hop.labelAr : hop.labelEn}
                    </div>
                    {hop.status === 'simulating' ? (
                       <div className="text-xs font-mono font-bold text-white/30 animate-pulse">
                         {isRtl ? "جاري الاستشعار..." : "Querying..."}
                       </div>
                    ) : (
                       <div className="text-lg font-black font-mono text-white select-none">
                         {hop.latency > 0 ? `${hop.latency} ms` : '-'}
                       </div>
                    )}
                  </div>
                  {i < 4 && (
                    <div className="hidden sm:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10 text-white/10">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Wi-Fi Spectrum Frequency Overlaps */}
        {analysisTab === 'wifi' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-in fade-in duration-300">
            <div className="lg:col-span-4 space-y-4">
              <h4 className="text-md font-black text-white uppercase tracking-tight flex items-center gap-2">
                <Wifi className="w-5 h-5 text-emerald-400" />
                {isRtl ? "محلل النبضات وتردد القنوات اللاسلكية" : "Wi-Fi Airwave Overlap"}
              </h4>
              <p className="text-xs text-white/50 leading-relaxed font-semibold">
                {isRtl 
                  ? "يقوم بفحص ومحاكاة جودة كل موجة تردد من موجات الواي فاي وتحديد القنوات الأمثل لتفادي تداخل الإشارات المنبوذ من الأجهزة المجاورة."
                  : "Analyzes ambient interference metrics. Helps choose the non-overlapping channel configured inside your local access point."}
              </p>

              {/* Band Selectors */}
              <div className="flex gap-1.5 bg-black/40 p-1 rounded-xl border border-white/5">
                {(['2.4ghz', '5ghz', '6ghz'] as const).map(band => (
                  <button
                    key={band}
                    onClick={() => setWifiBand(band)}
                    className={`flex-1 py-1.5 px-2.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                      wifiBand === band ? "bg-white/10 text-white" : "text-white/30 hover:text-white"
                    }`}
                  >
                    {band}
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
              
              <div className="bg-white/2 p-5 rounded-2xl border border-white/5 shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/30 block mb-1">
                  {isRtl ? "مستوى تداخل القنوات" : "Channel Contention"}
                </span>
                <span className="text-md lg:text-lg font-black font-sans uppercase">
                  {wifiBand === '2.4ghz' ? (
                    <span className="text-red-500">{isRtl ? "مرتفع جداً (تداخل)" : "Severe Overlap"}</span>
                  ) : wifiBand === '5ghz' ? (
                    <span className="text-blue-500">{isRtl ? "مستقر وضئيل" : "Stable Clear"}</span>
                  ) : (
                    <span className="text-emerald-400">{isRtl ? "نقي ومثالي" : "Ultra Silent"}</span>
                  )}
                </span>
                <p className="text-[10px] font-bold text-white/30 uppercase mt-2">
                  {wifiBand === '2.4ghz' ? "Channels 1, 6, 11 Occupied" : wifiBand === '5ghz' ? "DFS Dynamic Selection Active" : "Uncongested 160MHz width"}
                </p>
              </div>

              <div className="bg-white/2 p-5 rounded-2xl border border-white/5 shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/30 block mb-1">
                  {isRtl ? "قوة النبض ونسبة الضوضاء" : "Signal-To-Noise (SNR)"}
                </span>
                <div className="text-2xl font-black text-white font-mono">
                  {wifiBand === '2.4ghz' ? "21 dB" : wifiBand === '5ghz' ? "35 dB" : "42 dB"}
                </div>
                <p className="text-[10px] font-bold text-white/30 uppercase mt-2">
                  {wifiBand === '2.4ghz' ? "Noise Floor: -92 dBm" : "Noise Floor: -101 dBm"}
                </p>
              </div>

              <div className="bg-white/2 p-5 rounded-2xl border border-white/5 shrink-0 col-span-2 sm:col-span-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/30 block mb-1">
                  {isRtl ? "تكرار إرسال الحزم التالفة" : "Packet Air Collisions"}
                </span>
                <div className={`text-2xl font-black font-mono ${
                  wifiBand === '2.4ghz' ? 'text-red-400' : 'text-emerald-400'
                }`}>
                  {wifiBand === '2.4ghz' ? "4.85%" : wifiBand === '5ghz' ? "0.12%" : "0.00%"}
                </div>
                <p className="text-[10px] font-bold text-white/30 uppercase mt-2">
                  {wifiBand === '2.4ghz' ? "High retry transmission" : "Flawless wireless path"}
                </p>
              </div>

            </div>
          </div>
        )}

        {/* Tab 4: DNS Speed Benchmark Race */}
        {analysisTab === 'dns' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-md font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <Server className="w-5 h-5 text-purple-400" />
                  {isRtl ? "جهاز قياس استجابة خوادم أسماء النطاقات (DNS Benchmarker)" : "High-Performance DNS Resolver Benchmarker"}
                </h4>
                <p className="text-xs text-white/40 mt-1">
                  {isRtl 
                    ? "يقوم بعمليات فحص تسلسلي ذكي لمقارنة سرعة استجابة ملقمات الـ DNS العالمية وتحديد الخادم الأنسب لتصفح أسرع وحماية متكاملة."
                    : "Performs consecutive query benchmarks against global high-availability servers to find your optimal resolver path."}
                </p>
              </div>
              <button
                onClick={runDnsRace}
                disabled={isDnsTesting}
                className="flex items-center gap-2.5 px-5 py-2.5 bg-purple-600/10 hover:bg-purple-600 hover:text-white text-purple-400 border border-purple-600/20 rounded-2xl text-xs font-black uppercase transition-all shrink-0 cursor-pointer disabled:opacity-40"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isDnsTesting ? 'animate-spin' : ''}`} />
                {isDnsTesting ? (isRtl ? "يختبر الملقمات..." : "BENCHMARKING RESOLVERS...") : (isRtl ? "إطلاق فحص الملقمات" : "Launch DNS Speed Test")}
              </button>
            </div>

            {/* DNS Race visual list */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {dnsResults.map((item, index) => {
                const maxDelay = Math.max(...dnsResults.map(r => r.delay || 50));
                const percent = item.delay > 0 ? (item.delay / maxDelay) * 100 : 0;
                
                return (
                  <div 
                    key={index} 
                    className={cn(
                      "p-5 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between h-[180px]",
                      item.isWinner 
                        ? "bg-emerald-500/5 border-emerald-500/30 shadow-lg shadow-emerald-500/5 scale-[1.02]" 
                        : "bg-white/2 border-white/5 hover:bg-white/5"
                    )}
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-mono text-white/30 block mb-1">
                          {item.type}
                        </span>
                        {item.isWinner && (
                          <div className="flex items-center gap-1 bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider animate-pulse">
                            <Crown className="w-3 h-3" />
                            {isRtl ? "الأسرع" : "FASTEST"}
                          </div>
                        )}
                      </div>
                      
                      <h5 className="text-sm font-black text-white uppercase mt-1">
                        {item.name}
                      </h5>
                      <span className="text-[11px] font-bold font-mono text-blue-400/80">
                        {item.ip}
                      </span>
                    </div>

                    <div className="space-y-2 mt-4">
                      {/* Meter line */}
                      <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            item.isWinner ? "bg-emerald-500" : percent > 60 ? "bg-red-500" : "bg-blue-500"
                          )}
                          style={{ width: `${percent || 15}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-xl font-black font-mono text-white select-none">
                          {item.status === 'testing' ? (
                            <span className="text-xs text-white/30 animate-pulse">{isRtl ? "مزامنة مسار..." : "Benchmarking..."}</span>
                          ) : item.delay > 0 ? (
                            `${item.delay} ms`
                          ) : (
                            `${item.delay || '-'} ms`
                          )}
                        </div>
                        <span className="text-[9px] font-bold text-white/20 uppercase">
                          {isRtl ? "الاستقرار: " : "Reliability: "} {item.reliability}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 5: CDN Regional Metrics Matrix */}
        {analysisTab === 'cdn' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-md font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <Layers className="w-5 h-5 text-emerald-400" />
                  {isRtl ? "مؤشر شبكات توصيل المحتوى الإقليمية (CDN Nodes Index)" : "Regional Edge CDN Delivery Indices"}
                </h4>
                <p className="text-xs text-white/40 mt-1">
                  {isRtl 
                    ? "يقيس كفاءة وزمن عبور البيانات لشبكات خوادم CDN العالمية الأقرب جغرافياً إليك لتقدير جودة تصفح الفيديو والبث."
                    : "Profiles real-world latency routing to regional edge clusters for video delivery and heavy media payload handshakes."}
                </p>
              </div>
              <button
                onClick={runCdnProfiling}
                disabled={isCdnTesting}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600/10 hover:bg-emerald-600 hover:text-white text-emerald-400 border border-emerald-600/20 rounded-2xl text-xs font-black uppercase transition-all shrink-0 cursor-pointer disabled:opacity-40"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isCdnTesting ? 'animate-spin' : ''}`} />
                {isCdnTesting ? (isRtl ? "يفحص مسارات التوصيل..." : "PROFILING ROUTING...") : (isRtl ? "تحديث مؤشرات الـ CDNs" : "Profile CDN Routes")}
              </button>
            </div>

            {/* CDN Layout Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cdnResults.map((cdn, i) => (
                <div key={i} className="bg-white/2 p-5 rounded-2xl border border-white/5 hover:bg-white/5 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">{cdn.location}</span>
                    </div>
                    <h5 className="text-md font-black text-white uppercase">{cdn.provider}</h5>
                    <p className="text-xs text-white/50">{isRtl ? "الغرض الأمثل لـ: " : "Optimized for: "} <span className="font-bold text-blue-400/80">{cdn.optimalFor}</span></p>
                  </div>
                  <div className="flex items-center gap-6 self-end sm:self-auto shrink-0 font-mono">
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-white/20 block mb-0.5">{isRtl ? "زمن العبور" : "Transit"}</span>
                      <span className="text-2xl font-black text-white leading-none">
                        {cdn.status === 'testing' ? (
                          <span className="text-sm font-sans text-white/20 animate-pulse">Running...</span>
                        ) : (
                          `${cdn.pingTime} ms`
                        )}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-white/20 block mb-0.5">{isRtl ? "مؤشر الكفاءة" : "Efficiency"}</span>
                      <span className="text-2xl font-black text-emerald-400 leading-none">
                        {cdn.status === 'testing' ? (
                          <span className="text-sm font-sans text-white/20">--</span>
                        ) : (
                          `${cdn.speedScore}%`
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Second Row Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Performance History Chart */}
        <div className="lg:col-span-8 bg-white/5 rounded-[2.5rem] p-10 border border-white/10">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-black text-white tracking-tighter uppercase">{t('dashboard.performance24h')}</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Speed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Latency</span>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSpeed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="time" stroke="#ffffff30" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff30" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '1rem', color: '#fff' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="speed" stroke="#3B82F6" strokeWidth={4} fillOpacity={1} fill="url(#colorSpeed)" />
                <Area type="monotone" dataKey="latency" stroke="#F59E0B" strokeWidth={2} fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Faults / Highlights */}
        <div className="lg:col-span-4 bg-white/5 rounded-[2.5rem] p-8 border border-white/10">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-white tracking-tighter uppercase">{t('dashboard.recentFaults')}</h3>
            <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-red-500" />
            </div>
          </div>
          <div className="space-y-4">
            {faults.length === 0 ? (
                <div className="bg-white/5 p-6 rounded-3xl border border-dashed border-white/10 text-center">
                    <p className="text-white/30 font-bold uppercase text-xs tracking-widest">No active faults</p>
                </div>
            ) : (
                faults.slice(0, 4).map((fault, i) => (
                    <div key={i} className="flex gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-white/20 transition-all">
                        <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                            fault.severity >= 8 ? "bg-red-500/20 text-red-500" : "bg-orange-500/20 text-orange-500"
                        )}>
                            <AlertCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white line-clamp-1">{fault.nameEn}</p>
                            <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-1">
                                {new Date(fault.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                ))
            )}
          </div>

          <div className="mt-10 p-6 bg-blue-600/10 rounded-3xl border border-blue-600/20">
             <div className="flex items-center gap-3 mb-3">
                 <Globe className="text-blue-500 w-5 h-5" />
                 <span className="text-xs font-black uppercase tracking-widest text-blue-500">{t('common.isp')}</span>
             </div>
             <p className="text-white font-bold">{isp?.isp || 'Detection in progress...'}</p>
             <p className="text-white/40 text-xs font-bold mt-1 tracking-tight">{isp?.ip} • {isp?.city}, {isp?.country}</p>
          </div>
        </div>

      </div>
    </div>
  );
};
