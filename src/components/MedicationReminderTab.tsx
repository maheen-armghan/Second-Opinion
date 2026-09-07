'use client';

import React from 'react';
import { Calendar, Clock, Download, CheckCircle2, Pill, Bell, X, HeartHandshake } from 'lucide-react';
import { TRANSLATIONS, Language } from '@/lib/translations';
import { parseMedicinesToSchedule, generateIcsCalendarFile } from '@/lib/reminderParser';
import { PrescribedMedicineAnalysis } from '@/lib/interactionChecker';

interface MedicationReminderTabProps {
  isOpen: boolean;
  onClose: () => void;
  medicines: PrescribedMedicineAnalysis[];
  patientName?: string;
  lang: Language;
}

export const MedicationReminderTab: React.FC<MedicationReminderTabProps> = ({
  isOpen,
  onClose,
  medicines,
  patientName = 'Patient',
  lang,
}) => {
  const t = TRANSLATIONS[lang];
  const isUrdu = lang === 'ur';

  if (!isOpen) return null;

  const scheduleItems = parseMedicinesToSchedule(medicines);

  const handleDownloadIcs = () => {
    const icsData = generateIcsCalendarFile(scheduleItems, patientName);
    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `medication_reminders_${patientName.replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl relative text-slate-100 overflow-hidden">
        
        {/* Top Gradient Stripe */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-teal-500 via-emerald-400 to-teal-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-800 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-3 flex-shrink-0 pr-8">
          <div className="p-3 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex-shrink-0">
            <Bell className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20">
              OPT-IN PATIENT CONVENIENCE FEATURE
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-white font-display mt-0.5">
              {isUrdu ? 'مریض کی ادویات کے یاد دہانی اوّلین اوقات' : 'Patient Medication Schedule & Reminders'}
            </h2>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed mb-4 flex-shrink-0">
          {isUrdu
            ? 'نسخے کی بنیاد پر ادویات کے روزانہ استعمال کے اوقات کا شیڈول۔ آپ یہ شیڈول فون کے کیلنڈر میں محفوظ کر سکتے ہیں۔'
            : 'Parsed from Pakistani prescription frequency shorthand (1-0-1, BD, TDS). Export to iOS/Android Calendar for daily reminder alerts.'}
        </p>

        {/* Medication Schedule Items Scrollable List */}
        <div className="space-y-3 overflow-y-auto flex-1 pr-1 mb-4">
          {scheduleItems.map((item, idx) => (
            <div key={idx} className="p-3.5 sm:p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Pill className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <h4 className="text-xs sm:text-sm font-bold text-white font-display">
                    {item.drugName}
                  </h4>
                  {item.doseMg && (
                    <span className="text-[11px] text-teal-300 font-mono bg-teal-500/10 px-1.5 py-0.5 rounded border border-teal-500/20">
                      {item.doseMg} mg
                    </span>
                  )}
                </div>
                <span className="text-[10px] sm:text-[11px] text-slate-400 font-mono">
                  {item.frequencyRaw}
                </span>
              </div>

              {/* Time Slots */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px] text-slate-400">Scheduled Times:</span>
                {item.dailyTimes.map((timeStr, ti) => (
                  <span
                    key={ti}
                    className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[11px] font-mono font-bold"
                  >
                    ⏰ {timeStr}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Export Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <HeartHandshake className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
            <span>Patient opt-in feature</span>
          </div>

          <button
            onClick={handleDownloadIcs}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Export Calendar Reminders (.ics)</span>
          </button>
        </div>

      </div>
    </div>

  );
};
