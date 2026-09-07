export interface MedicationReminderItem {
  drugName: string;
  doseMg: number | null;
  frequencyRaw: string;
  dailyTimes: string[]; // e.g. ["08:00 AM", "08:00 PM"]
  instructionsEn: string;
  instructionsUr: string;
}

export function parsePakistaniFrequencyToTimes(freqText: string): string[] {
  const upper = freqText.toUpperCase();

  // Numeric dash shorthand 1-0-1 (Twice daily morning & night)
  if (upper.includes('1-0-1') || upper.includes('BD') || upper.includes('TWICE')) {
    return ['08:00 AM', '08:00 PM'];
  }

  // Numeric dash shorthand 1-1-1 (Thrice daily morning, afternoon, night)
  if (upper.includes('1-1-1') || upper.includes('TDS') || upper.includes('THRICE')) {
    return ['08:00 AM', '02:00 PM', '08:00 PM'];
  }

  // Numeric dash shorthand 1-0-0 (Morning only)
  if (upper.includes('1-0-0') || upper.includes('OD') || upper.includes('MORNING')) {
    return ['08:00 AM'];
  }

  // Numeric dash shorthand 0-0-1 (Night only)
  if (upper.includes('0-0-1') || upper.includes('NIGHT')) {
    return ['09:00 PM'];
  }

  // QID 1-1-1-1 (Four times daily)
  if (upper.includes('QID') || upper.includes('1-1-1-1')) {
    return ['08:00 AM', '01:00 PM', '06:00 PM', '10:00 PM'];
  }

  // Default once daily
  return ['09:00 AM'];
}

export function parseMedicinesToSchedule(medicines: any[]): MedicationReminderItem[] {
  return medicines.map((med) => {
    const times = parsePakistaniFrequencyToTimes(med.frequency || med.rawText || '');
    return {
      drugName: med.genericName || med.rawText,
      doseMg: med.doseMg || null,
      frequencyRaw: med.frequency || 'OD',
      dailyTimes: times,
      instructionsEn: `Take ${med.doseMg ? `${med.doseMg}mg` : 'dose'} at ${times.join(', ')}.`,
      instructionsUr: `دن میں ${times.length} بار دوا کا استعمال کریں۔`,
    };
  });
}

// Generate standard .ics calendar file content for export to iOS/Android calendar apps
export function generateIcsCalendarFile(schedule: MedicationReminderItem[], patientName = 'Patient'): string {
  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Second Opinion Pakistan//Medication Reminder//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  schedule.forEach((item, index) => {
    item.dailyTimes.forEach((timeStr, ti) => {
      icsContent.push('BEGIN:VEVENT');
      icsContent.push(`UID:med-remind-${index}-${ti}-${Date.now()}@secondopinion.pk`);
      icsContent.push(`SUMMARY:💊 Take ${item.drugName} (${item.doseMg ? `${item.doseMg}mg` : ''})`);
      icsContent.push(`DESCRIPTION:Medication Reminder for ${patientName}: Take ${item.drugName} ${item.frequencyRaw}. Instructions: ${item.instructionsEn}`);
      icsContent.push('STATUS:CONFIRMED');
      icsContent.push('RRULE:FREQ=DAILY');
      icsContent.push('END:VEVENT');
    });
  });

  icsContent.push('END:VCALENDAR');
  return icsContent.join('\r\n');
}
