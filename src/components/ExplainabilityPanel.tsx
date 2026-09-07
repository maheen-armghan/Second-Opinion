'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Info, AlertTriangle, AlertOctagon, HelpCircle, CopyCheck, BookOpen, Stethoscope } from 'lucide-react';
import { TRANSLATIONS, Language } from '@/lib/translations';
import { FlagExplanationItem } from '@/lib/interactionChecker';

interface ExplainabilityPanelProps {
  explanations: FlagExplanationItem[];
  lang: Language;
}

export const ExplainabilityPanel: React.FC<ExplainabilityPanelProps> = ({ explanations, lang }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const t = TRANSLATIONS[lang];
  const isUrdu = lang === 'ur';

  if (!explanations || explanations.length === 0) return null;

  const getIcon = (type: FlagExplanationItem['type']) => {
    switch (type) {
      case 'interaction':
        return <AlertOctagon className="w-4 h-4 text-rose-400" />;
      case 'duplicate_therapy':
        return <CopyCheck className="w-4 h-4 text-amber-400" />;
      case 'dosage':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      default:
        return <HelpCircle className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl transition-all">
      
      {/* Panel Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 bg-slate-950/80 hover:bg-slate-950 flex items-center justify-between gap-3 text-left transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
              {isUrdu ? 'وضاحتی کلینیکل پینل (Explainability Panel)' : 'Clinical Decision Explainability Panel'}
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20">
                {explanations.length} {explanations.length === 1 ? 'Rule Fired' : 'Rules Fired'}
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              {isUrdu ? 'ہر تنبیہ اور کیمیائی ردعمل کی تفصیلی اور فہماتی وضاحت دیکھیں' : 'Transparent clinical reasoning and pharmacological mechanism behind safety flags'}
            </p>
          </div>
        </div>

        <div className="text-slate-400 p-1 rounded-lg hover:bg-slate-800">
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      {/* Expandable Content Body */}
      {isExpanded && (
        <div className="p-4 sm:p-5 space-y-3.5 border-t border-slate-800/80 bg-slate-950/50">
          {explanations.map((exp, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs text-slate-200"
            >
              {/* Title & Icon */}
              <div className="flex items-center gap-2">
                {getIcon(exp.type)}
                <h4 className="font-bold text-sm text-white font-display">
                  {isUrdu ? exp.titleUr : exp.titleEn}
                </h4>
              </div>

              {/* One-Liner Summary */}
              <p className="text-slate-300 leading-relaxed font-semibold">
                {isUrdu ? exp.oneLinerUr : exp.oneLinerEn}
              </p>

              {/* Pharmacological Mechanism (if available) */}
              {exp.mechanismEn && (
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                  <span className="font-bold uppercase tracking-wider text-teal-400 block text-[10px]">
                    Pharmacological Mechanism:
                  </span>
                  <p className={isUrdu ? 'font-urdu text-xs text-slate-300' : ''}>
                    {isUrdu ? exp.mechanismUr : exp.mechanismEn}
                  </p>
                </div>
              )}

              {/* Clinical Recommendation */}
              {exp.recommendationEn && (
                <div className="flex items-center gap-1.5 text-[11px] text-teal-300 font-semibold pt-1">
                  <Stethoscope className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                  <span>{isUrdu ? exp.recommendationUr : exp.recommendationEn}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
