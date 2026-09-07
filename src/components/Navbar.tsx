'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldAlert, Languages, History, MapPin, FileCheck } from 'lucide-react';
import { TRANSLATIONS, Language } from '@/lib/translations';

interface NavbarProps {
  lang: Language;
  onToggleLang: () => void;
  onOpenHistory?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ lang, onToggleLang, onOpenHistory }) => {
  const t = TRANSLATIONS[lang];
  const pathname = usePathname();

  const isDoctorsPage = pathname === '/doctors-near-me';

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white transition-all shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-2 text-slate-950 flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-bold text-xl tracking-tight text-white flex items-center gap-1.5">
                  {t.appTitle}
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Pakistan Health
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden md:block">
                {t.subTitle}
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation Tabs (Rx Safety Scanner vs Doctors Near Me) */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <Link
            href="/"
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              !isDoctorsPage
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>{t.navScanner}</span>
          </Link>

          <Link
            href="/doctors-near-me"
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isDoctorsPage
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-teal-300" />
            <span>{t.navDoctorsNearMe}</span>
          </Link>
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Mobile Direct Link to Doctors Near Me if on Scanner */}
          {!isDoctorsPage ? (
            <Link
              href="/doctors-near-me"
              className="md:hidden flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-950 text-teal-300 border border-teal-500/30"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Doctors</span>
            </Link>
          ) : (
            <Link
              href="/"
              className="md:hidden flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-500/30"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Rx Scan</span>
            </Link>
          )}

          {/* Audit History Log Button (if on scanner page) */}
          {onOpenHistory && (
            <button
              onClick={onOpenHistory}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors shadow-sm"
              title={t.historyLog}
            >
              <History className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">{t.historyLog}</span>
            </button>
          )}

          {/* Bilingual Language Switch Toggle */}
          <button
            onClick={onToggleLang}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all transform active:scale-95 border border-emerald-400/30"
            title="Switch Language (English / اردو)"
          >
            <span className="text-[11px] font-extrabold font-urdu px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
              اردو
            </span>
            <span>/</span>
            <span className="font-mono text-xs tracking-tight">EN</span>
          </button>
        </div>

      </div>
    </header>
  );
};
