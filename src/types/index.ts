/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum Severity {
  LOW = 1,
  INFO = 3,
  MODERATE = 4,
  WARNING = 5,
  HIGH = 7,
  CRITICAL = 9,
  EMERGENCY = 10,
}

export interface NetworkMetrics {
  downloadSpeed: number; // Mbps
  uploadSpeed: number; // Mbps
  latency: number; // ms
  jitter: number; // ms
  packetLoss: number; // %
  dnsTime: number; // ms
  timestamp: number;
}

export interface ISPInfo {
  ip: string;
  isp: string;
  city: string;
  country: string;
  asn: string;
  org: string;
}

export interface Fault {
  id: string;
  code: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  severity: Severity;
  category: 'SPEED' | 'LATENCY' | 'HARDWARE' | 'SECURITY' | 'ISP' | 'PREDICTIVE';
  timestamp: number;
  status: 'ACTIVE' | 'RESOLVED';
  recommendedActionEn: string;
  recommendedActionAr: string;
}

export interface HealthScore {
  total: number;
  speed: number;
  latency: number;
  stability: number;
  dns: number;
  reliability: number;
  categoryEn: string;
  categoryAr: string;
  color: string;
}

export interface Baseline {
  hourOfDay: number;
  metric: string;
  mean: number;
  stdDev: number;
  count: number;
}

export interface UserSettings {
  language: 'en' | 'ar';
  theme: 'dark' | 'light';
  autoTest: boolean;
  testInterval: number; // minutes or days
  testIntervalUnit?: 'minutes' | 'days';
  slaThreshold: number; // Mbps
  autoDownloadReport: boolean;
  reportInterval: number; // minutes
  notifications: boolean;
}
