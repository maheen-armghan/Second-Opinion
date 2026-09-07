'use client';

import React from 'react';
import { Printer, Save, FileText, CheckCircle2, User, Stethoscope, Building2, Pill, Clock, AlertCircle } from 'lucide-react';
import { TRANSLATIONS, Language } from '@/lib/translations';
import { PrescriptionAnalysisResult } from '@/lib/interactionChecker';

interface DigitizedReportProps {
  lang: Language;
  analysis: PrescriptionAnalysisResult;
  onSaveToAudit: () => void;
  isSaving: boolean;
  savedSuccess: boolean;
}

// Map frequency codes like "1-0-1" to human-readable timing
function frequencyToTiming(freq: string): string {
  const map: Record<string, string> = {
    '1-0-0': 'Once daily (morning)',
    '0-1-0': 'Once daily (afternoon)',
    '0-0-1': 'Once daily (night)',
    '1-0-1': 'Twice daily (morning & night)',
    '1-1-0': 'Twice daily (morning & afternoon)',
    '0-1-1': 'Twice daily (afternoon & night)',
    '1-1-1': 'Three times daily',
  };
  return map[freq.trim()] || freq;
}

export const DigitizedReport: React.FC<DigitizedReportProps> = ({
  lang,
  analysis,
  onSaveToAudit,
  isSaving,
  savedSuccess,
}) => {
  const t = TRANSLATIONS[lang];
  const isUrdu = lang === 'ur';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl print:bg-white print:text-black print:p-0 print:border-none print:shadow-none">

      {/* Action Bar — hidden on print */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800 print:hidden">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-emerald-400" />
          <h2 className="text-lg font-bold text-white font-display">{t.digitizedReportTitle}</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onSaveToAudit}
            disabled={isSaving || savedSuccess}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            {savedSuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4 text-teal-400" />}
            {savedSuccess ? t.savedSuccess : t.saveToAuditLog}
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            {t.printReport}
          </button>
        </div>
      </div>

      {/* Printable Report Canvas */}
      <div id="printable-report" className="space-y-5 print:space-y-4">

        {/* Prescription Header: Doctor & Patient */}
        <div className="bg-slate-950/80 p-5 rounded-xl border border-slate-800 flex flex-wrap justify-between gap-4 print:bg-slate-50 print:border-slate-300 print:text-black">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm print:text-emerald-800">
              <Stethoscope className="w-4 h-4" />
              <span>{analysis.doctorName}</span>
            </div>
            {analysis.clinicName && (
              <div className="flex items-center gap-2 text-slate-400 text-xs print:text-slate-600">
                <Building2 className="w-3.5 h-3.5" />
                <span>{analysis.clinicName}</span>
              </div>
            )}
          </div>

          <div className="space-y-1.5 text-right">
            <div className="flex items-center justify-end gap-2 text-slate-200 text-xs font-medium print:text-black">
              <User className="w-3.5 h-3.5 text-teal-400 print:text-slate-700" />
              <span>Patient: <strong>{analysis.patientName}</strong></span>
            </div>
            {analysis.patientAge && (
              <div className="text-slate-400 text-xs print:text-slate-600">Age: {analysis.patientAge}</div>
            )}
          </div>
        </div>

        {/* Plain Language Summary */}
        {analysis.summary && (
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 print:bg-slate-50 print:border-slate-300">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1.5 print:text-teal-800">{t.summaryTitle}</h3>
            <p className={`text-xs text-slate-300 print:text-slate-800 leading-relaxed ${isUrdu ? 'font-urdu text-sm' : ''}`}>
              {isUrdu ? analysis.summary.ur : analysis.summary.en}
            </p>
          </div>
        )}

        {/* Medicines List */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5 print:text-black">
            <Pill className="w-4 h-4 text-emerald-400 print:text-emerald-700" />
            {t.medicationList} ({analysis.medicines.length})
          </h3>

          <div className="space-y-3">
            {analysis.medicines.map((med, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 print:bg-white print:border-slate-300 shadow-md">
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold flex items-center justify-center border border-emerald-500/20 print:bg-slate-200 print:text-black">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-white print:text-black font-display">{med.genericName}</h4>
                      {med.brandName && (
                        <span className="text-[10px] text-teal-300 print:text-teal-800 bg-teal-500/10 px-1.5 py-0.5 rounded border border-teal-500/20 mt-0.5 inline-block">
                          {med.brandName}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 text-xs text-slate-300 print:text-slate-800">
                    {med.doseMg && (
                      <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono print:bg-slate-100 print:border-slate-300">
                        {med.doseMg} mg
                      </span>
                    )}
                    <div className="flex items-center gap-1 text-slate-400 text-[11px]">
                      <Clock className="w-3 h-3" />
                      <span>{frequencyToTiming(med.frequency)}</span>
                    </div>
                  </div>
                </div>

                {/* Purpose / Context Label */}
                <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-300 print:bg-slate-50 print:border-slate-200 print:text-slate-800">
                  <span className="font-semibold text-emerald-400 print:text-emerald-800 block mb-0.5">Purpose:</span>
                  <p className={isUrdu ? 'font-urdu' : ''}>{isUrdu ? med.contextLabel.ur : med.contextLabel.en}</p>
                </div>

                {med.doseAlert && (
                  <div className="mt-2 text-xs text-amber-300 bg-amber-950/40 p-2.5 rounded-lg border border-amber-500/30 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span>{isUrdu ? med.doseAlert.ur : med.doseAlert.en}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Report Footer Disclaimer */}
        <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 text-center print:text-slate-600">
          <p>{t.disclaimer}</p>
        </div>
      </div>
    </div>
  );
};
