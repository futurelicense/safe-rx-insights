
import { useState } from 'react';
import { Upload, AlertTriangle, Users, FileText, TrendingUp, Shield, Zap, Clock, Pill } from 'lucide-react';
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10"></div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
          {/* Enhanced Header */}
          <header className="text-center mb-16 mt-12">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-2xl shadow-xl">
                  <AlertTriangle className="h-12 w-12 text-white" />
                </div>
              </div>
            </div>
            <h1 className="text-6xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-4">
              ORM-PAD
            </h1>
            <p className="text-2xl text-slate-600 mb-3 font-medium">
              Opioid Risk Monitoring & Patient Adherence Dashboard
            </p>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
              AI-powered client-side analytics for healthcare compliance with enterprise-grade security
            </p>
          </header>

          {/* Enhanced Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm hover:bg-white/90 hover:-translate-y-1">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl shadow-lg group-hover:shadow-emerald-500/25 transition-shadow">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
                </div>
                <CardTitle className="text-xl font-semibold text-slate-800">
                  Zero-Trust Security
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 leading-relaxed">
                  Process sensitive data entirely in your browser - no server storage, no data transmission
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm hover:bg-white/90 hover:-translate-y-1">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl shadow-lg group-hover:shadow-violet-500/25 transition-shadow">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <div className="h-2 w-2 bg-violet-500 rounded-full animate-pulse"></div>
                </div>
                <CardTitle className="text-xl font-semibold text-slate-800">
                  AI Risk Scoring
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 leading-relaxed">
                  Hugging Face transformer models analyze prescription patterns with clinical precision
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm hover:bg-white/90 hover:-translate-y-1">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-lg group-hover:shadow-amber-500/25 transition-shadow">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div className="h-2 w-2 bg-amber-500 rounded-full animate-pulse"></div>
                </div>
                <CardTitle className="text-xl font-semibold text-slate-800">
                  Instant Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 leading-relaxed">
                  Generate comprehensive compliance reports in seconds with exportable insights
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Upload Section */}
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-3xl font-bold text-slate-800 mb-2">
                Upload Patient Data
              </CardTitle>
              <CardDescription className="text-lg text-slate-600">
                Securely upload your CSV file to begin advanced AI-powered risk analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <CSVUploader onUpload={handleCSVUpload} isProcessing={isProcessing} />
            </CardContent>
          </Card>

          {/* Enhanced CSV Format Guide */}
          <div className="mt-12 p-8 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200/50 shadow-xl">
            <div className="flex items-center mb-6">
              <div className="p-2 bg-amber-500 rounded-lg mr-4">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-amber-800">CSV Format Requirements</h3>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-amber-200">
                <h4 className="font-semibold text-amber-800 mb-3 flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Patient Information
                </h4>
                <ul className="text-amber-700 space-y-1.5">
                  <li>• <code className="bg-amber-100 px-1 rounded">Patient_ID</code> - Unique identifier</li>
                  <li>• <code className="bg-amber-100 px-1 rounded">Full_Name</code> - Patient name</li>
                  <li>• <code className="bg-amber-100 px-1 rounded">DOB</code> - Date of birth (YYYY-MM-DD)</li>
                  <li>• <code className="bg-amber-100 px-1 rounded">Gender</code> - M/F/Other</li>
                </ul>
              </div>
              
              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-amber-200">
                <h4 className="font-semibold text-amber-800 mb-3 flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Prescriber Information
                </h4>
                <ul className="text-amber-700 space-y-1.5">
                  <li>• <code className="bg-amber-100 px-1 rounded">Prescriber_NPI</code> - National Provider ID</li>
                  <li>• <code className="bg-amber-100 px-1 rounded">Prescriber_Name</code> - Provider name</li>
                  <li>• <code className="bg-amber-100 px-1 rounded">Pharmacy_Name</code> - Dispensing pharmacy</li>
                </ul>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-amber-200">
                <h4 className="font-semibold text-amber-800 mb-3 flex items-center">
                  <Pill className="h-4 w-4 mr-2" />
                  Medication Details
                </h4>
                <ul className="text-amber-700 space-y-1.5">
                  <li>• <code className="bg-amber-100 px-1 rounded">Drug_Name</code> - Opioid name (e.g., Oxycodone)</li>
                  <li>• <code className="bg-amber-100 px-1 rounded">Drug_Code</code> - National Drug Code (NDC)</li>
                  <li>• <code className="bg-amber-100 px-1 rounded">Dosage_mg</code> - Milligram dosage per pill</li>
                  <li>• <code className="bg-amber-100 px-1 rounded">Quantity</code> - Total pills dispensed</li>
                </ul>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-amber-200">
                <h4 className="font-semibold text-amber-800 mb-3 flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Prescription Timeline
                </h4>
                <ul className="text-amber-700 space-y-1.5">
                  <li>• <code className="bg-amber-100 px-1 rounded">Prescription_Date</code> - Date written</li>
                  <li>• <code className="bg-amber-100 px-1 rounded">Dispense_Date</code> - Date dispensed</li>
                  <li>• <code className="bg-amber-100 px-1 rounded">Refill_Date</code> - Date of refill (optional)</li>
                  <li>• <code className="bg-amber-100 px-1 rounded">Days_Supplied</code> - Duration medication should last</li>
                </ul>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-amber-200">
                <h4 className="font-semibold text-amber-800 mb-3 flex items-center">
                  <Zap className="h-4 w-4 mr-2" />
                  Additional Fields
                </h4>
                <ul className="text-amber-700 space-y-1.5">
                  <li>• <code className="bg-amber-100 px-1 rounded">Refill_Number</code> - Refill count</li>
                  <li>• <code className="bg-amber-100 px-1 rounded">Payment_Type</code> - Cash/Insurance/Medicaid/Medicare</li>
                  <li>• <code className="bg-amber-100 px-1 rounded">Pickup_Method</code> - In-person/Delivery/Third-party</li>
                  <li>• <code className="bg-amber-100 px-1 rounded">State_PDMP_Status</code> - Matched/Unmatched/Not Available</li>
                </ul>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-amber-200">
                <h4 className="font-semibold text-amber-800 mb-3 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Risk Indicators
                </h4>
                <ul className="text-amber-700 space-y-1.5">
                  <li>• <code className="bg-amber-100 px-1 rounded">Overlapping_Prescriptions</code> - TRUE/FALSE</li>
                  <li>• <code className="bg-amber-100 px-1 rounded">Adherence_Score</code> - % adherence if tracked</li>
                  <li>• <code className="bg-amber-100 px-1 rounded">Notes</code> - Optional clinical notes</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Enhanced Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="relative mr-4">
                <div className="absolute inset-0 bg-blue-500 rounded-lg blur-md opacity-20"></div>
                <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent">
                  ORM-PAD
                </h1>
                <p className="text-sm text-slate-600 font-medium">Risk Analysis Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center bg-slate-100 rounded-full px-4 py-2">
                <Users className="h-4 w-4 mr-2 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">{patients.length} Patients</span>
              </div>
              <Button 
                variant="outline" 
                onClick={handleReset}
                className="bg-white/80 border-slate-200 hover:bg-white hover:border-slate-300 transition-all"
              >
                New Analysis
              </Button>
            </div>
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
