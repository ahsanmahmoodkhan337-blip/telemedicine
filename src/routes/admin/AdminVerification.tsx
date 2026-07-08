import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EmptyState, LoadingSkeleton } from '@/components/ui/loading-states'
import { Shield, CheckCircle, XCircle, Stethoscope, User, MapPin, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

interface VerificationRequest {
  id: string
  name: string
  role: string
  email: string
  city: string
  specialty: string
  licenseNumber: string
  submittedAt: string
  status: 'pending' | 'approved' | 'rejected'
}

const mockRequests: VerificationRequest[] = [
  {
    id: '1',
    name: 'Dr. Sarah Ahmed',
    role: 'doctor',
    email: 'sarah.ahmed@clinic.com',
    city: 'Karachi',
    specialty: 'Cardiology',
    licenseNumber: 'PMC-2024-12345',
    submittedAt: '2026-07-08',
    status: 'pending',
  },
  {
    id: '2',
    name: 'Ali Raza',
    role: 'physiotherapist',
    email: 'ali.raza@ptclinic.com',
    city: 'Lahore',
    specialty: 'Sports Physiotherapy',
    licenseNumber: 'PTC-2024-67890',
    submittedAt: '2026-07-07',
    status: 'pending',
  },
  {
    id: '3',
    name: 'Fatima Zafar',
    role: 'nutritionist',
    email: 'fatima@nutrihub.com',
    city: 'Islamabad',
    specialty: 'Clinical Nutrition',
    licenseNumber: 'NTC-2024-11111',
    submittedAt: '2026-07-06',
    status: 'approved',
  },
  {
    id: '4',
    name: 'Usman Malik',
    role: 'doctor',
    email: 'usman.malik@hospital.pk',
    city: 'Rawalpindi',
    specialty: 'Dermatology',
    licenseNumber: 'PMC-2024-22222',
    submittedAt: '2026-07-05',
    status: 'rejected',
  },
]

export default function AdminVerification() {
  const [requests, setRequests] = useState<VerificationRequest[]>(mockRequests)
  const [search, setSearch] = useState('')
  const [loading] = useState(false)

  const handleApprove = (id: string) => {
    setRequests(prev =>
      prev.map(r => r.id === id ? { ...r, status: 'approved' as const } : r)
    )
    toast.success('Practitioner verified successfully')
  }

  const handleReject = (id: string) => {
    setRequests(prev =>
      prev.map(r => r.id === id ? { ...r, status: 'rejected' as const } : r)
    )
    toast.success('Practitioner verification rejected')
  }

  if (loading) return <LoadingSkeleton title="Admin Verification Console" />

  const filtered = requests.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.email.toLowerCase().includes(search.toLowerCase()) ||
    r.licenseNumber.toLowerCase().includes(search.toLowerCase())
  )

  const pending = filtered.filter(r => r.status === 'pending')
  const reviewed = filtered.filter(r => r.status !== 'pending')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Verification Console</h1>
        <p className="text-gray-500 mt-1">Review and verify practitioner credentials</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search by name, email, or license..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Badge variant="warning" className="text-sm px-3 py-1">
          {pending.length} Pending
        </Badge>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="reviewed">Reviewed ({reviewed.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {pending.length === 0 ? (
            <EmptyState
              title="All clear!"
              description="No pending verification requests."
              icon={<Shield className="h-12 w-12" />}
            />
          ) : (
            <div className="grid gap-4">
              {pending.map((req) => (
                <Card key={req.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-accent text-white text-sm">
                          {req.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-slate-900 dark:text-white">{req.name}</h3>
                          <Badge variant="outline" className="text-xs capitalize">{req.role}</Badge>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                          <p className="text-gray-500"><span className="font-medium text-slate-700 dark:text-slate-300">Email:</span> {req.email}</p>
                          <p className="text-gray-500"><span className="font-medium text-slate-700 dark:text-slate-300">City:</span> {req.city}</p>
                          <p className="text-gray-500"><span className="font-medium text-slate-700 dark:text-slate-300">Specialty:</span> {req.specialty}</p>
                          <p className="text-gray-500"><span className="font-medium text-slate-700 dark:text-slate-300">License:</span> {req.licenseNumber}</p>
                          <p className="text-gray-500"><span className="font-medium text-slate-700 dark:text-slate-300">Submitted:</span> {req.submittedAt}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                          onClick={() => handleReject(req.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" /> Reject
                        </Button>
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700"
                          onClick={() => handleApprove(req.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" /> Approve
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reviewed">
          {reviewed.length === 0 ? (
            <EmptyState title="No reviewed requests" description="No practitioners have been reviewed yet." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Specialty</TableHead>
                  <TableHead>License</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviewed.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="font-medium">{req.name}</TableCell>
                    <TableCell className="capitalize">{req.role}</TableCell>
                    <TableCell>{req.specialty}</TableCell>
                    <TableCell className="text-xs">{req.licenseNumber}</TableCell>
                    <TableCell>{req.submittedAt}</TableCell>
                    <TableCell>
                      <Badge variant={req.status === 'approved' ? 'success' : 'destructive'}>
                        {req.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}