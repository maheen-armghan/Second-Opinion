'use client';

import React, { useState, useEffect, useTransition } from 'react';
import dynamic from 'next/dynamic';
import { Navbar } from '@/components/Navbar';
import { DoctorCard } from '@/components/DoctorCard';
import { TRANSLATIONS, Language } from '@/lib/translations';
import { DoctorClinicItem } from '@/app/api/doctors-near-me/route';
import {
  MapPin,
  Search,
  Crosshair,
  Filter,
  List,
  Map as MapIcon,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Stethoscope,
  Building2,
  AlertCircle
} from 'lucide-react';

// Dynamically import DoctorsMap component without SSR to avoid Leaflet window undefined errors
const DoctorsMap = dynamic(
  () => import('@/components/DoctorsMap').then((mod) => mod.DoctorsMap),
  { ssr: false, loading: () => <div className="w-full h-full min-h-[380px] bg-slate-900 animate-pulse rounded-2xl border border-slate-800 flex items-center justify-center text-slate-500 text-xs">Loading Interactive Map...</div> }
);

export default function DoctorsNearMePage() {
  const [lang, setLang] = useState<Language>('en');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>({
    lat: 31.4504,
    lng: 73.1350, // Default Faisalabad center coordinates
  });
  const [isLocating, setIsLocating] = useState(false);
  const [locationLabel, setLocationLabel] = useState<string>('faisalabadDefault');

  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [doctorsList, setDoctorsList] = useState<DoctorClinicItem[]>([]);
  const [dataSource, setDataSource] = useState<string>('live_health_network');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);

  const [mobileView, setMobileView] = useState<'split' | 'list' | 'map'>('split');

  const t = TRANSLATIONS[lang];
  const isUrdu = lang === 'ur';

  // Fetch live doctors & clinics from backend API proxy route
  const fetchDoctors = async (lat = userLocation.lat, lng = userLocation.lng, dept = selectedDepartment, q = searchQuery) => {
    setIsLoading(true);
    try {
      const url = `/api/doctors-near-me?lat=${lat}&lng=${lng}&department=${dept}&q=${encodeURIComponent(q)}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setDoctorsList(json.data || []);
        setDataSource(json.dataSource || 'live_health_network');
      }
    } catch (e) {
      console.error('Failed to fetch nearby doctors:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Browser Geolocation Trigger
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser. Using Faisalabad center.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: Number(position.coords.latitude.toFixed(4)),
          lng: Number(position.coords.longitude.toFixed(4)),
        };
        setUserLocation(coords);
        setLocationLabel('My Current GPS Location');
        setIsLocating(false);
        fetchDoctors(coords.lat, coords.lng, selectedDepartment, searchQuery);
      },
      (error) => {
        console.warn('Geolocation denied or failed, using Faisalabad default:', error);
        setIsLocating(false);
        setLocationLabel('faisalabadDefault');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Trigger fetch when department filter or user location changes
  useEffect(() => {
    fetchDoctors(userLocation.lat, userLocation.lng, selectedDepartment, searchQuery);
  }, [selectedDepartment]);

  const departmentChips = [
    { id: 'all', label: t.allDepartments, icon: '🩺' },
    { id: 'general_medicine', label: t.deptGeneralMedicine, icon: '👨‍⚕️' },
    { id: 'orthopedics', label: t.deptOrthopedics, icon: '🦴' },
    { id: 'neurology', label: t.deptNeurology, icon: '🧠' },
    { id: 'cardiology', label: t.deptCardiology, icon: '🫀' },
    { id: 'pediatrics', label: t.deptPediatrics, icon: '👶' },
    { id: 'gynecology', label: t.deptGynecology, icon: '👩‍⚕️' },
    { id: 'dermatology', label: t.deptDermatology, icon: '✨' },
    { id: 'ent', label: t.deptENT, icon: '👂' },
    { id: 'ophthalmology', label: t.deptOphthalmology, icon: '👁️' },
    { id: 'psychiatry', label: t.deptPsychiatry, icon: '🌱' },
    { id: 'dentistry', label: t.deptDentistry, icon: '🦷' },
  ];

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans ${isUrdu ? 'rtl font-urdu' : 'ltr'}`} dir={isUrdu ? 'rtl' : 'ltr'}>
      
      {/* Top Navigation */}
      <Navbar lang={lang} onToggleLang={() => setLang((prev) => (prev === 'en' ? 'ur' : 'en'))} />

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border-b border-emerald-500/20 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Live Map Directory
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {dataSource === 'google_places' ? t.dataSourceGoogle : t.dataSourceOSM}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              {t.doctorsNearMeTitle}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              {t.doctorsNearMeSubtext}
            </p>
          </div>

          {/* Geolocation Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleGetCurrentLocation}
              disabled={isLocating}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <Crosshair className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? t.locating : t.useMyLocation}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Search & Department Filter Bar */}
        <div className="space-y-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
          
          {/* Keyword Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder={t.searchDoctorPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchDoctors(userLocation.lat, userLocation.lng, selectedDepartment, searchQuery)}
              className="w-full pl-10 pr-24 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 transition-colors"
            />
            <button
              onClick={() => fetchDoctors(userLocation.lat, userLocation.lng, selectedDepartment, searchQuery)}
              className="absolute right-2 top-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg transition-colors"
            >
              Search
            </button>
          </div>

          {/* Department Scrollable Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
            <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
            {departmentChips.map((chip) => (
              <button
                key={chip.id}
                onClick={() => setSelectedDepartment(chip.id)}
                className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedDepartment === chip.id
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 scale-[1.02]'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <span>{chip.icon}</span>
                <span>{chip.label}</span>
              </button>
            ))}
          </div>

        </div>

        {/* Mobile View Toggle Switch (List vs Map) */}
        <div className="flex lg:hidden items-center justify-between bg-slate-900 p-1.5 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 font-medium px-2">
            {t.showingResults} ({doctorsList.length})
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setMobileView('list')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                mobileView === 'list' ? 'bg-emerald-600 text-white' : 'text-slate-400'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>{t.viewList}</span>
            </button>
            <button
              onClick={() => setMobileView('map')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                mobileView === 'map' ? 'bg-emerald-600 text-white' : 'text-slate-400'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>{t.viewMap}</span>
            </button>
          </div>
        </div>

        {/* Split Grid Layout (Map + Scrollable List) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Doctor Cards Scrollable List */}
          <div className={`lg:col-span-6 xl:col-span-5 space-y-3 ${
            mobileView === 'map' ? 'hidden lg:block' : 'block'
          }`}>
            <div className="hidden lg:flex items-center justify-between text-xs text-slate-400 px-1 mb-1">
              <span>{t.showingResults} ({doctorsList.length})</span>
              <span className="font-mono text-[11px] text-teal-400">
                Lat: {userLocation.lat}, Lng: {userLocation.lng}
              </span>
            </div>

            {isLoading ? (
              <div className="py-16 text-center space-y-3 bg-slate-900 border border-slate-800 rounded-2xl">
                <RefreshCw className="w-6 h-6 text-emerald-400 animate-spin mx-auto" />
                <p className="text-xs text-slate-400">Fetching live doctor & clinic data nearby...</p>
              </div>
            ) : doctorsList.length === 0 ? (
              <div className="py-16 text-center space-y-3 bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
                <p className="text-xs text-slate-300 max-w-sm mx-auto">{t.noDoctorsFound}</p>
                <button
                  onClick={() => {
                    setSelectedDepartment('all');
                    setSearchQuery('');
                  }}
                  className="px-3 py-1.5 bg-slate-800 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 hover:bg-slate-700"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
                {doctorsList.map((doc) => (
                  <DoctorCard
                    key={doc.id}
                    item={doc}
                    lang={lang}
                    isSelected={doc.id === selectedDoctorId}
                    onSelect={() => setSelectedDoctorId(doc.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Live Interactive Map */}
          <div className={`lg:col-span-6 xl:col-span-7 sticky top-20 h-[550px] sm:h-[640px] ${
            mobileView === 'list' ? 'hidden lg:block' : 'block'
          }`}>
            <DoctorsMap
              userLocation={userLocation}
              items={doctorsList}
              selectedId={selectedDoctorId}
              onSelectDoctor={(item) => setSelectedDoctorId(item.id)}
              lang={lang}
            />
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="bg-slate-900/80 border-t border-slate-800 text-slate-400 py-6 px-4 text-center text-xs mt-12">
        <div className="max-w-7xl mx-auto space-y-2">
          <p className="flex items-center justify-center gap-1.5 font-medium text-slate-300">
            <Stethoscope className="w-4 h-4 text-emerald-400" />
            {t.footerText}
          </p>
          <p className="text-slate-500 max-w-3xl mx-auto leading-relaxed text-[11px]">
            {t.disclaimer}
          </p>
        </div>
      </footer>

    </div>
  );
}
