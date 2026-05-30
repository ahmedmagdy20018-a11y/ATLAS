/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Terminal as TerminalIcon, 
  Search, 
  Globe, 
  MapPin, 
  ShieldCheck, 
  Unlink, 
  Radar,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { cn } from '../lib/utils';

export const Diagnostics: React.FC = () => {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<string[]>([
    "ATLAS System initialized...",
    "Ready for diagnostics."
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const runTool = (name: string) => {
    if (isRunning) return;
    setIsRunning(true);
    setLogs(prev => [...prev, `atlas@network:~$ launch --tool="${name.toLowerCase().replace(' ', '_')}"`]);
    
    // Simulate multi-step tool run
    const sequences = {
      "Ping Test": [
        "PING 8.8.8.8 (8.8.8.8) 56(84) bytes of data.",
        "64 bytes from 8.8.8.8: icmp_seq=1 ttl=117 time=14.2 ms",
        "64 bytes from 8.8.8.8: icmp_seq=2 ttl=117 time=13.8 ms",
        "64 bytes from 8.8.8.8: icmp_seq=3 ttl=117 time=15.1 ms",
        "--- 8.8.8.8 ping statistics ---",
        "3 packets transmitted, 3 received, 0% packet loss"
      ],
      "DNS Lookup": [
        "Resolving google.com via system default...",
        "ANSWER SECTION:",
        "google.com. 256 IN A 142.250.185.14",
        "google.com. 256 IN AAAA 2a00:1450:4009:823::200e",
        "Query completed in 42ms"
      ],
      "WHOIS Query": [
        "Querying WHOIS database for current IP origin...",
        "Organization: Google LLC",
        "ASN: AS15169",
        "Registry: ARIN",
        "Country: US"
      ],
      "Traceroute": [
        "traceroute to cloudflare.com (104.16.132.229), 30 hops max",
        " 1  192.168.1.1 (192.168.1.1)  1.231 ms",
        " 2  10.0.0.1 (10.0.0.1)  4.562 ms",
        " 3  172.67.143.12 (172.67.143.12)  12.441 ms",
        "Hop target reached successfully."
      ]
    };

    const targetSequence = (sequences as any)[name] || ["Running tool sequence...", "Completed."];
    
    targetSequence.forEach((line: string, i: number) => {
      setTimeout(() => {
        setLogs(prev => [...prev, line]);
        if (i === targetSequence.length - 1) setIsRunning(false);
      }, (i + 1) * 800);
    });
  };

  const tools = [
    { name: "Ping Test", icon: Radar, desc: "Real-time ICMP response tracking for any host.", status: "Stable" },
    { name: "DNS Lookup", icon: MapPin, desc: "Deep lookup of A, AAAA, MX, and TXT records.", status: "Stable" },
    { name: "WHOIS Query", icon: Globe, desc: "Check domain owner and registration details.", status: "Stable" },
    { name: "Traceroute", icon: Unlink, desc: "Hop-by-hop visual path analysis to destination.", status: "Optimizing" },
  ];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase mb-1">
            {t('common.diagnostics')}
          </h2>
          <p className="text-white/40 font-medium">Advanced low-level networking tools for troubleshooting.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-purple-600/10 rounded-full border border-purple-600/20">
          <TerminalIcon className="w-4 h-4 text-purple-500" />
          <span className="text-[10px] font-black uppercase tracking-widest text-purple-500">Expert Toolkit Enabled</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {tools.map((tool, i) => (
          <div key={i} className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 group hover:border-white/20 transition-all flex items-center gap-8">
            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center shrink-0 border border-white/5 group-hover:bg-blue-600/10 group-hover:border-blue-600/20 transition-all">
                <tool.icon className="w-10 h-10 text-white/50 group-hover:text-blue-500 transition-all" />
            </div>
            <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter">{tool.name}</h3>
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-20">{tool.status}</span>
                </div>
                <p className="text-sm font-medium text-white/40 leading-relaxed mb-4">{tool.desc}</p>
                <button 
                  onClick={() => runTool(tool.name)}
                  disabled={isRunning}
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 hover:text-blue-400 transition-all disabled:opacity-50"
                >
                    {isRunning ? "Running..." : "Launch Tool"} <ChevronRight className="w-3 h-3" />
                </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#0c0c0c] rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
        <div className="p-6 bg-white/5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <TerminalIcon className="text-white/40 w-5 h-5" />
                <span className="text-xs font-black uppercase tracking-widest text-white/40">ATLAS Terminal v1.0</span>
            </div>
            <div className="flex gap-2">
                {isRunning && <Loader2 className="w-4 h-4 text-blue-500 animate-spin mr-2" />}
                <div className="w-3 h-3 rounded-full bg-red-500 opacity-50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500 opacity-50" />
                <div className="w-3 h-3 rounded-full bg-green-500 opacity-50" />
            </div>
        </div>
        <div className="p-6 lg:p-10 font-mono text-sm space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
            {logs.map((log, i) => (
              <p key={i} className={cn(
                log.startsWith('atlas@network') ? "text-blue-500" : "text-white/60",
                "leading-relaxed"
              )}>
                {log}
              </p>
            ))}
            {isRunning && (
               <div className="flex items-center gap-2 text-white/40">
                  <span className="animate-pulse">●</span>
                  <span className="animate-pulse">●</span>
                  <span className="animate-pulse">●</span>
               </div>
            )}
            <div ref={terminalEndRef} />
        </div>
      </div>
    </div>
  );
};
