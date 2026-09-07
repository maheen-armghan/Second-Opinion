'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Navbar } from '@/components/Navbar';
import { ImageUploader } from '@/components/ImageUploader';
import { OcrVerificationTable } from '@/components/OcrVerificationTable';
import { SafetyFlagCard } from '@/components/SafetyFlagCard';
import { DigitizedReport } from '@/components/DigitizedReport';
import { HistoryDrawer } from '@/components/HistoryDrawer';
import { FallbackDoctorModal } from '@/components/FallbackDoctorModal';
import { MedicationReminderTab } from '@/components/MedicationReminderTab';
import { TRANSLATIONS, Language } from '@/lib/translations';
import { PrescriptionAnalysisResult } from '@/lib/interactionChecker';
import { ShieldAlert, AlertCircle, HeartHandshake, Bell, QrCode } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const [lang, setLang] = useState<Language>('en');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [activeSampleId, setActiveSampleId] = useState<string | null>(null);
  const [doctorName, setDoctorName] = useState('');
  const [patientName, setPatientName] = useState('');
  const [rawTextLines, setRawTextLines] = useState<string[]>([]);
  const [analysisResult, setAnalysisResult] = useState<PrescriptionAnalysisResult | null>(null);
  const [isFallbackModalOpen, setIsFallbackModalOpen] = useState(false);
  const [isReminderTabOpen, setIsReminderTabOpen] = useState(false);

  const [activePrescriptionId, setActivePrescriptionId] = useState<string>('SEC-1001');
  const qc = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: async (result: PrescriptionAnalysisResult) => {
      const res = await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisResult: result }),
      });
      if (!res.ok) throw new Error('Save failed');
      return res.json();
    },
    onSuccess: (resData) => {
      if (resData?.data?.prescriptionId) {
        setActivePrescriptionId(resData.data.prescriptionId);
      }
      qc.invalidateQueries({ queryKey: ['history'] });
    },
  });

  const analyzeMutation = useMutation({
    mutationFn: async ({ lines, doc, pat }: { lines: string[]; doc: string; pat: string }) => {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawTextLines: lines, doctorName: doc, patientName: pat }),
      });
      if (!res.ok) throw new Error('Analysis failed');
      const json = await res.json();
      if (!json.success) throw new Error('Analysis error');
      return json.data as PrescriptionAnalysisResult;
    },
    onSuccess: (data) => {
      setAnalysisResult(data);
      // Automatically persist result to capture real unique prescriptionId
      saveMutation.mutate(data);
      // NOTE: Modals do NOT auto-open per user requirement
    },
  });

  const ocrMutation = useMutation({
    mutationFn: async ({ sampleId, imageFile }: { sampleId?: string; imageFile?: File }) => {
      let imagePayload: string | undefined = undefined;
      if (imageFile) {
        imagePayload = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(imageFile);
        });
      }

      const res = await fetch('/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sampleId: sampleId || undefined, imageBase64: imagePayload }),
      });
      if (!res.ok) {
        let errorMsg = 'OCR failed';
        try {
          const errData = await res.json();
          if (errData.error) errorMsg = errData.error;
        } catch(e) {}
        throw new Error(errorMsg);
      }
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'OCR error');
      return data;
    },
    onSuccess: (data) => {
      setDoctorName(data.doctorName);
      setPatientName(data.patientName);
      setRawTextLines(data.rawTextLines);
      analyzeMutation.mutate({ lines: data.rawTextLines, doc: data.doctorName, pat: data.patientName });
    },
  });

  const runAnalysis = (lines: string[]) => analyzeMutation.mutate({ lines, doc: doctorName, pat: patientName });
  const triggerOcrProcess = (sampleId?: string, imageFile?: File) => { saveMutation.reset(); ocrMutation.mutate({ sampleId, imageFile }); };


  const isLoadingOcr = ocrMutation.isPending;
  const isAnalyzing = analyzeMutation.isPending;
  const isSaving = saveMutation.isPending;
  const savedSuccess = saveMutation.isSuccess;

  const t = TRANSLATIONS[lang];
  const isUrdu = lang === 'ur';

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans ${isUrdu ? 'rtl font-urdu' : 'ltr'}`} dir={isUrdu ? 'rtl' : 'ltr'}>
      <Navbar lang={lang} onToggleLang={() => setLang((prev) => (prev === 'en' ? 'ur' : 'en'))} onOpenHistory={() => setHistoryOpen(true)} />

      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border-b border-emerald-500/20 py-3 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-emerald-300 font-medium">
            <HeartHandshake className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{t.tagline}</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setIsReminderTabOpen(true)} className="px-3 py-1 rounded-lg bg-teal-500/10 text-teal-300 border border-teal-500/20 hover:bg-teal-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors">
              <Bell className="w-3.5 h-3.5" /><span>Patient Reminders</span>
            </button>
            <div className="flex items-center gap-1.5 text-amber-300/90 text-[11px]">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" /><span>{t.safetyNotice}</span>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <section>
          <ImageUploader lang={lang} activeSampleId={activeSampleId}
            onSelectSample={(sampleId) => { setActiveSampleId(sampleId); triggerOcrProcess(sampleId); }}
            onUploadImage={(file) => { setActiveSampleId(null); triggerOcrProcess(undefined, file); }}
            isLoading={isLoadingOcr}
            error={ocrMutation.isError ? (ocrMutation.error as Error).message : null} />
        </section>

        <section>
          <OcrVerificationTable lang={lang} rawTextLines={rawTextLines}
            onUpdateLines={(newLines) => { setRawTextLines(newLines); runAnalysis(newLines); }}
            onRunCheck={() => runAnalysis(rawTextLines)} isAnalyzing={isAnalyzing} />
        </section>

        {analysisResult && (
          <section className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <ShieldAlert className="w-4 h-4 text-emerald-400" /><span>Verification Actions:</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/slip/${activePrescriptionId}`} target="_blank" className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 transition-all flex items-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5 text-teal-400" /><span>Digital Slip</span>
                </Link>
                <button onClick={() => setIsReminderTabOpen(true)} className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-teal-600 hover:bg-teal-500 text-white shadow-md shadow-teal-600/20 transition-all flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5" /><span>Set Patient Reminders</span>
                </button>
              </div>
            </div>

            <SafetyFlagCard lang={lang} analysis={analysisResult} onOpenFallbackModal={() => setIsFallbackModalOpen(true)} />
            <DigitizedReport lang={lang} analysis={analysisResult} onSaveToAudit={() => saveMutation.mutate(analysisResult)} isSaving={isSaving} savedSuccess={savedSuccess} />
          </section>
        )}
      </main>

      {analysisResult && (<FallbackDoctorModal isOpen={isFallbackModalOpen} onClose={() => setIsFallbackModalOpen(false)} onConfirmDoctor={() => setIsFallbackModalOpen(false)} unreadableFields={analysisResult.unreadableFields || []} medicines={analysisResult.medicines || []} doctorName={doctorName} lang={lang} />)}
      {analysisResult && (<MedicationReminderTab isOpen={isReminderTabOpen} onClose={() => setIsReminderTabOpen(false)} medicines={analysisResult.medicines || []} patientName={patientName} lang={lang} />)}

      <HistoryDrawer isOpen={historyOpen} onClose={() => setHistoryOpen(false)} lang={lang}
        onSelectHistoricalScan={(h) => { setAnalysisResult(h); setDoctorName(h.doctorName || doctorName); setPatientName(h.patientName || patientName); if (h.medicines) setRawTextLines(h.medicines.map((m: any) => m.rawText)); }} />

      <footer className="bg-slate-900/80 border-t border-slate-800 text-slate-400 py-6 px-4 text-center text-xs mt-12">
        <div className="max-w-7xl mx-auto space-y-2">
          <p className="flex items-center justify-center gap-1.5 font-medium text-slate-300"><ShieldAlert className="w-4 h-4 text-emerald-400" />{t.footerText}</p>
          <p className="text-slate-500 max-w-3xl mx-auto leading-relaxed text-[11px]">{t.disclaimer}</p>
        </div>
      </footer>
    </div>
  );
}
