import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { connectToDatabase } from '@/lib/db';
import AuditLog from '@/models/AuditLog';

export async function GET(req: Request) {
  try {
    const { isConnected, memoryStore } = await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const filterStatus = searchParams.get('status');

    if (isConnected) {
      const query: any = {};
      if (filterStatus && filterStatus !== 'ALL') {
        query.overallStatus = filterStatus;
      }
      const logs = await AuditLog.find(query).sort({ scannedAt: -1 }).limit(50);
      return NextResponse.json({ success: true, mode: 'mongodb', data: logs });
    } else {
      let filtered = [...memoryStore];
      if (filterStatus && filterStatus !== 'ALL') {
        filtered = filtered.filter(item => item.overallStatus === filterStatus);
      }
      filtered.sort((a, b) => new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime());
      return NextResponse.json({ success: true, mode: 'memory', data: filtered });
    }
  } catch (error: any) {
    console.error('Fetch history error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { analysisResult, prescriptionImage } = body;

    if (!analysisResult) {
      return NextResponse.json({ success: false, error: 'analysisResult is required' }, { status: 400 });
    }

    const { isConnected, memoryStore } = await connectToDatabase();

    const prescriptionId = `SEC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const medicinesList = analysisResult.medicines.map((m: any) => m.genericName);

    const logEntry = {
      prescriptionId,
      doctorName: analysisResult.doctorName || 'Dr. Prescribing Doctor',
      patientName: analysisResult.patientName || 'Patient',
      clinicName: analysisResult.clinicName || 'OPD Clinic, Pakistan',
      scannedAt: new Date(),
      overallStatus: analysisResult.overallStatus,
      medicinesCount: analysisResult.medicines.length,
      medicinesList,
      detectedInteractionsCount: analysisResult.detectedInteractions.length,
      dosageAlertsCount: analysisResult.dosageAlerts.length,
      summaryEn: analysisResult.summary.en,
      summaryUr: analysisResult.summary.ur,
      prescriptionImage: prescriptionImage || undefined,
      analysisDetails: analysisResult
    };

    if (isConnected) {
      const newLog = await AuditLog.create(logEntry);
      return NextResponse.json({ success: true, mode: 'mongodb', data: newLog });
    } else {
      memoryStore.unshift(logEntry);
      return NextResponse.json({ success: true, mode: 'memory', data: logEntry });
    }
  } catch (error: any) {
    console.error('Save history error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
