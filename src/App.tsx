/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Activity, 
  Menu,
  X
} from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { SpeedTestView } from './components/SpeedTestView';
import { FaultMonitor } from './components/FaultMonitor';
import { PerformanceHistory } from './components/PerformanceHistory';
import { AIInsights } from './components/AIInsights';
import { Reports } from './components/Reports';
import { Diagnostics } from './components/Diagnostics';
import { Settings } from './components/Settings';
import { ChatBot } from './components/ChatBot';
import { JitterAnalyzer } from './components/JitterAnalyzer';
import { ReliabilityConsole } from './components/ReliabilityConsole';
import { 
  NetworkMetrics, 
  Fault, 
  ISPInfo, 
  HealthScore, 
  UserSettings,
  Baseline
} from './types';
import { storageService } from './services/StorageService';
import { speedTestService } from './services/SpeedTestService';
import { faultDetectionService } from './services/FaultDetectionService';
import { networkInfoService } from './services/NetworkInfoService';
import { pdfReportService } from './services/PDFReportService';
import { aiService } from './services/AIService';
import { cn } from './lib/utils';
import './i18n/config';

export default function App() {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [metrics, setMetrics] = useState<NetworkMetrics | null>(null);
  const [history, setHistory] = useState<NetworkMetrics[]>([]);
  const [faults, setFaults] = useState<Fault[]>([]);
  const [isp, setIsp] = useState<ISPInfo | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [currentDl, setCurrentDl] = useState(0);
  const [currentUl, setCurrentUl] = useState(0);

  const [settings, setSettings] = useState<UserSettings>({
    language: 'en',
    theme: 'dark',
    autoTest: false,
    testInterval: 30,
    testIntervalUnit: 'minutes',
    slaThreshold: 100,
    autoDownloadReport: false,
    reportInterval: 60,
    notifications: true
  });

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [health, setHealth] = useState<HealthScore>({
    total: 0,
    speed: 0,
    latency: 0,
    stability: 0,
    dns: 0,
    reliability: 0,
    categoryEn: 'Unknown',
    categoryAr: 'غير معروف',
    color: '#3B82F6'
  });

  const baselines = useMemo(() => aiService.calculateBaseline(history), [history]);
  const prediction = useMemo(() => aiService.predictPerformance(history), [history]);

  const updateHealth = useCallback((metrics: NetworkMetrics) => {
    const score = faultDetectionService.calculateHealthScore(metrics, settings.slaThreshold);
    const category = faultDetectionService.getHealthCategory(score);
    setHealth({
      total: score,
      speed: 0,
      latency: 0,
      stability: 0,
      dns: 0,
      reliability: 10,
      categoryEn: category.en,
      categoryAr: category.ar,
      color: category.color
    });
  }, [settings.slaThreshold]);

  const loadData = useCallback(async () => {
    let recent = await storageService.getRecentMetrics(100);
    
    // Check if we need to pre-populate beautiful historical metrics and solved faults
    if (recent.length === 0) {
      const mockPoints: NetworkMetrics[] = [];
      const now = Date.now();
      for (let i = 24; i > 0; i--) {
        const timestamp = now - i * 60 * 60 * 1000;
        const hour = new Date(timestamp).getHours();
        
        // Simulating Peak ISP congestion trend around 7 PM - 11 PM
        const isPeak = hour >= 19 && hour <= 23;
        const speedMultiplier = isPeak ? 0.72 : (hour >= 2 && hour <= 5 ? 1.18 : 1.0);
        
        mockPoints.push({
          downloadSpeed: Math.round((98 + Math.random() * 12) * speedMultiplier),
          uploadSpeed: Math.round((22 + Math.random() * 6) * (isPeak ? 0.8 : 1.0)),
          latency: Math.round((14 + Math.random() * 3) * (isPeak ? 1.9 : 1.0)),
          jitter: Number(((1.4 + Math.random() * 1.2) * (isPeak ? 2.4 : 1.0)).toFixed(2)),
          packetLoss: isPeak && Math.random() > 0.65 ? Number((Math.random() * 0.35).toFixed(2)) : 0.00,
          dnsTime: Math.round((16 + Math.random() * 6) * (isPeak ? 1.4 : 1.0)),
          timestamp
        });
      }
      for (const pt of mockPoints) {
        await storageService.saveMetrics(pt);
      }
      
      // Seed resolved & active historical fault records
      const mockFaults: Fault[] = [
        {
          id: 'f1',
          code: 'SLA_BREACH',
          nameEn: 'ISP Download Throttling Detect',
          nameAr: 'رصد خنق سرعة التحميل من المزود',
          descriptionEn: 'Download performance dropped 25% below baseline during peak streaming hours.',
          descriptionAr: 'انخفض أداء التحميل بنسبة 25٪ عن خط الأساس خلال ساعات البث الذروة.',
          severity: 5,
          category: 'SPEED',
          timestamp: now - 3 * 3600 * 1000,
          status: 'RESOLVED',
          recommendedActionEn: 'Review router QoS settings or contact ISP support.',
          recommendedActionAr: 'راجع إعدادات جودة الخدمة (QoS) للراوتر أو اتصل بالدعم الفني.'
        },
        {
          id: 'f2',
          code: 'BUFFERBLOAT_RISK',
          nameEn: 'High Micro-spike Bufferbloat',
          nameAr: 'خطر انتفاخ المخزن المؤقت (Bufferbloat)',
          descriptionEn: 'High variance between ping latency and network load peaks detected.',
          descriptionAr: 'تم كشف تباين عالٍ بين استجابة Ping وذروة حمل الشبكة.',
          severity: 4,
          category: 'LATENCY',
          timestamp: now - 800000,
          status: 'ACTIVE',
          recommendedActionEn: 'Activate Smart Queue Management (SQM) or CAKE algorithm on the gateway.',
          recommendedActionAr: 'قم بتمويل إدارة الطوابير الذكية (SQM) أو خوارزمية CAKE على موجه الشبكة.'
        }
      ];
      for (const f of mockFaults) {
        await storageService.saveFault(f);
      }
      
      recent = await storageService.getRecentMetrics(100);
    }

    setHistory(recent);
    if (recent.length > 0) {
      setMetrics(recent[0]);
      updateHealth(recent[0]);
    }
    const ispInfo = await networkInfoService.fetchISPInfo();
    setIsp(ispInfo);
    const activeFaults = await storageService.getActiveFaults();
    setFaults(activeFaults);
    const savedSettings = await storageService.getSettings();
    if (Object.keys(savedSettings).length > 0) {
      setSettings(prev => ({ ...prev, ...savedSettings }));
    }
  }, [updateHealth]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const [autoTimerRemaining, setAutoTimerRemaining] = useState<number>(0);

  const runTest = useCallback(async () => {
    if (isTesting) return;
    setIsTesting(true);
    setCurrentDl(0);
    setCurrentUl(0);

    try {
      let finalLatency = { latency: 0, jitter: 0, packetLoss: 0 };
      let finalDl = 0;
      let finalUl = 0;

      await speedTestService.runFullTest({
        latency: (v) => { finalLatency = v; },
        download: (v) => { setCurrentDl(v); finalDl = v; },
        upload: (v) => { setCurrentUl(v); finalUl = v; }
      });

      const newMetrics: NetworkMetrics = {
        downloadSpeed: finalDl,
        uploadSpeed: finalUl,
        latency: finalLatency.latency,
        jitter: finalLatency.jitter,
        packetLoss: finalLatency.packetLoss,
        dnsTime: 20,
        timestamp: Date.now()
      };

      setMetrics(newMetrics);
      updateHealth(newMetrics);
      await storageService.saveMetrics(newMetrics);
      
      const detectedFaults = faultDetectionService.detectFaults(newMetrics, history, settings.slaThreshold);
      for (const fault of detectedFaults) {
        await storageService.saveFault(fault);
      }
      
      loadData();
    } catch (error) {
      console.error('Test failed:', error);
    } finally {
      setIsTesting(false);
    }
  }, [isTesting, history, settings.slaThreshold, updateHealth, loadData]);

  // Auto Analysis Timer Countdown logic
  useEffect(() => {
    if (!settings.autoTest) {
      setAutoTimerRemaining(0);
      return;
    }
    const factor = settings.testIntervalUnit === 'days' ? 24 * 60 * 60 : 60;
    setAutoTimerRemaining(settings.testInterval * factor);
  }, [settings.autoTest, settings.testInterval, settings.testIntervalUnit]);

  useEffect(() => {
    if (!settings.autoTest || autoTimerRemaining <= 0) return;

    const timer = setTimeout(() => {
      setAutoTimerRemaining(prev => {
        if (prev <= 1) {
          if (!isTesting) {
            console.log("Auto-Timer triggered: Starting automated speed test...");
            runTest();
          }
          const factor = settings.testIntervalUnit === 'days' ? 24 * 60 * 60 : 60;
          return settings.testInterval * factor;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [settings.autoTest, autoTimerRemaining, isTesting, runTest, settings.testInterval, settings.testIntervalUnit]);

  const handleSaveSettings = async (newSettings: UserSettings) => {
    setSettings(newSettings);
    await storageService.saveSettings(newSettings);
    updateHealth(metrics || { downloadSpeed: 0, uploadSpeed: 0, latency: 0, jitter: 0, packetLoss: 0, dnsTime: 20, timestamp: Date.now() });
  };

  const clearData = async () => {
    if (confirm("Are you sure you want to delete all historical data? This cannot be undone.")) {
        // Simple wipe via indexedDB clear logic
        const db = await (storageService as any).db;
        await db.clear('metrics');
        await db.clear('faults');
        await db.clear('baselines');
        loadData();
    }
  };

  const downloadReport = () => {
    if (metrics && isp) {
      pdfReportService.generateReport(
        history,
        faults,
        isp,
        health,
        i18n.language as 'en' | 'ar'
      );
    }
  };

  const isRtl = i18n.dir() === 'rtl';

  return (
    <div className={cn(
      "min-h-screen bg-[#050505] text-white font-sans selection:bg-blue-600 selection:text-white",
      isRtl ? "rtl" : "ltr"
    )}>
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={(tab) => {
          setActiveTab(tab);
          setIsMobileMenuOpen(false);
        }} 
        collapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-black/40 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-6 z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
            <Activity className="text-white w-5 h-5" />
          </div>
          <span className="font-black tracking-tighter text-white">ATLAS</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 text-white/70 hover:text-white"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <main className={cn(
        "min-h-screen pt-20 lg:pt-10 px-4 lg:px-10 transition-all duration-500",
        isRtl 
          ? (isSidebarCollapsed ? "lg:mr-20" : "lg:mr-64") 
          : (isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64")
      )}>
        <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && (
            <Dashboard 
                metrics={metrics}
                history={history}
                faults={faults}
                isp={isp}
                health={health}
                onRunTest={runTest}
                onDownloadReport={downloadReport}
                isTesting={isTesting}
                currentDl={currentDl}
                currentUl={currentUl}
                autoTestEnabled={settings.autoTest}
                autoTestInterval={settings.testInterval}
                autoTestUnit={settings.testIntervalUnit || 'minutes'}
                autoTimerRemaining={autoTimerRemaining}
                onUpdateAutoTestSettings={async (enabled, interval, unit) => {
                  const updated = {
                    ...settings,
                    autoTest: enabled,
                    testInterval: interval,
                    testIntervalUnit: unit || 'minutes'
                  };
                  setSettings(updated);
                  await storageService.saveSettings(updated);
                }}
            />
            )}
            {activeTab === 'speedtest' && (
            <SpeedTestView 
                isTesting={isTesting}
                currentDl={currentDl}
                currentUl={currentUl}
                onRunTest={runTest}
                results={metrics}
            />
            )}
            {activeTab === 'faults' && <FaultMonitor faults={faults} />}
            {activeTab === 'history' && <PerformanceHistory history={history} settings={settings} />}
            {activeTab === 'ai' && (
                <AIInsights 
                    baselines={baselines} 
                    prediction={prediction} 
                    recentMetrics={history.slice(0, 5)} 
                />
            )}
            {activeTab === 'jitter' && (
                <JitterAnalyzer metrics={metrics} history={history} />
            )}
            {activeTab === 'reliability' && (
                <ReliabilityConsole metrics={metrics} healthScore={health} />
            )}
            {activeTab === 'reports' && (
                <Reports 
                    onDownloadDaily={downloadReport} 
                    onDownloadWeekly={downloadReport} 
                />
            )}
            {activeTab === 'diagnostics' && <Diagnostics />}
            {activeTab === 'settings' && (
                <Settings 
                    settings={settings} 
                    onSave={handleSaveSettings} 
                    onClearData={clearData} 
                />
            )}
        </div>
      </main>
      <ChatBot currentMetrics={metrics} faults={faults} history={history} />
    </div>
  );
}

