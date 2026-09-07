import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

interface MemoryLogItem {
  prescriptionId: string;
  doctorName: string;
  patientName: string;
  clinicName: string;
  scannedAt: Date;
  overallStatus: 'SAFE' | 'DOSAGE_WARNING' | 'DANGEROUS_INTERACTION' | 'UNREADABLE';
  medicinesCount: number;
  medicinesList: string[];
  detectedInteractionsCount: number;
  dosageAlertsCount: number;
  summaryEn: string;
  summaryUr: string;
  analysisDetails: any;
}

// Global in-memory log cache for demo mode when MONGODB_URI is not set
const memoryLogs: MemoryLogItem[] = [];

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (!MONGODB_URI) {
    console.warn('⚠️ MONGODB_URI not set. Running Second Opinion in memory audit mode.');
    return { isConnected: false, memoryStore: memoryLogs };
  }

  if (cached.conn) {
    return { isConnected: true, conn: cached.conn, memoryStore: memoryLogs };
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('MongoDB Atlas Connection Error:', e);
    return { isConnected: false, memoryStore: memoryLogs };
  }

  return { isConnected: true, conn: cached.conn, memoryStore: memoryLogs };
}
