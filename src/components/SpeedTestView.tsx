/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Speedometer } from './Speedometer';
import { NetworkMetrics } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { History, Activity, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';

interface SpeedTestViewProps {
  isTesting: boolean;
  currentDl: number;
  currentUl: number;
  onRunTest: () => void;
  results: NetworkMetrics | null;
}

export const SpeedTestView: React.FC<SpeedTestViewProps> = ({
  isTesting,
  currentDl,
  currentUl,
  onRunTest,
  results
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-12 py-10">
      <div className="text-center">
        <h2 className="text-5xl font-black text-white tracking-tighter uppercase mb-4">
            {isTesting ? t('speedTest.testing') : t('common.speedTest')}
        </h2>
        <p className="text-white/40 font-bold uppercase tracking-[0.2em]">{isTesting ? 'Optimizing measurements...' : 'Run a full network diagnostic'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <Speedometer 
            value={currentDl} 
            max={200} 
            label={t('common.download')} 
            color="#3B82F6" 
        />
        <Speedometer 
            value={currentUl} 
            max={50} 
            label={t('common.upload')} 
            color="#8B5CF6" 
            unit="Mbps"
        />
      </div>

      <div className="flex gap-8 mt-8">
        <button
          disabled={isTesting}
          onClick={onRunTest}
          className="px-16 py-6 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-full text-white font-black text-lg tracking-widest shadow-2xl shadow-blue-600/40 transition-all hover:scale-105 active:scale-95 flex items-center gap-4"
        >
          {isTesting && (
              <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          )}
          {isTesting ? t('speedTest.testing') : t('speedTest.start')}
        </button>
      </div>

      <AnimatePresence>
        {results && !isTesting && (
            <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl mt-12"
            >
                {[
                    { label: t('common.latency'), value: results.latency.toFixed(0), unit: 'ms', icon: History, color: 'text-orange-500' },
                    { label: t('common.jitter'), value: results.jitter.toFixed(1), unit: 'ms', icon: Activity, color: 'text-purple-500' },
                    { label: 'Reliability', value: '100', unit: '%', icon: ShieldCheck, color: 'text-green-500' },
                ].map((item, i) => (
                    <div key={i} className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 text-center">
                        <div className={cn("mx-auto w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4", item.color)}>
                            <item.icon className="w-6 h-6" />
                        </div>
                        <p className="text-4xl font-black text-white">{item.value}</p>
                        <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mt-1">{item.label} • {item.unit}</p>
                    </div>
                ))}
            </motion.div>
        )}
      </AnimatePresence>

      {!results && !isTesting && (
          <p className="text-white/20 text-xs font-bold uppercase tracking-widest mt-10">
            Click START to begin full diagnostic scan
          </p>
      )}
    </div>
  );
};
