import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { EmptyState, LoadingSkeleton } from '@/components/ui/loading-states'
import { Search, MapPin, Star, DollarSign, Languages, Stethoscope } from 'lucide-react'
import { BookAppointmentButton } from './BookAppointment'

const mockProviders = [
  { id: '1', name: 'Dr. Sarah Ahmed', specialty: 'Cardiologist', city: 'Karachi', fee: 1500, rating: 4.8, language: ['English', 'Urdu'], verified: true },
  { id: '2', name: 'Dr. Imran Ali', specialty: 'Physiotherapist', city: 'Lahore', fee: 1200, rating: 4.6, language: ['Urdu', 'Punjabi'], verified: true },
  { id: '3', name: 'Dr. Fatima Khan', specialty: 'Nutritionist', city: 'Islamabad', fee: 1000, rating: 4.9, language: ['English', 'Urdu'], verified: true },
  { id: '4', name: 'Dr. Usman Malik', specialty: 'General Physician', city: 'Karachi', fee: 800, rating: 4.5, language: ['English', 'Urdu', 'Sindhi'], verified: true },
  { id: '5', name: 'Dr. Ayesha Rizvi', specialty: 'Dermatologist', city: 'Lahore', fee: 2000, rating: 4.7, language: ['English', 'Urdu'], verified: false },
  { id: '6', name: 'Dr. Hassan Shah', specialty: 'Cardiologist', city: 'Lahore', fee: 1800, rating: 4.3, language: ['Urdu', 'Punjabi'], verified: true },
]

const specialties = ['All', 'Cardiologist', 'Physiotherapist', 'Nutritionist', 'General Physician', 'Dermatologist']
const cities = ['All', 'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi']

export default function PatientSearch() {
  const [search, setSearch] = useState('')
  const [specialty, setSpecialty] = useState('All')
  const [city, setCity] = useState('All')
  const [maxFee, setMaxFee] = useState('')
  const [loading] = useState(false)

  const filtered = mockProviders.filter((p) => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
    if (specialty !== 'All' && p.specialty !== specialty) return false
    if (city !== 'All' && p.city !== city) return false
    if (maxFee && p.fee > parseInt(maxFee)) return false
    return true
  })

  if (loading) return <LoadingSkeleton title="Find a Doctor" />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Find a Provider</h1>
        <p className="text-gray-500 mt-1">Search for doctors, physiotherapists, nutritionists, and more</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by name..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={specialty} onValueChange={setSpecialty}>
              <SelectTrigger>
                <SelectValue placeholder="Specialty" />
              </SelectTrigger>
              <SelectContent>
                {specialties.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={city} onValueChange={setCity}>
              <SelectTrigger>
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent>
                {cities.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Max fee (Rs)"
              type="number"
              value={maxFee}
              onChange={(e) => setMaxFee(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No providers found"
          description="Try adjusting your search filters to find more results."
          icon={<Search className="h-12 w-12" />}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((provider) => (
            <Card key={provider.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-accent text-white text-sm">
                      {provider.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900 dark:text-white truncate">{provider.name}</h3>
                      {provider.verified && <Badge variant="success" className="text-[10px]">Verified</Badge>}
                    </div>
                    <div className="mt-1 space-y-1">
                      <p className="flex items-center gap-1 text-sm text-gray-500">
                        <Stethoscope className="h-3.5 w-3.5" />
                        {provider.specialty}
                      </p>
                      <p className="flex items-center gap-1 text-sm text-gray-500">
                        <MapPin className="h-3.5 w-3.5" />
                        {provider.city}
                      </p>
                      <p className="flex items-center gap-1 text-sm text-gray-500">
                        <DollarSign className="h-3.5 w-3.5" />
                        Rs. {provider.fee.toLocaleString()}
                      </p>
                      <p className="flex items-center gap-1 text-sm text-gray-500">
                        <Star className="h-3.5 w-3.5 text-amber-400" />
                        {provider.rating}
                      </p>
                      <p className="flex items-center gap-1 text-sm text-gray-500">
                        <Languages className="h-3.5 w-3.5" />
                        {provider.language.join(', ')}
                      </p>
                    </div>
                    <BookAppointmentButton doctorId={provider.id} onBook={() => {}} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}