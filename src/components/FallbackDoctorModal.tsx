'use client';

import React, { useState } from 'react';
import { AlertOctagon, PhoneCall, CheckSquare, Square, X, Stethoscope, AlertCircle, HelpCircle } from 'lucide-react';
import { TRANSLATIONS, Language } from '@/lib/translations';
import { PrescribedMedicineAnalysis } from '@/lib/interactionChecker';

interface FallbackDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDoctor: () => void;
  unreadableFields: string[];
  medicines: PrescribedMedicineAnalysis[];
  doctorName?: string;
  lang: Language;
}

export const FallbackDoctorModal: React.FC<FallbackDoctorModalProps> = ({
  isOpen,
  onClose,
  onConfirmDoctor,
  unreadableFields,
  medicines,
  doctorName = 'Dr. Prescribing Physician',
  lang,
}) => {
  const [isChecked, setIsChecked] = useState(false);
  const t = TRANSLATIONS[lang];
  const isUrdu = lang === 'ur';

  if (!isOpen) return null;

  // Filter medicines with ambiguous candidates
  const ambiguousMeds = medicines.filter((m) => m.ambiguousCandidates && m.ambiguousCandidates.length > 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-slate-900 border-2 border-amber-500/60 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-amber-500/10 relative text-slate-100 overflow-hidden">
        
        {/* Top Warning Stripe */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-inner">
            <AlertOctagon className="w-8 h-8 stroke-[2.5] animate-pulse" />
          </div>
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
              MANDATORY SAFETY ESCALATION
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-display mt-0.5">
              {isUrdu ? 'ڈاکٹر سے بالمشافہ تائید لازمی ہے' : 'Confirm with Prescribing Doctor'}
            </h2>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
          {isUrdu
            ? 'سسٹم نے تحریر میں غیر واضح حروف یا دوا کے کئی ممکنہ نام پائے ہیں۔ مریض کی حفاظت کے لیے دوا دینے سے پہلے ڈاکٹر سے رابطہ کریں۔'
            : 'Low OCR confidence or ambiguous drug matches were detected. Automated checks cannot guarantee safety without doctor confirmation.'}
        </p>

        {/* Ambiguity & Low-Confidence Breakdown */}
        <div className="space-y-3 mb-6">
          
          {/* Low Confidence Fields List */}
          {unreadableFields.length > 0 && (
            <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/30 text-xs text-amber-200">
              <span className="font-bold text-amber-300 flex items-center gap-1.5 mb-1">
                <HelpCircle className="w-4 h-4 text-amber-400" /> Low Confidence Entries (&lt;60%):
              </span>
              <ul className="list-disc list-inside space-y-0.5 text-slate-300 font-mono text-[11px]">
                {unreadableFields.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Ambiguous Drug Candidates List */}
          {ambiguousMeds.length > 0 && (
            <div className="p-3.5 rounded-xl bg-slate-950 border border-rose-500/30 text-xs text-rose-200">
              <span className="font-bold text-rose-300 flex items-center gap-1.5 mb-1">
                <AlertCircle className="w-4 h-4 text-rose-400" /> Ambiguous Drug Candidates Detected:
              </span>
              <div className="space-y-2 mt-1">
                {ambiguousMeds.map((med, idx) => (
                  <div key={idx} className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 text-[11px]">
                    <span className="text-slate-400 block mb-1">Raw line: "{med.rawText}" could match:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {med.ambiguousCandidates?.map((cand, ci) => (
                        <span key={ci} className="px-2 py-0.5 rounded bg-slate-800 text-teal-300 border border-teal-500/30 font-semibold">
                          {cand.name} ({Math.round(cand.score * 100)}%)
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Doctor Contact Box */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0 border border-emerald-500/20">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                Prescribing Doctor
              </span>
              <h4 className="text-xs font-bold text-white truncate">{doctorName}</h4>
            </div>
          </div>

          <a
            href="tel:+92419200000"
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 flex-shrink-0"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Call Doctor</span>
          </a>
        </div>

        {/* Explicit Pharmacist Hard Stop Checkbox */}
        <div
          onClick={() => setIsChecked(!isChecked)}
          className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 mb-6 ${
            isChecked
              ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <button type="button" className="mt-0.5 text-emerald-400 flex-shrink-0">
            {isChecked ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5 text-slate-500" />}
          </button>
          <span className="text-xs leading-relaxed font-semibold">
            {isUrdu
              ? 'میں تصدیق کرتا ہوں کہ میں نے اس نسخے اور ادویات کی مقدار کے متعلق ڈاکٹر سے بالمشافہ رابطہ کر کے تائید حاصل کر لی ہے۔'
              : 'I acknowledge that I have directly contacted the prescribing doctor and confirmed the extracted drug entries and dosages before dispensing.'}
          </span>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            Cancel / Edit OCR
          </button>
          <button
            onClick={() => {
              if (isChecked) {
                onConfirmDoctor();
                onClose();
              }
            }}
            disabled={!isChecked}
            className="flex-1 py-2.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Resolve & Proceed ⚡
          </button>
        </div>

      </div>
    </div>
  );
};
