// Artist Profile Creation and Management
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { auth, artists, User } from '@/lib/pocketbase'
import {
  Palette,
  Save,
  ArrowLeft,
  Upload,
  MapPin,
  Globe,
  Instagram,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface ArtistProfile {
  user: string
  artistic_mediums: string[]
  experience_level: 'beginner' | 'intermediate' | 'advanced' | 'professional'
  portfolio_website?: string
  instagram_handle?: string
  artistic_statement?: string
  skills?: string
  availability_for_mentorship: boolean
  preferred_mentorship_type?: 'in_person' | 'virtual' | 'both'
  languages_spoken?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  special_needs?: string
}

const ARTISTIC_MEDIUMS = [
  'Painting', 'Drawing', 'Sculpture', 'Digital Art', 'Photography',
  'Printmaking', 'Ceramics', 'Textiles', 'Mixed Media', 'Installation',
  'Performance', 'Video Art', 'Street Art', 'Illustration', 'Graphic Design'
]

const EXPERIENCE_LEVELS = [
  { value: 'beginner', label: 'Beginner (0-2 years)' },
  { value: 'intermediate', label: 'Intermediate (2-5 years)' },
  { value: 'advanced', label: 'Advanced (5-10 years)' },
  { value: 'professional', label: 'Professional (10+ years)' }
]

const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese',
  'Chinese', 'Japanese', 'Korean', 'Arabic', 'Hindi', 'Other'
]

export default function ArtistProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [profileExists, setProfileExists] = useState(false)

  const [profile, setProfile] = useState<ArtistProfile>({
    user: '',
    artistic_mediums: [],
    experience_level: 'beginner',
    availability_for_mentorship: false,
    preferred_mentorship_type: 'virtual'
  })

  useEffect(() => {
    checkAuthAndLoadProfile()
  }, [])

  const checkAuthAndLoadProfile = async () => {
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

    try {
      // Check if artist profile already exists
      const existingProfiles = await artists.getAll()
      const existingProfile = existingProfiles.items.find(p => p.user === currentUser.id)

      if (existingProfile) {
        setProfile({
          user: existingProfile.user,
          artistic_mediums: existingProfile.artistic_mediums || [],
          experience_level: existingProfile.experience_level || 'beginner',
          portfolio_website: existingProfile.portfolio_website || '',
          instagram_handle: existingProfile.instagram_handle || '',
          artistic_statement: existingProfile.artistic_statement || '',
          skills: existingProfile.skills || '',
          availability_for_mentorship: existingProfile.availability_for_mentorship || false,
          preferred_mentorship_type: existingProfile.preferred_mentorship_type || 'virtual',
          languages_spoken: existingProfile.languages_spoken || '',
          emergency_contact_name: existingProfile.emergency_contact_name || '',
          emergency_contact_phone: existingProfile.emergency_contact_phone || '',
          special_needs: existingProfile.special_needs || ''
        })
        setProfileExists(true)
      } else {
        // Initialize with user ID
        setProfile(prev => ({ ...prev, user: currentUser.id }))
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      toast({
        title: "Error",
        description: "Failed to load profile data.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof ArtistProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }))
  }

  const handleMediumToggle = (medium: string) => {
    setProfile(prev => ({
      ...prev,
      artistic_mediums: prev.artistic_mediums.includes(medium)
        ? prev.artistic_mediums.filter(m => m !== medium)
        : [...prev.artistic_mediums, medium]
    }))
  }

  const validateProfile = () => {
    if (profile.artistic_mediums.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one artistic medium.",
        variant: "destructive",
      })
      return false
    }

    if (!profile.experience_level) {
      toast({
        title: "Validation Error",
        description: "Please select your experience level.",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const handleSave = async () => {
    if (!validateProfile()) return

    setIsSaving(true)
    try {
      if (profileExists) {
        // Update existing profile
        await artists.update(user!.id, profile)
        toast({
          title: "Profile Updated",
          description: "Your artist profile has been successfully updated.",
        })
      } else {
        // Create new profile
        await artists.create(profile)
        toast({
          title: "Profile Created",
          description: "Your artist profile has been successfully created!",
        })
        setProfileExists(true)
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      toast({
        title: "Save Failed",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
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
          <h1 className="text-3xl font-bold">Artist Profile</h1>
          <p className="text-muted-foreground">
            {profileExists ? 'Update your artist profile' : 'Create your artist profile'}
          </p>
        </div>
      </div>

      <div className="grid gap-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Tell us about your artistic background and experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Artistic Mediums */}
            <div className="space-y-3">
              <Label>Artistic Mediums *</Label>
              <p className="text-sm text-muted-foreground">
                Select all that apply to your artistic practice
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {ARTISTIC_MEDIUMS.map((medium) => (
                  <div key={medium} className="flex items-center space-x-2">
                    <Checkbox
                      id={medium}
                      checked={profile.artistic_mediums.includes(medium)}
                      onCheckedChange={() => handleMediumToggle(medium)}
                    />
                    <Label htmlFor={medium} className="text-sm font-normal">
                      {medium}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Experience Level */}
            <div className="space-y-3">
              <Label>Experience Level *</Label>
              <Select
                value={profile.experience_level}
                onValueChange={(value) => handleInputChange('experience_level', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your experience level" />
                </SelectTrigger>
                <SelectContent>
                  {EXPERIENCE_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Artistic Statement */}
            <div className="space-y-3">
              <Label htmlFor="statement">Artistic Statement</Label>
              <p className="text-sm text-muted-foreground">
                Share your artistic vision, influences, and what drives your creative work
              </p>
              <Textarea
                id="statement"
                placeholder="Describe your artistic journey, influences, and creative vision..."
                value={profile.artistic_statement || ''}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('artistic_statement', e.target.value)}
                rows={4}
              />
            </div>

            {/* Skills */}
            <div className="space-y-3">
              <Label htmlFor="skills">Skills & Techniques</Label>
              <p className="text-sm text-muted-foreground">
                List specific skills, techniques, or tools you work with
              </p>
              <Textarea
                id="skills"
                placeholder="e.g., Oil painting, Watercolor, Adobe Creative Suite, Welding, etc."
                value={profile.skills || ''}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('skills', e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Online Presence */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Online Presence
            </CardTitle>
            <CardDescription>
              Share your portfolio and social media links
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="portfolio">Portfolio Website</Label>
                <Input
                  id="portfolio"
                  type="url"
                  placeholder="https://yourportfolio.com"
                  value={profile.portfolio_website || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('portfolio_website', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram Handle</Label>
                <div className="relative">
                  <Instagram className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="instagram"
                    placeholder="@yourhandle"
                    className="pl-10"
                    value={profile.instagram_handle || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('instagram_handle', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mentorship Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Mentorship Availability
            </CardTitle>
            <CardDescription>
              Indicate if you're available to mentor other artists
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="mentorship"
                checked={profile.availability_for_mentorship}
                onCheckedChange={(checked: boolean) =>
                  handleInputChange('availability_for_mentorship', checked)
                }
              />
              <Label htmlFor="mentorship" className="text-sm font-normal">
                I am available to mentor other artists
              </Label>
            </div>

            {profile.availability_for_mentorship && (
              <>
                <Separator />
                <div className="space-y-4">
                  <div className="space-y-3">
                    <Label>Preferred Mentorship Type</Label>
                    <Select
                      value={profile.preferred_mentorship_type}
                      onValueChange={(value) => handleInputChange('preferred_mentorship_type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="virtual">Virtual Only</SelectItem>
                        <SelectItem value="in_person">In-Person Only</SelectItem>
                        <SelectItem value="both">Both Virtual and In-Person</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label>Languages Spoken</Label>
                    <p className="text-sm text-muted-foreground">
                      Select all languages you speak fluently
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {LANGUAGES.map((language) => (
                        <div key={language} className="flex items-center space-x-2">
                          <Checkbox
                            id={language}
                            checked={profile.languages_spoken?.includes(language) || false}
                            onCheckedChange={(checked: boolean) => {
                              const current = profile.languages_spoken || ''
                              const languages = current.split(',').filter(l => l.trim())
                              if (checked) {
                                languages.push(language)
                              } else {
                                languages.splice(languages.indexOf(language), 1)
                              }
                              handleInputChange('languages_spoken', languages.join(', '))
                            }}
                          />
                          <Label htmlFor={language} className="text-sm font-normal">
                            {language}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Emergency Contact & Special Needs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Additional Information
            </CardTitle>
            <CardDescription>
              Optional information for safety and accessibility
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergency_name">Emergency Contact Name</Label>
                <Input
                  id="emergency_name"
                  placeholder="Contact person's full name"
                  value={profile.emergency_contact_name || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('emergency_contact_name', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergency_phone">Emergency Contact Phone</Label>
                <Input
                  id="emergency_phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={profile.emergency_contact_phone || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('emergency_contact_phone', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="special_needs">Special Needs or Accommodations</Label>
              <p className="text-sm text-muted-foreground">
                Please share any accessibility needs or accommodations that would be helpful
              </p>
              <Textarea
                id="special_needs"
                placeholder="e.g., wheelchair accessibility, quiet spaces, visual impairments, etc."
                value={profile.special_needs || ''}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('special_needs', e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : profileExists ? 'Update Profile' : 'Create Profile'}
          </Button>
        </div>
      </div>
    </div>
  )
}
