// Donation System - Support Artists Financially
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { auth, donations, artists, User } from '@/lib/pocketbase'
import {
  Heart,
  ArrowLeft,
  CreditCard,
  DollarSign,
  Calendar,
  Users,
  Star,
  Gift,
  Shield,
  CheckCircle,
  Loader2
} from 'lucide-react'

interface DonationFormData {
  artist: string
  amount: number
  currency: 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD'
  donation_type: 'one_time' | 'monthly' | 'artwork_purchase'
  message: string
  is_anonymous: boolean
  payment_method: 'card' | 'bank_transfer' | 'paypal' | 'other'
}

const CURRENCIES = [
  { value: 'USD', label: 'US Dollar ($)', symbol: '$' },
  { value: 'EUR', label: 'Euro (€)', symbol: '€' },
  { value: 'GBP', label: 'British Pound (£)', symbol: '£' },
  { value: 'CAD', label: 'Canadian Dollar (C$)', symbol: 'C$' },
  { value: 'AUD', label: 'Australian Dollar (A$)', symbol: 'A$' }
]

const DONATION_PRESETS = [10, 25, 50, 100, 250, 500]

export default function DonatePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedArtist, setSelectedArtist] = useState<any>(null)
  const [availableArtists, setAvailableArtists] = useState<any[]>([])
  const [step, setStep] = useState(1)

  const [formData, setFormData] = useState<DonationFormData>({
    artist: '',
    amount: 25,
    currency: 'USD',
    donation_type: 'one_time',
    message: '',
    is_anonymous: false,
    payment_method: 'card'
  })

  useEffect(() => {
    checkAuthAndLoadArtists()
  }, [])

  const checkAuthAndLoadArtists = async () => {
    if (!auth.isAuthenticated) {
      router.push('/sign-in')
      return
    }

    const currentUser = auth.currentUser
    if (!currentUser) {
      router.push('/sign-in')
      return
    }

    setUser(currentUser)

    // Check if specific artist is requested via URL params
    const artistId = searchParams.get('artist')
    if (artistId) {
      try {
        const artist = await artists.getById(artistId)
        setSelectedArtist(artist)
        setFormData(prev => ({ ...prev, artist: artistId }))
      } catch (error) {
        console.error('Error loading artist:', error)
      }
    }

    await loadAvailableArtists()
  }

  const loadAvailableArtists = async () => {
    try {
      const artistsData = await artists.getAll()
      setAvailableArtists(artistsData.items)
    } catch (error) {
      console.error('Error loading artists:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof DonationFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateDonation = () => {
    if (!formData.artist) {
      toast({
        title: "Artist Required",
        description: "Please select an artist to support.",
        variant: "destructive",
      })
      return false
    }

    if (!formData.amount || formData.amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid donation amount.",
        variant: "destructive",
      })
      return false
    }

    if (formData.amount < 1) {
      toast({
        title: "Minimum Amount",
        description: "Minimum donation amount is $1.",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validateDonation()) return

    setIsProcessing(true)
    try {
      // Calculate platform fee (5%)
      const platformFee = formData.amount * 0.05
      const netAmount = formData.amount - platformFee

      const donationData = {
        donor: user!.id,
        artist: formData.artist,
        amount: formData.amount,
        currency: formData.currency,
        donation_type: formData.donation_type,
        message: formData.message,
        is_anonymous: formData.is_anonymous,
        payment_method: formData.payment_method,
        platform_fee: platformFee,
        net_amount: netAmount,
        status: 'pending',
        is_recurring: formData.donation_type === 'monthly'
      }

      // TODO: Integrate with Stripe for actual payment processing
      // For now, we'll simulate the donation creation
      await donations.create(donationData)

      toast({
        title: "Donation Successful!",
        description: `Thank you for supporting ${selectedArtist?.user?.first_name}! Your donation of ${CURRENCIES.find(c => c.value === formData.currency)?.symbol}${formData.amount} has been processed.`,
      })

      // Redirect to success page or back to artist profile
      router.push('/dashboard')
    } catch (error) {
      console.error('Error processing donation:', error)
      toast({
        title: "Donation Failed",
        description: "Failed to process donation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const selectedCurrency = CURRENCIES.find(c => c.value === formData.currency)

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading donation page...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Support Artists</h1>
          <p className="text-muted-foreground">
            Make a donation to support creative communities and artists
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Donation Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Artist Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Choose an Artist to Support
              </CardTitle>
              <CardDescription>
                Select an artist whose work inspires you
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedArtist ? (
                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">
                      {selectedArtist.user?.first_name} {selectedArtist.user?.last_name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedArtist.artistic_mediums?.join(', ')} • {selectedArtist.experience_level}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedArtist.portfolio_views || 0} portfolio views
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedArtist(null)
                      setFormData(prev => ({ ...prev, artist: '' }))
                    }}
                  >
                    Change
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableArtists.slice(0, 6).map((artist) => (
                    <Card
                      key={artist.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => {
                        setSelectedArtist(artist)
                        setFormData(prev => ({ ...prev, artist: artist.id }))
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">
                              {artist.user?.first_name} {artist.user?.last_name}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {artist.artistic_mediums?.join(', ')}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="h-3 w-3 text-yellow-500" />
                              <span className="text-xs text-muted-foreground">
                                {artist.experience_level}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Donation Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Donation Details
              </CardTitle>
              <CardDescription>
                Choose your donation amount and frequency
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Donation Type */}
              <div className="space-y-3">
                <Label>Donation Type</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Card
                    className={`cursor-pointer transition-all ${
                      formData.donation_type === 'one_time' ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => handleInputChange('donation_type', 'one_time')}
                  >
                    <CardContent className="p-4 text-center">
                      <Gift className="h-8 w-8 text-primary mx-auto mb-2" />
                      <h3 className="font-medium">One-time</h3>
                      <p className="text-sm text-muted-foreground">Single donation</p>
                    </CardContent>
                  </Card>

                  <Card
                    className={`cursor-pointer transition-all ${
                      formData.donation_type === 'monthly' ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => handleInputChange('donation_type', 'monthly')}
                  >
                    <CardContent className="p-4 text-center">
                      <Calendar className="h-8 w-8 text-primary mx-auto mb-2" />
                      <h3 className="font-medium">Monthly</h3>
                      <p className="text-sm text-muted-foreground">Recurring support</p>
                    </CardContent>
                  </Card>

                  <Card
                    className={`cursor-pointer transition-all ${
                      formData.donation_type === 'artwork_purchase' ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => handleInputChange('donation_type', 'artwork_purchase')}
                  >
                    <CardContent className="p-4 text-center">
                      <Heart className="h-8 w-8 text-primary mx-auto mb-2" />
                      <h3 className="font-medium">Artwork Purchase</h3>
                      <p className="text-sm text-muted-foreground">Buy artwork</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Amount Selection */}
              <div className="space-y-3">
                <Label>Donation Amount</Label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-4">
                  {DONATION_PRESETS.map((preset) => (
                    <Button
                      key={preset}
                      variant={formData.amount === preset ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleInputChange('amount', preset)}
                    >
                      {selectedCurrency?.symbol}{preset}
                    </Button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-3 text-muted-foreground">
                      {selectedCurrency?.symbol}
                    </span>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                      className="pl-8"
                    />
                  </div>
                  <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((currency) => (
                        <SelectItem key={currency.value} value={currency.value}>
                          {currency.value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Personal Message */}
              <div className="space-y-3">
                <Label htmlFor="message">Personal Message (Optional)</Label>
                <Textarea
                  id="message"
                  placeholder="Share why you're supporting this artist or add a note of encouragement..."
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  rows={3}
                />
              </div>

              {/* Privacy Options */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="anonymous"
                    checked={formData.is_anonymous}
                    onCheckedChange={(checked) => handleInputChange('is_anonymous', checked)}
                  />
                  <Label htmlFor="anonymous" className="text-sm font-normal">
                    Make this donation anonymous
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Information
              </CardTitle>
              <CardDescription>
                Secure payment processing powered by Stripe
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Secure Payment</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your payment information is encrypted and secure. We never store your card details.
                </p>
              </div>

              <div className="space-y-3">
                <Label>Payment Method</Label>
                <Select value={formData.payment_method} onValueChange={(value) => handleInputChange('payment_method', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="card">Credit/Debit Card</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Mock Payment Form - In real implementation, this would be Stripe Elements */}
              <div className="space-y-4 p-4 border rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="card_number">Card Number</Label>
                    <Input id="card_number" placeholder="1234 5678 9012 3456" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input id="expiry" placeholder="MM/YY" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input id="cvv" placeholder="123" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Cardholder Name</Label>
                    <Input id="name" placeholder="John Doe" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Donation Summary */}
        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Donation Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedArtist && (
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">
                      {selectedArtist.user?.first_name} {selectedArtist.user?.last_name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedArtist.artistic_mediums?.join(', ')}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Donation Amount:</span>
                  <span className="font-medium">
                    {selectedCurrency?.symbol}{formData.amount}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platform Fee (5%):</span>
                  <span className="font-medium text-muted-foreground">
                    {selectedCurrency?.symbol}{(formData.amount * 0.05).toFixed(2)}
                  </span>
                </div>

                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Artist Receives:</span>
                    <span className="font-bold text-primary">
                      {selectedCurrency?.symbol}{(formData.amount * 0.95).toFixed(2)}
                    </span>
                  </div>
                </div>

                {formData.donation_type === 'monthly' && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      This will be a recurring monthly donation
                    </p>
                  </div>
                )}
              </div>

              <Button
                onClick={handleSubmit}
                disabled={isProcessing || !formData.artist}
                className="w-full"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Heart className="h-4 w-4 mr-2" />
                    Complete Donation
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                By donating, you agree to our terms of service. Donations are processed securely and are non-refundable.
              </p>
            </CardContent>
          </Card>

          {/* Impact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Impact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Support creative communities</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Help artists sustain their practice</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm">Enable mentorship opportunities</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-sm">Build lasting artistic relationships</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
