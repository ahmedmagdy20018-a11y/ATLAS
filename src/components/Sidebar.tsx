/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, 
  Zap, 
  Activity, 
  History, 
  BrainCircuit, 
  FileDown, 
  ShieldCheck, 
  Settings,
  X,
  Waves,
  CheckCircle2
} from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  onTabChange, 
  collapsed, 
  onToggleCollapse,
  isMobileOpen,
  onMobileClose
}) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: t('common.dashboard') },
    { id: 'speedtest', icon: Zap, label: t('common.speedTest') },
    { id: 'faults', icon: Activity, label: t('common.faultMonitor') },
    { id: 'history', icon: History, label: t('common.history') },
    { id: 'ai', icon: BrainCircuit, label: t('common.aiInsights') },
    { id: 'jitter', icon: Waves, label: t('common.jitter') },
    { id: 'reliability', icon: CheckCircle2, label: t('common.reliability') },
    { id: 'reports', icon: FileDown, label: t('common.reports') },
    { id: 'diagnostics', icon: ShieldCheck, label: t('common.diagnostics') },
    { id: 'settings', icon: Settings, label: t('common.settings') },
  ];

  return (
    <div className={cn(
      "h-screen bg-black/90 lg:bg-black/40 backdrop-blur-xl border-white/10 flex flex-col p-6 fixed transition-all duration-500 z-50",
      collapsed ? "lg:w-20 lg:items-center lg:px-2" : "lg:w-64",
      isRtl 
        ? "right-0 border-l lg:translate-x-0" 
        : "left-0 border-r lg:translate-x-0",
      // Mobile logic
      "w-72 lg:w-auto",
      isMobileOpen 
        ? "translate-x-0" 
        : (isRtl ? "translate-x-full" : "-translate-x-full"),
      !isMobileOpen && "lg:translate-x-0"
    )}>
      <div className="flex items-center justify-between lg:justify-start gap-3 mb-10 px-2 leading-none">
        <div 
          onClick={onToggleCollapse}
          className={cn(
            "flex items-center gap-3 cursor-pointer group transition-all",
            collapsed && "lg:justify-center lg:px-0"
          )}
        >
          <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30 group-hover:scale-110 transition-all">
            <Activity className="text-white w-6 h-6" />
          </div>
          {!collapsed && <h1 className="text-xl font-black tracking-tighter text-white animate-in fade-in duration-500">ATLAS</h1>}
        </div>
        
        {/* Mobile Close Button */}
        <button 
          onClick={onMobileClose}
          className="lg:hidden p-2 text-white/50 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 w-full">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            title={collapsed ? item.label : undefined}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group relative overflow-hidden",
              collapsed && "justify-center px-0",
              activeTab === item.id 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                : "text-white/50 hover:bg-white/5 hover:text-white"
            )}
          >
            <item.icon className={cn("w-5 h-5 shrink-0", activeTab === item.id ? "text-white" : "text-white/5 group-hover:text-white")} />
            {!collapsed && <span className="font-semibold text-sm animate-in fade-in duration-500 truncate">{item.label}</span>}
            {activeTab === item.id && !collapsed && (
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
            )}
          </button>
        ))}
      </nav>

      <div className={cn(
        "mt-auto p-4 bg-white/5 rounded-3xl border border-white/5 transition-all text-center",
        collapsed && "w-12 h-12 p-0 flex items-center justify-center rounded-full"
      )}>
        {!collapsed ? (
          <>
            <div className="text-xs text-white/30 uppercase tracking-widest font-bold mb-2">Network Status</div>
            <div className="flex items-center gap-2 justify-center">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-white/80 tracking-tight">Connected</span>
            </div>
          </>
        ) : (
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Connected" />
        )}
      </div>
    </div>
  );
};
