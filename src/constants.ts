/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Severity, Fault } from './types';

export const FAULT_LIBRARY: Partial<Fault>[] = [
  // A - SPEED & BANDWIDTH FAULTS
  { code: 'SPD_001', nameEn: 'Speed Below SLA Threshold', nameAr: 'السرعة أقل من حد الخدمة', severity: Severity.HIGH, category: 'SPEED', descriptionEn: 'Download speed below user-defined SLA.', descriptionAr: 'سرعة التحميل أقل من الحد المخطط له.', recommendedActionEn: 'Contact ISP or check plan limits.', recommendedActionAr: 'اتصل بمزود الخدمة أو افحص حدود الباقة.' },
  { code: 'SPD_002', nameEn: 'Sudden Speed Drop', nameAr: 'انخفاض مفاجئ في السرعة', severity: Severity.CRITICAL, category: 'SPEED', descriptionEn: 'Speed dropped over 60% suddenly.', descriptionAr: 'انقطاع أو انخفاض مفاجئ بنسبة تزيد عن 60%.', recommendedActionEn: 'Check for congestion or outage.', recommendedActionAr: 'تحقق من وجود ازدحام أو عطل عام.' },
  { code: 'SPD_012', nameEn: 'Complete Zero Throughput', nameAr: 'انقطاع كامل في البيانات', severity: Severity.EMERGENCY, category: 'SPEED', descriptionEn: 'No data transmission detected.', descriptionAr: 'لا يوجد انتقال للبيانات نهائياً.', recommendedActionEn: 'Check physical link and ISP status.', recommendedActionAr: 'افحص التوصيلات الفيزيائية وحالة مزود الخدمة.' },
  
  // B - LATENCY & QUALITY FAULTS
  { code: 'LAT_001', nameEn: 'Critical Latency Spike', nameAr: 'ارتفاع حاد في زمن الاستجابة', severity: Severity.HIGH, category: 'LATENCY', descriptionEn: 'Latency over 150ms sustained.', descriptionAr: 'تجاوز زمن الاستجابة 150ms بشكل مستمر.', recommendedActionEn: 'Reduce high-bandwidth usage.', recommendedActionAr: 'قلل من استهلاك النطاق الترددي العالي.' },
  { code: 'LAT_002', nameEn: 'Jitter Spike - VoIP Risk', nameAr: 'تقطع الإشارة - خطر على المكالمات', severity: Severity.HIGH, category: 'LATENCY', descriptionEn: 'Jitter over 30ms detected.', descriptionAr: 'تجاوز تقطع الإشارة 30ms.', recommendedActionEn: 'Use wired connection if possible.', recommendedActionAr: 'استخدم الاتصال السلكي إذا كان متاحاً.' },
  { code: 'LAT_003', nameEn: 'Packet Loss Cascade', nameAr: 'انهيار في الحزم المفقودة', severity: Severity.CRITICAL, category: 'LATENCY', descriptionEn: 'Packet loss > 3% detected.', descriptionAr: 'فقدان الحزم يتجاوز 3%.', recommendedActionEn: 'Check for network equipment failure.', recommendedActionAr: 'افحص عطل أجهزة الشبكة.' },
  
  // C - SECURITY THREATS
  { code: 'SEC_001', nameEn: 'Possible ARP Spoofing', nameAr: 'اشتباه انتحال ARP', severity: Severity.EMERGENCY, category: 'SECURITY', descriptionEn: 'Gateway response anomaly detected.', descriptionAr: 'تم اكتشاف شذوذ في استجابة البوابة.', recommendedActionEn: 'Scan authorized devices immediately.', recommendedActionAr: 'افحص الأجهزة المصرح لها فوراً.' },
  { code: 'SEC_002', nameEn: 'DNS Hijacking Suspected', nameAr: 'اشتباه في اختطاف DNS', severity: Severity.EMERGENCY, category: 'SECURITY', descriptionEn: 'DNS responses differ across providers.', descriptionAr: 'استجابات DNS تختلف بين المزودين.', recommendedActionEn: 'Switch to a secure DNS provider.', recommendedActionAr: 'انتقل إلى مزود DNS آمن.' },
  
  // D - HARDWARE
  { code: 'HW_001', nameEn: 'Weak WiFi Signal', nameAr: 'إشارة واي فاي ضعيفة', severity: Severity.MODERATE, category: 'HARDWARE', descriptionEn: 'Estimated signal strength is low.', descriptionAr: 'قوة الإشارة المقدرة منخفضة.', recommendedActionEn: 'Move closer to the router.', recommendedActionAr: 'اقترب أكثر من الموجه.' },
  
  // E - ISP
  { code: 'ISP_001', nameEn: 'ISP Service Outage', nameAr: 'انقطاع خدمة مزود الإنترنت', severity: Severity.EMERGENCY, category: 'ISP', descriptionEn: 'Complete ISP level failure detected.', descriptionAr: 'تم اكتشاف فشل كامل على مستوى مزود الخدمة.', recommendedActionEn: 'Check local area outage reports.', recommendedActionAr: 'تحقق من تقارير الانقطاع في منطقتك.' },

  // F - PREDICTIVE
  { code: 'PRD_001', nameEn: 'Router Failure Predicted', nameAr: 'توقع فشل الموجه قريباً', severity: Severity.WARNING, category: 'PREDICTIVE', descriptionEn: 'Degradation pattern suggests HW failure.', descriptionAr: 'نمط التدهور يشير إلى فشل الأجهزة قريباً.', recommendedActionEn: 'Backup settings and prepare replacement.', recommendedActionAr: 'احفظ نسخة احتياطية واستعد للاستبدال.' }
];
