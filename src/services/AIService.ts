/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NetworkMetrics, Baseline } from '../types';

export class AIService {
  calculateBaseline(history: NetworkMetrics[]): Baseline[] {
    const groupedByHour: { [hour: number]: number[] } = {};
    history.forEach(m => {
        const hour = new Date(m.timestamp).getHours();
        if (!groupedByHour[hour]) groupedByHour[hour] = [];
        groupedByHour[hour].push(m.downloadSpeed);
    });

    const baselines: Baseline[] = [];
    for (let h = 0; h < 24; h++) {
        const samples = groupedByHour[h] || [];
        if (samples.length === 0) continue;
        
        const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
        const variance = samples.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / samples.length;
        
        baselines.push({
            hourOfDay: h,
            metric: 'downloadSpeed',
            mean,
            stdDev: Math.sqrt(variance),
            count: samples.length
        });
    }
    return baselines;
  }

  detectAnomalies(metrics: NetworkMetrics, baseline: Baseline | undefined): boolean {
    if (!baseline || baseline.count < 5) return false;
    const zScore = Math.abs(metrics.downloadSpeed - baseline.mean) / (baseline.stdDev || 1);
    return zScore > 2.5;
  }

  predictPerformance(history: NetworkMetrics[]): { nextHourSpeed: number; confidence: number } {
    if (history.length < 10) return { nextHourSpeed: 0, confidence: 0 };
    
    // Simple linear regression placeholder for prediction
    return { 
        nextHourSpeed: history[0].downloadSpeed * 0.98, // Predicted slight decay
        confidence: 75 
    };
  }
}

export const aiService = new AIService();
