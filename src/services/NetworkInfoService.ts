/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ISPInfo } from '../types';

export class NetworkInfoService {
  async fetchISPInfo(): Promise<ISPInfo> {
    const fetchWithTimeout = async (url: string, options: any = {}, timeout = 3000) => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);
      try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(id);
        return response;
      } catch (e) {
        clearTimeout(id);
        throw e;
      }
    };

    // Try primary provider (ipapi.co)
    try {
      const response = await fetchWithTimeout('https://ipapi.co/json/');
      if (response.ok) {
        const data = await response.json();
        return {
          ip: data.ip,
          isp: data.org || 'Unknown ISP',
          city: data.city || 'Unknown',
          country: data.country_name || 'Unknown',
          asn: data.asn || 'N/A',
          org: data.org || 'N/A'
        };
      }
    } catch (e) {
      console.warn('Primary ISP fetch failed:', e);
    }

    // Try secondary provider (ipinfo.io)
    try {
      const response = await fetchWithTimeout('https://ipinfo.io/json');
      if (response.ok) {
        const data = await response.json();
        return {
          ip: data.ip,
          isp: data.org || 'Unknown ISP',
          city: data.city || 'Unknown',
          country: data.country || 'Unknown',
          asn: data.org?.split(' ')[0] || 'N/A',
          org: data.org || 'N/A'
        };
      }
    } catch (e) {
      console.warn('Secondary ISP fetch failed:', e);
    }

    // Try icanhazip.com for just IP
    try {
      const response = await fetchWithTimeout('https://icanhazip.com');
      if (response.ok) {
        const ip = (await response.text()).trim();
        return {
          ip,
          isp: 'ISP detection failed',
          city: 'Unknown',
          country: 'Unknown',
          asn: 'N/A',
          org: 'N/A'
        };
      }
    } catch (e) {
      console.warn('Tertiary IP fetch failed:', e);
    }

    return {
      ip: '127.0.0.1',
      isp: 'Identity Masked/Offline',
      city: 'Secure Tunnel',
      country: 'N/A',
      asn: 'N/A',
      org: 'N/A'
    };
  }

  async getGatewayIP(): Promise<string> {
    // Note: True gateway detection is hard in browser without WebRTC trickery
    // We'll return a common one or attempt to find via WebRTC if needed.
    return '192.168.1.1'; 
  }
}

export const networkInfoService = new NetworkInfoService();
