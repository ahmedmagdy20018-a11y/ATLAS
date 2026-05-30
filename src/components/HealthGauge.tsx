/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';

interface HealthGaugeProps {
  score: number;
  color: string;
}

export const HealthGauge: React.FC<HealthGaugeProps> = ({ score, color }) => {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-48 h-48">
      <svg className="w-full h-full transform -rotate-90">
        {/* Background Track */}
        <circle
          cx="96"
          cy="96"
          r={radius}
          stroke="currentColor"
          strokeWidth="12"
          fill="transparent"
          className="text-white/5"
        />
        {/* Progress bar */}
        <motion.circle
          cx="96"
          cy="96"
          r={radius}
          stroke={color}
          strokeWidth="12"
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-5xl font-black text-white tracking-tighter"
        >
          {score}
        </motion.span>
        <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mt-1">Health Score</span>
      </div>
    </div>
  );
};
