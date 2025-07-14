
import { Calendar, MapPin, Pill, AlertTriangle, Clock, User } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PatientRecord } from '@/types/patient';

interface PatientModalProps {
  patient: PatientRecord;
  onClose: () => void;
}

export const PatientModal = ({ patient, onClose }: PatientModalProps) => {
  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <User className="h-5 w-5" />
            Patient Details: {patient.Full_Name}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Patient Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Patient Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Patient ID</label>
                  <p className="text-sm">{patient.Patient_ID}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                  <p className="text-sm">{patient.DOB}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Gender</label>
                  <p className="text-sm">{patient.Gender}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Payment Type</label>
                  <p className="text-sm">{patient.Payment_Type}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Pickup Method</label>
                <p className="text-sm">{patient.Pickup_Method}</p>
              </div>
              
              {patient.Adherence_Score && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Adherence Score</label>
                  <p className="text-sm">{patient.Adherence_Score}%</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Risk Assessment */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Risk Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Risk Level</label>
                  <div className="mt-1">
                    <Badge className={getRiskBadgeColor(patient.Risk_Level)}>
                      {patient.Risk_Level}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Risk Score</label>
                  <p className="text-lg font-mono">{patient.Risk_Score.toFixed(2)}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">AI Confidence</label>
                <p className="text-sm">{(patient.AI_Confidence * 100).toFixed(1)}%</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 mb-2 block">Warning Flags</label>
                <div className="space-y-2">
                  {patient.Flagged_Warnings.length > 0 ? (
                    patient.Flagged_Warnings.map((warning, idx) => (
                      <Badge key={idx} variant="outline" className="mr-2 mb-1">
                        {warning}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No warnings</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Prescription Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Pill className="h-5 w-5" />
                Prescription Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Drug Name</label>
                  <p className="text-sm font-medium">{patient.Drug_Name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Drug Code</label>
                  <p className="text-sm">{patient.Drug_Code}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Dosage</label>
                  <p className="text-sm">{patient.Dosage_mg}mg</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Quantity</label>
                  <p className="text-sm">{patient.Quantity} pills</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Days Supplied</label>
                  <p className="text-sm">{patient.Days_Supplied} days</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Refill Number</label>
                  <p className="text-sm">{patient.Refill_Number}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Overlapping Prescriptions</label>
                <p className="text-sm">
                  {patient.Overlapping_Prescriptions ? 'Yes' : 'No'}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">PDMP Status</label>
                <p className="text-sm">{patient.State_PDMP_Status}</p>
              </div>
            </CardContent>
          </Card>

          {/* Provider & Pharmacy */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Provider & Pharmacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Prescriber</label>
                <p className="text-sm">{patient.Prescriber_Name}</p>
                <p className="text-xs text-gray-500">NPI: {patient.Prescriber_NPI}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Pharmacy</label>
                <p className="text-sm">{patient.Pharmacy_Name}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Prescription Date</label>
                  <p className="text-sm">{patient.Prescription_Date}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Dispense Date</label>
                  <p className="text-sm">{patient.Dispense_Date}</p>
                </div>
              </div>

              {patient.Refill_Date && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Refill Date</label>
                  <p className="text-sm">{patient.Refill_Date}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Notes */}
        {patient.Notes && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Clinical Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{patient.Notes}</p>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
};
