import { NextResponse } from 'next/server';
import { matchOcrTextToDrug } from '@/lib/fuzzyMatcher';
import { analyzePrescription } from '@/lib/interactionChecker';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { rawTextLines, doctorName, patientName, clinicName } = body;

    if (!Array.isArray(rawTextLines)) {
      return NextResponse.json({ success: false, error: 'rawTextLines must be an array of strings' }, { status: 400 });
    }

    // Step 1: Perform fuzzy matching & dosage extraction on each raw line
    const ocrMatches = rawTextLines.map((line: string) => matchOcrTextToDrug(line));

    // Step 2: Run interaction rules, dosage checks, and context label generation
    const analysis = analyzePrescription(
      ocrMatches,
      doctorName || 'Dr. M. Akram (MBBS, FCPS)',
      patientName || 'Chaudhry Muhammad Aslam',
      clinicName || 'City Clinic & OPD Center, Lahore'
    );

    return NextResponse.json({
      success: true,
      data: analysis,
    });
  } catch (error: any) {
    console.error('Prescription analysis error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
