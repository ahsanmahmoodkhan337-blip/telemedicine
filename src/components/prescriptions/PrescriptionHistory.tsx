import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { EmptyState } from '@/components/ui/loading-states'
import { Pill, AlertTriangle, Eye, Clock, CheckCircle, XCircle } from 'lucide-react'
import { getPrescriptionsByPatient, type Prescription } from '@/lib/mockData'

const currentPatientId = 'p1' // Simulating logged-in patient (Ahmed Raza)

export default function PrescriptionHistory() {
  const [selectedRx, setSelectedRx] = useState<Prescription | null>(null)
  const [showDetail, setShowDetail] = useState(false)

  const prescriptions = getPrescriptionsByPatient(currentPatientId)

  const statusConfig = {
    pending: { icon: Clock, label: 'Pending', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    dispensed: { icon: CheckCircle, label: 'Dispensed', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    cancelled: { icon: XCircle, label: 'Cancelled', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  }

  const viewDetails = (rx: Prescription) => {
    setSelectedRx(rx)
    setShowDetail(true)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Pill className="h-4 w-4 text-primary" />
              My Prescriptions
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              {prescriptions.length} total
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {prescriptions.length === 0 ? (
            <EmptyState
              title="No prescriptions"
              description="You don't have any prescriptions yet."
              icon={<Pill className="h-12 w-12" />}
            />
          ) : (
            <div className="space-y-3">
              {prescriptions.map((rx) => {
                const status = statusConfig[rx.status]
                const StatusIcon = status.icon
                return (
                  <div
                    key={rx.id}
                    className="flex items-center gap-3 rounded-lg border border-gray-100 dark:border-gray-700 p-3 hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                    onClick={() => viewDetails(rx)}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-900/20">
                      <Pill className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {rx.medications.length} medication{rx.medications.length > 1 ? 's' : ''}
                      </p>
                      <p className="text-xs text-gray-500">
                        Prescribed by {rx.doctorName} · {rx.date}
                      </p>
                      {medSummary(rx)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${status.className}`}>
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </span>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Prescription Detail Dialog */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-primary" />
              Prescription Details
            </DialogTitle>
            <DialogDescription>
              {selectedRx?.id} · Prescribed by {selectedRx?.doctorName} · {selectedRx?.date}
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

              {selectedRx.interactions.length > 0 && (
                <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-3">
                  <p className="text-xs font-medium text-amber-800 dark:text-amber-400 flex items-center gap-1 mb-1">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Drug Interaction Warnings
                  </p>
                  <ul className="space-y-0.5">
                    {selectedRx.interactions.map((w, i) => (
                      <li key={i} className="text-xs text-amber-700 dark:text-amber-300 flex items-start gap-1">
                        <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5" />
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedRx.notes && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Notes</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{selectedRx.notes}</p>
                </div>
              )}

              <div className="flex items-center gap-2">
                <p className="text-xs text-gray-500">Status:</p>
                <Badge variant={selectedRx.status === 'dispensed' ? 'success' : selectedRx.status === 'cancelled' ? 'destructive' : 'warning'}>
                  {selectedRx.status}
                </Badge>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetail(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function medSummary(rx: Prescription): JSX.Element | null {
  if (rx.medications.length === 0) return null
  const names = rx.medications.map((m) => m.name).join(', ')
  return <p className="text-xs text-gray-400 mt-0.5 truncate">{names}</p>
}
