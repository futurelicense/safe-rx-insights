
export interface PatientRecord {
  Patient_ID: string;
  Full_Name: string;
  DOB: string;
  Gender: string;
  Prescriber_NPI: string;
  Prescriber_Name: string;
  Pharmacy_Name: string;
  Drug_Name: string;
  Drug_Code: string;
  Prescription_Date: string;
  Dispense_Date: string;
  Refill_Date?: string;
  Days_Supplied: number;
  Dosage_mg: number;
  Quantity: number;
  Refill_Number: number;
  Payment_Type: string;
  Pickup_Method: string;
  State_PDMP_Status: string;
  Overlapping_Prescriptions: boolean;
  Adherence_Score?: number;
  Notes?: string;
  
  // AI and calculated fields
  Risk_Level: 'Low' | 'Medium' | 'High';
  Risk_Score: number;
  Flagged_Warnings: string[];
  AI_Confidence: number;
}

export interface RiskSummaryData {
  totalPatients: number;
  highRisk: number;
  mediumRisk: number;
  lowRisk: number;
  flaggedWarnings: { [key: string]: number };
  topDrugs: { name: string; count: number; avgRisk: number }[];
}
