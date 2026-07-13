import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { LoadingSkeleton, EmptyState } from '@/components/ui/loading-states'
import { Pill, AlertTriangle, CheckCircle, Clock, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { CheckoutPaymentFlow } from '@/components/payments/CheckoutFlow'
import {
  getPrescriptions,
  updatePrescriptionStatus,
  type Prescription,
} from '@/lib/mockData'

export default function PharmacistInbox() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(getPrescriptions())
  const [selectedRx, setSelectedRx] = useState<Prescription | null>(null)
  const [showInteraction, setShowInteraction] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [loading] = useState(false)

  const refreshData = () => {
    setPrescriptions(getPrescriptions())
  }

  const handleDispense = (rx: Prescription) => {
    if (rx.interactions.length > 0) {
      setSelectedRx(rx)
      setShowInteraction(true)
      return
    }
    const updated = updatePrescriptionStatus(rx.id, 'dispensed')
    if (updated) {
      refreshData()
      toast.success(`Prescription ${rx.id} dispensed`)
    }
  }

  const handleOverrideInteraction = () => {
    if (selectedRx) {
      const updated = updatePrescriptionStatus(selectedRx.id, 'dispensed')
      if (updated) {
        refreshData()
        toast.success('Interaction overridden — prescription dispensed')
      }
      setShowInteraction(false)
      setSelectedRx(null)
    }
  }

  const viewDetails = (rx: Prescription) => {
    setSelectedRx(rx)
    setShowDetail(true)
  }

  if (loading) return <LoadingSkeleton title="Pharmacist Console" />

  const pending = prescriptions.filter(p => p.status === 'pending')
  const dispensed = prescriptions.filter(p => p.status === 'dispensed')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Pharmacist Console</h1>
          <p className="text-gray-500 mt-1">Review and dispense e-prescriptions</p>
        </div>
        <Button variant="outline" size="sm" onClick={refreshData} className="gap-1.5">
          <Clock className="h-4 w-4" /> Refresh
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-amber-600">{pending.length}</p>
            <p className="text-sm text-gray-500">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-emerald-600">{dispensed.length}</p>
            <p className="text-sm text-gray-500">Dispensed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-accent">{prescriptions.length}</p>
            <p className="text-sm text-gray-500">Total Today</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">E-Prescriptions</CardTitle>
        </CardHeader>
        <CardContent>
          {prescriptions.length === 0 ? (
            <EmptyState title="No prescriptions" description="No prescriptions to review at this time." icon={<Pill className="h-12 w-12" />} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Medications</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Interactions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prescriptions.map((rx) => (
                  <TableRow key={rx.id}>
                    <TableCell className="font-medium">{rx.id}</TableCell>
                    <TableCell>{rx.patientName}</TableCell>
                    <TableCell>{rx.doctorName}</TableCell>
                    <TableCell>
                      {rx.medications.length} item{rx.medications.length > 1 ? 's' : ''}
                    </TableCell>
                    <TableCell>{rx.date}</TableCell>
                    <TableCell>
                      {rx.interactions.length > 0 ? (
                        <span className="inline-flex items-center gap-1 text-amber-600 text-xs font-medium">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          {rx.interactions.length} alert{rx.interactions.length > 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span className="text-emerald-600 text-xs flex items-center gap-1">
                          <CheckCircle className="h-3.5 w-3.5" /> None
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={rx.status === 'dispensed' ? 'success' : rx.status === 'cancelled' ? 'destructive' : 'warning'}>
                        {rx.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" onClick={() => viewDetails(rx)} className="h-8 w-8 p-0">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {rx.status === 'pending' && (
                          <Button size="sm" variant="outline" onClick={() => handleDispense(rx)} className="text-xs h-8">
                            Dispense
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Drug Interaction Dialog */}
      <Dialog open={showInteraction} onOpenChange={setShowInteraction}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Drug-Drug Interaction Alert
            </DialogTitle>
            <DialogDescription>
              Potential interactions detected for this prescription
            </DialogDescription>
          </DialogHeader>
          {selectedRx && (
            <div className="space-y-4">
              <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-4">
                <p className="font-medium text-slate-900 dark:text-white mb-2">Patient: {selectedRx.patientName}</p>
                <p className="font-medium text-amber-800 dark:text-amber-400 mb-2">Interactions found:</p>
                <ul className="space-y-1">
                  {selectedRx.interactions.map((interaction, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-500">
                      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                      {interaction}
                    </li>
                  ))}
                </ul>
              </div>
              <p className="text-sm text-gray-500">
                You can override this alert and proceed with dispensing, or cancel and contact the prescribing doctor.
              </p>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowInteraction(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleOverrideInteraction}>
              Override & Dispense
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Prescription Detail Dialog */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-primary" />
              Prescription Details
            </DialogTitle>
            <DialogDescription>
              {selectedRx?.id} · {selectedRx?.patientName}
            </DialogDescription>
          </DialogHeader>
          {selectedRx && (
            <div className="space-y-4">
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
                {selectedRx.medications.map((med, idx) => (
                  <div key={idx} className="p-3">
                    <p className="font-medium text-slate-900 dark:text-white text-sm">{med.name}</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1 text-xs text-gray-500">
                      <span>Dosage: {med.dosage}</span>
                      <span>Frequency: {med.frequency}</span>
                      <span>Route: {med.route}</span>
                      <span>Duration: {med.duration}</span>
                      <span>Quantity: {med.quantity}</span>
                    </div>
                    {med.instructions && (
                      <p className="text-xs text-gray-500 mt-1 italic">Note: {med.instructions}</p>
                    )}
                  </div>
                ))}
              </div>
              {selectedRx.notes && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Notes</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{selectedRx.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetail(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Checkout & Payment */}
      <div className="max-w-sm">
        <CheckoutPaymentFlow
          patientId="patient-001"
          practitionerId="pharmacist-001"
          showConversion={true}
          defaultAmount="500"
          onPaymentComplete={(resp) => {
            if (resp.success) toast.success('Prescription payment received')
          }}
        />
      </div>
    </div>
  )
}
