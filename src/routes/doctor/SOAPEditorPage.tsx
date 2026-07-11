import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Search, AlertTriangle, Shield, Lock, User, ClipboardList, Stethoscope, FlaskConical, Truck } from 'lucide-react'
import { toast } from 'sonner'
import { CheckoutPaymentFlow } from '@/components/payments/CheckoutFlow'
import { diagnosticsController, TEST_PANELS, LAB_NAMES } from '@/lib/integrations'
import type { LabPartner } from '@/lib/integrations'

interface ICD10Code {
  code: string
  description: string
}

const mockICD10: ICD10Code[] = [
  { code: 'I10', description: 'Essential (primary) hypertension' },
  { code: 'E11', description: 'Type 2 diabetes mellitus' },
  { code: 'M54.5', description: 'Low back pain' },
  { code: 'J06.9', description: 'Acute upper respiratory infection' },
  { code: 'F41.9', description: 'Anxiety disorder, unspecified' },
]

const restrictedMeds = ['Morphine', 'Oxycodone', 'Fentanyl', 'Diazepam', 'Midazolam']

export default function SOAPEditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [subjective, setSubjective] = useState('Patient reports persistent headache for the past week, rated 6/10 pain scale. No visual disturbances.')
  const [objective, setObjective] = useState('BP: 135/85, HR: 78, Temp: 36.8°C\nAlert and oriented. Pupils reactive.')
  const [assessment, setAssessment] = useState('Essential hypertension (I10)\nTension-type headache')
  const [plan, setPlan] = useState('1. Start Amlodipine 5mg daily\n2. Follow-up in 2 weeks\n3. Monitor BP daily')
  const [icdSearch, setIcdSearch] = useState('')
  const [restrictedDrug, setRestrictedDrug] = useState('')
  const [showConsent, setShowConsent] = useState(false)
  const [consentSigned, setConsentSigned] = useState(false)
  const [locked, setLocked] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selectedLab, setSelectedLab] = useState<LabPartner>('chughtai')
  const [selectedTests, setSelectedTests] = useState<string[]>([])
  const [labOrderRef, setLabOrderRef] = useState<string | null>(null)
  const [dispatchingLab, setDispatchingLab] = useState(false)

  const filteredICD = mockICD10.filter(c =>
    c.code.includes(icdSearch) || c.description.toLowerCase().includes(icdSearch.toLowerCase())
  )

  const handleCheckRestricted = () => {
    const drug = restrictedDrug.trim()
    if (restrictedMeds.some(m => m.toLowerCase() === drug.toLowerCase())) {
      setShowConsent(true)
    } else {
      toast.success(`${drug} is not restricted`)
    }
  }

  const handleSignConsent = () => {
    setConsentSigned(true)
    setShowConsent(false)
    toast.success('Digital consent recorded')
  }

  const handleSave = () => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      toast.success('SOAP note saved')
    }, 600)
  }

  const handleLock = () => {
    setLocked(true)
    toast.success('SOAP note locked and signed')
  }

  const handleSendLabOrder = async () => {
    if (selectedTests.length === 0) { toast.error('Select at least one test'); return }
    setDispatchingLab(true)
    const tests = TEST_PANELS[selectedLab].filter(t => selectedTests.includes(t.code))
    const response = await diagnosticsController.placeOrder(selectedLab, {
      id: `LAB-${Date.now()}`,
      labPartner: selectedLab,
      patientId: 'patient-001', patientName: 'Ahmed Raza',
      patientPhone: '0300-1234567', patientAge: 35, patientGender: 'Male',
      doctorId: 'doctor-001', doctorName: 'Dr. Sarah Ahmed',
      tests: tests.map(t => ({ code: t.code, name: t.name })),
      priority: 'routine', collectionType: 'home',
      collectionAddress: 'House 12, Street 5, Gulshan-e-Maymar, Karachi',
      collectionDate: new Date().toISOString().split('T')[0],
      collectionTime: '09:00',
    })
    setDispatchingLab(false)
    if (response.success) {
      setLabOrderRef(response.labReference)
      toast.success(response.message)
    } else {
      toast.error(response.message)
    }
  }

  const toggleTest = (code: string) => {
    setSelectedTests(prev => prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code])
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">SOAP Note</h1>
          <p className="text-gray-500 mt-1">Appointment #{id} — Ahmed Raza, 35 yrs</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-sm text-gray-500">
            <Shield className="h-4 w-4 text-accent" />
            {locked ? 'Locked' : 'Editing'}
          </span>
          {locked && <Badge variant="success">Signed</Badge>}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* SOAP Editor */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subjective</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={subjective}
                onChange={(e) => setSubjective(e.target.value)}
                rows={4}
                disabled={locked}
                placeholder="Patient's reported symptoms and history..."
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Objective</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                rows={4}
                disabled={locked}
                placeholder="Vitals, exam findings, lab results..."
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Assessment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={assessment}
                onChange={(e) => setAssessment(e.target.value)}
                rows={3}
                disabled={locked}
                placeholder="Diagnosis and assessment..."
              />
              {/* ICD-10 Search */}
              <div>
                <Label>ICD-10 Code Search</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search by code or description..."
                    className="pl-9"
                    value={icdSearch}
                    onChange={(e) => setIcdSearch(e.target.value)}
                  />
                </div>
                {icdSearch && (
                  <div className="mt-2 max-h-32 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                    {filteredICD.map((c) => (
                      <button
                        key={c.code}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-slate-800 border-b border-gray-100 dark:border-gray-700 last:border-0"
                        onClick={() => {
                          setAssessment(prev => prev + `\n${c.code} - ${c.description}`)
                          setIcdSearch('')
                        }}
                      >
                        <span className="font-medium text-accent">{c.code}</span>{' '}
                        <span className="text-gray-600 dark:text-gray-400">{c.description}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                rows={3}
                disabled={locked}
                placeholder="Treatment plan, medications, follow-up..."
              />

              {/* Restricted Medication Safeguard */}
              <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-400">Restricted Medication Check</p>
                    <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
                      Verify if a medication is restricted before prescribing
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        placeholder="Enter drug name..."
                        value={restrictedDrug}
                        onChange={(e) => setRestrictedDrug(e.target.value)}
                        className="max-w-xs text-sm"
                      />
                      <Button size="sm" variant="outline" onClick={handleCheckRestricted}>
                        <Search className="h-3.5 w-3.5 mr-1" /> Check
                      </Button>
                    </div>
                    {consentSigned && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600">
                        <Shield className="h-3.5 w-3.5" />
                        Digital consent recorded & signed
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center gap-3">
            <Button onClick={handleSave} disabled={saving || locked}>
              {saving ? 'Saving...' : 'Save Draft'}
            </Button>
            {!locked && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="secondary" disabled={locked}>
                    <Lock className="h-4 w-4 mr-1" /> Review, Sign & Lock
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Sign & Lock SOAP Note</DialogTitle>
                    <DialogDescription>
                      This will lock the SOAP note and digitally sign it. No further edits can be made.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="rounded-lg bg-gray-50 dark:bg-slate-800 p-4 text-sm">
                      <p className="font-medium">Dr. Ahmed Khan</p>
                      <p className="text-gray-500">License: PMC-12345</p>
                      <p className="text-gray-500 mt-2 text-xs">
                        By signing, I confirm the above notes are accurate and complete.
                      </p>
                    </div>
                    <Input placeholder="Type your full name to sign..." />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => {}}>Cancel</Button>
                    <Button onClick={handleLock}>
                      <Lock className="h-4 w-4 mr-1" /> Sign & Lock
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Patient Summary Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Patient Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-accent text-white">AR</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">Ahmed Raza</p>
                  <p className="text-sm text-gray-500">35 yrs · Male</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">BP:</span>
                  <span className="font-medium text-amber-600">135/85</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">HR:</span>
                  <span className="font-medium">78 bpm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Temp:</span>
                  <span className="font-medium">36.8°C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Allergies:</span>
                  <span className="font-medium text-red-600">Penicillin</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Vitals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-500">Jul 08</span>
                <span>121/81 · 72kg · 98 mg/dL</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-500">Jul 07</span>
                <span>118/78 · 72.5kg · 102 mg/dL</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Jul 06</span>
                <span>135/90 · 73kg · 115 mg/dL</span>
              </div>
            </CardContent>
          </Card>

          {/* Lab Ordering */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <FlaskConical className="h-4 w-4 text-accent" />
                Lab Orders
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-1">
                {(['chughtai', 'zeenat'] as LabPartner[]).map(lab => (
                  <Button key={lab} size="sm" variant={selectedLab === lab ? 'accent' : 'outline'}
                    onClick={() => { setSelectedLab(lab); setSelectedTests([]); setLabOrderRef(null) }}>
                    {LAB_NAMES[lab]}
                  </Button>
                ))}
              </div>
              <div className="space-y-1 max-h-40 overflow-auto">
                {TEST_PANELS[selectedLab].map(test => (
                  <label key={test.code} className="flex items-center gap-2 rounded px-2 py-1 text-xs hover:bg-primary-50 cursor-pointer">
                    <input type="checkbox" checked={selectedTests.includes(test.code)}
                      onChange={() => toggleTest(test.code)} className="accent-accent-600" />
                    <span className="flex-1">{test.name}</span>
                    <span className="text-primary-400">Rs.{test.price}</span>
                  </label>
                ))}
              </div>
              {labOrderRef && (
                <div className="rounded bg-accent-50 p-2 text-xs text-accent-700">
                  Order placed: {labOrderRef}
                </div>
              )}
              <Button size="sm" className="w-full" variant="accent"
                onClick={handleSendLabOrder} disabled={dispatchingLab || selectedTests.length === 0}>
                {dispatchingLab ? 'Sending...' : <><Truck className="h-3.5 w-3.5 mr-1" /> Send to Lab</>}
              </Button>
            </CardContent>
          </Card>

          <CheckoutPaymentFlow
            patientId="patient-001"
            practitionerId="doctor-001"
            appointmentId={appointmentId}
            showConversion={true}
            defaultAmount="1500"
          />

          <Button variant="outline" className="w-full" onClick={() => navigate('/doctor/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}