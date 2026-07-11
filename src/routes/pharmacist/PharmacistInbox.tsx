import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { LoadingSkeleton, EmptyState, ErrorState } from '@/components/ui/loading-states'
import { Pill, AlertTriangle, CheckCircle, Clock, User, Stethoscope, Truck } from 'lucide-react'
import { toast } from 'sonner'
import { CheckoutPaymentFlow } from '@/components/payments/CheckoutFlow'
import { pharmacyDispatch, PHARMACY_NAMES } from '@/lib/integrations'
import type { PharmacyPartner } from '@/lib/integrations'

interface Prescription {
  id: string
  patient: string
  doctor: string
  medication: string
  dosage: string
  frequency: string
  duration: string
  date: string
  status: 'pending' | 'dispensed' | 'cancelled'
  interactions: string[]
}

const mockPrescriptions: Prescription[] = [
  {
    id: 'RX-001',
    patient: 'Ahmed Raza',
    doctor: 'Dr. Sarah Ahmed',
    medication: 'Amlodipine 5mg',
    dosage: '1 tablet',
    frequency: 'Once daily',
    duration: '30 days',
    date: '2026-07-08',
    status: 'pending',
    interactions: ['Possible interaction with Metformin'],
  },
  {
    id: 'RX-002',
    patient: 'Sana Tariq',
    doctor: 'Dr. Imran Ali',
    medication: 'Metformin 500mg',
    dosage: '1 tablet',
    frequency: 'Twice daily',
    duration: '60 days',
    date: '2026-07-07',
    status: 'pending',
    interactions: [],
  },
  {
    id: 'RX-003',
    patient: 'Bilal Khan',
    doctor: 'Dr. Fatima Khan',
    medication: 'Ibuprofen 400mg',
    dosage: '1 tablet',
    frequency: 'As needed',
    duration: '10 days',
    date: '2026-07-06',
    status: 'dispensed',
    interactions: [],
  },
]

export default function PharmacistInbox() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(mockPrescriptions)
  const [selectedRx, setSelectedRx] = useState<Prescription | null>(null)
  const [showInteraction, setShowInteraction] = useState(false)
  const [loading] = useState(false)
  const [dispatchingRx, setDispatchingRx] = useState<string | null>(null)
  const [dispatchPartner, setDispatchPartner] = useState<PharmacyPartner>('dvago')

  const handleDispense = (rx: Prescription) => {
    if (rx.interactions.length > 0) {
      setSelectedRx(rx)
      setShowInteraction(true)
      return
    }
    setPrescriptions(prev =>
      prev.map(p => p.id === rx.id ? { ...p, status: 'dispensed' as const } : p)
    )
    toast.success(`Prescription ${rx.id} dispensed`)
  }

  const handleOverrideInteraction = () => {
    if (selectedRx) {
      setPrescriptions(prev =>
        prev.map(p => p.id === selectedRx.id ? { ...p, status: 'dispensed' as const } : p)
      )
      toast.success('Interaction overridden — prescription dispensed')
      setShowInteraction(false)
      setSelectedRx(null)
    }
  }

  const handleSendToPharmacy = async (rx: Prescription) => {
    setDispatchingRx(rx.id)
    const response = await pharmacyDispatch.placeOrder(dispatchPartner, {
      id: `PH-${Date.now()}`,
      pharmacyPartner: dispatchPartner,
      prescriptionId: rx.id,
      patientId: 'patient-001', patientName: rx.patient,
      patientPhone: '0300-1234567', patientAddress: '12-A, Block 6',
      patientCity: 'Karachi',
      doctorId: 'doctor-001', doctorName: rx.doctor,
      deliveryType: 'delivery', paymentMethod: 'cod',
      items: [{
        medicationCode: rx.id, medicationName: rx.medication,
        dosage: rx.dosage, quantity: 1, unit: 'box',
        instructions: rx.frequency, pricePerUnit: 150,
        isControlled: false,
      }],
    })
    setDispatchingRx(null)
    if (response.success) {
      toast.success(`Dispatched via ${PHARMACY_NAMES[dispatchPartner]}: ${response.trackingUrl ? 'Track at ' + response.trackingUrl : response.message}`)
      setPrescriptions(prev => prev.map(p => p.id === rx.id ? { ...p, status: 'dispensed' as const } : p))
    } else {
      toast.error(response.message)
    }
  }

  if (loading) return <LoadingSkeleton title="Pharmacist Console" />

  const pending = prescriptions.filter(p => p.status === 'pending')
  const dispensed = prescriptions.filter(p => p.status === 'dispensed')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Pharmacist Console</h1>
        <p className="text-gray-500 mt-1">Review and dispense e-prescriptions</p>
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
                  <TableHead>Medication</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Interactions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prescriptions.map((rx) => (
                  <TableRow key={rx.id}>
                    <TableCell className="font-medium">{rx.id}</TableCell>
                    <TableCell>{rx.patient}</TableCell>
                    <TableCell>{rx.doctor}</TableCell>
                    <TableCell>{rx.medication} · {rx.dosage}</TableCell>
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
                      <Badge variant={rx.status === 'dispensed' ? 'success' : 'warning'}>
                        {rx.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex gap-1">
                          {(['dvago', 'dawaai', 'tabiyat'] as PharmacyPartner[]).map(p => (
                            <Button key={p} size="sm" variant={dispatchPartner === p ? 'default' : 'ghost'}
                              className="text-xs px-1.5 h-6" onClick={() => setDispatchPartner(p)}>
                              {p === 'dvago' ? 'DV' : p === 'dawaai' ? 'DW' : 'TB'}
                            </Button>
                          ))}
                        </div>
                        {rx.status === 'pending' && (
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" onClick={() => handleDispense(rx)}>
                              Dispense
                            </Button>
                            <Button size="sm" variant="accent" onClick={() => handleSendToPharmacy(rx)}
                              disabled={dispatchingRx === rx.id}>
                              {dispatchingRx === rx.id ? '...' : <Truck className="h-3 w-3" />}
                            </Button>
                          </div>
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
                <p className="font-medium text-amber-800 dark:text-amber-400">{selectedRx.medication}</p>
                <ul className="mt-2 space-y-1">
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