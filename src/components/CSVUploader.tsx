
import { useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CSVUploaderProps {
  onUpload: (file: File) => void;
  isProcessing: boolean;
}

const REQUIRED_COLUMNS = [
  'Patient_ID', 'Full_Name', 'DOB', 'Gender', 'Drug_Name', 
  'Prescription_Date', 'Days_Supplied', 'Dosage_mg', 'Quantity'
];

export const CSVUploader = ({ onUpload, isProcessing }: CSVUploaderProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

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
