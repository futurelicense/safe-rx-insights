
import { useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, RadialBarChart, RadialBar, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PatientRecord } from '@/types/patient';
import { TrendingUp, Users, Calendar, DollarSign, Activity, Clock } from 'lucide-react';

interface AdvancedAnalyticsProps {
  patients: PatientRecord[];
}

export const AdvancedAnalytics = ({ patients }: AdvancedAnalyticsProps) => {
  const analyticsData = useMemo(() => {
    // Dosage vs Risk Score Analysis
    const dosageRiskData = patients.map(p => ({
      dosage: p.Dosage_mg,
      riskScore: p.Risk_Score * 100,
      quantity: p.Quantity,
      riskLevel: p.Risk_Level
    }));

    // Payment Type Distribution
    const paymentStats: { [key: string]: number } = {};
    patients.forEach(p => {
      paymentStats[p.Payment_Type] = (paymentStats[p.Payment_Type] || 0) + 1;
    });
    const paymentData = Object.entries(paymentStats).map(([type, count]) => ({
      name: type,
      value: count,
      percentage: (count / patients.length) * 100
    }));

    // Daily Supply vs Risk Analysis
    const supplyRiskData = patients.map(p => ({
      daysSupplied: p.Days_Supplied,
      riskScore: p.Risk_Score * 100,
      quantity: p.Quantity
    }));

    // Prescriber Performance Analysis (keyed by DEA number for accuracy)
    const prescriberStats: { [key: string]: { count: number; avgRisk: number; highRisk: number; name: string; dea: string } } = {};
    patients.forEach(p => {
      const key = p.Prescriber_DEA || p.Prescriber_NPI; // Fallback to NPI if DEA not available
      if (!prescriberStats[key]) {
        prescriberStats[key] = { count: 0, avgRisk: 0, highRisk: 0, name: p.Prescriber_Name, dea: p.Prescriber_DEA };
      }
      prescriberStats[key].count++;
      prescriberStats[key].avgRisk += p.Risk_Score;
      if (p.Risk_Level === 'High') prescriberStats[key].highRisk++;
    });

    const prescriberData = Object.entries(prescriberStats)
      .map(([key, stats]) => ({
        name: stats.name.length > 15 ? stats.name.substring(0, 15) + '...' : stats.name,
        fullName: stats.name,
        dea: stats.dea,
        prescriptions: stats.count,
        avgRisk: (stats.avgRisk / stats.count) * 100,
        highRiskRate: (stats.highRisk / stats.count) * 100
      }))
      .sort((a, b) => b.prescriptions - a.prescriptions)
      .slice(0, 8);

    // Drug Distribution Analysis
    const drugStats: { [key: string]: number } = {};
    patients.forEach(p => {
      drugStats[p.Drug_Name] = (drugStats[p.Drug_Name] || 0) + 1;
    });
    const drugData = Object.entries(drugStats)
      .map(([drug, count]) => ({
        name: drug,
        value: count,
        percentage: (count / patients.length) * 100
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    // Time-based Analysis (if we had real dates, this would be more meaningful)
    const refillData = Array.from({ length: 6 }, (_, i) => ({
      refillNumber: i,
      count: patients.filter(p => p.Refill_Number === i).length,
      avgRisk: patients.filter(p => p.Refill_Number === i).reduce((sum, p) => sum + p.Risk_Score, 0) / 
               Math.max(1, patients.filter(p => p.Refill_Number === i).length) * 100
    }));

    return {
      dosageRiskData,
      paymentData,
      supplyRiskData,
      prescriberData,
      drugData,
      refillData
    };
  }, [patients]);

  return (
    <div className="space-y-8">
      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Avg Risk Score</p>
                <p className="text-2xl font-bold text-blue-900">
                  {(patients.reduce((sum, p) => sum + p.Risk_Score, 0) / patients.length * 100).toFixed(1)}%
                </p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Avg Days Supply</p>
                <p className="text-2xl font-bold text-green-900">
                  {(patients.reduce((sum, p) => sum + p.Days_Supplied, 0) / patients.length).toFixed(0)} days
                </p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Unique Prescribers</p>
                <p className="text-2xl font-bold text-purple-900">
                  {new Set(patients.map(p => p.Prescriber_DEA || p.Prescriber_NPI)).size}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">Cash Payment Rate</p>
                <p className="text-2xl font-bold text-orange-900">
                  {((patients.filter(p => p.Payment_Type === 'Cash').length / patients.length) * 100).toFixed(1)}%
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Dosage vs Risk Scatter Plot */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
              Dosage vs Risk Correlation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart data={analyticsData.dosageRiskData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="dosage" name="Dosage (mg)" stroke="#64748b" />
                <YAxis dataKey="riskScore" name="Risk Score %" stroke="#64748b" />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'riskScore' ? `${typeof value === 'number' ? value.toFixed(1) : value}%` : value,
                    name === 'riskScore' ? 'Risk Score' : 'Dosage'
                  ]}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Scatter dataKey="riskScore" fill="#3B82F6" />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Prescriber Performance */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center">
              <Users className="h-5 w-5 mr-2 text-green-600" />
              Prescriber Risk Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.prescriberData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={11}
                  stroke="#64748b"
                />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  labelFormatter={(label) => {
                    const prescriber = analyticsData.prescriberData.find(p => p.name === label);
                    return prescriber ? `${prescriber.fullName} (DEA: ${prescriber.dea})` : label;
                  }}
                />
                <Bar dataKey="avgRisk" fill="#10B981" name="Avg Risk %" radius={[2, 2, 0, 0]} />
                <Bar dataKey="highRiskRate" fill="#EF4444" name="High Risk %" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment Method Distribution */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-purple-600" />
              Payment Method Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadialBarChart data={analyticsData.paymentData} innerRadius="30%" outerRadius="90%">
                <RadialBar dataKey="percentage" cornerRadius={10} fill="#8884d8" />
                <Legend />
                <Tooltip formatter={(value) => [`${typeof value === 'number' ? value.toFixed(1) : value}%`, 'Percentage']} />
              </RadialBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Refill Pattern Analysis */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-orange-600" />
              Refill Pattern Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.refillData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="refillNumber" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line type="monotone" dataKey="count" stroke="#F59E0B" strokeWidth={3} name="Patient Count" />
                <Line type="monotone" dataKey="avgRisk" stroke="#EF4444" strokeWidth={3} name="Avg Risk %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
