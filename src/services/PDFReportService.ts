/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { NetworkMetrics, Fault, ISPInfo, HealthScore } from '../types';

export class PDFReportService {
  async generateReport(
    metrics: NetworkMetrics[], 
    faults: Fault[], 
    isp: ISPInfo, 
    health: HealthScore,
    lang: 'en' | 'ar'
  ) {
    const doc = new jsPDF();
    const title = lang === 'en' ? 'ATLAS Network Analysis Report' : 'تقرير أطلس لتحليل الشبكة';
    
    doc.setFontSize(22);
    doc.text(title, 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 105, 30, { align: 'center' });

    // Executive Summary
    doc.setFontSize(16);
    doc.text(lang === 'en' ? 'Executive Summary' : 'ملخص تنفيذي', 20, 45);
    doc.setFontSize(10);
    doc.text([
        `ISP: ${isp.isp}`,
        `IP Address: ${isp.ip}`,
        `Location: ${isp.city}, ${isp.country}`,
        `Health Score: ${health.total}/100 (${lang === 'en' ? health.categoryEn : health.categoryAr})`,
        `Download Avg: ${(metrics.reduce((a,b)=>a+b.downloadSpeed, 0) / (metrics.length || 1)).toFixed(2)} Mbps`,
        `Active Faults: ${faults.length}`
    ], 20, 55);

    // Faults Table
    const tableHeaders = lang === 'en' 
        ? [['Code', 'Fault Name', 'Severity', 'Time']] 
        : [['الكود', 'اسم العطل', 'الخطورة', 'الوقت']];
    
    const tableData = faults.map(f => [
        f.code,
        lang === 'en' ? f.nameEn : f.nameAr,
        f.severity.toString(),
        new Date(f.timestamp).toLocaleTimeString()
    ]);

    autoTable(doc, {
        startY: 90,
        head: tableHeaders,
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] }
    });

    const fileName = `ATLAS_Report_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.pdf`;
    doc.save(fileName);
  }
}

export const pdfReportService = new PDFReportService();
