import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { CheckCircle, ArrowRight } from 'lucide-react'

export default function PractitionerSuccessPage() {
  return (
    <Card className="text-center">
      <CardHeader>
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-900/20 mb-4">
          <CheckCircle className="h-8 w-8 text-emerald-500" />
        </div>
        <CardTitle className="text-xl text-[#1e293b] dark:text-white">Registration Submitted!</CardTitle>
        <CardDescription className="text-[#334155] dark:text-gray-400 max-w-sm mx-auto">
          Thank you for registering as a practitioner. Our team will review your credentials and documents.
          You'll receive a confirmation email once your profile is verified.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="rounded-lg bg-primary-50 dark:bg-primary-900/10 p-4 text-left text-sm text-[#334155] dark:text-slate-300">
            <p className="font-medium text-[#1e293b] dark:text-white mb-1">What happens next?</p>
            <ul className="space-y-1 text-xs">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                Our verification team reviews your documents (1-2 business days)
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                You'll receive an email confirmation once verified
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                Log in to set up your profile and start accepting patients
              </li>
            </ul>
          </div>

          <Link to="/auth/sign-in">
            <Button className="w-full gap-2">
              Go to Sign In <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}