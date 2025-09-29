// ArtSaaS Sign In Page
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ThemeToggle } from '@/components/theme-toggle'
import { Palette, Eye, EyeOff } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { auth } from '@/lib/pocketbase'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Use PocketBase authentication
      const authData = await auth.signIn(email, password)

      toast({
        title: "Welcome back!",
        description: "You've been successfully signed in.",
      })

      // Redirect based on user role
      const userRole = authData.record.role
      switch (userRole) {
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
      console.error('Sign in error:', error)
      toast({
        title: "Sign in failed",
        description: "Please check your credentials and try again.",
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
          <CardTitle>Welcome Back</CardTitle>
          <CardDescription>
            Sign in to your ArtSaaS account to continue supporting artists
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <Link href="/forgot-password" className="text-primary hover:underline">
              Forgot your password?
            </Link>
          </div>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link href="/sign-up" className="text-primary hover:underline">
              Sign up here
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
