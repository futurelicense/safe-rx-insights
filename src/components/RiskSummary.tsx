
import { useMemo } from 'react';
import { AlertTriangle, TrendingUp, Users, Flag } from 'lucide-react';
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
    <div className="space-y-6 mb-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryData.totalPatients}</div>
            <p className="text-xs text-muted-foreground">
              Analyzed records
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{summaryData.highRisk}</div>
            <p className="text-xs text-muted-foreground">
              {((summaryData.highRisk / summaryData.totalPatients) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medium Risk</CardTitle>
            <TrendingUp className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{summaryData.mediumRisk}</div>
            <p className="text-xs text-muted-foreground">
              {((summaryData.mediumRisk / summaryData.totalPatients) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged Cases</CardTitle>
            <Flag className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {patients.filter(p => p.Flagged_Warnings.length > 0).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={riskDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
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

        <Card>
          <CardHeader>
            <CardTitle>Top Warning Flags</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={warningData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="warning" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
