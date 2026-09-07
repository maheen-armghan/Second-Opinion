import { DANGEROUS_INTERACTIONS, DrugInteractionRule } from './drugDatabase';
import { MatchedDrugResult } from './fuzzyMatcher';

export type SafetyStatus = 'SAFE' | 'DOSAGE_WARNING' | 'DANGEROUS_INTERACTION' | 'DUPLICATE_THERAPY' | 'UNREADABLE';

export interface PrescribedMedicineAnalysis {
  id: string;
  rawText: string;
  originalOcrText?: string;
  correctedByUser: boolean;
  genericName: string;
  brandName?: string;
  therapeuticClass: string;
  categoryEn: string;
  categoryUr: string;
  indicationEn: string;
  indicationUr: string;
  doseMg: number | null;
  frequency: string;
  confidenceScore: number;
  fieldConfidence: MatchedDrugResult['fieldConfidence'];
  isLowConfidence: boolean;
  ambiguousCandidates?: MatchedDrugResult['ambiguousCandidates'];
  contextLabel: {
    en: string;
    ur: string;
  };
  doseAlert?: {
    en: string;
    ur: string;
  };
}

export interface DuplicateTherapyAlert {
  classEn: string;
  classUr: string;
  drugA: string;
  drugB: string;
  messageEn: string;
  messageUr: string;
}

export interface FlagExplanationItem {
  type: 'interaction' | 'dosage' | 'duplicate_therapy' | 'low_confidence';
  titleEn: string;
  titleUr: string;
  oneLinerEn: string;
  oneLinerUr: string;
  mechanismEn?: string;
  mechanismUr?: string;
  recommendationEn?: string;
  recommendationUr?: string;
}

export interface PrescriptionAnalysisResult {
  overallStatus: SafetyStatus;
  statusTitle: {
    en: string;
    ur: string;
  };
  summary?: {
    en: string;
    ur: string;
  };
  statusDescription: {
    en: string;
    ur: string;
  };
  medicines: PrescribedMedicineAnalysis[];
  detectedInteractions: {
    ruleId: string;
    drugA: string;
    drugB: string;
    titleEn: string;
    titleUr: string;
    descEn: string;
    descUr: string;
    explanationEn: string;
    explanationUr: string;
    recommendationEn: string;
    recommendationUr: string;
  }[];
  dosageAlerts: {
    drugName: string;
    alertEn: string;
    alertUr: string;
  }[];
  duplicateTherapies: DuplicateTherapyAlert[];
  explainabilityPanel: FlagExplanationItem[];
  hasLowConfidence: boolean;
  unreadableFields: string[];
  doctorName?: string;
  patientName?: string;
  patientAge?: string;
  clinicName?: string;
  dateStr?: string;
  slipShortId?: string;
}

export function analyzePrescription(
  ocrMatches: MatchedDrugResult[],
  doctorName = 'Dr. Tariq Mahmood (FCPS)',
  patientName = 'Mohammad Rashid',
  clinicName = 'City Clinic & OPD Center, Lahore'
): PrescriptionAnalysisResult {
  const analyzedMedicines: PrescribedMedicineAnalysis[] = [];
  const dosageAlerts: PrescriptionAnalysisResult['dosageAlerts'] = [];
  const detectedInteractions: PrescriptionAnalysisResult['detectedInteractions'] = [];
  const duplicateTherapies: DuplicateTherapyAlert[] = [];
  const explainabilityPanel: FlagExplanationItem[] = [];
  const unreadableFields: string[] = [];

  let anyLowConfidence = false;

  for (let i = 0; i < ocrMatches.length; i++) {
    const item = ocrMatches[i];

    if (item.isLowConfidence || item.confidenceScore < 0.60) {
      anyLowConfidence = true;
      unreadableFields.push(`Medicine #${i + 1} (${item.rawOcrText || 'Unclear handwriting'})`);
    }

    const drug = item.matchedDrug;
    const genericName = drug ? drug.genericName : item.matchedName || 'Unknown Drug';
    const therapeuticClass = drug ? drug.therapeuticClass : 'Unclassified Medication';
    const categoryEn = drug ? drug.category.en : 'Unclassified Medication';
    const categoryUr = drug ? drug.category.ur : 'غیر واضح دوا';
    const indicationEn = drug ? drug.indication.en : 'Prescribed medical treatment';
    const indicationUr = drug ? drug.indication.ur : 'طبی علاج کے لیے تجویز کردہ دوا';

    let doseAlertEn: string | undefined;
    let doseAlertUr: string | undefined;

    if (item.doseWarning && item.doseWarning.isOutRange) {
      doseAlertEn = item.doseWarning.reasonEn;
      doseAlertUr = item.doseWarning.reasonUr;
      dosageAlerts.push({
        drugName: genericName,
        alertEn: doseAlertEn || '',
        alertUr: doseAlertUr || ''
      });

      explainabilityPanel.push({
        type: 'dosage',
        titleEn: `⚠️ Dosage Boundary Warning: ${genericName}`,
        titleUr: `⚠️ خوراک کی مقدار کی تنبیہ: ${genericName}`,
        oneLinerEn: doseAlertEn || '',
        oneLinerUr: doseAlertUr || '',
        recommendationEn: `Verify dosage of ${genericName} with prescribing physician.`,
        recommendationUr: `ڈاکٹر سے ${genericName} کی مقدار کی تصدیق کریں۔`
      });
    }

    const contextLabelEn = `${genericName} (${drug?.brandNames[0] || genericName}) — ${categoryEn}. ${indicationEn}`;
    const contextLabelUr = `${genericName} — ${categoryUr}۔ ${indicationUr}`;

    analyzedMedicines.push({
      id: `med-${i + 1}`,
      rawText: item.rawOcrText,
      originalOcrText: item.originalOcrText,
      correctedByUser: Boolean(item.correctedByUser),
      genericName,
      brandName: item.isBrandMatch ? item.matchedName : drug?.brandNames[0],
      therapeuticClass,
      categoryEn,
      categoryUr,
      indicationEn,
      indicationUr,
      doseMg: item.extractedDoseMg,
      frequency: item.extractedFrequency,
      confidenceScore: item.confidenceScore,
      fieldConfidence: item.fieldConfidence,
      isLowConfidence: item.isLowConfidence,
      ambiguousCandidates: item.ambiguousCandidates,
      contextLabel: {
        en: contextLabelEn,
        ur: contextLabelUr
      },
      doseAlert: doseAlertEn ? { en: doseAlertEn, ur: doseAlertUr || '' } : undefined
    });
  }

  // 1. Duplicate Therapy Check: 2+ drugs sharing same therapeuticClass
  const classGroups: Record<string, PrescribedMedicineAnalysis[]> = {};
  analyzedMedicines.forEach((m) => {
    if (m.therapeuticClass && m.therapeuticClass !== 'Unclassified Medication') {
      if (!classGroups[m.therapeuticClass]) classGroups[m.therapeuticClass] = [];
      classGroups[m.therapeuticClass].push(m);
    }
  });

  Object.entries(classGroups).forEach(([tClass, meds]) => {
    if (meds.length >= 2) {
      const drugAName = meds[0].genericName;
      const drugBName = meds[1].genericName;
      const msgEn = `Duplicate Therapy Warning: ${drugAName} and ${drugBName} both belong to the ${tClass} class.`;
      const msgUr = `تکراری علاج کی تنبیہ: ${drugAName} اور ${drugBName} دونوں ایک ہی شعبے (${tClass}) کی ادویات ہیں۔`;

      duplicateTherapies.push({
        classEn: tClass,
        classUr: tClass,
        drugA: drugAName,
        drugB: drugBName,
        messageEn: msgEn,
        messageUr: msgUr
      });

      explainabilityPanel.push({
        type: 'duplicate_therapy',
        titleEn: `⚠️ Duplicate Therapy: ${tClass}`,
        titleUr: `⚠️ تکراری علاج کی تنبیہ: ${tClass}`,
        oneLinerEn: msgEn,
        oneLinerUr: msgUr,
        recommendationEn: `Confirm with doctor whether duplicate ${tClass} prescribing was intentional or a transcription error.`,
        recommendationUr: `ڈاکٹر سے تصدیق کریں کہ آیا دونوں ادویات اکٹھی دینا ضروری ہے۔`
      });
    }
  });

  // 2. Drug-Drug Interactions Check
  const matchedGenericAndBrands = analyzedMedicines.map(m => [
    m.genericName.toLowerCase(),
    (m.brandName || '').toLowerCase(),
    m.rawText.toLowerCase()
  ]).flat().filter(Boolean);

  for (const rule of DANGEROUS_INTERACTIONS) {
    const drugALower = rule.drugA.toLowerCase();
    const drugBLower = rule.drugB.toLowerCase();

    const hasA = matchedGenericAndBrands.some(name => name.includes(drugALower) || drugALower.includes(name));
    const hasB = matchedGenericAndBrands.some(name => name.includes(drugBLower) || drugBLower.includes(name));

    if (hasA && hasB) {
      detectedInteractions.push({
        ruleId: rule.id,
        drugA: rule.drugA,
        drugB: rule.drugB,
        titleEn: rule.title.en,
        titleUr: rule.title.ur,
        descEn: rule.description.en,
        descUr: rule.description.ur,
        explanationEn: rule.explanationMechanism.en,
        explanationUr: rule.explanationMechanism.ur,
        recommendationEn: rule.clinicalRecommendation.en,
        recommendationUr: rule.clinicalRecommendation.ur
      });

      explainabilityPanel.push({
        type: 'interaction',
        titleEn: rule.title.en,
        titleUr: rule.title.ur,
        oneLinerEn: `${rule.drugA} + ${rule.drugB}: ${rule.description.en}`,
        oneLinerUr: `${rule.drugA} + ${rule.drugB}: ${rule.description.ur}`,
        mechanismEn: rule.explanationMechanism.en,
        mechanismUr: rule.explanationMechanism.ur,
        recommendationEn: rule.clinicalRecommendation.en,
        recommendationUr: rule.clinicalRecommendation.ur
      });
    }
  }

  // 3. Explainability for Low Confidence OCR
  if (anyLowConfidence) {
    explainabilityPanel.push({
      type: 'low_confidence',
      titleEn: '❓ Unreadable / Low Confidence Handwriting',
      titleUr: '❓ غیر واضح تحریر یا کم درستگی',
      oneLinerEn: `OCR confidence was below 60% threshold for: ${unreadableFields.join(', ')}.`,
      oneLinerUr: `منظر عام پر آنے والی تحریر 60 فیصد سے کم واضح ہے: ${unreadableFields.join(', ')}۔`,
      recommendationEn: 'Low OCR confidence overrides automated checks. Direct confirmation with prescribing doctor required.',
      recommendationUr: 'غیر واضح تحریر کی وجہ سے ڈاکٹر سے بالمشافہ تائید لازمی ہے۔'
    });
  }

  // 4. Determine Overall Safety Status (LOW CONFIDENCE ALWAYS WINS RULE)
  let overallStatus: SafetyStatus = 'SAFE';

  if (anyLowConfidence) {
    overallStatus = 'UNREADABLE';
  } else if (detectedInteractions.length > 0) {
    overallStatus = 'DANGEROUS_INTERACTION';
  } else if (duplicateTherapies.length > 0) {
    overallStatus = 'DUPLICATE_THERAPY';
  } else if (dosageAlerts.length > 0) {
    overallStatus = 'DOSAGE_WARNING';
  }

  // Status Titles & Descriptions
  const statusMessages = {
    SAFE: {
      title: { en: '✅ Looks Safe to Dispense', ur: '✅ نسخہ محفوظ معلوم ہوتا ہے' },
      desc: {
        en: 'No dangerous drug-drug interactions, duplicate therapies, or severe dosage anomalies detected. Always visually verify with patient record.',
        ur: 'کوئی خطرناک تضاد، دوا کی تکرار یا غلط مقدار نہیں پائی گئی۔ مریض کی معلومات کی پھر بھی تصدیق کریں۔'
      }
    },
    DOSAGE_WARNING: {
      title: { en: '⚠️ Dosage Out of Normal Range', ur: '⚠️ دوا کی مقدار عام حد سے باہر ہے' },
      desc: {
        en: 'One or more medicines exceed or fall below standard therapeutic single/daily limits. Confirm prescribed dose with doctor.',
        ur: 'ایک یا زائد ادویات کی خوراک عام حدود سے زیادہ یا کم ہے۔ ڈاکٹر سے تصدیق کریں۔'
      }
    },
    DUPLICATE_THERAPY: {
      title: { en: '⚠️ Duplicate Therapy Detected', ur: '⚠️ تکراری ادویاتی ملاپ کی نشاندہی' },
      desc: {
        en: 'Prescription contains two or more drugs belonging to the same therapeutic class. Verify if duplication was intentional.',
        ur: 'اس نسخے میں ایک ہی شعبے کی دو ادویات شامل ہیں۔ ڈاکٹر سے تکرار کی تائید کریں۔'
      }
    },
    DANGEROUS_INTERACTION: {
      title: { en: '🚫 Dangerous Drug Interaction Detected', ur: '🚫 شدید اور خطرناک ادویاتی تضاد' },
      desc: {
        en: 'CRITICAL SAFETY ALERT: This prescription contains a potentially harmful drug combination. Do not dispense without doctor review.',
        ur: 'انتباہ: اس نسخے میں ادویات کا ملاپ مریض کے لیے نقصان دہ ثابت ہو سکتا ہے۔ ڈاکٹر کے مشورے کے بغیر دوا نہ دیں۔'
      }
    },
    UNREADABLE: {
      title: { en: '❓ Unreadable / Low Confidence Handwriting', ur: '❓ تحریر غیر واضح یا مشکوک ہے' },
      desc: {
        en: 'Handwriting confidence fell below 60% threshold. System safety override active: contact doctor to verify prescription entries.',
        ur: 'ڈاکٹر کی بدخطی کی وجہ سے دوا پڑھنے میں 60 فیصد سے کم درستگی آئی ہے۔ ڈاکٹر سے تصدیق کریں۔'
      }
    }
  };

  const selectedMsg = statusMessages[overallStatus];

  // Plain language summary synthesis
  const medNamesEn = analyzedMedicines.map(m => m.genericName).join(', ');
  const medNamesUr = analyzedMedicines.map(m => m.genericName).join('، ');

  const summaryEn = analyzedMedicines.length === 0
    ? 'No clear medicines were detected on the prescription photo.'
    : `This prescription contains ${analyzedMedicines.length} medicine(s): ${medNamesEn}. ${
        overallStatus === 'SAFE'
          ? 'All medicines appear compatible and within standard dosage ranges.'
          : overallStatus === 'DANGEROUS_INTERACTION'
          ? 'ALERT: A high-risk drug interaction was flagged requiring immediate medical review.'
          : overallStatus === 'DUPLICATE_THERAPY'
          ? 'NOTE: Duplicate therapy was detected (multiple drugs in same class).'
          : overallStatus === 'DOSAGE_WARNING'
          ? 'NOTE: Dosage warnings were raised for one or more medicines.'
          : 'ATTENTION: Low handwriting confidence triggered automated fallback.'
      }`;

  const summaryUr = analyzedMedicines.length === 0
    ? 'نسخے کی تصویر میں کوئی دوا واضح طور پر نہیں مل سکی۔'
    : `اس نسخے میں ${analyzedMedicines.length} ادویات شامل ہیں: ${medNamesUr}۔ ${
        overallStatus === 'SAFE'
          ? 'تمام ادویات کی مقدار اور ملاپ محفوظ محسوس ہوتا ہے۔'
          : overallStatus === 'DANGEROUS_INTERACTION'
          ? 'انتباہ: خطرناک تضاد کی وجہ سے دوا دینے سے پہلے ڈاکٹر سے رابطہ کریں۔'
          : overallStatus === 'DUPLICATE_THERAPY'
          ? 'توجہ: ایک ہی شعبے کی دو ادویات کی تکرار پائی گئی ہے۔'
          : overallStatus === 'DOSAGE_WARNING'
          ? 'توجہ فرمائیں: ادویات کی مقدار میں تنبیہ موجود ہے۔'
          : 'توجہ: کم درستگی کی وجہ سے ڈاکٹر سے تصدیق لازمی ہے۔'
      }`;

  return {
    overallStatus,
    statusTitle: selectedMsg.title,
    statusDescription: selectedMsg.desc,
    medicines: analyzedMedicines,
    detectedInteractions,
    dosageAlerts,
    duplicateTherapies,
    explainabilityPanel,
    hasLowConfidence: anyLowConfidence,
    unreadableFields,
    summary: {
      en: summaryEn,
      ur: summaryUr
    },
    doctorName,
    patientName,
    clinicName,
    dateStr: new Date().toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' })
  };
}
