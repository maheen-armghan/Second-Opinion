'use client';

import React from 'react';
import { MapPin, Phone, Star, Navigation, Building2, Stethoscope, Clock } from 'lucide-react';
import { TRANSLATIONS, Language } from '@/lib/translations';
import { DoctorClinicItem } from '@/app/api/doctors-near-me/route';

interface DoctorCardProps {
  item: DoctorClinicItem;
  lang: Language;
  isSelected?: boolean;
  onSelect: () => void;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({
  item,
  lang,
  isSelected = false,
  onSelect,
}) => {
  const t = TRANSLATIONS[lang];
  const isUrdu = lang === 'ur';

  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
        isSelected
          ? 'bg-emerald-950/40 border-emerald-500 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500 scale-[1.01]'
          : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60 shadow-md'
      }`}
    >
      {/* Top Header: Name & Department Badge */}
      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
        <div className="space-y-0.5 min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-xs text-teal-400 font-semibold">
            <Stethoscope className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{item.clinicHospitalName}</span>
          </div>
          <h3 className="text-sm sm:text-base font-bold text-white font-display truncate">
            {item.name}
          </h3>
        </div>

        {/* Distance Badge */}
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-bold flex-shrink-0">
          <Navigation className="w-3 h-3 rotate-45 text-emerald-400" />
          <span>{item.distanceKm} {t.kmAway}</span>
        </div>
      </div>

      {/* Address */}
      <div className="flex items-start gap-1.5 text-xs text-slate-300 mb-3">
        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
        <span className="leading-snug">{item.address}</span>
      </div>

      {/* Department & Rating Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-xs">
        
        {/* Department Name */}
        <span className="px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium border border-slate-700">
          {isUrdu ? item.departmentUr : item.departmentEn}
        </span>

        {/* Rating & Reviews */}
        <div className="flex items-center gap-3 text-slate-400 text-xs">
          {item.rating && (
            <div className="flex items-center gap-1 text-amber-400 font-semibold">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{item.rating}</span>
              {item.userRatingsTotal && (
                <span className="text-slate-500 font-normal">({item.userRatingsTotal})</span>
              )}
            </div>
          )}

          {item.openNow !== undefined && (
            <span className={`flex items-center gap-1 text-[11px] font-semibold ${
              item.openNow ? 'text-emerald-400' : 'text-slate-500'
            }`}>
              <Clock className="w-3 h-3" />
              {item.openNow ? t.openNow : t.closedNow}
            </span>
          )}
        </div>

      </div>

      {/* Action Buttons: Phone & Get Directions */}
      <div className="mt-3.5 flex items-center gap-2">
        {item.phone && (
          <a
            href={`tel:${item.phone}`}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
          >
            <Phone className="w-3.5 h-3.5 text-teal-400" />
            <span>{t.callNow}</span>
          </a>
        )}

        <a
          href={item.googleMapsDirectionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex-1 px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5 active:scale-95"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>{t.getDirections}</span>
        </a>
      </div>

    </div>
  );
};
