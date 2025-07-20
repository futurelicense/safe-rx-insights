
import { PatientRecord } from '@/types/patient';

export const processCSVData = async (file: File): Promise<PatientRecord[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        
        if (lines.length < 2) {
          reject(new Error('CSV file must contain at least a header row and one data row'));
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const patients: PatientRecord[] = [];

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          const patient: Partial<PatientRecord> = {};

          headers.forEach((header, index) => {
            const value = values[index] || '';
            
            switch (header) {
              case 'Patient_ID':
                patient.Patient_ID = value;
                break;
              case 'Full_Name':
                patient.Full_Name = value;
                break;
              case 'DOB':
                patient.DOB = value;
                break;
              case 'Gender':
                patient.Gender = value;
                break;
              case 'Prescriber_NPI':
                patient.Prescriber_NPI = value;
                break;
              case 'Prescriber_DEA':
                patient.Prescriber_DEA = value;
                break;
              case 'Prescriber_Name':
                patient.Prescriber_Name = value;
                break;
              case 'Pharmacy_Name':
                patient.Pharmacy_Name = value;
                break;
              case 'Drug_Name':
                patient.Drug_Name = value;
                break;
              case 'Drug_Code':
                patient.Drug_Code = value;
                break;
              case 'Prescription_Date':
                patient.Prescription_Date = value;
                break;
              case 'Dispense_Date':
                patient.Dispense_Date = value;
                break;
              case 'Refill_Date':
                patient.Refill_Date = value || undefined;
                break;
              case 'Days_Supplied':
                patient.Days_Supplied = parseInt(value) || 0;
                break;
              case 'Dosage_mg':
                patient.Dosage_mg = parseFloat(value) || 0;
                break;
              case 'Quantity':
                patient.Quantity = parseInt(value) || 0;
                break;
              case 'Refill_Number':
                patient.Refill_Number = parseInt(value) || 0;
                break;
              case 'Payment_Type':
                patient.Payment_Type = value;
                break;
              case 'Pickup_Method':
                patient.Pickup_Method = value;
                break;
              case 'State_PDMP_Status':
                patient.State_PDMP_Status = value;
                break;
              case 'Overlapping_Prescriptions':
                patient.Overlapping_Prescriptions = value.toLowerCase() === 'true';
                break;
              case 'Adherence_Score':
                patient.Adherence_Score = parseFloat(value) || undefined;
                break;
              case 'Notes':
                patient.Notes = value || undefined;
                break;
              default:
                // Handle any additional columns
                break;
            }
          });

          // Initialize AI and calculated fields
          patient.Risk_Level = 'Low';
          patient.Risk_Score = 0;
          patient.Flagged_Warnings = [];
          patient.AI_Confidence = 0;

          patients.push(patient as PatientRecord);
        }

        resolve(patients);
      } catch (error) {
        reject(new Error(`Error parsing CSV: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };

    reader.onerror = () => reject(new Error('Error reading file'));
    reader.readAsText(file);
  });
};
