import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { LoadingSkeleton, EmptyState } from '@/components/ui/loading-states'
import {
  Plus,
  Trash2,
  Search,
  User,
  Pill,
  AlertTriangle,
  Printer,
  CheckCircle,
  X,
  ChevronLeft,
  FileText,
  Clock,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  searchPatients,
  checkInteractions,
  addPrescription,
  getPatients,
  COMMON_MEDICATIONS,
  FREQUENCY_OPTIONS,
  ROUTE_OPTIONS,
  DURATION_OPTIONS,
  type Patient,
  type PrescriptionMedication,
} from '@/lib/mockData'

interface MedEntry extends PrescriptionMedication {
  id: string
  interactions: string[]
}

function emptyMed(): MedEntry {
  return {
    id: crypto.randomUUID(),
    name: '',
    dosage: '',
    frequency: '',
    duration: '',
    route: 'Oral',
    quantity: 0,
    instructions: '',
    interactions: [],
  }
}

export default function PrescriptionGenerator() {
  const navigate = useNavigate()
  const [step, setStep] = useState<'select-patient' | 'compose' | 'preview'>('select-patient')
  const [search, setSearch] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [medications, setMedications] = useState<MedEntry[]>([emptyMed()])
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [selectedMed, setSelectedMed] = useState<string>('')
  const printRef = useRef<HTMLDivElement>(null)

  const filteredPatients = search ? searchPatients(search) : getPatients()

  const selectPatient = (patient: Patient) => {
    setSelectedPatient(patient)
    setStep('compose')
  }

  const updateMed = (id: string, patch: Partial<MedEntry>) => {
    setMedications((prev) => {
      const updated = prev.map((m) => {
        if (m.id !== id) return m
        const merged = { ...m, ...patch }

        // Check interactions when medication name changes
        if (patch.name && patch.name !== m.name) {
          const otherMeds = prev.filter((x) => x.id !== id).map((x) => ({ ...x, ...(x.id === id ? patch : {}) }))
          merged.interactions = checkInteractions(patch.name, otherMeds)
        }

        return merged
      })
      return updated
    })
  }

  const addMed = () => {
    setMedications((prev) => [...prev, emptyMed()])
  }

  const removeMed = (id: string) => {
    setMedications((prev) => {
      const remaining = prev.filter((m) => m.id !== id)
      // Re-check interactions for remaining meds
      return remaining.map((m) => ({
        ...m,
        interactions: checkInteractions(
          m.name,
          remaining.filter((x) => x.id !== m.id),
        ),
      }))
    })
  }

  const handleMedicationSelect = (medId: string, medName: string) => {
    setSelectedMed('')
    updateMed(medId, { name: medName })
  }

  const validateMeds = (): boolean => {
    for (const med of medications) {
      if (!med.name.trim()) {
        toast.error('Please fill in all medication names')
        return false
      }
      if (!med.dosage.trim()) {
        toast.error('Please fill in dosage for all medications')
        return false
      }
      if (!med.frequency) {
        toast.error('Please select frequency for all medications')
        return false
      }
      if (!med.duration) {
        toast.error('Please select duration for all medications')
        return false
      }
      if (med.quantity <= 0) {
        toast.error('Please enter quantity for all medications')
        return false
      }
    }
    return true
  }

  const goToPreview = () => {
    if (!validateMeds()) return
    setStep('preview')
  }

  const handleSubmit = () => {
    if (!selectedPatient) return
    setSubmitting(true)

    const allInteractions = medications.flatMap((m) => m.interactions)

    const rx = addPrescription({
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      doctorName: 'Dr. Sarah Ahmed',
      doctorId: 'doc1',
      medications: medications.map(({ id, interactions, ...med }) => med),
      status: 'pending',
      notes,
      interactions: allInteractions,
    })

    toast.success(`Prescription ${rx.id} submitted successfully!`)
    setTimeout(() => {
      navigate('/pharmacist/inbox')
    }, 800)
  }

  const handlePrint = () => {
    window.print()
  }

  const isMedicationSelected = (medName: string): boolean => {
    return medications.some((m) => m.name === medName)
  }

  const allInteractions = medications.flatMap((m) => m.interactions)
  const uniqueInteractions = [...new Set(allInteractions)]

  if (!selectedPatient && step === 'select-patient') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">New Prescription</h1>
          <p className="text-gray-500 mt-1">Select a patient to write a prescription for</p>
        </div>

        <Card>
          <CardHeader>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search patients by name or condition..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            {filteredPatients.length === 0 ? (
              <EmptyState title="No patients found" description="Try a different search term" />
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {filteredPatients.map((patient) => (
                  <button
                    key={patient.id}
                    type="button"
                    onClick={() => selectPatient(patient)}
                    className="flex items-center gap-3 rounded-lg border border-[#D1D5DB] p-3 text-left hover:border-primary/50 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-white text-xs">
                        {patient.name.split(' ').map((n) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 dark:text-white text-sm">{patient.name}</p>
                      <p className="text-xs text-gray-500">{patient.age} yrs · {patient.condition}</p>
                      <p className="text-xs text-gray-400">Last visit: {patient.lastVisit}</p>
                    </div>
                    <ChevronLeft className="h-5 w-5 text-gray-300 rotate-180" />
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (step === 'preview') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Preview Prescription</h1>
            <p className="text-gray-500 mt-1">Review and print before submitting</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep('compose')} className="gap-1.5">
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>
            <Button variant="outline" onClick={handlePrint} className="gap-1.5">
              <Printer className="h-4 w-4" /> Print
            </Button>
          </div>
        </div>

        {/* Printable Prescription */}
        <div ref={printRef} className="print-area">
          <Card className="border-2 border-primary/20">
            <CardContent className="p-8">
              {/* Header */}
              <div className="text-center border-b border-gray-200 pb-4 mb-6">
                <h2 className="text-xl font-bold text-slate-900">Healthcare Hustlers</h2>
                <p className="text-sm text-gray-500">Digital E-Prescription · Secure & Verified</p>
              </div>

              {/* Info */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Patient</p>
                  <p className="font-medium text-slate-900">{selectedPatient?.name}</p>
                  <p className="text-sm text-gray-500">Age: {selectedPatient?.age} yrs</p>
                  <p className="text-sm text-gray-500">Condition: {selectedPatient?.condition}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Prescriber</p>
                  <p className="font-medium text-slate-900">Dr. Sarah Ahmed</p>
                  <p className="text-sm text-gray-500">License: PMC-12345</p>
                  <p className="text-sm text-gray-500">{new Date().toLocaleDateString()}</p>
                </div>
              </div>

              {/* Medications */}
              <table className="w-full mb-6">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 text-xs text-gray-500 uppercase">Medication</th>
                    <th className="text-left py-2 text-xs text-gray-500 uppercase">Dosage</th>
                    <th className="text-left py-2 text-xs text-gray-500 uppercase">Frequency</th>
                    <th className="text-left py-2 text-xs text-gray-500 uppercase">Route</th>
                    <th className="text-right py-2 text-xs text-gray-500 uppercase">Qty</th>
                    <th className="text-left py-2 text-xs text-gray-500 uppercase">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {medications.map((med, idx) => (
                    <tr key={med.id} className="border-b border-gray-100">
                      <td className="py-3 font-medium text-slate-900">{med.name}</td>
                      <td className="py-3 text-sm">{med.dosage}</td>
                      <td className="py-3 text-sm">{med.frequency}</td>
                      <td className="py-3 text-sm">{med.route}</td>
                      <td className="py-3 text-right text-sm">{med.quantity}</td>
                      <td className="py-3 text-sm">{med.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Instructions */}
              {medications.some((m) => m.instructions) && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Instructions</p>
                  <ul className="list-disc pl-5 space-y-0.5">
                    {medications.map(
                      (m) =>
                        m.instructions && (
                          <li key={m.id} className="text-sm text-slate-700">
                            {m.name}: {m.instructions}
                          </li>
                        ),
                    )}
                  </ul>
                </div>
              )}

              {notes && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Notes</p>
                  <p className="text-sm text-slate-700">{notes}</p>
                </div>
              )}

              {/* Drug Interaction Warnings */}
              {uniqueInteractions.length > 0 && (
                <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 mb-4">
                  <p className="text-xs font-medium text-amber-800 flex items-center gap-1 mb-1">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Drug Interaction Warning
                  </p>
                  <ul className="list-disc pl-5">
                    {uniqueInteractions.map((w, i) => (
                      <li key={i} className="text-xs text-amber-700">{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Signature */}
              <div className="border-t border-gray-200 pt-4 mt-6 text-center text-xs text-gray-400">
                <p>This is a computer-generated prescription. No physical signature required.</p>
                <p>Prescription ID: RX-{String(Math.floor(Math.random() * 900) + 100)} · Issued: {new Date().toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setStep('compose')}>
            <ChevronLeft className="h-4 w-4 mr-1.5" /> Edit
          </Button>
          <Button onClick={handleSubmit} disabled={submitting} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
            {submitting ? 'Submitting...' : <><CheckCircle className="h-4 w-4" /> Submit Prescription</>}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">New Prescription</h1>
          <p className="text-gray-500 mt-1">
            Writing for: <span className="font-medium text-slate-700 dark:text-slate-300">{selectedPatient?.name}</span>
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => { setSelectedPatient(null); setStep('select-patient'); setMedications([emptyMed()]) }} className="gap-1.5">
          <X className="h-4 w-4" /> Change Patient
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main: Medication Form */}
        <div className="lg:col-span-2 space-y-4">
          {medications.map((med, idx) => (
            <Card key={med.id} className="border-primary/10">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Pill className="h-4 w-4 text-primary" />
                    Medication #{idx + 1}
                  </CardTitle>
                  {medications.length > 1 && (
                    <button type="button" onClick={() => removeMed(med.id)} className="text-red-400 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Medication Name */}
                <div className="space-y-1.5">
                  <Label>Medication Name *</Label>
                  <div className="relative">
                    <Input
                      placeholder="Type to search or enter manually..."
                      value={med.name}
                      onChange={(e) => updateMed(med.id, { name: e.target.value })}
                    />
                    {med.name && (
                      <div className="absolute z-10 top-full mt-1 left-0 right-0 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {COMMON_MEDICATIONS.filter(
                          (m) =>
                            m.name.toLowerCase().includes(med.name.toLowerCase()) &&
                            !isMedicationSelected(m.name),
                        ).map((m) => (
                          <button
                            key={m.name}
                            type="button"
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-slate-800 flex items-center justify-between"
                            onClick={() => handleMedicationSelect(med.id, m.name)}
                          >
                            <span>{m.name}</span>
                            <Badge variant="secondary" className="text-[10px]">{m.category}</Badge>
                          </button>
                        ))}
                        {COMMON_MEDICATIONS.filter(
                          (m) =>
                            m.name.toLowerCase().includes(med.name.toLowerCase()) &&
                            !isMedicationSelected(m.name),
                        ).length === 0 && (
                          <p className="px-3 py-2 text-xs text-gray-400">No matching medications found</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Dosage *</Label>
                    <Input placeholder="e.g. 1 tablet, 5ml" value={med.dosage} onChange={(e) => updateMed(med.id, { dosage: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Route *</Label>
                    <select
                      className="flex h-10 w-full rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm text-[#334155] focus:outline-none focus:ring-2 focus:ring-primary/50 dark:border-gray-600 dark:bg-slate-900 dark:text-slate-50"
                      value={med.route}
                      onChange={(e) => updateMed(med.id, { route: e.target.value })}
                    >
                      {ROUTE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Frequency *</Label>
                    <select
                      className="flex h-10 w-full rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm text-[#334155] focus:outline-none focus:ring-2 focus:ring-primary/50 dark:border-gray-600 dark:bg-slate-900 dark:text-slate-50"
                      value={med.frequency}
                      onChange={(e) => updateMed(med.id, { frequency: e.target.value })}
                    >
                      <option value="">Select frequency</option>
                      {FREQUENCY_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Duration *</Label>
                    <select
                      className="flex h-10 w-full rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm text-[#334155] focus:outline-none focus:ring-2 focus:ring-primary/50 dark:border-gray-600 dark:bg-slate-900 dark:text-slate-50"
                      value={med.duration}
                      onChange={(e) => updateMed(med.id, { duration: e.target.value })}
                    >
                      <option value="">Select duration</option>
                      {DURATION_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Quantity *</Label>
                    <Input type="number" min={1} placeholder="e.g. 30" value={med.quantity || ''} onChange={(e) => updateMed(med.id, { quantity: parseInt(e.target.value) || 0 })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Special Instructions</Label>
                    <Input placeholder="e.g. Take after meals" value={med.instructions} onChange={(e) => updateMed(med.id, { instructions: e.target.value })} />
                  </div>
                </div>

                {/* Interaction warnings for this medication */}
                {med.interactions.length > 0 && (
                  <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-3">
                    <p className="text-xs font-medium text-amber-800 dark:text-amber-400 flex items-center gap-1 mb-1">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Drug Interactions Detected
                    </p>
                    <ul className="space-y-0.5">
                      {med.interactions.map((w, i) => (
                        <li key={i} className="text-xs text-amber-700 dark:text-amber-400 flex items-start gap-1">
                          <span className="mt-1 block h-1 w-1 rounded-full bg-amber-500 shrink-0" />
                          {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          <Button type="button" variant="outline" onClick={addMed} className="gap-1.5 w-full">
            <Plus className="h-4 w-4" /> Add Another Medication
          </Button>

          {/* Global Interaction Warnings */}
          {uniqueInteractions.length > 0 && medications.length > 1 && (
            <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/10">
              <CardContent className="p-4">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-400 flex items-center gap-1.5 mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  {uniqueInteractions.length} Drug Interaction{uniqueInteractions.length > 1 ? 's' : ''} Across Medications
                </p>
                <ul className="space-y-1">
                  {uniqueInteractions.map((w, i) => (
                    <li key={i} className="text-xs text-amber-700 dark:text-amber-300 flex items-start gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      {w}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar: Summary & Actions */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-gray-500">Patient:</span>
                <span className="font-medium text-slate-900 dark:text-white">{selectedPatient?.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Pill className="h-4 w-4 text-gray-400" />
                <span className="text-gray-500">Medications:</span>
                <span className="font-medium text-slate-900 dark:text-white">{medications.length}</span>
              </div>
              {uniqueInteractions.length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <span className="text-amber-600 font-medium">{uniqueInteractions.length} interaction(s)</span>
                </div>
              )}

              <div className="space-y-1.5 pt-2 border-t border-gray-100 dark:border-gray-700">
                <Label htmlFor="notes" className="text-xs">Clinical Notes</Label>
                <textarea
                  id="notes"
                  rows={3}
                  className="w-full rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 dark:border-gray-600 dark:bg-slate-900 dark:text-slate-50"
                  placeholder="Optional notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <Button className="w-full gap-1.5" onClick={goToPreview}>
                <FileText className="h-4 w-4" /> Review & Submit
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
