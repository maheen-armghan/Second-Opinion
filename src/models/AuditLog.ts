import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
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
  prescriptionImage?: string;
  analysisDetails: any;
}

const AuditLogSchema: Schema = new Schema(
  {
    prescriptionId: { type: String, required: true, unique: true },
    doctorName: { type: String, required: true, default: 'Dr. M. Akram (MBBS, FCPS)' },
    patientName: { type: String, required: true, default: 'Patient' },
    clinicName: { type: String, required: true, default: 'City Clinic, Lahore' },
    scannedAt: { type: Date, default: Date.now },
    overallStatus: {
      type: String,
      enum: ['SAFE', 'DOSAGE_WARNING', 'DANGEROUS_INTERACTION', 'UNREADABLE'],
      required: true,
    },
    medicinesCount: { type: Number, default: 0 },
    medicinesList: [{ type: String }],
    detectedInteractionsCount: { type: Number, default: 0 },
    dosageAlertsCount: { type: Number, default: 0 },
    summaryEn: { type: String, required: true },
    summaryUr: { type: String, required: true },
    prescriptionImage: { type: String },
    analysisDetails: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export default mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
