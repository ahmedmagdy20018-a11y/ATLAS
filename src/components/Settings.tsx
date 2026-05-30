/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Globe, 
  Moon, 
  Sun, 
  Bell, 
  Database, 
  Shield, 
  Save,
  Download,
  Trash2
} from 'lucide-react';
import { UserSettings } from '../types';

interface SettingsProps {
  settings: UserSettings;
  onSave: (settings: UserSettings) => void;
  onClearData: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ settings, onSave, onClearData }) => {
  const { t, i18n } = useTranslation();
  const [localSettings, setLocalSettings] = React.useState<UserSettings>(settings);

  const handleLanguageChange = (lang: 'en' | 'ar') => {
    i18n.changeLanguage(lang);
    setLocalSettings({ ...localSettings, language: lang });
  };

  return (
    <div className="max-w-4xl space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-4xl font-black text-white tracking-tighter uppercase mb-1">
          {t('common.settings')}
        </h2>
        <p className="text-white/40 font-medium">Configure ATLAS system behavior and preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* General Settings */}
        <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 space-y-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center">
              <Globe className="text-blue-500 w-5 h-5" />
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-tighter">{t('settings.language')}</h3>
          </div>

          <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5">
            <button 
              onClick={() => handleLanguageChange('en')}
              className={`flex-1 py-3 rounded-xl font-bold transition-all ${i18n.language === 'en' ? 'bg-blue-600 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
            >
              English
            </button>
            <button 
              onClick={() => handleLanguageChange('ar')}
              className={`flex-1 py-3 rounded-xl font-bold transition-all ${i18n.language === 'ar' ? 'bg-blue-600 text-white shadow-lg font-arabic' : 'text-white/40 hover:text-white font-arabic'}`}
            >
              العربية
            </button>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between group cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-purple-600/20 rounded-xl flex items-center justify-center">
                  <Moon className="text-purple-500 w-5 h-5" />
                </div>
                <span className="font-bold text-white/80">{t('settings.theme')}</span>
              </div>
              <input 
                type="checkbox" 
                checked={localSettings.theme === 'dark'}
                onChange={(e) => setLocalSettings({...localSettings, theme: e.target.checked ? 'dark' : 'light'})}
                className="w-6 h-6 border-2 border-white/10 rounded bg-transparent checked:bg-blue-600 transition-all cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Monitoring Settings */}
        <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 space-y-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 bg-orange-600/20 rounded-xl flex items-center justify-center">
              <Shield className="text-orange-500 w-5 h-5" />
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-tighter">Monitoring</h3>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-white/40">{t('settings.slaThreshold')}</label>
              <input 
                type="number" 
                value={localSettings.slaThreshold}
                onChange={(e) => setLocalSettings({...localSettings, slaThreshold: Number(e.target.value)})}
                className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 font-bold text-white focus:outline-none focus:border-blue-600 transition-all"
              />
            </div>

            <label className="flex items-center justify-between group cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-green-600/20 rounded-xl flex items-center justify-center">
                  <Bell className="text-green-500 w-5 h-5" />
                </div>
                <span className="font-bold text-white/80">{t('settings.notifications')}</span>
              </div>
              <input 
                type="checkbox" 
                checked={localSettings.notifications}
                onChange={(e) => setLocalSettings({...localSettings, notifications: e.target.checked})}
                className="w-6 h-6 border-2 border-white/10 rounded bg-transparent checked:bg-blue-600 transition-all cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-red-600/5 p-8 rounded-[2.5rem] border border-red-600/10 space-y-8 md:col-span-2">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-red-600/20 rounded-xl flex items-center justify-center">
              <Database className="text-red-500 w-5 h-5" />
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-tighter">Data Management</h3>
          </div>

          <div className="flex flex-wrap gap-4">
            <button className="flex items-center gap-2 px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold transition-all">
              <Download className="w-5 h-5" />
              Export All Data (JSON)
            </button>
            <button 
              onClick={onClearData}
              className="flex items-center gap-2 px-6 py-4 bg-red-600/10 hover:bg-red-600/20 border border-red-600/20 rounded-2xl font-bold text-red-500 transition-all"
            >
              <Trash2 className="w-5 h-5" />
              Wipe System Data
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end p-2">
        <button 
          onClick={() => onSave(localSettings)}
          className="flex items-center gap-3 px-12 py-5 bg-blue-600 hover:bg-blue-500 shadow-2xl shadow-blue-600/40 rounded-3xl font-black text-lg tracking-widest transition-all hover:scale-105 active:scale-95"
        >
          <Save className="w-6 h-6" />
          {t('settings.save')}
        </button>
      </div>
    </div>
  );
};
