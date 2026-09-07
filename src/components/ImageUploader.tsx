'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, Camera, CheckCircle2, AlertTriangle, XCircle, HelpCircle, FileText, Sparkles } from 'lucide-react';
import { TRANSLATIONS, Language } from '@/lib/translations';

interface ImageUploaderProps {
  lang: Language;
  onSelectSample: (sampleId: string) => void;
  onUploadImage: (file: File) => void;
  isLoading: boolean;
  activeSampleId: string | null;
  error?: string | null;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  lang,
  onSelectSample,
  onUploadImage,
  isLoading,
  activeSampleId,
  error,
}) => {
  const t = TRANSLATIONS[lang];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFile = (file: File) => {
    setSelectedFileName(file.name);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    onUploadImage(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const sampleButtons = [
    {
      id: 'sample1',
      label: t.sample1,
      icon: CheckCircle2,
      color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20',
      badge: 'SAFE',
    },
    {
      id: 'sample2',
      label: t.sample2,
      icon: AlertTriangle,
      color: 'border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20',
      badge: 'DOSAGE WARNING',
    },
    {
      id: 'sample3',
      label: t.sample3,
      icon: XCircle,
      color: 'border-rose-500/40 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20',
      badge: 'DANGEROUS INTERACTION',
    },
    {
      id: 'sample4',
      label: t.sample4,
      icon: XCircle,
      color: 'border-rose-500/40 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20',
      badge: 'HYPERKALEMIA RISK',
    },
    {
      id: 'sample5',
      label: t.sample5,
      icon: HelpCircle,
      color: 'border-slate-500/40 bg-slate-500/10 text-slate-300 hover:bg-slate-500/20',
      badge: 'UNREADABLE OCR',
    },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl transition-all">

      {/* Header */}
      <div className="mb-4">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2 font-display">
          <UploadCloud className="w-5 h-5 text-emerald-400" />
          {t.uploadHeader}
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">{t.uploadSubtext}</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg flex items-start gap-2.5">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-red-200">Extraction Failed</h3>
            <p className="text-xs text-red-300 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Main Drag & Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${dragOver
            ? 'border-emerald-400 bg-emerald-500/10'
            : 'border-slate-700 bg-slate-950/60 hover:border-slate-600 hover:bg-slate-950'
          }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        <input
          type="file"
          ref={cameraInputRef}
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        {previewUrl ? (
          <div className="flex flex-col items-center gap-3">
            <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-slate-700 shadow-md">
              <img src={previewUrl} alt="Prescription preview" className="w-full h-full object-cover" />
            </div>
            <p className="text-xs font-mono text-emerald-400">{selectedFileName}</p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="text-xs text-slate-400 underline hover:text-slate-200"
            >
              Change Photo
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center text-emerald-400 ring-8 ring-slate-900">
              <FileText className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-200">{t.uploadSubtext}</p>
              <p className="text-xs text-slate-500 mt-1">Supports JPG, PNG, WEBP (Handwritten or printed OPD slips)</p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 mt-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all flex items-center gap-1.5"
              >
                <UploadCloud className="w-4 h-4" />
                {t.browseFiles}
              </button>
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center gap-1.5"
              >
                <Camera className="w-4 h-4 text-teal-400" />
                {t.takePhoto}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Preset Pakistani Prescription Scenario Selector */}
      <div className="mt-6">
        <div className="flex items-center gap-2 mb-3">
          {/* <Sparkles className="w-4 h-4 text-amber-400" /> */}
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            {t.sampleScenarios}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {sampleButtons.map((sample) => {
            const Icon = sample.icon;
            const isActive = activeSampleId === sample.id;
            return (
              <button
                key={sample.id}
                onClick={() => {
                  setSelectedFileName(null);
                  setPreviewUrl(null);
                  onSelectSample(sample.id);
                }}
                disabled={isLoading}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all relative overflow-hidden ${sample.color
                  } ${isActive ? 'ring-2 ring-emerald-400 scale-[1.01]' : 'opacity-90'}`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <div className="min-w-0">
                  <span className="text-xs font-bold block truncate">{sample.label}</span>
                  <span className="text-[10px] opacity-75 font-mono tracking-tight block">
                    {sample.badge}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};
