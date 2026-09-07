export interface DrugInfo {
  id: string;
  genericName: string;
  brandNames: string[];
  therapeuticClass: string; // e.g. "NSAID", "ACE Inhibitor", "Penicillin Antibiotic"
  category: {
    en: string;
    ur: string;
  };
  indication: {
    en: string;
    ur: string;
  };
  defaultUnit: string;
  normalSingleDoseMg: {
    min: number;
    max: number;
  };
  normalDailyDoseMg: {
    max: number;
  };
  warnings: {
    en: string[];
    ur: string[];
  };
}

export interface DrugInteractionRule {
  id: string;
  drugA: string; // generic or brand name
  drugB: string; // generic or brand name
  severity: 'high' | 'moderate' | 'low';
  title: {
    en: string;
    ur: string;
  };
  description: {
    en: string;
    ur: string;
  };
  clinicalRecommendation: {
    en: string;
    ur: string;
  };
  explanationMechanism: {
    en: string;
    ur: string;
  };
}

export const PAKISTAN_DRUG_DATABASE: DrugInfo[] = [
  {
    id: 'paracetamol',
    genericName: 'Paracetamol',
    brandNames: ['Panadol', 'Calpol', 'Disprol', 'Febrol', 'Askari Paracetamol', 'Feverol'],
    therapeuticClass: 'Analgesic & Antipyretic',
    category: {
      en: 'Analgesic & Antipyretic (Pain & Fever)',
      ur: 'درد اور بخار کی دوا (اینالجیسک)'
    },
    indication: {
      en: 'Used for mild to moderate pain relief and reducing fever.',
      ur: 'ہلکے سے درمیانے درجے کے درد اور بخار کو کم کرنے کے لیے استعمال ہوتی ہے۔'
    },
    defaultUnit: 'mg',
    normalSingleDoseMg: { min: 250, max: 1000 },
    normalDailyDoseMg: { max: 4000 },
    warnings: {
      en: ['Do not exceed 4,000 mg per day to avoid severe liver damage.', 'Check for combination cough/cold medicines containing paracetamol.'],
      ur: ['جگر کے شدید نقصان سے بچنے کے لیے روزانہ 4000 ملی گرام سے زیادہ نہ لیں۔', 'نزلہ زکام کی دیگر ادویات میں بھی پیراسیٹامول کی موجودگی چیک کریں۔']
    }
  },
  {
    id: 'amoxicillin',
    genericName: 'Amoxicillin',
    brandNames: ['Amoxil', 'Penamox', 'Mox', 'Amoxi-clav', 'Augmentin'],
    therapeuticClass: 'Penicillin Antibiotic',
    category: {
      en: 'Penicillin Antibiotic',
      ur: 'پینسلین اینٹی بائیوٹک (بیکٹیریل انفیکشن)'
    },
    indication: {
      en: 'Used for bacterial infections including chest, throat, ear, and urinary tract infections.',
      ur: 'سینے، گلے، کان اور پیشاب کی نالی کے بیکٹیریل انفیکشن کے لیے استعمال ہوتی ہے۔'
    },
    defaultUnit: 'mg',
    normalSingleDoseMg: { min: 250, max: 1000 },
    normalDailyDoseMg: { max: 3000 },
    warnings: {
      en: ['Complete full prescribed course even if symptoms improve.', 'High risk of allergic reactions in patients allergic to Penicillin.'],
      ur: ['علامات بہتر ہونے کے باوجود دوا کا مکمل کورس پورا کریں۔', 'پنسلن سے الرجی والے مریضوں میں محتاط رہیں۔']
    }
  },
  {
    id: 'ibuprofen',
    genericName: 'Ibuprofen',
    brandNames: ['Brufen', 'Advium', 'Ibex', 'Profen'],
    therapeuticClass: 'NSAID',
    category: {
      en: 'NSAID (Pain & Inflammation)',
      ur: 'سوزش اور درد کش دوا (NSAID)'
    },
    indication: {
      en: 'Used to relieve pain, swelling, and fever associated with arthritis or injury.',
      ur: 'جوڑوں کے درد، سوجن اور جسمانی چوٹ کا درد کم کرنے کے لیے استعمال ہوتی ہے۔'
    },
    defaultUnit: 'mg',
    normalSingleDoseMg: { min: 200, max: 800 },
    normalDailyDoseMg: { max: 2400 },
    warnings: {
      en: ['Take with food to prevent gastric ulcers or stomach bleeding.', 'Avoid in severe asthma or kidney failure.'],
      ur: ['معدے کی تیزابیت اور زخم سے بچنے کے لیے کھانے کے بعد لیں۔', 'گردے کے امراض میں احتیاط برتیں۔']
    }
  },
  {
    id: 'diclofenac',
    genericName: 'Diclofenac',
    brandNames: ['Voltral', 'Voveran', 'Dicloran', 'Artren'],
    therapeuticClass: 'NSAID',
    category: {
      en: 'NSAID (Pain & Inflammation)',
      ur: 'سوزش اور درد کش دوا (NSAID)'
    },
    indication: {
      en: 'Used for acute joint pain, arthritis, and post-surgical pain.',
      ur: 'جوڑوں کے شدید درد اور سوجن کو کم کرنے کے لیے استعمال ہوتی ہے۔'
    },
    defaultUnit: 'mg',
    normalSingleDoseMg: { min: 25, max: 75 },
    normalDailyDoseMg: { max: 150 },
    warnings: {
      en: ['High risk of gastric bleeding if combined with another NSAID like Ibuprofen.', 'Avoid prolonged continuous use.'],
      ur: ['دیگر این ایس اے آئی ڈی ادویات کے ساتھ ملا کر کھانے سے معدے میں زخم کا شدید خطرہ ہوتا ہے۔']
    }
  },
  {
    id: 'metronidazole',
    genericName: 'Metronidazole',
    brandNames: ['Flagyl', 'Metrozine', 'Entamizole'],
    therapeuticClass: 'Antiprotozoal & Antibacterial',
    category: {
      en: 'Antiprotozoal & Antibacterial',
      ur: 'پیٹ اور اینٹی بیکٹیریل اینٹی بائیوٹک'
    },
    indication: {
      en: 'Used for intestinal infections, diarrhea, stomach bugs, and anaerobic infections.',
      ur: 'پیٹ کے انفیکشن، اسہال (ڈائریا) اور معدے کی بیماریوں کے لیے استعمال ہوتی ہے۔'
    },
    defaultUnit: 'mg',
    normalSingleDoseMg: { min: 200, max: 500 },
    normalDailyDoseMg: { max: 1500 },
    warnings: {
      en: ['Avoid alcohol completely during treatment (causes disulfiram-like reaction).', 'May cause a metallic taste.'],
      ur: ['علاج کے دوران الکحل یا اس سے بنی ادویات سے مکمل پرہیز کریں۔', 'منہ کا ذائقہ دھاتی ہو سکتا ہے۔']
    }
  },
  {
    id: 'omeprazole',
    genericName: 'Omeprazole',
    brandNames: ['Risek', 'Omez', 'Zecer', 'Prilosec'],
    therapeuticClass: 'Proton Pump Inhibitor',
    category: {
      en: 'Proton Pump Inhibitor (Antacid)',
      ur: 'معدے کی تیزابیت کی دوا (PPI)'
    },
    indication: {
      en: 'Used for stomach acid, acid reflux (GERD), and stomach ulcer prevention.',
      ur: 'معدے میں تیزابیت، جلن اور السر کے علاج و بچاؤ کے لیے استعمال ہوتی ہے۔'
    },
    defaultUnit: 'mg',
    normalSingleDoseMg: { min: 20, max: 40 },
    normalDailyDoseMg: { max: 80 },
    warnings: {
      en: ['Best taken 30-60 minutes before morning meal.', 'Long-term use requires monitoring magnesium levels.'],
      ur: ['صبح کے کھانے سے 30 منٹ پہلے نہار منہ لینا زیادہ مفید ہے۔', 'طویل مدتی استعمال سے وٹامن اور میگنیشیم چیک کروائیں۔']
    }
  },
  {
    id: 'atorvastatin',
    genericName: 'Atorvastatin',
    brandNames: ['Lipiget', 'Lipitor', 'Atorva', 'Torvast'],
    therapeuticClass: 'Statin',
    category: {
      en: 'Statin (Cholesterol Reducer)',
      ur: 'کولیسٹرول کم کرنے کی دوا (Statin)'
    },
    indication: {
      en: 'Used to lower bad cholesterol (LDL) and reduce risk of heart attacks and stroke.',
      ur: 'خون میں کولیسٹرول کم کرنے اور دل کے دورے کے خطرے کو گھٹانے کے لیے استعمال ہوتی ہے۔'
    },
    defaultUnit: 'mg',
    normalSingleDoseMg: { min: 10, max: 80 },
    normalDailyDoseMg: { max: 80 },
    warnings: {
      en: ['Report unexplained muscle pain or weakness immediately.', 'Take preferably in the evening.'],
      ur: ['پٹھوں میں مسلسل درد یا کمزوری کی صورت میں فوری ڈاکٹر کو بتائیں۔', 'رات کو لینا زیادہ موثر ہوتا ہے۔']
    }
  },
  {
    id: 'aspirin',
    genericName: 'Aspirin',
    brandNames: ['Disprin', 'Ascard', 'Loprin', 'Ecprin'],
    therapeuticClass: 'Antiplatelet',
    category: {
      en: 'Antiplatelet & NSAID (Blood Thinner)',
      ur: 'خون پتلا کرنے اور درد کی دوا (Antiplatelet)'
    },
    indication: {
      en: 'Prevents blood clots, heart attack, and stroke; reduces pain/fever at higher doses.',
      ur: 'خون کے لوتھڑے بننے سے روکتی ہے اور دل کے دورے سے حفاظت کرتی ہے۔'
    },
    defaultUnit: 'mg',
    normalSingleDoseMg: { min: 75, max: 300 },
    normalDailyDoseMg: { max: 325 },
    warnings: {
      en: ['Increases bleeding risk when combined with blood thinners like Warfarin.', 'Avoid in children under 16 due to Reye syndrome risk.'],
      ur: ['وارفرین یا دیگر خون پتلا کرنے والی ادویات کے ساتھ خون بہنے کا شدید خطرہ ہوتا ہے۔', 'بچوں کو بغیر ڈاکٹر کے مشورے کے نہ دیں۔']
    }
  },
  {
    id: 'warfarin',
    genericName: 'Warfarin',
    brandNames: ['Coumadin', 'Warf', 'Warfarin-BCP'],
    therapeuticClass: 'Anticoagulant',
    category: {
      en: 'Anticoagulant (Major Blood Thinner)',
      ur: 'شدید خون پتلا کرنے کی دوا (Anticoagulant)'
    },
    indication: {
      en: 'Used to treat and prevent deep vein thrombosis (DVT), pulmonary embolism, and stroke in atrial fibrillation.',
      ur: 'خون کی نالیوں میں لوتھڑے بننے کے علاج اور فالج سے بچاؤ کے لیے استعمال ہوتی ہے۔'
    },
    defaultUnit: 'mg',
    normalSingleDoseMg: { min: 1, max: 10 },
    normalDailyDoseMg: { max: 10 },
    warnings: {
      en: ['HIGH RISK DRUG: Requires strict INR monitoring.', 'Severe interaction with Aspirin and NSAIDs causing life-threatening bleeding.'],
      ur: ['انتہائی حساس دوا: باقاعدگی سے خون کا ٹیسٹ (INR) کروائیں۔', 'ڈسپریشن/ایسپرین کے ساتھ ملا کر لینے سے اندرونی خون بہنے کا جان لیوا خطرہ ہے۔']
    }
  },
  {
    id: 'enalapril',
    genericName: 'Enalapril',
    brandNames: ['Renitec', 'Vasotec', 'Envas', 'Enalapril-Sandoz'],
    therapeuticClass: 'ACE Inhibitor',
    category: {
      en: 'ACE Inhibitor (Blood Pressure)',
      ur: 'بلڈ پریشر اور دل کی دوا (ACE Inhibitor)'
    },
    indication: {
      en: 'Used to treat high blood pressure and heart failure.',
      ur: 'ہائی بلڈ پریشر اور دل کی ناکامی (ہارٹ فیلیر) کے علاج کے لیے استعمال ہوتی ہے۔'
    },
    defaultUnit: 'mg',
    normalSingleDoseMg: { min: 2.5, max: 20 },
    normalDailyDoseMg: { max: 40 },
    warnings: {
      en: ['Can raise blood potassium levels (hyperkalemia) if taken with Spironolactone or Potassium supplements.', 'May cause a persistent dry cough.'],
      ur: ['پوٹاشیم سپلیمنٹس یا اسپرونولیکٹون کے ساتھ پوٹاشیم لیول خطرناک حد تک بڑھ سکتا ہے۔', 'خشک کھانسی کی شکایت ہو سکتی ہے۔']
    }
  },
  {
    id: 'lisinopril',
    genericName: 'Lisinopril',
    brandNames: ['Zestril', 'Prinivil'],
    therapeuticClass: 'ACE Inhibitor',
    category: {
      en: 'ACE Inhibitor (Blood Pressure)',
      ur: 'بلڈ پریشر کی دوا (ACE Inhibitor)'
    },
    indication: {
      en: 'Used to treat hypertension and heart failure.',
      ur: 'بلڈ پریشر اور ہارٹ فیلیر کے علاج کے لیے استعمال ہوتی ہے۔'
    },
    defaultUnit: 'mg',
    normalSingleDoseMg: { min: 5, max: 20 },
    normalDailyDoseMg: { max: 40 },
    warnings: {
      en: ['Combining with Enalapril is duplicate therapy of the same ACE Inhibitor class.'],
      ur: ['اینالاپرل کے ساتھ اکٹھا دینا ایک ہی شعبے کی دوا کی تکرار ہے۔']
    }
  },
  {
    id: 'spironolactone',
    genericName: 'Spironolactone',
    brandNames: ['Aldactone', 'Spilactone'],
    therapeuticClass: 'Potassium-Sparing Diuretic',
    category: {
      en: 'Potassium-Sparing Diuretic',
      ur: 'پوٹاشیم بچانے والی پیشاب آور دوا'
    },
    indication: {
      en: 'Used for heart failure, fluid retention (edema), high blood pressure, and low potassium levels.',
      ur: 'جسم میں پانی کا جمع ہونا، ہائی بلڈ پریشر اور پوٹاشیم کی کمی کے لیے استعمال ہوتی ہے۔'
    },
    defaultUnit: 'mg',
    normalSingleDoseMg: { min: 25, max: 100 },
    normalDailyDoseMg: { max: 200 },
    warnings: {
      en: ['Do not take potassium supplements alongside. Danger of cardiac arrhythmia.'],
      ur: ['ساتھ پوٹاشیم سپلیمنٹس نہ لیں۔ دل کی دھڑکن بے ترتیب ہونے کا خطرہ۔']
    }
  },
  {
    id: 'potassium_chloride',
    genericName: 'Potassium Chloride',
    brandNames: ['K-Continuum', 'K-Lite', 'KSR', 'Potassium-K'],
    therapeuticClass: 'Electrolyte Supplement',
    category: {
      en: 'Electrolyte Supplement',
      ur: 'پوٹاشیم کا سپلیمنٹ (الیکٹرولائٹ)'
    },
    indication: {
      en: 'Used to prevent or treat low blood potassium levels (hypokalemia).',
      ur: 'خون میں پوٹاشیم کی کمی کا علاج کرنے کے لیے استعمال ہوتی ہے۔'
    },
    defaultUnit: 'mg',
    normalSingleDoseMg: { min: 300, max: 600 },
    normalDailyDoseMg: { max: 1200 },
    warnings: {
      en: ['Combining with Enalapril/Lisinopril or Spironolactone can trigger fatal hyperkalemia.'],
      ur: ['بلڈ پریشر کی دوا (Enalapril) یا Aldactone کے ساتھ ملا کر لینے سے پوٹاشیم خطرناک حد تک بڑھ سکتا ہے۔']
    }
  },
  {
    id: 'ciprofloxacin',
    genericName: 'Ciprofloxacin',
    brandNames: ['Cipro', 'Ciprobay', 'Mercip', 'Ciproxin'],
    therapeuticClass: 'Fluoroquinolone Antibiotic',
    category: {
      en: 'Fluoroquinolone Antibiotic',
      ur: 'فلوروکوئنولون اینٹی بائیوٹک'
    },
    indication: {
      en: 'Used to treat serious bacterial infections of typhoid, kidneys, joints, and severe gastroenteritis.',
      ur: 'ٹائیفائڈ، گردے کے سخت انفیکشن اور پیٹ کی شدید بیماریوں کے لیے استعمال ہوتی ہے۔'
    },
    defaultUnit: 'mg',
    normalSingleDoseMg: { min: 250, max: 750 },
    normalDailyDoseMg: { max: 1500 },
    warnings: {
      en: ['Do not take with milk, calcium, or antacids simultaneously (impairs absorption).', 'Risk of tendonitis.'],
      ur: ['دودھ یا اینٹاسڈ ڈرگز کے ساتھ ایک وقت میں نہ لیں۔ دوا کا اثر ختم ہو جاتا ہے۔']
    }
  },
  {
    id: 'cetirizine',
    genericName: 'Cetirizine',
    brandNames: ['Softin', 'Zyrtec', 'Rigix', 'Cetrinet'],
    therapeuticClass: 'Antihistamine',
    category: {
      en: 'Antihistamine (Allergy)',
      ur: 'الرجی اور چھینکوں کی دوا (Antihistamine)'
    },
    indication: {
      en: 'Used for allergy relief, runny nose, hives, itching, and sneezing.',
      ur: 'چھینکوں، الرجی، خارش اور زکام کی تکلیف کم کرنے کے لیے استعمال ہوتی ہے۔'
    },
    defaultUnit: 'mg',
    normalSingleDoseMg: { min: 5, max: 10 },
    normalDailyDoseMg: { max: 10 },
    warnings: {
      en: ['May cause mild drowsiness. Exercise caution when driving.'],
      ur: ['ہلکی غنودگی ہو سکتی ہے۔ ڈرائیونگ میں احتیاط کریں۔']
    }
  }
];

export const DANGEROUS_INTERACTIONS: DrugInteractionRule[] = [
  {
    id: 'rule-warfarin-aspirin',
    drugA: 'Warfarin',
    drugB: 'Aspirin',
    severity: 'high',
    title: {
      en: 'Severe Bleeding Danger: Warfarin + Aspirin',
      ur: 'شدید خون بہنے کا جان لیوا خطرہ: وارفرین + ایسپرین'
    },
    description: {
      en: 'Combining Warfarin (Coumadin) with Aspirin (Disprin/Ascard) exponentially increases the risk of severe gastrointestinal and internal brain hemorrhages.',
      ur: 'وارفرین اور ایسپرین کو ملا کر کھانے سے معدے اور دماغ میں شدید خون بہنے کا خطرناک امکان بڑھ جاتا ہے۔'
    },
    clinicalRecommendation: {
      en: '🚫 DO NOT DISPENSE without explicit physician written clearance and immediate INR evaluation.',
      ur: '🚫 ڈاکٹر سے فوری مشورے اور تائید کے بغیر یہ دونوں ادویات اکٹھی نہ دیں۔'
    },
    explanationMechanism: {
      en: 'Warfarin inhibits vitamin K clotting factor synthesis, while Aspirin irreversibly inhibits platelet aggregation. Combined therapy severely impairs coagulation cascade, elevating major bleeding risk by 4.5x.',
      ur: 'وارفرین خون کے لوتھڑے بننے کے عمل کو روکتی ہے جبکہ ایسپرین پلیٹ لیٹس کو جمنے نہیں دیتی۔ ان کا ملاپ اندرونی خون بہنے کے خطرے کو ساڑھے چار گنا بڑھا دیتا ہے۔'
    }
  },
  {
    id: 'rule-warfarin-ibuprofen',
    drugA: 'Warfarin',
    drugB: 'Ibuprofen',
    severity: 'high',
    title: {
      en: 'Major Hemorrhage Risk: Warfarin + Ibuprofen (Brufen)',
      ur: 'خون کے بہاؤ کا شدید خطرہ: وارفرین + بروفن'
    },
    description: {
      en: 'Ibuprofen damages gastric mucosa and inhibits platelets, compounding anticoagulant effects of Warfarin.',
      ur: 'بروفن معدے میں زخم کا باعث بنتی ہے اور وارفرین کے ساتھ خون پتلا کرنے کا عمل دگنا کر دیتی ہے۔'
    },
    clinicalRecommendation: {
      en: '🚫 Switch analgesic to Paracetamol if pain relief is required, or consult doctor.',
      ur: '🚫 درد کے لیے بروفن کی جگہ پیراسیٹامول کا انتخاب کریں یا ڈاکٹر سے رجوع کریں۔'
    },
    explanationMechanism: {
      en: 'Ibuprofen erodes the protective stomach lining and impairs platelet aggregation, creating gastric micro-bleeds that Warfarin prevents from clotting.',
      ur: 'بروفن معدے کی اندرونی جھلی کو متاثر کرتی ہے اور وارفرین کی موجودگی میں خون کا بہاؤ رکنا ناممکن ہو جاتا ہے۔'
    }
  },
  {
    id: 'rule-enalapril-spironolactone',
    drugA: 'Enalapril',
    drugB: 'Spironolactone',
    severity: 'high',
    title: {
      en: 'Fatal Hyperkalemia Danger: Enalapril + Spironolactone (Aldactone)',
      ur: 'پوٹاشیم کا جان لیوا اضافہ: اینالاپرل + ایلڈیکٹون'
    },
    description: {
      en: 'Both Enalapril and Spironolactone inhibit potassium excretion, leading to cardiac arrhythmia or cardiac arrest.',
      ur: 'یہ دونوں ادویات پوٹاشیم کا اخراج روکتی ہیں جس سے دل کی دھڑکن بند ہونے کا ڈر ہوتا ہے۔'
    },
    clinicalRecommendation: {
      en: '⚠️ Requires close serum potassium monitoring and dosage adjustment by prescribing doctor.',
      ur: '⚠️ ڈاکٹر سے فوراً پوٹاشیم کا لیول چیک کروائیں اور دوا کی مقدار ایڈجسٹ کریں۔'
    },
    explanationMechanism: {
      en: 'Enalapril reduces aldosterone secretion via ACE inhibition, while Spironolactone competitively blocks mineralocorticoid receptors in distal renal tubules. Together they cause profound renal potassium retention.',
      ur: 'اینالاپرل اور اسپرونولیکٹون دونوں گردوں سے پوٹاشیم کا اخراج مکمل طور پر روک دیتی ہیں جس سے خون میں پوٹاشیم کی مقدار خطرناک حد تک بڑھ جاتی ہے۔'
    }
  },
  {
    id: 'rule-enalapril-potassium',
    drugA: 'Enalapril',
    drugB: 'Potassium Chloride',
    severity: 'high',
    title: {
      en: 'Severe Hyperkalemia: ACE Inhibitor + Potassium Supplement',
      ur: 'شدید ہائپرکیلیمیا: اینالاپرل + پوٹاشیم سپلیمنٹ'
    },
    description: {
      en: 'Taking potassium supplements with ACE inhibitors causes dangerously high blood potassium levels.',
      ur: 'اینالاپرل کے ساتھ پوٹاشیم کی گولیاں لینا خون میں پوٹاشیم کی سطح کو خطرناک حد تک بڑھاتا ہے۔'
    },
    clinicalRecommendation: {
      en: '🚫 Hold potassium supplements until confirmed with cardiologist.',
      ur: '🚫 ماہرِ امراضِ قلب کی اجازت کے بغیر پوٹاشیم نہ دیں۔'
    },
    explanationMechanism: {
      en: 'Direct exogenous potassium loading combined with reduced renal clearance from ACE inhibition can rapidly cause serum potassium to exceed 6.0 mEq/L, inducing cardiac arrest.',
      ur: 'باہر سے پوٹاشیم سپلیمنٹ لینا اور اینالاپرل کی وجہ سے اس کا گردوں سے نہ نکلنا دل کے لیے فورا جان لیوا ثابت ہوتا ہے۔'
    }
  },
  {
    id: 'rule-metronidazole-alcohol',
    drugA: 'Metronidazole',
    drugB: 'Alcohol',
    severity: 'high',
    title: {
      en: 'Severe Disulfiram Reaction: Metronidazole (Flagyl)',
      ur: 'شدید ردعمل: فلیجل (Metronidazole)'
    },
    description: {
      en: 'Metronidazole causes severe vomiting, tachycardia, and drop in blood pressure if combined with alcohol/syrups containing alcohol.',
      ur: 'فلیجل الکحل یا اس سے بنے سیرپ کے ساتھ شدید الٹی اور بلڈ پریشر گرنے کا باعث بنتی ہے۔'
    },
    clinicalRecommendation: {
      en: '⚠️ Counsel patient to avoid all alcohol-based products during and 48 hours after treatment.',
      ur: '⚠️ مریض کو سختی سے ہدایت کریں کہ علاج کے بعد بھی دو دن تک پرہیز رکھے۔'
    },
    explanationMechanism: {
      en: 'Metronidazole inhibits aldehyde dehydrogenase, causing toxic accumulation of acetaldehyde leading to severe flushing, vomiting, and hypotension.',
      ur: 'فلیجل الکحل کو ہضم کرنے والے اینزائم کو بلاک کرتی ہے جس سے جسم میں زہریلا مادہ جمع ہو کر شدید متلی اور بلڈ پریشر گرانے کا باعث بنتا ہے۔'
    }
  }
];
