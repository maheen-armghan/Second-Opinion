'use client';

import React, { useState } from 'react';
import { X, Search, History, Calendar, CheckCircle2, AlertTriangle, XCircle, HelpCircle, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { TRANSLATIONS, Language } from '@/lib/translations';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onSelectHistoricalScan: (scan: any) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  lang,
  onSelectHistoricalScan,
}) => {
  const t = TRANSLATIONS[lang];
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  const { data: historyData, isLoading: loading } = useQuery({
    queryKey: ['history', activeFilter],
    queryFn: async () => {
      const url = `/api/history${activeFilter !== 'ALL' ? `?status=${activeFilter}` : ''}`;
      const res = await fetch(url);
      const json = await res.json();
      if (!json.success) throw new Error('Failed to fetch history');
      return json.data || [];
    },
    enabled: isOpen,
    staleTime: 1000 * 30,
  });

  const logs = historyData || [];



  if (!isOpen) return null;

  const filteredLogs = logs.filter((item: any) => {
    const q = searchQuery.toLowerCase();
    return (
      item.doctorName.toLowerCase().includes(q) ||
      item.patientName.toLowerCase().includes(q) ||
      item.prescriptionId.toLowerCase().includes(q) ||
      (item.medicinesList && item.medicinesList.some((m: string) => m.toLowerCase().includes(q)))
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SAFE':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> SAFE
          </span>
        );
      case 'DOSAGE_WARNING':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> DOSAGE WARN
          </span>
        );
      case 'DANGEROUS_INTERACTION':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
            <XCircle className="w-3 h-3" /> DANGER
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-700/40 text-slate-400 border border-slate-600 flex items-center gap-1">
            <HelpCircle className="w-3 h-3" /> UNREADABLE
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white font-display">
              {t.auditTitle}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Controls */}
        <div className="p-4 border-b border-slate-800 space-y-3 bg-slate-950/50">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
            {[
              { id: 'ALL', label: t.filterAll },
              { id: 'SAFE', label: t.filterSafe },
              { id: 'DOSAGE_WARNING', label: t.filterWarning },
              { id: 'DANGEROUS_INTERACTION', label: t.filterDanger },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  activeFilter === f.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Audit Log Content List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-500">Loading audit history...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 italic">
              {t.noHistory}
            </div>
          ) : (
            filteredLogs.map((item: any, idx: number) => (
              <div
                key={idx}
                onClick={() => {
                  if (item.analysisDetails) {
                    onSelectHistoricalScan(item.analysisDetails);
                    onClose();
                  }
                }}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-emerald-500/40 hover:bg-slate-800/40 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="font-mono text-[10px] text-slate-500">
                    {item.prescriptionId}
                  </span>
                  {getStatusBadge(item.overallStatus)}
                </div>

                <h4 className="text-xs font-bold text-slate-200 group-hover:text-emerald-300 transition-colors">
                  {item.patientName}
                </h4>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  {item.doctorName}
                </p>

                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-800/60 pt-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(item.scannedAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-emerald-400">
                    {t.viewDetails} <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
