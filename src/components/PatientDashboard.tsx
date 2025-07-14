
import { useState, useMemo } from 'react';
import { Search, Filter, Download, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PatientRecord } from '@/types/patient';
import { PatientModal } from '@/components/PatientModal';
import { generatePDFReport } from '@/utils/pdfGenerator';

interface PatientDashboardProps {
  patients: PatientRecord[];
}

export const PatientDashboard = ({ patients }: PatientDashboardProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);
  const [sortBy, setSortBy] = useState<string>('Risk_Score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredAndSortedPatients = useMemo(() => {
    let filtered = patients.filter(patient => {
      const matchesSearch = patient.Full_Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           patient.Patient_ID.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           patient.Drug_Name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRisk = riskFilter === 'all' || patient.Risk_Level === riskFilter;
      
      return matchesSearch && matchesRisk;
    });

    // Sort patients
    filtered.sort((a, b) => {
      let aValue = a[sortBy as keyof PatientRecord];
      let bValue = b[sortBy as keyof PatientRecord];
      
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [patients, searchTerm, riskFilter, sortBy, sortOrder]);

  const handleExportPDF = async () => {
    try {
      await generatePDFReport(patients);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Patient Risk Analysis</CardTitle>
            <Button onClick={handleExportPDF} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export PDF Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search patients, IDs, or drugs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by risk" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="High">High Risk</SelectItem>
                <SelectItem value="Medium">Medium Risk</SelectItem>
                <SelectItem value="Low">Low Risk</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Risk_Score">Risk Score</SelectItem>
                <SelectItem value="Full_Name">Patient Name</SelectItem>
                <SelectItem value="Drug_Name">Drug Name</SelectItem>
                <SelectItem value="Prescription_Date">Prescription Date</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="w-20"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </Button>
          </div>

          {/* Patient Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-3 font-medium">Patient</th>
                  <th className="text-left p-3 font-medium">Drug</th>
                  <th className="text-left p-3 font-medium">Risk Level</th>
                  <th className="text-left p-3 font-medium">Score</th>
                  <th className="text-left p-3 font-medium">Warnings</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedPatients.map((patient) => (
                  <tr key={patient.Patient_ID} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div>
                        <div className="font-medium">{patient.Full_Name}</div>
                        <div className="text-sm text-gray-500">ID: {patient.Patient_ID}</div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div>
                        <div className="font-medium">{patient.Drug_Name}</div>
                        <div className="text-sm text-gray-500">
                          {patient.Dosage_mg}mg × {patient.Quantity}
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge className={getRiskBadgeColor(patient.Risk_Level)}>
                        {patient.Risk_Level}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="font-mono text-sm">
                        {patient.Risk_Score.toFixed(2)}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="space-y-1">
                        {patient.Flagged_Warnings.slice(0, 2).map((warning, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {warning}
                          </Badge>
                        ))}
                        {patient.Flagged_Warnings.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{patient.Flagged_Warnings.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedPatient(patient)}
                        className="flex items-center gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredAndSortedPatients.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No patients found matching the current filters.
            </div>
          )}
        </CardContent>
      </Card>

      {selectedPatient && (
        <PatientModal
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
        />
      )}
    </div>
  );
};
