import { PatientRecord } from '@/types/patient';

// Enhanced AI scoring with more sophisticated algorithms
const simulateAdvancedAIRiskScoring = async (patient: PatientRecord): Promise<{ score: number; confidence: number; factors: string[] }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 50));
  
  let score = 0;
  let confidence = 0.8;
  const factors: string[] = [];
  
  // Enhanced dosage risk calculation with non-linear scaling
  if (patient.Dosage_mg > 120) {
    score += 0.4;
    factors.push('Very High Dosage');
  } else if (patient.Dosage_mg > 80) {
    score += 0.3;
    factors.push('High Dosage');
  } else if (patient.Dosage_mg > 50) {
    score += 0.2;
    factors.push('Moderate Dosage');
  }
  
  // Quantity-based risk with threshold analysis
  const quantityRisk = Math.min(patient.Quantity / 180, 1) * 0.25;
  score += quantityRisk;
  if (patient.Quantity > 120) factors.push('High Quantity');
  
  // Days supplied analysis - both too short and too long can be risky
  const optimalDays = 30;
  const daysDeviation = Math.abs(patient.Days_Supplied - optimalDays) / optimalDays;
  if (daysDeviation > 0.5) {
    score += 0.15;
    factors.push('Unusual Supply Duration');
  }
  
  // Enhanced payment type risk
  if (patient.Payment_Type === 'Cash') {
    score += 0.2;
    factors.push('Cash Payment');
    confidence -= 0.05; // Cash payments are harder to verify
  } else if (patient.Payment_Type === 'Medicaid') {
    score += 0.05; // Slight increase for Medicaid
  }
  
  // Refill pattern analysis
  if (patient.Refill_Number > 5) {
    score += 0.15;
    factors.push('Excessive Refills');
  } else if (patient.Refill_Number > 3) {
    score += 0.08;
    factors.push('Multiple Refills');
  }
  
  // Early refill detection with more sophisticated timing
  if (patient.Refill_Date && patient.Prescription_Date) {
    const prescriptionDate = new Date(patient.Prescription_Date);
    const refillDate = new Date(patient.Refill_Date);
    const daysBetween = Math.floor((refillDate.getTime() - prescriptionDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const expectedDuration = patient.Days_Supplied;
    const refillRatio = daysBetween / expectedDuration;
    
    if (refillRatio < 0.7) {
      score += 0.25;
      factors.push('Early Refill');
    } else if (refillRatio < 0.8) {
      score += 0.15;
      factors.push('Slightly Early Refill');
    }
  }
  
  // Overlapping prescriptions - high risk indicator
  if (patient.Overlapping_Prescriptions) {
    score += 0.25;
    factors.push('Overlapping Prescriptions');
    confidence += 0.1; // This is a clear indicator
  }
  
  // PDMP status analysis
  if (patient.State_PDMP_Status === 'Unmatched') {
    score += 0.2;
    factors.push('PDMP Unmatched');
  } else if (patient.State_PDMP_Status === 'Not Available') {
    score += 0.1;
    factors.push('PDMP Unavailable');
    confidence -= 0.05;
  }
  
  // Adherence score analysis with inverted risk
  if (patient.Adherence_Score !== undefined) {
    if (patient.Adherence_Score < 50) {
      score += 0.15;
      factors.push('Very Poor Adherence');
    } else if (patient.Adherence_Score < 70) {
      score += 0.1;
      factors.push('Poor Adherence');
    } else if (patient.Adherence_Score > 95) {
      // Perfect adherence can also be suspicious
      score += 0.05;
      factors.push('Perfect Adherence');
    }
  }
  
  // Pickup method analysis
  if (patient.Pickup_Method === 'Third-party') {
    score += 0.1;
    factors.push('Third-party Pickup');
  } else if (patient.Pickup_Method === 'Delivery') {
    score += 0.05;
    factors.push('Delivery Method');
  }
  
  // Drug-specific risk factors (simulate database lookup)
  const highRiskDrugs = ['Oxycodone', 'Fentanyl', 'Morphine', 'Hydrocodone'];
  if (highRiskDrugs.includes(patient.Drug_Name)) {
    score += 0.1;
    factors.push('High-Risk Opioid');
  }
  
  // Age-based risk (simulated from DOB if available)
  if (patient.DOB) {
    const age = new Date().getFullYear() - new Date(patient.DOB).getFullYear();
    if (age < 25 || age > 75) {
      score += 0.05;
      factors.push('Age Risk Factor');
    }
  }
  
  // Add some ML-like variability but keep it realistic
  const mlVariation = (Math.random() - 0.5) * 0.08;
  score += mlVariation;
  
  // Confidence adjustments based on data quality
  if (factors.length > 5) confidence += 0.1; // More factors = higher confidence
  if (factors.length < 2) confidence -= 0.1; // Fewer factors = lower confidence
  
  // Normalize score and confidence
  score = Math.max(0, Math.min(1, score));
  confidence = Math.max(0.5, Math.min(1, confidence));
  
  return { score, confidence, factors };
};

const applyEnhancedBusinessRules = (patient: PatientRecord): string[] => {
  const warnings: string[] = [];
  
  // Enhanced early refill detection
  if (patient.Refill_Date && patient.Prescription_Date) {
    const prescriptionDate = new Date(patient.Prescription_Date);
    const refillDate = new Date(patient.Refill_Date);
    const daysBetween = Math.floor((refillDate.getTime() - prescriptionDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysBetween < patient.Days_Supplied * 0.6) {
      warnings.push('Very Early Refill Attempt');
    } else if (daysBetween < patient.Days_Supplied * 0.75) {
      warnings.push('Early Refill Attempt');
    }
  }
  
  // Dosage warnings with multiple thresholds
  if (patient.Dosage_mg > 120) {
    warnings.push('Extremely High Dosage');
  } else if (patient.Dosage_mg > 90) {
    warnings.push('High Dosage Prescription');
  } else if (patient.Dosage_mg > 60) {
    warnings.push('Elevated Dosage');
  }
  
  // Quantity analysis
  if (patient.Quantity > 180) {
    warnings.push('Excessive Quantity Dispensed');
  } else if (patient.Quantity > 120) {
    warnings.push('High Quantity Dispensed');
  }
  
  // Enhanced overlapping prescription detection
  if (patient.Overlapping_Prescriptions) {
    warnings.push('Overlapping Prescriptions Detected');
  }
  
  // Payment pattern analysis
  if (patient.Payment_Type === 'Cash' && patient.Quantity > 90) {
    warnings.push('Cash Payment High Quantity');
  } else if (patient.Payment_Type === 'Cash' && patient.Dosage_mg > 60) {
    warnings.push('Cash Payment High Dosage');
  }
  
  // Multiple refills with escalating warnings
  if (patient.Refill_Number > 6) {
    warnings.push('Excessive Refills');
  } else if (patient.Refill_Number > 4) {
    warnings.push('Multiple Refills');
  }
  
  // PDMP integration warnings
  if (patient.State_PDMP_Status === 'Unmatched') {
    warnings.push('PDMP Status Unmatched');
  } else if (patient.State_PDMP_Status === 'Not Available') {
    warnings.push('PDMP Data Unavailable');
  }
  
  // Adherence warnings
  if (patient.Adherence_Score !== undefined) {
    if (patient.Adherence_Score < 50) {
      warnings.push('Very Low Adherence Score');
    } else if (patient.Adherence_Score < 60) {
      warnings.push('Low Adherence Score');
    } else if (patient.Adherence_Score > 98) {
      warnings.push('Suspiciously High Adherence');
    }
  }
  
  // Pickup method concerns
  if (patient.Pickup_Method === 'Third-party' && patient.Quantity > 90) {
    warnings.push('Third-party Pickup High Quantity');
  } else if (patient.Pickup_Method === 'Third-party' && patient.Refill_Number > 3) {
    warnings.push('Third-party Pickup Multiple Refills');
  }
  
  // Days supplied analysis
  if (patient.Days_Supplied < 7 && patient.Quantity > 60) {
    warnings.push('Short Supply High Quantity');
  } else if (patient.Days_Supplied > 90) {
    warnings.push('Extended Supply Duration');
  }
  
  // Drug-specific warnings
  const controlledSubstances = ['Oxycodone', 'Fentanyl', 'Morphine', 'Hydrocodone', 'Codeine'];
  if (controlledSubstances.includes(patient.Drug_Name) && patient.Dosage_mg > 80) {
    warnings.push('High-Risk Controlled Substance');
  }
  
  return warnings;
};

export const applyRiskScoring = async (patients: PatientRecord[]): Promise<PatientRecord[]> => {
  const scoredPatients: PatientRecord[] = [];
  
  for (const patient of patients) {
    // Apply enhanced AI risk scoring
    const aiResult = await simulateAdvancedAIRiskScoring(patient);
    
    // Apply enhanced business rules
    const warnings = applyEnhancedBusinessRules(patient);
    
    // Determine risk level with more nuanced thresholds
    let riskLevel: 'Low' | 'Medium' | 'High' = 'Low';
    if (aiResult.score > 0.75 || warnings.length > 4) {
      riskLevel = 'High';
    } else if (aiResult.score > 0.45 || warnings.length > 2) {
      riskLevel = 'Medium';
    } else if (aiResult.score > 0.25 || warnings.length > 0) {
      riskLevel = 'Medium';
    }
    
    // Update patient record with enhanced data
    const updatedPatient: PatientRecord = {
      ...patient,
      Risk_Level: riskLevel,
      Risk_Score: aiResult.score,
      Flagged_Warnings: warnings,
      AI_Confidence: aiResult.confidence,
    };
    
    scoredPatients.push(updatedPatient);
  }
  
  return scoredPatients;
};
