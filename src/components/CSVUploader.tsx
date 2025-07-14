
import { useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CSVUploaderProps {
  onUpload: (file: File) => void;
  isProcessing: boolean;
}

const REQUIRED_COLUMNS = [
  'Patient_ID', 'Full_Name', 'DOB', 'Gender', 'Prescriber_NPI', 'Prescriber_Name',
  'Pharmacy_Name', 'Drug_Name', 'Drug_Code', 'Prescription_Date', 'Dispense_Date',
  'Refill_Date', 'Days_Supplied', 'Dosage_mg', 'Quantity', 'Refill_Number',
  'Payment_Type', 'Pickup_Method', 'State_PDMP_Status', 'Overlapping_Prescriptions',
  'Adherence_Score', 'Notes'
];

const SAMPLE_CSV_DATA = `Patient_ID,Full_Name,DOB,Gender,Prescriber_NPI,Prescriber_Name,Pharmacy_Name,Drug_Name,Drug_Code,Prescription_Date,Dispense_Date,Refill_Date,Days_Supplied,Dosage_mg,Quantity,Refill_Number,Payment_Type,Pickup_Method,State_PDMP_Status,Overlapping_Prescriptions,Adherence_Score,Notes
P001,John Smith,1985-03-15,M,1234567890,Dr. Sarah Johnson,Central Pharmacy,Oxycodone,12345-678-90,2024-01-15,2024-01-16,,30,10,90,0,Insurance,In-person,Matched,FALSE,85.5,Initial prescription
P002,Mary Johnson,1978-11-22,F,0987654321,Dr. Michael Brown,Westside Pharmacy,Morphine,98765-432-10,2024-01-18,2024-01-19,,15,30,45,0,Medicare,Delivery,Matched,FALSE,92.0,Chronic pain management
P003,Robert Davis,1990-07-08,M,1122334455,Dr. Emily Wilson,Downtown Pharmacy,Fentanyl,11223-344-55,2024-01-20,2024-01-20,2024-01-25,7,25,14,1,Cash,In-person,Unmatched,TRUE,45.2,Early refill request
P004,Lisa Anderson,1982-12-03,F,5566778899,Dr. James Miller,North Pharmacy,Tramadol,55667-788-99,2024-01-22,2024-01-23,,30,50,60,0,Medicaid,Third-party,Matched,FALSE,78.9,Standard refill
P005,David Wilson,1975-09-14,M,9988776655,Dr. Sarah Johnson,Central Pharmacy,Oxycodone,12345-678-90,2024-01-25,2024-01-26,,30,15,120,0,Insurance,In-person,Matched,TRUE,65.3,High quantity prescription`;

export const CSVUploader = ({ onUpload, isProcessing }: CSVUploaderProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const downloadSampleCSV = useCallback(() => {
    const blob = new Blob([SAMPLE_CSV_DATA], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'opioid_rx_records_sample.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }, []);

  const validateCSV = useCallback(async (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        
        if (lines.length < 2) {
          setValidationError('CSV file must contain at least a header row and one data row');
          resolve(false);
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const missingColumns = REQUIRED_COLUMNS.filter(col => !headers.includes(col));
        
        if (missingColumns.length > 0) {
          setValidationError(`Missing required columns: ${missingColumns.join(', ')}`);
          resolve(false);
          return;
        }

        setValidationError(null);
        resolve(true);
      };
      reader.readAsText(file);
    });
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    const csvFile = files.find(file => file.type === 'text/csv' || file.name.endsWith('.csv'));
    
    if (!csvFile) {
      setValidationError('Please upload a CSV file');
      return;
    }

    setFile(csvFile);
    const isValid = await validateCSV(csvFile);
    if (isValid) {
      handleUpload(csvFile);
    }
  }, [validateCSV]);

  const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const csvFile = files[0];
    setFile(csvFile);
    
    const isValid = await validateCSV(csvFile);
    if (isValid) {
      handleUpload(csvFile);
    }
  }, [validateCSV]);

  const handleUpload = useCallback(async (file: File) => {
    setProgress(0);
    
    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 200);

    try {
      await onUpload(file);
      setProgress(100);
    } catch (error) {
      clearInterval(progressInterval);
      setProgress(0);
    }
  }, [onUpload]);

  if (isProcessing) {
    return (
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Processing Patient Data</h3>
          <p className="text-blue-600 mb-4">Applying AI risk scoring and analysis...</p>
          <Progress value={progress} className="w-full max-w-md mx-auto" />
          <p className="text-sm text-blue-600 mt-2">{progress}% complete</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card 
        className={`border-2 border-dashed transition-all duration-200 ${
          dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <CardContent className="p-8 text-center">
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Drag and drop your CSV file here
          </h3>
          <p className="text-gray-500 mb-4">or click to select a file</p>
          
          <div className="flex items-center justify-center gap-4">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileInput}
              className="hidden"
              id="csv-upload"
              disabled={isProcessing}
            />
            
            <label htmlFor="csv-upload">
              <Button variant="outline" className="cursor-pointer" disabled={isProcessing}>
                <FileText className="h-4 w-4 mr-2" />
                Select CSV File
              </Button>
            </label>

            <Button 
              variant="secondary" 
              onClick={downloadSampleCSV}
              className="cursor-pointer"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Sample CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {validationError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{validationError}</AlertDescription>
        </Alert>
      )}

      {file && !validationError && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            File "{file.name}" is valid and ready for processing
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
