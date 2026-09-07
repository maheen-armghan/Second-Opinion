'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Stethoscope, User, Calendar, Pill, AlertTriangle, CheckCircle2, QrCode, Clock, ExternalLink } from 'lucide-react';
import { TRANSLATIONS, Language } from '@/lib/translations';
import { PrescriptionAnalysisResult } from '@/lib/interactionChecker';
import { QrCodeGenerator } from '@/components/QrCodeGenerator';

export default function DigitalSlipPage({ params }: { params: { shortId: string } }) {
  const { shortId } = params;
  const [lang, setLang] = useState<Language>('en');
  const [analysis, setAnalysis] = useState<PrescriptionAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const t = TRANSLATIONS[lang];
  const isUrdu = lang === 'ur';

  useEffect(() => {
    const fetchSlip = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/slip/${shortId}`);
        const json = await res.json();
        if (json.success) {
          setAnalysis(json.data);
        } else {
          setError(json.error || 'Prescription slip not found');
        }
      } catch (e: any) {
        setError(e.message || 'Failed to load slip');
      } finally {
        setLoading(false);
      }
    };

    fetchSlip();
  }, [shortId]);

  const fullSlipUrl = typeof window !== 'undefined' ? `${window.location.origin}/slip/${shortId}` : `https://second-opinion.vercel.app/slip/${shortId}`;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-spin mx-auto flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <p className="text-xs text-slate-400 font-mono">Loading Verified Prescription Slip...</p>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 mx-auto flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold">Prescription Slip Not Found</h2>
          <p className="text-xs text-slate-400">
            This digital prescription slip link may have expired or is invalid. Please scan the QR code on your paper slip again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center ${isUrdu ? 'rtl font-urdu' : 'ltr'}`} dir={isUrdu ? 'rtl' : 'ltr'}>
      
      {/* Top Header Card */}
      <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Top Accent Stripe */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500" />

        {/* Header Bar */}
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-emerald-500/20">
              <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white font-display">Second Opinion</h1>
              <p className="text-[11px] text-slate-400">Verified Patient Prescription Slip</p>
            </div>
          </div>

          <button
            onClick={() => setLang((prev) => (prev === 'en' ? 'ur' : 'en'))}
            className="px-3 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700"
          >
            {t.languageSwitch}
          </button>
        </div>

        {/* Doctor & Patient Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Prescribing Physician</span>
            <div className="font-bold text-white flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-emerald-400" />
              <span>{analysis.doctorName}</span>
            </div>
            <p className="text-slate-400 text-[11px]">{analysis.clinicName}</p>
          </div>

          <div className="space-y-1 sm:text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Patient Record</span>
            <div className="font-bold text-white flex items-center sm:justify-end gap-1.5">
              <User className="w-3.5 h-3.5 text-teal-400" />
              <span>{analysis.patientName}</span>
            </div>
            <div className="flex items-center sm:justify-end gap-1 text-slate-400 text-[11px]">
              <Calendar className="w-3 h-3" />
              <span>{analysis.dateStr}</span>
            </div>
          </div>
        </div>

        {/* Safety Status Banner */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-200">Safety Verification Status:</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            {isUrdu ? analysis.statusTitle.ur : analysis.statusTitle.en}
          </span>
        </div>

        {/* Plain Language Summary View */}
        {analysis.summary && (
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">
              Prescription Summary
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {isUrdu ? analysis.summary.ur : analysis.summary.en}
            </p>
          </div>
        )}

        {/* Extracted Medicines List with Context Labels */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Pill className="w-4 h-4 text-emerald-400" />
            Prescribed Medications ({analysis.medicines.length})
          </h3>

          <div className="space-y-2.5">
            {analysis.medicines.map((med, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-[11px] flex items-center justify-center border border-emerald-500/20">
                      {idx + 1}
                    </span>
                    <h4 className="font-bold text-white">{med.genericName}</h4>
                    {med.brandName && (
                      <span className="text-[10px] text-teal-300 bg-teal-500/10 px-1.5 py-0.5 rounded border border-teal-500/20">
                        {med.brandName}
                      </span>
                    )}
                  </div>
                  <span className="text-slate-400 font-mono text-[11px]">
                    {med.doseMg ? `${med.doseMg}mg` : ''} ({med.frequency})
                  </span>
                </div>

                <p className="text-[11px] text-slate-300 bg-slate-900 p-2.5 rounded-lg border border-slate-800/80 leading-relaxed">
                  {isUrdu ? med.contextLabel.ur : med.contextLabel.en}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* QR Code & Link Expiry Box */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <QrCodeGenerator value={fullSlipUrl} size={90} />
            <div className="space-y-1">
              <span className="text-xs font-bold text-white block">Digital Verification QR Code</span>
              <p className="text-[10px] text-slate-400 max-w-xs">
                Present this QR code at any pharmacy in Pakistan for instant prescription safety verification.
              </p>
              <div className="flex items-center gap-1 text-[10px] text-teal-400 font-semibold">
                <Clock className="w-3 h-3" />
                <span>Valid for 60 Days • Encrypted Record</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500 text-center">
          Second Opinion • Patient Safety Verification System Pakistan
        </div>

      </div>
    </div>
  );
}
