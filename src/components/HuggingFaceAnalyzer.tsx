
import { useState, useEffect } from 'react';
import { Brain, Zap, AlertTriangle, TrendingUp, Users, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PatientRecord } from '@/types/patient';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface HuggingFaceAnalyzerProps {
  patients: PatientRecord[];
}

interface MLPrediction {
  type: 'classification' | 'sentiment' | 'anomaly' | 'clustering';
  title: string;
  description: string;
  confidence: number;
  result: any;
  timestamp: Date;
}

export const HuggingFaceAnalyzer = ({ patients }: HuggingFaceAnalyzerProps) => {
  const [predictions, setPredictions] = useState<MLPrediction[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<string>('all');

  // Simulate Hugging Face transformer analysis
  const runMLAnalysis = async () => {
    setIsAnalyzing(true);
    
    try {
      // Simulate different ML tasks
      const newPredictions: MLPrediction[] = [];

      // 1. Risk Classification Analysis
      const riskClassification = await simulateRiskClassification(patients);
      newPredictions.push({
        type: 'classification',
        title: 'Advanced Risk Classification',
        description: `ML model identified ${riskClassification.highConfidence} patients with high-confidence risk predictions`,
        confidence: riskClassification.avgConfidence,
        result: riskClassification,
        timestamp: new Date()
      });

      // 2. Sentiment Analysis on Notes (simulated)
      const sentimentAnalysis = await simulateNoteSentimentAnalysis(patients);
      newPredictions.push({
        type: 'sentiment',
        title: 'Clinical Notes Sentiment Analysis',
        description: `Analyzed ${sentimentAnalysis.totalNotes} clinical notes for emotional indicators`,
        confidence: sentimentAnalysis.confidence,
        result: sentimentAnalysis,
        timestamp: new Date()
      });

      // 3. Anomaly Detection
      const anomalyDetection = await simulateAnomalyDetection(patients);
      newPredictions.push({
        type: 'anomaly',
        title: 'Prescription Pattern Anomalies',
        description: `Detected ${anomalyDetection.anomalies.length} statistical anomalies in prescription patterns`,
        confidence: anomalyDetection.confidence,
        result: anomalyDetection,
        timestamp: new Date()
      });

      // 4. Patient Clustering
      const clustering = await simulatePatientClustering(patients);
      newPredictions.push({
        type: 'clustering',
        title: 'Patient Risk Clustering',
        description: `Identified ${clustering.clusters.length} distinct patient risk profiles using unsupervised learning`,
        confidence: clustering.confidence,
        result: clustering,
        timestamp: new Date()
      });

      setPredictions(newPredictions);
    } catch (error) {
      console.error('ML Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Simulated ML functions (in production, these would call actual Hugging Face models)
  const simulateRiskClassification = async (patients: PatientRecord[]) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const highConfidenceCount = patients.filter(p => p.AI_Confidence > 0.8).length;
    const avgConfidence = patients.reduce((sum, p) => sum + p.AI_Confidence, 0) / patients.length;
    
    return {
      highConfidence: highConfidenceCount,
      avgConfidence,
      riskDistribution: {
        low: patients.filter(p => p.Risk_Level === 'Low').length,
        medium: patients.filter(p => p.Risk_Level === 'Medium').length,
        high: patients.filter(p => p.Risk_Level === 'High').length
      },
      modelAccuracy: 0.94
    };
  };

  const simulateNoteSentimentAnalysis = async (patients: PatientRecord[]) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const notesWithData = patients.filter(p => p.Notes && p.Notes.length > 0);
    const totalNotes = notesWithData.length;
    
    return {
      totalNotes,
      sentiment: {
        positive: Math.floor(totalNotes * 0.4),
        neutral: Math.floor(totalNotes * 0.45),
        negative: Math.floor(totalNotes * 0.15)
      },
      concernKeywords: ['pain', 'urgent', 'difficult', 'noncompliant'],
      confidence: 0.87
    };
  };

  const simulateAnomalyDetection = async (patients: PatientRecord[]) => {
    await new Promise(resolve => setTimeout(resolve, 700));
    
    // Detect statistical anomalies
    const anomalies = [];
    
    // High dosage anomalies
    const avgDosage = patients.reduce((sum, p) => sum + p.Dosage_mg, 0) / patients.length;
    const highDosagePatients = patients.filter(p => p.Dosage_mg > avgDosage * 2);
    
    if (highDosagePatients.length > 0) {
      anomalies.push({
        type: 'dosage_outlier',
        patients: highDosagePatients.length,
        description: 'Patients with dosages >200% of average'
      });
    }

    // Quantity anomalies
    const avgQuantity = patients.reduce((sum, p) => sum + p.Quantity, 0) / patients.length;
    const highQuantityPatients = patients.filter(p => p.Quantity > avgQuantity * 2.5);
    
    if (highQuantityPatients.length > 0) {
      anomalies.push({
        type: 'quantity_outlier',
        patients: highQuantityPatients.length,
        description: 'Patients with quantities >250% of average'
      });
    }

    return {
      anomalies,
      confidence: 0.91,
      totalChecked: patients.length
    };
  };

  const simulatePatientClustering = async (patients: PatientRecord[]) => {
    await new Promise(resolve => setTimeout(resolve, 900));
    
    // Simulate K-means clustering based on risk factors
    const clusters = [
      {
        id: 1,
        name: 'Low-Risk Standard Care',
        size: Math.floor(patients.length * 0.6),
        characteristics: ['Low dosage', 'Insurance payment', 'Good adherence'],
        avgRisk: 0.15
      },
      {
        id: 2,
        name: 'Medium-Risk Monitor',
        size: Math.floor(patients.length * 0.25),
        characteristics: ['Moderate dosage', 'Mixed payment', 'Average adherence'],
        avgRisk: 0.45
      },
      {
        id: 3,
        name: 'High-Risk Intervention',
        size: Math.floor(patients.length * 0.15),
        characteristics: ['High dosage', 'Cash payment', 'Poor adherence'],
        avgRisk: 0.78
      }
    ];

    return {
      clusters,
      confidence: 0.89,
      silhouetteScore: 0.73
    };
  };

  useEffect(() => {
    if (patients.length > 0) {
      runMLAnalysis();
    }
  }, [patients]);

  const getAnalysisIcon = (type: string) => {
    switch (type) {
      case 'classification': return <Target className="h-4 w-4" />;
      case 'sentiment': return <Brain className="h-4 w-4" />;
      case 'anomaly': return <AlertTriangle className="h-4 w-4" />;
      case 'clustering': return <Users className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'classification': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'sentiment': return 'bg-green-100 text-green-800 border-green-200';
      case 'anomaly': return 'bg-red-100 text-red-800 border-red-200';
      case 'clustering': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-0 shadow-xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-slate-800 flex items-center">
            <Brain className="h-6 w-6 mr-2 text-indigo-600" />
            Hugging Face ML Analysis
            {isAnalyzing && (
              <div className="ml-3 flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                <span className="ml-2 text-sm text-indigo-600">Processing...</span>
              </div>
            )}
          </CardTitle>
          <Button 
            onClick={runMLAnalysis} 
            disabled={isAnalyzing}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Zap className="h-4 w-4 mr-2" />
            Run Analysis
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {predictions.length === 0 && !isAnalyzing ? (
          <div className="text-center py-8 text-slate-500">
            <Brain className="h-12 w-12 mx-auto mb-3 text-slate-300" />
            <p>Click "Run Analysis" to start ML processing</p>
          </div>
        ) : (
          <div className="space-y-6">
            {predictions.map((prediction, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-sm rounded-lg p-5 border border-white/50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                      {getAnalysisIcon(prediction.type)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800">{prediction.title}</h4>
                      <p className="text-sm text-slate-600">{prediction.description}</p>
                    </div>
                  </div>
                  <Badge className={getTypeColor(prediction.type)} variant="outline">
                    {prediction.type.toUpperCase()}
                  </Badge>
                </div>

                <div className="mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm text-slate-600">Model Confidence:</span>
                    <Progress value={prediction.confidence * 100} className="flex-1 h-2" />
                    <span className="text-sm font-medium text-slate-700">
                      {(prediction.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Render specific results based on type */}
                <div className="bg-slate-50 rounded-md p-3">
                  {prediction.type === 'classification' && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">{prediction.result.highConfidence}</div>
                        <div className="text-xs text-slate-600">High Confidence</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">{prediction.result.riskDistribution.low}</div>
                        <div className="text-xs text-slate-600">Low Risk</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-yellow-600">{prediction.result.riskDistribution.medium}</div>
                        <div className="text-xs text-slate-600">Medium Risk</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-red-600">{prediction.result.riskDistribution.high}</div>
                        <div className="text-xs text-slate-600">High Risk</div>
                      </div>
                    </div>
                  )}

                  {prediction.type === 'clustering' && (
                    <div className="space-y-2">
                      {prediction.result.clusters.map((cluster: any) => (
                        <div key={cluster.id} className="flex items-center justify-between p-2 bg-white rounded">
                          <div>
                            <span className="font-medium">{cluster.name}</span>
                            <span className="text-sm text-slate-600 ml-2">({cluster.size} patients)</span>
                          </div>
                          <Badge variant="outline">
                            {(cluster.avgRisk * 100).toFixed(0)}% avg risk
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}

                  {prediction.type === 'anomaly' && (
                    <div className="space-y-2">
                      {prediction.result.anomalies.map((anomaly: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-white rounded">
                          <span className="text-sm">{anomaly.description}</span>
                          <Badge variant="outline" className="bg-red-50 text-red-700">
                            {anomaly.patients} patients
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="text-xs text-slate-500 mt-3">
                  Analyzed: {prediction.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
