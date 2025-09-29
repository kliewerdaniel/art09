// ArtSaaS Sign Up Page
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ThemeToggle } from '@/components/theme-toggle'
import { Palette, Eye, EyeOff, CheckCircle, Check, X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { auth } from '@/lib/pocketbase'
import { validatePassword, getPasswordStrength, getPasswordStrengthColor } from '@/lib/utils'

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const router = useRouter()
  const { toast } = useToast()

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateStep1 = () => {
    return formData.firstName && formData.lastName && formData.email && formData.role
  }

  const validateStep2 = () => {
    const passwordValid = validatePassword(formData.password).isValid
    return formData.password && formData.confirmPassword && passwordValid && formData.password === formData.confirmPassword
  }

  const handleNext = () => {
    if (validateStep1()) {
      setCurrentStep(2)
    }
  }

  const handleBack = () => {
    setCurrentStep(1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateStep2()) {
      const passwordValid = validatePassword(formData.password).isValid
      let description = "Please ensure all fields are filled."

      if (!passwordValid) {
        description = "Please create a strong password that meets all requirements."
      } else if (formData.password !== formData.confirmPassword) {
        description = "Passwords do not match. Please check and try again."
      }

      toast({
        title: "Validation Error",
        description,
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Use PocketBase authentication for user creation
      // Note: Custom profile fields are not handled during signup due to schema limitations
      const user = await auth.signUp({
        email: formData.email,
        password: formData.password
      })

      toast({
        title: "Account created!",
        description: "Welcome to ArtSaaS. Please complete your profile to get started.",
      })

      // Redirect based on user role
      switch (formData.role) {
        case 'admin':
          router.push('/dashboard/admin')
          break
        case 'artist':
          router.push('/dashboard/artist')
          break
        case 'volunteer':
          router.push('/dashboard/volunteer')
          break
        default:
          router.push('/dashboard')
      }
    } catch (error) {
      console.error('Sign up error:', error)
      toast({
        title: "Sign up failed",
        description: "Please try again or contact support if the problem persists.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Palette className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">ArtSaaS</span>
          </div>
          <CardTitle>Join ArtSaaS</CardTitle>
          <CardDescription>
            Create your account to start supporting the artistic community
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {currentStep > 1 ? <CheckCircle className="h-4 w-4" /> : '1'}
              </div>
              <div className={`w-8 h-0.5 ${currentStep >= 2 ? 'bg-primary' : 'bg-muted'}`} />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                2
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {currentStep === 1 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">I am a...</Label>
                  <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="artist">Artist</SelectItem>
                      <SelectItem value="volunteer">Volunteer/Mentor</SelectItem>
                      <SelectItem value="guest">Supporter/Donor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="button" onClick={handleNext} className="w-full">
                  Continue
                </Button>
              </>
            )}

            {currentStep === 2 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Password Strength</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${getPasswordStrengthColor(getPasswordStrength(formData.password))} transition-all duration-200`}
                              style={{
                                width: `${(Object.values(validatePassword(formData.password).requirements).filter(Boolean).length / 5) * 100}%`
                              }}
                            />
                          </div>
                          <span className="text-sm capitalize">{getPasswordStrength(formData.password)}</span>
                        </div>
                      </div>

                      {/* Password Requirements */}
                      <div className="space-y-1">
                        {validatePassword(formData.password).messages.map((message, index) => (
                          <div key={index} className="flex items-center space-x-2 text-sm">
                            <X className="h-3 w-3 text-red-500" />
                            <span className="text-muted-foreground">{message}</span>
                          </div>
                        ))}
                        {Object.values(validatePassword(formData.password).requirements).map((isValid, index) => {
                          if (isValid) {
                            const messages = [
                              'At least 8 characters',
                              'One uppercase letter',
                              'One lowercase letter',
                              'One number',
                              'One special character'
                            ]
                            return (
                              <div key={index} className="flex items-center space-x-2 text-sm">
                                <Check className="h-3 w-3 text-green-500" />
                                <span className="text-muted-foreground">{messages[index]}</span>
                              </div>
                            )
                          }
                          return null
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
                    Back
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isLoading}>
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </div>
              </>
            )}
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/sign-in" className="text-primary hover:underline">
              Sign in here
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
