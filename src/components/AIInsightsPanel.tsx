
import { useState, useEffect, useMemo } from 'react';
import { Brain, TrendingUp, AlertCircle, BarChart3, Zap, Clock, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PatientRecord } from '@/types/patient';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface AIInsightsPanelProps {
  patients: PatientRecord[];
}

interface AIInsight {
  type: 'trend' | 'anomaly' | 'prediction' | 'recommendation';
  title: string;
  description: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high';
  actionable: boolean;
}

export const AIInsightsPanel = ({ patients }: AIInsightsPanelProps) => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const generateAIInsights = useMemo(() => {
    if (patients.length === 0) return [];

    const insights: AIInsight[] = [];

    // Trend Analysis
    const highRiskPatients = patients.filter(p => p.Risk_Level === 'High');
    const cashPayments = patients.filter(p => p.Payment_Type === 'Cash');
    const overlappingRx = patients.filter(p => p.Overlapping_Prescriptions);

    if (highRiskPatients.length > patients.length * 0.15) {
      insights.push({
        type: 'trend',
        title: 'Elevated High-Risk Patient Population',
        description: `${((highRiskPatients.length / patients.length) * 100).toFixed(1)}% of patients are classified as high-risk, above the 15% threshold.`,
        confidence: 0.92,
        severity: 'high',
        actionable: true
      });
    }

    // Cash Payment Pattern Analysis
    if (cashPayments.length > patients.length * 0.25) {
      insights.push({
        type: 'anomaly',
        title: 'Unusual Cash Payment Pattern',
        description: `${cashPayments.length} patients (${((cashPayments.length / patients.length) * 100).toFixed(1)}%) are using cash payments, indicating potential diversion risk.`,
        confidence: 0.88,
        severity: 'medium',
        actionable: true
      });
    }

    // Prescriber Concentration Analysis
    const prescriberStats: { [key: string]: number } = {};
    patients.forEach(p => {
      prescriberStats[p.Prescriber_NPI] = (prescriberStats[p.Prescriber_NPI] || 0) + 1;
    });
    
    const topPrescriber = Object.entries(prescriberStats).sort((a, b) => b[1] - a[1])[0];
    if (topPrescriber && topPrescriber[1] > patients.length * 0.3) {
      insights.push({
        type: 'anomaly',
        title: 'Prescriber Concentration Risk',
        description: `Single prescriber (NPI: ${topPrescriber[0]}) accounts for ${((topPrescriber[1] / patients.length) * 100).toFixed(1)}% of prescriptions.`,
        confidence: 0.85,
        severity: 'medium',
        actionable: true
      });
    }

    // Dosage Pattern Analysis
    const avgDosage = patients.reduce((sum, p) => sum + p.Dosage_mg, 0) / patients.length;
    const highDosagePatients = patients.filter(p => p.Dosage_mg > avgDosage * 1.5);
    
    if (highDosagePatients.length > 0) {
      insights.push({
        type: 'prediction',
        title: 'High Dosage Risk Prediction',
        description: `${highDosagePatients.length} patients on dosages >50% above average may require enhanced monitoring.`,
        confidence: 0.79,
        severity: 'medium',
        actionable: true
      });
    }

    // Refill Pattern Analysis
    const multipleRefills = patients.filter(p => p.Refill_Number > 3);
    if (multipleRefills.length > 0) {
      insights.push({
        type: 'recommendation',
        title: 'Refill Pattern Optimization',
        description: `${multipleRefills.length} patients with >3 refills may benefit from adherence counseling programs.`,
        confidence: 0.82,
        severity: 'low',
        actionable: true
      });
    }

    return insights;
  }, [patients]);

  useEffect(() => {
    setIsAnalyzing(true);
    // Simulate AI processing time
    const timer = setTimeout(() => {
      setInsights(generateAIInsights);
      setIsAnalyzing(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [generateAIInsights]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'trend': return <TrendingUp className="h-4 w-4" />;
      case 'anomaly': return <AlertCircle className="h-4 w-4" />;
      case 'prediction': return <Target className="h-4 w-4" />;
      case 'recommendation': return <Zap className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-0 shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-slate-800 flex items-center">
          <Brain className="h-5 w-5 mr-2 text-purple-600" />
          AI-Powered Insights
          {isAnalyzing && (
            <div className="ml-3 flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
              <span className="ml-2 text-sm text-purple-600">Analyzing...</span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {insights.length === 0 && !isAnalyzing ? (
          <div className="text-center py-8 text-slate-500">
            <Brain className="h-12 w-12 mx-auto mb-3 text-slate-300" />
            <p>No significant patterns detected in current dataset.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-white/50">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center">
                    <div className="p-1 bg-purple-100 rounded-md mr-2">
                      {getTypeIcon(insight.type)}
                    </div>
                    <h4 className="font-semibold text-slate-800">{insight.title}</h4>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getSeverityColor(insight.severity)} variant="outline">
                      {insight.severity.toUpperCase()}
                    </Badge>
                    {insight.actionable && (
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                        ACTIONABLE
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-slate-600 text-sm mb-3">{insight.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-500">AI Confidence:</span>
                    <Progress value={insight.confidence * 100} className="w-20 h-2" />
                    <span className="text-xs font-medium text-slate-700">
                      {(insight.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {insight.type.toUpperCase()}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
