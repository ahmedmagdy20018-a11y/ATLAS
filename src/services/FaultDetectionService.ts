/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Fault, NetworkMetrics, Severity } from '../types';
import { FAULT_LIBRARY } from '../constants';

export class FaultDetectionService {
  detectFaults(metrics: NetworkMetrics, history: NetworkMetrics[], slaThreshold: number): Fault[] {
    const detected: Fault[] = [];
    const timestamp = Date.now();

    // SPD_001: Speed Below SLA
    if (metrics.downloadSpeed < slaThreshold) {
      const template = FAULT_LIBRARY.find(f => f.code === 'SPD_001');
      if (template) {
        detected.push({
          ...template as Fault,
          id: `SPD_001_${timestamp}`,
          timestamp,
          status: 'ACTIVE'
        });
      }
    }

    // SPD_002: Sudden Speed Drop (>60%)
    if (history.length > 5) {
      const avgRecent = history.slice(0, 5).reduce((a, b) => a + b.downloadSpeed, 0) / 5;
      if (metrics.downloadSpeed < avgRecent * 0.4) {
        const template = FAULT_LIBRARY.find(f => f.code === 'SPD_002');
        if (template) {
          detected.push({
            ...template as Fault,
            id: `SPD_002_${timestamp}`,
            timestamp,
            status: 'ACTIVE'
          });
        }
      }
    }

    // LAT_001: High Latency (>150ms)
    if (metrics.latency > 150) {
      const template = FAULT_LIBRARY.find(f => f.code === 'LAT_001');
      if (template) {
        detected.push({
          ...template as Fault,
          id: `LAT_001_${timestamp}`,
          timestamp,
          status: 'ACTIVE'
        });
      }
    }

    // LAT_003: Packet Loss Cascade (>3%)
    if (metrics.packetLoss > 3) {
      const template = FAULT_LIBRARY.find(f => f.code === 'LAT_003');
      if (template) {
        detected.push({
          ...template as Fault,
          id: `LAT_003_${timestamp}`,
          timestamp,
          status: 'ACTIVE'
        });
      }
    }

    return detected;
  }

  calculateHealthScore(metrics: NetworkMetrics, slaThreshold: number): number {
    const speedScore = Math.min(30, (metrics.downloadSpeed / slaThreshold) * 30);
    const latencyScore = Math.min(25, (100 / Math.max(metrics.latency, 1)) * 2.5);
    const stabilityScore = Math.max(0, Math.min(20, (100 - metrics.jitter * 2 - metrics.packetLoss * 10) * 0.2));
    const dnsScore = Math.min(15, (100 / Math.max(metrics.dnsTime || 20, 1)) * 1.5);
    const reliabilityScore = 10; // Default placeholder for reliability

    return Math.round(speedScore + latencyScore + stabilityScore + dnsScore + reliabilityScore);
  }

  getHealthCategory(score: number): { en: string; ar: string; color: string } {
    if (score >= 90) return { en: 'EXCELLENT', ar: 'ممتاز', color: '#10B981' };
    if (score >= 75) return { en: 'GOOD', ar: 'جيد', color: '#34D399' };
    if (score >= 60) return { en: 'FAIR', ar: 'مقبول', color: '#FBBF24' };
    if (score >= 40) return { en: 'POOR', ar: 'ضعيف', color: '#F59E0B' };
    return { en: 'CRITICAL', ar: 'حرج', color: '#EF4444' };
  }
}

export const faultDetectionService = new FaultDetectionService();
