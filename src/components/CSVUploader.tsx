import { useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, Download, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CSVUploaderProps {
  onUpload: (file: File) => void;
  isProcessing: boolean;
}

const REQUIRED_COLUMNS = [
  'Patient_ID', 'Full_Name', 'DOB', 'Gender', 'Prescriber_NPI', 'Prescriber_DEA', 'Prescriber_Name',
  'Pharmacy_Name', 'Drug_Name', 'Drug_Code', 'Prescription_Date', 'Dispense_Date',
  'Refill_Date', 'Days_Supplied', 'Dosage_mg', 'Quantity', 'Refill_Number',
  'Payment_Type', 'Pickup_Method', 'State_PDMP_Status', 'Overlapping_Prescriptions',
  'Adherence_Score', 'Notes'
];

const SAMPLE_CSV_DATA = `Patient_ID,Full_Name,DOB,Gender,Prescriber_NPI,Prescriber_DEA,Prescriber_Name,Pharmacy_Name,Drug_Name,Drug_Code,Prescription_Date,Dispense_Date,Refill_Date,Days_Supplied,Dosage_mg,Quantity,Refill_Number,Payment_Type,Pickup_Method,State_PDMP_Status,Overlapping_Prescriptions,Adherence_Score,Notes
P001,John Smith,1985-03-15,M,1234567890,AS1234567,Dr. Sarah Johnson,Central Pharmacy,Oxycodone,12345-678-90,2024-01-15,2024-01-16,,30,10,90,0,Insurance,In-person,Matched,FALSE,85.5,Initial prescription
P002,Mary Johnson,1978-11-22,F,0987654321,BT9876543,Dr. Michael Brown,Westside Pharmacy,Morphine,98765-432-10,2024-01-18,2024-01-19,,15,30,45,0,Medicare,Delivery,Matched,FALSE,92.0,Chronic pain management
P003,Robert Davis,1990-07-08,M,1122334455,CW1122334,Dr. Emily Wilson,Downtown Pharmacy,Fentanyl,11223-344-55,2024-01-20,2024-01-20,2024-01-25,7,25,14,1,Cash,In-person,Unmatched,TRUE,45.2,Early refill request
P004,Lisa Anderson,1982-12-03,F,5566778899,DM5566778,Dr. James Miller,North Pharmacy,Tramadol,55667-788-99,2024-01-22,2024-01-23,,30,50,60,0,Medicaid,Third-party,Matched,FALSE,78.9,Standard refill
P005,David Wilson,1975-09-14,M,9988776655,AS1234567,Dr. Sarah Johnson,Central Pharmacy,Oxycodone,12345-678-90,2024-01-25,2024-01-26,,30,15,120,0,Insurance,In-person,Matched,TRUE,65.3,High quantity prescription`;

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
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-xl">
        <CardContent className="p-10 text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
            <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-full mx-auto w-20 h-20 flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-white animate-spin" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-blue-800 mb-3">Processing Patient Data</h3>
          <p className="text-blue-700 mb-6 text-lg">Applying AI risk scoring and clinical analysis...</p>
          <div className="max-w-md mx-auto mb-4">
            <Progress value={progress} className="h-3 bg-blue-200" />
          </div>
          <p className="text-blue-600 font-medium">{progress}% complete</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card 
        className={`border-2 border-dashed transition-all duration-300 ${
          dragActive 
            ? 'border-blue-500 bg-blue-50 shadow-lg scale-105' 
            : 'border-slate-300 hover:border-slate-400 hover:shadow-md'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <CardContent className="p-12 text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-slate-400 rounded-full blur-lg opacity-20"></div>
            <div className="relative bg-gradient-to-r from-slate-600 to-slate-700 p-4 rounded-full mx-auto w-20 h-20 flex items-center justify-center">
              <Upload className="h-8 w-8 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-3">
            Drag and drop your CSV file here
          </h3>
          <p className="text-slate-600 mb-8 text-lg">or click to select a file</p>
          
          <div className="flex items-center justify-center gap-6">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileInput}
              className="hidden"
              id="csv-upload"
              disabled={isProcessing}
            />
            
            <label htmlFor="csv-upload">
              <Button 
                variant="outline" 
                className="cursor-pointer bg-white hover:bg-slate-50 border-slate-300 hover:border-slate-400 shadow-sm text-lg px-8 py-6" 
                disabled={isProcessing}
              >
                <FileText className="h-5 w-5 mr-3" />
                Select CSV File
              </Button>
            </label>

            <Button 
              variant="secondary" 
              onClick={downloadSampleCSV}
              className="cursor-pointer bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-all text-lg px-8 py-6"
            >
              <Download className="h-5 w-5 mr-3" />
              Download Sample CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {validationError && (
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-800 font-medium">{validationError}</AlertDescription>
        </Alert>
      )}

      {file && !validationError && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 font-medium">
            File "{file.name}" is valid and ready for processing
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
