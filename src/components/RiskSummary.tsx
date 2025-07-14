import { useMemo } from 'react';
import { AlertTriangle, TrendingUp, Users, Flag, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PatientRecord, RiskSummaryData } from '@/types/patient';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface RiskSummaryProps {
  patients: PatientRecord[];
}

const RISK_COLORS = {
  Low: '#10B981',
  Medium: '#F59E0B',
  High: '#EF4444',
};

export const RiskSummary = ({ patients }: RiskSummaryProps) => {
  const summaryData: RiskSummaryData = useMemo(() => {
    const totalPatients = patients.length;
    const highRisk = patients.filter(p => p.Risk_Level === 'High').length;
    const mediumRisk = patients.filter(p => p.Risk_Level === 'Medium').length;
    const lowRisk = patients.filter(p => p.Risk_Level === 'Low').length;

    // Count flagged warnings
    const flaggedWarnings: { [key: string]: number } = {};
    patients.forEach(patient => {
      patient.Flagged_Warnings.forEach(warning => {
        flaggedWarnings[warning] = (flaggedWarnings[warning] || 0) + 1;
      });
    });

    // Top drugs by usage and risk
    const drugStats: { [key: string]: { count: number; totalRisk: number } } = {};
    patients.forEach(patient => {
      if (!drugStats[patient.Drug_Name]) {
        drugStats[patient.Drug_Name] = { count: 0, totalRisk: 0 };
      }
      drugStats[patient.Drug_Name].count++;
      drugStats[patient.Drug_Name].totalRisk += patient.Risk_Score;
    });

    const topDrugs = Object.entries(drugStats)
      .map(([name, stats]) => ({
        name,
        count: stats.count,
        avgRisk: stats.totalRisk / stats.count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalPatients,
      highRisk,
      mediumRisk,
      lowRisk,
      flaggedWarnings,
      topDrugs,
    };
  }, [patients]);

  const riskDistributionData = [
    { name: 'Low Risk', value: summaryData.lowRisk, color: RISK_COLORS.Low },
    { name: 'Medium Risk', value: summaryData.mediumRisk, color: RISK_COLORS.Medium },
    { name: 'High Risk', value: summaryData.highRisk, color: RISK_COLORS.High },
  ];

  const warningData = Object.entries(summaryData.flaggedWarnings)
    .map(([warning, count]) => ({ warning, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  return (
    <div className="space-y-8 mb-12">
      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="group hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-indigo-50 border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-blue-700">Total Patients</CardTitle>
            <div className="p-2 bg-blue-500 rounded-lg">
              <Users className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">{summaryData.totalPatients}</div>
            <p className="text-xs text-blue-600 mt-1 font-medium">
              Analyzed records
            </p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-red-50 to-pink-50 border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-red-700">High Risk</CardTitle>
            <div className="p-2 bg-red-500 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-900">{summaryData.highRisk}</div>
            <p className="text-xs text-red-600 mt-1 font-medium">
              {((summaryData.highRisk / summaryData.totalPatients) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-amber-50 to-orange-50 border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-amber-700">Medium Risk</CardTitle>
            <div className="p-2 bg-amber-500 rounded-lg">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-900">{summaryData.mediumRisk}</div>
            <p className="text-xs text-amber-600 mt-1 font-medium">
              {((summaryData.mediumRisk / summaryData.totalPatients) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-indigo-50 border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-purple-700">Flagged Cases</CardTitle>
            <div className="p-2 bg-purple-500 rounded-lg">
              <Flag className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900">
              {patients.filter(p => p.Flagged_Warnings.length > 0).length}
            </div>
            <p className="text-xs text-purple-600 mt-1 font-medium">
              Require attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-slate-800 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-blue-600" />
              Risk Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={riskDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {riskDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} patients`, 'Count']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-slate-800 flex items-center">
              <Flag className="h-5 w-5 mr-2 text-orange-600" />
              Top Warning Flags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={warningData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="warning" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  fontSize={12}
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
                />
                <Bar dataKey="count" fill="url(#colorGradient)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#1E40AF" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
