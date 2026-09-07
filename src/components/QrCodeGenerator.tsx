'use client';

import React, { useEffect, useRef } from 'react';

interface QrCodeGeneratorProps {
  value: string;
  size?: number;
}

export const QrCodeGenerator: React.FC<QrCodeGeneratorProps> = ({ value, size = 120 }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    const generateQr = async () => {
      if (!containerRef.current || typeof window === 'undefined') return;
      
      try {
        // Simple canvas QR Code rendering using google chart QR service or inline SVG
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}&color=10b981&bgcolor=090d16`;
        if (isMounted && containerRef.current) {
          containerRef.current.innerHTML = `<img src="${qrUrl}" alt="Prescription Digital Slip QR Code" width="${size}" height="${size}" style="border-radius: 8px; border: 1px solid #1e293b;" />`;
        }
      } catch (err) {
        console.error('QR code generation error:', err);
      }
    };

    generateQr();

    return () => {
      isMounted = false;
    };
  }, [value, size]);

  return <div ref={containerRef} className="flex items-center justify-center p-1 bg-slate-950 rounded-xl border border-slate-800" />;
};
