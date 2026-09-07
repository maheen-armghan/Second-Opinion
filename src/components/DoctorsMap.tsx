'use client';

import React, { useEffect, useRef } from 'react';
import { DoctorClinicItem } from '@/app/api/doctors-near-me/route';
import { Language, TRANSLATIONS } from '@/lib/translations';

interface DoctorsMapProps {
  userLocation: { lat: number; lng: number };
  items: DoctorClinicItem[];
  selectedId: string | null;
  onSelectDoctor: (item: DoctorClinicItem) => void;
  lang: Language;
}

export const DoctorsMap: React.FC<DoctorsMapProps> = ({
  userLocation,
  items,
  selectedId,
  onSelectDoctor,
  lang,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<{ [id: string]: any }>({});
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    // Dynamically import Leaflet on client side
    let isMounted = true;

    const initMap = async () => {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;

      const L = (await import('leaflet')).default;

      // Import Leaflet CSS dynamically if not present
      if (!document.getElementById('leaflet-css-bundle')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css-bundle';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      if (!isMounted) return;

      // Initialize map instance if not existing
      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [userLocation.lat, userLocation.lng],
          zoom: 13,
          zoomControl: false,
        });

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        // OpenStreetMap Dark/Standard tiles
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        mapInstanceRef.current = map;
      }

      const map = mapInstanceRef.current;
      map.setView([userLocation.lat, userLocation.lng], map.getZoom());

      // Clear existing markers
      Object.values(markersRef.current).forEach((m) => m.remove());
      markersRef.current = {};

      // User location pulsing pin icon
      const userIcon = L.divIcon({
        className: 'user-pin-icon',
        html: `
          <div class="relative flex items-center justify-center w-8 h-8">
            <div class="absolute w-8 h-8 rounded-full bg-emerald-500/30 animate-ping"></div>
            <div class="w-5 h-5 rounded-full bg-emerald-500 border-2 border-white shadow-lg flex items-center justify-center">
              <div class="w-2 h-2 rounded-full bg-slate-950"></div>
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .addTo(map)
        .bindPopup(`<b>${lang === 'ur' ? 'آپ کی لوکیشن' : 'Your Location'}</b><br/>${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`);

      markersRef.current['user-loc'] = userMarker;

      // Plot doctor / clinic markers
      items.forEach((item) => {
        const isSelected = item.id === selectedId;

        const doctorIcon = L.divIcon({
          className: 'doctor-pin-icon',
          html: `
            <div class="relative group cursor-pointer">
              <div class="w-8 h-8 rounded-xl ${
                isSelected
                  ? 'bg-emerald-500 ring-4 ring-emerald-400/40 scale-110'
                  : 'bg-slate-900 hover:bg-slate-800'
              } border-2 ${
                isSelected ? 'border-white' : 'border-emerald-400'
              } shadow-xl text-emerald-400 flex items-center justify-center transition-all">
                <svg class="w-4 h-4 ${isSelected ? 'text-slate-950' : 'text-emerald-400'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0 0h4m-4 0H7m4 0v4m0 0h4m-4 0H7"></path>
                </svg>
              </div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
        });

        const popupContent = `
          <div style="font-family: sans-serif; min-width: 180px; text-align: left;">
            <div style="font-size: 11px; font-weight: 700; color: #059669; text-transform: uppercase; margin-bottom: 2px;">
              ${item.clinicHospitalName}
            </div>
            <div style="font-size: 14px; font-weight: 700; color: #0f172a;">
              ${item.name}
            </div>
            <div style="font-size: 11px; color: #475569; margin-top: 2px;">
              ${item.address}
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 8px; pt-6; border-top: 1px solid #e2e8f0;">
              <span style="font-size: 11px; font-weight: 700; color: #10b981;">
                📍 ${item.distanceKm} km
              </span>
              <a href="${item.googleMapsDirectionsUrl}" target="_blank" style="font-size: 11px; font-weight: 700; color: #2563eb; text-decoration: none;">
                Get Directions ↗
              </a>
            </div>
          </div>
        `;

        const marker = L.marker([item.lat, item.lng], { icon: doctorIcon })
          .addTo(map)
          .bindPopup(popupContent);

        marker.on('click', () => {
          onSelectDoctor(item);
        });

        markersRef.current[item.id] = marker;

        if (isSelected) {
          marker.openPopup();
          map.panTo([item.lat, item.lng], { animate: true });
        }
      });
    };

    initMap();

    return () => {
      isMounted = false;
    };
  }, [userLocation, items, selectedId, lang]);

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
      <div ref={mapContainerRef} className="w-full h-full min-h-[380px] bg-slate-950" />
    </div>
  );
};
