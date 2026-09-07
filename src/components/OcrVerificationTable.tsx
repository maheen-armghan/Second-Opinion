'use client';

import React, { useState } from 'react';
import { Edit3, Trash2, Plus, RefreshCw, CheckCircle, AlertCircle, HelpCircle, Check, AlertOctagon } from 'lucide-react';
import { TRANSLATIONS, Language } from '@/lib/translations';
import { matchOcrTextToDrug, MatchedDrugResult } from '@/lib/fuzzyMatcher';

interface OcrVerificationTableProps {
  lang: Language;
  rawTextLines: string[];
  onUpdateLines: (newLines: string[]) => void;
  onRunCheck: () => void;
  isAnalyzing: boolean;
}

export const OcrVerificationTable: React.FC<OcrVerificationTableProps> = ({
  lang,
  rawTextLines,
  onUpdateLines,
  onRunCheck,
  isAnalyzing,
}) => {
  const t = TRANSLATIONS[lang];
  const isUrdu = lang === 'ur';

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [newLineText, setNewLineText] = useState('');

  const matches: MatchedDrugResult[] = rawTextLines.map((line) => matchOcrTextToDrug(line));

  const handleSaveEdit = (index: number) => {
    if (editText.trim()) {
      const updated = [...rawTextLines];
      updated[index] = editText.trim();
      onUpdateLines(updated);
    }
    setEditingIndex(null);
  };

  const handleRemove = (index: number) => {
    const updated = rawTextLines.filter((_, i) => i !== index);
    onUpdateLines(updated);
  };

  const handleAddLine = () => {
    if (newLineText.trim()) {
      onUpdateLines([...rawTextLines, newLineText.trim()]);
      setNewLineText('');
    }
  };

  const getCertaintyBadge = (level: 'green' | 'yellow' | 'red') => {
    switch (level) {
      case 'green':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> High Certainty
          </span>
        );
      case 'yellow':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Medium Certainty
          </span>
        );
      case 'red':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse flex items-center gap-1">
            <AlertOctagon className="w-3 h-3 text-rose-400" /> Low Certainty - Verify
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
      
      {/* Table Title & AI Vision Disclaimer */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 font-display">
            <Edit3 className="w-4 h-4 text-teal-400" />
            {t.ocrVerificationTitle}
          </h3>
          <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
            Extraction powered by AI Vision Model — please inspect and verify extracted text before dispensing.
          </p>
        </div>

        <button
          onClick={onRunCheck}
          disabled={isAnalyzing || rawTextLines.length === 0}
          className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
          {t.reAnalyzeBtn}
        </button>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/70">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-800/80 text-slate-400 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-800">
            <tr>
              <th className="p-3">#</th>
              <th className="p-3">{t.rawExtractedText}</th>
              <th className="p-3">{t.matchedDrugName}</th>
              <th className="p-3">{t.extractedDose}</th>
              <th className="p-3">{t.frequency}</th>
              <th className="p-3">{t.confidence}</th>
              <th className="p-3 text-right">{t.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {matches.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-slate-500 italic">
                  No OCR text lines recognized yet. Upload a prescription or select a sample above.
                </td>
              </tr>
            ) : (
              matches.map((item, idx) => {
                const isEditing = editingIndex === idx;

                return (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-mono text-slate-500">{idx + 1}</td>
                    
                    {/* Raw OCR Line */}
                    <td className="p-3 font-medium text-slate-200 min-w-[160px]">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full bg-slate-900 border border-emerald-500/50 rounded px-2 py-1 text-xs text-white focus:outline-none"
                          autoFocus
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(idx)}
                        />
                      ) : (
                        <div
                          onClick={() => {
                            setEditingIndex(idx);
                            setEditText(item.rawOcrText);
                          }}
                          className="cursor-pointer group flex items-center justify-between gap-1 p-1 -m-1 rounded hover:bg-slate-800/80 transition-colors"
                          title="Tap to edit field"
                        >
                          <span className="group-hover:text-emerald-300 font-semibold">{item.rawOcrText}</span>
                          <Edit3 className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      )}
                    </td>

                    {/* Matched Drug in DB */}
                    <td className="p-3 min-w-[180px]">
                      {item.matchedDrug ? (
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                            <span className="font-semibold text-emerald-300">
                              {item.matchedDrug.genericName}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            Class: {item.matchedDrug.therapeuticClass}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <HelpCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                          <span className="italic">{item.matchedName}</span>
                        </div>
                      )}
                    </td>

                    {/* Dosage (mg) */}
                    <td className="p-3 font-mono">
                      {item.extractedDoseMg ? (
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">
                          {item.extractedDoseMg} mg
                        </span>
                      ) : (
                        <span className="text-slate-500 font-sans italic">Not specified</span>
                      )}
                    </td>

                    {/* Frequency */}
                    <td className="p-3">
                      <span className="text-slate-300">{item.extractedFrequency}</span>
                    </td>

                    {/* Vision AI Certainty Badge */}
                    <td className="p-3">
                      {getCertaintyBadge(item.fieldConfidence.drugName.level)}
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {isEditing ? (
                          <button
                            onClick={() => handleSaveEdit(idx)}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-bold"
                          >
                            Save
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingIndex(idx);
                              setEditText(item.rawOcrText);
                            }}
                            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded"
                            title={t.editItem}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleRemove(idx)}
                          className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded"
                          title={t.removeItem}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add New Line Input */}
      <div className="mt-3 flex items-center gap-2">
        <input
          type="text"
          placeholder="e.g., Flagyl 400mg - 1-0-1"
          value={newLineText}
          onChange={(e) => setNewLineText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddLine()}
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60"
        />
        <button
          onClick={handleAddLine}
          className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5 text-emerald-400" />
          {t.addItem}
        </button>
      </div>

    </div>
  );
};
