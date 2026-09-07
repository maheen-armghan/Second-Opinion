import { PAKISTAN_DRUG_DATABASE, DrugInfo } from './drugDatabase';

export interface FieldConfidence {
  score: number; // 0.0 to 1.0
  level: 'green' | 'yellow' | 'red';
}

export interface MatchedDrugResult {
  rawOcrText: string;
  matchedDrug: DrugInfo | null;
  matchedName: string;
  isBrandMatch: boolean;
  confidenceScore: number; // overall 0 to 1
  fieldConfidence: {
    drugName: FieldConfidence;
    dosage: FieldConfidence;
    frequency: FieldConfidence;
  };
  isLowConfidence: boolean; // true if any field < 0.60
  ambiguousCandidates?: { name: string; genericName: string; score: number }[];
  extractedDoseMg: number | null;
  extractedFrequency: string;
  correctedByUser?: boolean;
  originalOcrText?: string;
  doseWarning: {
    isOutRange: boolean;
    reasonEn?: string;
    reasonUr?: string;
  } | null;
}

// Levenshtein distance calculation
export function calculateLevenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  const str1 = a.toLowerCase().trim();
  const str2 = b.toLowerCase().trim();

  for (let i = 0; i <= str1.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= str2.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str1.length; i++) {
    for (let j = 1; j <= str2.length; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[str1.length][str2.length];
}

// Calculate similarity score between 0 and 1
export function calculateSimilarity(str1: string, str2: string): number {
  const clean1 = str1.toLowerCase().trim();
  const clean2 = str2.toLowerCase().trim();
  if (clean1 === clean2) return 1.0;
  if (clean1.includes(clean2) || clean2.includes(clean1)) return 0.88;

  const maxLen = Math.max(clean1.length, clean2.length);
  if (maxLen === 0) return 1.0;
  const dist = calculateLevenshteinDistance(clean1, clean2);
  return Math.max(0, 1 - dist / maxLen);
}

// Helper to determine green / yellow / red level
export function getConfidenceLevel(score: number): 'green' | 'yellow' | 'red' {
  if (score >= 0.85) return 'green';
  if (score >= 0.60) return 'yellow';
  return 'red';
}

// Extract dosage numerical value (e.g., "Panadol 500mg" -> 500)
export function extractDoseMg(text: string): number | null {
  const mgMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:mg|g|mcg|ml)/i);
  if (mgMatch) {
    let val = parseFloat(mgMatch[1]);
    if (text.toLowerCase().includes(' g') && !text.toLowerCase().includes('mg')) {
      val = val * 1000;
    }
    return val;
  }

  const standaloneMatch = text.match(/\b(10|20|25|40|50|75|80|100|200|250|400|500|600|750|850|1000)\b/);
  if (standaloneMatch) {
    return parseFloat(standaloneMatch[1]);
  }

  return null;
}

// Extract frequency code
export function extractFrequency(text: string): string {
  const upper = text.toUpperCase();
  if (upper.includes('1-0-1') || upper.includes('BD') || upper.includes('B.D') || upper.includes('TWICE')) return 'BD (1-0-1 / Twice Daily)';
  if (upper.includes('1-1-1') || upper.includes('TDS') || upper.includes('T.D.S') || upper.includes('THRICE')) return 'TDS (1-1-1 / Thrice Daily)';
  if (upper.includes('1-0-0') || upper.includes('0-0-1') || upper.includes('OD') || upper.includes('O.D') || upper.includes('DAILY')) return 'OD (1-0-0 / Once Daily)';
  if (upper.includes('QID') || upper.includes('1-1-1-1')) return 'QID (Four times daily)';
  if (upper.includes('SOS') || upper.includes('PRN') || upper.includes('AS NEEDED')) return 'SOS (As Needed)';
  return 'OD (Once Daily)';
}

export function matchOcrTextToDrug(rawLine: string, originalText?: string, isCorrected?: boolean): MatchedDrugResult {
  const cleanLine = rawLine.trim();
  const dose = extractDoseMg(cleanLine);
  const freq = extractFrequency(cleanLine);

  // Extract clean drug token by removing numerical dosage & frequency patterns
  const drugToken = cleanLine
    .replace(/(\d+(?:\.\d+)?)\s*(?:mg|g|mcg|ml)/gi, '')
    .replace(/1-0-1|1-1-1|1-0-0|0-0-1|BD|TDS|OD|QID|SOS|PRN/gi, '')
    .replace(/\(.*?\)/g, '')
    .replace(/[\-\?]/g, ' ')
    .trim();

  let bestMatch: DrugInfo | null = null;
  let bestMatchedName = '';
  let bestScore = 0;
  let isBrand = false;

  const candidateScores: { drug: DrugInfo; name: string; score: number }[] = [];

  // Compare both full line and extracted drug token against generic & brand names
  for (const drug of PAKISTAN_DRUG_DATABASE) {
    const genericScoreFull = calculateSimilarity(cleanLine, drug.genericName);
    const genericScoreToken = calculateSimilarity(drugToken, drug.genericName);
    const genericScore = Math.max(genericScoreFull, genericScoreToken);

    candidateScores.push({ drug, name: drug.genericName, score: genericScore });

    if (genericScore > bestScore) {
      bestScore = genericScore;
      bestMatch = drug;
      bestMatchedName = drug.genericName;
      isBrand = false;
    }

    for (const brand of drug.brandNames) {
      const brandScoreFull = calculateSimilarity(cleanLine, brand);
      const brandScoreToken = calculateSimilarity(drugToken, brand);
      const brandScore = Math.max(brandScoreFull, brandScoreToken);

      candidateScores.push({ drug, name: brand, score: brandScore });

      if (brandScore > bestScore) {
        bestScore = brandScore;
        bestMatch = drug;
        bestMatchedName = brand;
        isBrand = true;
      }
    }
  }

  // Debug trace logging for raw vs matched output
  if (bestScore < 0.85) {
    console.log(`[FuzzyMatcher] Trace mismatch/low-confidence for raw line: "${rawLine}" -> Token: "${drugToken}", Best Match: "${bestMatchedName}" (Score: ${bestScore.toFixed(2)})`);
  } else {
    console.log(`[FuzzyMatcher] Clean match for raw line: "${rawLine}" -> "${bestMatch?.genericName}" (Score: ${bestScore.toFixed(2)})`);
  }

  // Sort candidate matches descending by score
  candidateScores.sort((a, b) => b.score - a.score);

  // Check for ambiguous candidates (top candidates with scores close to bestScore)
  const ambiguousCandidates = candidateScores
    .slice(0, 3)
    .filter((c) => c.score >= 0.40 && Math.abs(bestScore - c.score) <= 0.15)
    .map((c) => ({ name: c.name, genericName: c.drug.genericName, score: Number(c.score.toFixed(2)) }));

  // Evaluate per-field confidence scores
  const drugNameScore = Number(bestScore.toFixed(2));
  const doseScore = dose !== null ? 0.95 : (cleanLine.toLowerCase().includes('mg') ? 0.80 : 0.45);
  const freqScore = cleanLine.match(/1-0-1|1-1-1|1-0-0|BD|TDS|OD|QID/i) ? 0.95 : 0.70;

  const overallConfidence = Math.min(1.0, Number(bestScore.toFixed(2)));
  const isLowConfidence = drugNameScore < 0.60 || doseScore < 0.60;

  // Evaluate dosage range warnings if matched
  let doseWarning: MatchedDrugResult['doseWarning'] = null;
  if (bestMatch && dose !== null) {
    if (dose > bestMatch.normalSingleDoseMg.max) {
      doseWarning = {
        isOutRange: true,
        reasonEn: `High Single Dose: ${dose}mg exceeds maximum recommended single dose (${bestMatch.normalSingleDoseMg.max}mg) for ${bestMatch.genericName}.`,
        reasonUr: `زیادہ خوراک: ${dose} ملی گرام ${bestMatch.genericName} کی تجویز کردہ سنگل ڈوز (${bestMatch.normalSingleDoseMg.max}mg) سے زیادہ ہے۔`
      };
    } else if (dose < bestMatch.normalSingleDoseMg.min) {
      doseWarning = {
        isOutRange: true,
        reasonEn: `Sub-therapeutic Dose: ${dose}mg is below standard therapeutic dosage range (${bestMatch.normalSingleDoseMg.min}mg - ${bestMatch.normalSingleDoseMg.max}mg).`,
        reasonUr: `کم خوراک: ${dose} ملی گرام کی مقدار تجویز کردہ نچلی سطح سے کم ہے۔`
      };
    }
  }

  return {
    rawOcrText: rawLine,
    originalOcrText: originalText || rawLine,
    correctedByUser: Boolean(isCorrected),
    matchedDrug: bestScore >= 0.45 ? bestMatch : null,
    matchedName: bestScore >= 0.45 ? bestMatchedName : cleanLine,
    isBrandMatch: isBrand,
    confidenceScore: overallConfidence,
    fieldConfidence: {
      drugName: { score: drugNameScore, level: getConfidenceLevel(drugNameScore) },
      dosage: { score: doseScore, level: getConfidenceLevel(doseScore) },
      frequency: { score: freqScore, level: getConfidenceLevel(freqScore) },
    },
    isLowConfidence,
    ambiguousCandidates: ambiguousCandidates.length > 1 ? ambiguousCandidates : undefined,
    extractedDoseMg: dose,
    extractedFrequency: freq,
    doseWarning,
  };
}
