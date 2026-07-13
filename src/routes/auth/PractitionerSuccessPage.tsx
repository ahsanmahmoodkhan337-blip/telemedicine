import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { CheckCircle2, Clock, Mail } from 'lucide-react'

export default function PractitionerSuccessPage() {
  return (
    <Card className="w-full max-w-md mx-auto text-center">
      <CardHeader>
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        </div>
        <CardTitle className="text-xl text-[#1e293b] dark:text-white">
          Registration Submitted!
        </CardTitle>
        <CardDescription className="text-sm">
          Your practitioner account is pending verification.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 p-4 text-left text-sm space-y-2">
          <div className="flex items-start gap-2">
            <Clock className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-amber-800 dark:text-amber-300">
              Our team will review your documents and verify your credentials. This typically takes 1-2 business days.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <Mail className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-amber-800 dark:text-amber-300">
              You'll receive an email notification once your account is verified. You can then sign in and start using the platform.
            </p>
          </div>
        </div>

        <p className="text-xs text-gray-500">
          If you have any questions, please contact our support team.
        </p>

        <div className="pt-2 space-y-2">
          <Link to="/auth/sign-in">
            <Button className="w-full">
              Go to Sign In
            </Button>
          </Link>
          <Link to="/">
            <Button variant="outline" className="w-full">
              Back to Home
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}