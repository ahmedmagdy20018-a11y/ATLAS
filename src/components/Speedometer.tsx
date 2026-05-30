/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';

interface SpeedometerProps {
  value: number;
  max?: number;
  label: string;
  unit?: string;
  color?: string;
}

export const Speedometer: React.FC<SpeedometerProps> = ({ 
  value, 
  max = 100, 
  label, 
  unit = 'Mbps',
  color = '#3B82F6' 
}) => {
  const rotation = (Math.min(value, max) / max) * 180 - 90;

  return (
    <div className="relative flex flex-col items-center justify-center w-64 h-64 overflow-hidden">
      {/* Outer Glow */}
      <div 
        className="absolute w-48 h-48 rounded-full opacity-20 blur-3xl transition-colors duration-500"
        style={{ backgroundColor: color }}
      />
      
      {/* Semi-circle dial */}
      <div className="relative w-full h-full flex items-center justify-center">
        <svg viewBox="0 0 200 120" className="w-full">
            <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-white/5"
                strokeLinecap="round"
            />
            <motion.path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke={color}
                strokeWidth="8"
                strokeDasharray="251.2"
                initial={{ strokeDashoffset: 251.2 }}
                animate={{ strokeDashoffset: 251.2 - (Math.min(value, max) / max) * 251.2 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                strokeLinecap="round"
            />
        </svg>

        {/* Value Display */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/3 flex flex-col items-center">
          <motion.span 
            key={value}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-6xl font-black text-white tracking-tighter"
          >
            {value.toFixed(1)}
          </motion.span>
          <span className="text-xs font-bold text-white/40 uppercase tracking-widest">{unit}</span>
        </div>
      </div>

      <div className="mt-4 text-sm font-bold text-white/60 uppercase tracking-[0.2em]">{label}</div>
    </div>
  );
};
