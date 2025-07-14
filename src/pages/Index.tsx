
import { useState } from 'react';
import { Upload, AlertTriangle, Users, FileText, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CSVUploader } from '@/components/CSVUploader';
import { PatientDashboard } from '@/components/PatientDashboard';
import { RiskSummary } from '@/components/RiskSummary';
import { Button } from '@/components/ui/button';
import { PatientRecord } from '@/types/patient';
import { processCSVData } from '@/utils/csvProcessor';
import { applyRiskScoring } from '@/utils/riskEngine';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasData, setHasData] = useState(false);

  const handleCSVUpload = async (file: File) => {
    setIsProcessing(true);
    try {
      // Process CSV data
      const processedData = await processCSVData(file);
      
      // Apply AI risk scoring and flagging
      const scoredData = await applyRiskScoring(processedData);
      
      setPatients(scoredData);
      setHasData(true);
      
      toast({
        title: "Data processed successfully",
        description: `${scoredData.length} patient records analyzed with AI risk scoring`,
      });
    } catch (error) {
      console.error('Error processing CSV:', error);
      toast({
        title: "Error processing file",
        description: "Please check your CSV format and try again",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setPatients([]);
    setHasData(false);
  };

  if (!hasData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-12 mt-8">
            <div className="flex items-center justify-center mb-4">
              <AlertTriangle className="h-12 w-12 text-blue-600 mr-3" />
              <h1 className="text-4xl font-bold text-gray-900">ORM-PAD</h1>
            </div>
            <p className="text-xl text-gray-600 mb-2">
              Opioid Risk Monitoring & Patient Adherence Dashboard
            </p>
            <p className="text-lg text-gray-500">
              AI-powered client-side analytics for healthcare compliance
            </p>
          </header>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-white/70 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <Upload className="h-5 w-5 mr-2 text-blue-600" />
                  Secure Upload
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Process data entirely in your browser - no server storage
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                  AI Risk Scoring
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Hugging Face models analyze prescription patterns
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <FileText className="h-5 w-5 mr-2 text-purple-600" />
                  Instant Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Generate comprehensive PDF reports immediately
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Upload Patient Data</CardTitle>
              <CardDescription className="text-center">
                Upload your CSV file to begin AI-powered risk analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CSVUploader onUpload={handleCSVUpload} isProcessing={isProcessing} />
            </CardContent>
          </Card>

          <div className="mt-8 p-6 bg-yellow-50 rounded-lg border border-yellow-200">
            <h3 className="font-semibold text-yellow-800 mb-4">Required CSV Format (opioid_rx_records.csv):</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-yellow-700 mb-2">Patient Information:</h4>
                <ul className="text-yellow-600 space-y-1">
                  <li>• Patient_ID - Unique identifier</li>
                  <li>• Full_Name - Patient name</li>
                  <li>• DOB - Date of birth (YYYY-MM-DD)</li>
                  <li>• Gender - M/F/Other</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-yellow-700 mb-2">Prescriber Information:</h4>
                <ul className="text-yellow-600 space-y-1">
                  <li>• Prescriber_NPI - National Provider ID</li>
                  <li>• Prescriber_Name - Provider name</li>
                  <li>• Pharmacy_Name - Dispensing pharmacy</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-yellow-700 mb-2">Medication Details:</h4>
                <ul className="text-yellow-600 space-y-1">
                  <li>• Drug_Name - Opioid name (e.g., Oxycodone)</li>
                  <li>• Drug_Code - National Drug Code (NDC)</li>
                  <li>• Dosage_mg - Milligram dosage per pill</li>
                  <li>• Quantity - Total pills dispensed</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-yellow-700 mb-2">Prescription Timeline:</h4>
                <ul className="text-yellow-600 space-y-1">
                  <li>• Prescription_Date - Date written</li>
                  <li>• Dispense_Date - Date dispensed</li>
                  <li>• Refill_Date - Date of refill (optional)</li>
                  <li>• Days_Supplied - Duration medication should last</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-yellow-700 mb-2">Additional Fields:</h4>
                <ul className="text-yellow-600 space-y-1">
                  <li>• Refill_Number - Refill count</li>
                  <li>• Payment_Type - Cash/Insurance/Medicaid/Medicare</li>
                  <li>• Pickup_Method - In-person/Delivery/Third-party</li>
                  <li>• State_PDMP_Status - Matched/Unmatched/Not Available</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-yellow-700 mb-2">Risk Indicators:</h4>
                <ul className="text-yellow-600 space-y-1">
                  <li>• Overlapping_Prescriptions - TRUE/FALSE</li>
                  <li>• Adherence_Score - % adherence if tracked</li>
                  <li>• Notes - Optional clinical notes</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">ORM-PAD</h1>
              <p className="text-sm text-gray-600">Risk Analysis Dashboard</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm text-gray-600">
              <Users className="h-4 w-4 mr-1" />
              {patients.length} Patients
            </div>
            <Button variant="outline" onClick={handleReset}>
              New Analysis
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <RiskSummary patients={patients} />
        <PatientDashboard patients={patients} />
      </main>
    </div>
  );
};

export default Index;
