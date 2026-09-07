'use client';

import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle, AlertOctagon, ShieldCheck, Stethoscope, CopyCheck, FileCode } from 'lucide-react';
import { TRANSLATIONS, Language } from '@/lib/translations';
import { PrescriptionAnalysisResult } from '@/lib/interactionChecker';
import { ExplainabilityPanel } from './ExplainabilityPanel';

interface SafetyFlagCardProps {
  lang: Language;
  analysis: PrescriptionAnalysisResult;
  onOpenFallbackModal?: () => void;
}

export const SafetyFlagCard: React.FC<SafetyFlagCardProps> = ({
  lang,
  analysis,
  onOpenFallbackModal,
}) => {
  const t = TRANSLATIONS[lang];
  const isUrdu = lang === 'ur';

  const configMap = {
    SAFE: {
      badgeText: t.safeBadge,
      bgGradient: 'from-emerald-950/80 via-slate-900 to-slate-900',
      borderColor: 'border-emerald-500/50',
      shadowColor: 'shadow-emerald-500/10',
      icon: CheckCircle2,
      iconColor: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    },
    DOSAGE_WARNING: {
      badgeText: t.warningBadge,
      bgGradient: 'from-amber-950/80 via-slate-900 to-slate-900',
      borderColor: 'border-amber-500/50',
      shadowColor: 'shadow-amber-500/10',
      icon: AlertTriangle,
      iconColor: 'text-amber-400',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    },
    DUPLICATE_THERAPY: {
      badgeText: 'DUPLICATE THERAPY DETECTED',
      bgGradient: 'from-amber-950/90 via-slate-900 to-slate-900',
      borderColor: 'border-amber-500/60',
      shadowColor: 'shadow-amber-500/20',
      icon: CopyCheck,
      iconColor: 'text-amber-400',
      badgeBg: 'bg-amber-500/25 text-amber-200 border-amber-500/50',
    },
    DANGEROUS_INTERACTION: {
      badgeText: t.dangerBadge,
      bgGradient: 'from-rose-950/90 via-slate-900 to-slate-900',
      borderColor: 'border-rose-500/60',
      shadowColor: 'shadow-rose-500/20',
      icon: XCircle,
      iconColor: 'text-rose-400',
      badgeBg: 'bg-rose-500/25 text-rose-200 border-rose-500/50 animate-pulse',
    },
    UNREADABLE: {
      badgeText: t.unreadableBadge,
      bgGradient: 'from-slate-800/80 via-slate-900 to-slate-900',
      borderColor: 'border-amber-500/60',
      shadowColor: 'shadow-amber-500/20',
      icon: HelpCircle,
      iconColor: 'text-amber-400',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse',
    },
  };

  const style = configMap[analysis.overallStatus];
  const IconComponent = style.icon;

  return (
    <div className={`bg-gradient-to-br ${style.bgGradient} border-2 ${style.borderColor} rounded-2xl p-5 sm:p-7 shadow-2xl ${style.shadowColor} transition-all space-y-6`}>
      
      {/* Status Traffic Light Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className={`p-3 rounded-2xl bg-slate-950/80 border ${style.borderColor} shadow-lg`}>
            <IconComponent className={`w-8 h-8 ${style.iconColor}`} />
          </div>
          <div>
            <span className={`inline-block text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border mb-1.5 ${style.badgeBg}`}>
              {style.badgeText}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
              {isUrdu ? analysis.statusTitle.ur : analysis.statusTitle.en}
            </h2>
          </div>
        </div>

        {/* Fallback to Human Doctor Confirmation Trigger Button */}
        {(analysis.hasLowConfidence || analysis.overallStatus === 'UNREADABLE') && onOpenFallbackModal && (
          <button
            onClick={onOpenFallbackModal}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 active:scale-95"
          >
            <Stethoscope className="w-4 h-4" />
            <span>Confirm with Doctor</span>
          </button>
        )}
      </div>

      {/* Overview Description */}
      <p className="text-sm text-slate-300 leading-relaxed font-sans">
        {isUrdu ? analysis.statusDescription.ur : analysis.statusDescription.en}
      </p>

      {/* Duplicate Therapy Warnings List */}
      {analysis.duplicateTherapies && analysis.duplicateTherapies.length > 0 && (
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <CopyCheck className="w-4 h-4" />
            Duplicate Therapy Warnings ({analysis.duplicateTherapies.length})
          </h3>

          <div className="space-y-2">
            {analysis.duplicateTherapies.map((dup, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs leading-relaxed"
              >
                <span className="font-bold text-amber-300 block mb-0.5">
                  Class: {dup.classEn} ({dup.drugA} + {dup.drugB})
                </span>
                <span>{isUrdu ? dup.messageUr : dup.messageEn}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dangerous Interactions Breakdown List */}
      {analysis.detectedInteractions.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
            <AlertOctagon className="w-4 h-4" />
            {t.interactionsTitle} ({analysis.detectedInteractions.length})
          </h3>

          <div className="space-y-3">
            {analysis.detectedInteractions.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-100 shadow-md"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="font-bold text-sm text-rose-200">
                    {isUrdu ? item.titleUr : item.titleEn}
                  </h4>
                  <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    CRITICAL CONTRAINDICATION
                  </span>
                </div>
                <p className="text-xs text-rose-200/90 mt-1 leading-relaxed">
                  {isUrdu ? item.descUr : item.descEn}
                </p>
                <div className="mt-2.5 pt-2 border-t border-rose-500/20 text-xs font-semibold text-rose-300 flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>{isUrdu ? item.recommendationUr : item.recommendationEn}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Collapsible Explainability Panel */}
      {analysis.explainabilityPanel && analysis.explainabilityPanel.length > 0 && (
        <ExplainabilityPanel explanations={analysis.explainabilityPanel} lang={lang} />
      )}

      {/* Doctor Action Guidance */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            {t.doctorAdviceTitle}
          </h4>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            {analysis.overallStatus === 'SAFE'
              ? 'Verification complete. Confirm prescription dosage with patient record and proceed to dispense.'
              : 'Hold dispensing until prescribing physician confirms dosage or provides substitute medication co-sign.'}
          </p>
        </div>
      </div>

    </div>
  );
};
