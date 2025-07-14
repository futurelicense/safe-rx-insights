
import { PatientRecord } from '@/types/patient';

// Simulate AI scoring with Hugging Face (in production, replace with actual API call)
const simulateAIRiskScoring = async (patient: PatientRecord): Promise<{ score: number; confidence: number }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Mock AI scoring based on various factors
  let score = 0;
  let confidence = 0.8;
  
  // High dosage increases risk
  if (patient.Dosage_mg > 80) score += 0.3;
  else if (patient.Dosage_mg > 50) score += 0.2;
  
  // High quantity increases risk
  if (patient.Quantity > 120) score += 0.2;
  else if (patient.Quantity > 90) score += 0.1;
  
  // Short days supplied with high quantity is suspicious
  if (patient.Days_Supplied < 15 && patient.Quantity > 60) score += 0.25;
  
  // Cash payments are higher risk
  if (patient.Payment_Type === 'Cash') score += 0.15;
  
  // Multiple refills increase risk
  if (patient.Refill_Number > 3) score += 0.1;
  
  // Overlapping prescriptions
  if (patient.Overlapping_Prescriptions) score += 0.2;
  
  // PDMP status
  if (patient.State_PDMP_Status === 'Unmatched') score += 0.15;
  
  // Low adherence score
  if (patient.Adherence_Score && patient.Adherence_Score < 70) score += 0.1;
  
  // Add some randomness to simulate AI variability
  score += (Math.random() - 0.5) * 0.1;
  score = Math.max(0, Math.min(1, score));
  
  return { score, confidence };
};

const applyBusinessRules = (patient: PatientRecord): string[] => {
  const warnings: string[] = [];
  
  // Early refill detection
  if (patient.Refill_Date && patient.Prescription_Date) {
    const prescriptionDate = new Date(patient.Prescription_Date);
    const refillDate = new Date(patient.Refill_Date);
    const daysBetween = Math.floor((refillDate.getTime() - prescriptionDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysBetween < patient.Days_Supplied * 0.75) {
      warnings.push('Early Refill Attempt');
    }
  }
  
  // High dosage warning
  if (patient.Dosage_mg > 90) {
    warnings.push('High Dosage Prescription');
  }
  
  // Overlapping prescriptions
  if (patient.Overlapping_Prescriptions) {
    warnings.push('Overlapping Prescriptions');
  }
  
  // Cash payment pattern
  if (patient.Payment_Type === 'Cash' && patient.Quantity > 90) {
    warnings.push('Cash Payment High Quantity');
  }
  
  // Multiple refills
  if (patient.Refill_Number > 4) {
    warnings.push('Multiple Refills');
  }
  
  // PDMP concerns
  if (patient.State_PDMP_Status === 'Unmatched') {
    warnings.push('PDMP Status Unmatched');
  }
  
  // Low adherence
  if (patient.Adherence_Score && patient.Adherence_Score < 60) {
    warnings.push('Low Adherence Score');
  }
  
  // Pickup method concerns
  if (patient.Pickup_Method === 'Third-party' && patient.Quantity > 90) {
    warnings.push('Third-party Pickup High Quantity');
  }
  
  return warnings;
};

export const applyRiskScoring = async (patients: PatientRecord[]): Promise<PatientRecord[]> => {
  const scoredPatients: PatientRecord[] = [];
  
  for (const patient of patients) {
    // Apply AI risk scoring
    const aiResult = await simulateAIRiskScoring(patient);
    
    // Apply business rules
    const warnings = applyBusinessRules(patient);
    
    // Determine risk level
    let riskLevel: 'Low' | 'Medium' | 'High' = 'Low';
    if (aiResult.score > 0.7 || warnings.length > 3) {
      riskLevel = 'High';
    } else if (aiResult.score > 0.4 || warnings.length > 1) {
      riskLevel = 'Medium';
    }
    
    // Update patient record
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
