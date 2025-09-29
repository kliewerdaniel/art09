// ArtSaaS PocketBase Client Configuration
import PocketBase from 'pocketbase'
import { env } from 'process'

// Initialize PocketBase client
const pb = new PocketBase(env.POCKETBASE_URL || 'http://localhost:8090')

// Types for our collections
export interface User {
  id: string
  email: string
  role: 'artist' | 'volunteer' | 'admin' | 'guest'
  first_name: string
  last_name: string
  bio?: string
  location?: string
  website?: string
  profile_image?: string
  is_profile_complete: boolean
  created: string
  updated: string
}

export interface Artist {
  id: string
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
  portfolio_views: number
  total_donations: number
  created: string
  updated: string
}

export interface Artwork {
  id: string
  artist: string
  title: string
  description?: string
  medium: string
  dimensions?: string
  year_created?: number
  price?: number
  is_for_sale: boolean
  image: string
  additional_images?: string[]
  tags?: string
  views: number
  likes: number
  is_featured: boolean
  status: 'draft' | 'published' | 'sold' | 'archived'
  created: string
  updated: string
}

export interface MentorshipRequest {
  id: string
  artist: string
  volunteer: string
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed'
  request_message: string
  response_message?: string
  preferred_mentorship_type: 'in_person' | 'virtual' | 'both'
  preferred_frequency?: 'weekly' | 'bi_weekly' | 'monthly' | 'as_needed'
  goals?: string
  special_requirements?: string
  requested_at: string
  responded_at?: string
  expires_at?: string
  created: string
  updated: string
}

export interface MentorshipSession {
  id: string
  mentorship_request: string
  artist: string
  volunteer: string
  session_date: string
  duration_minutes: number
  session_type: 'in_person' | 'virtual' | 'phone_call'
  location?: string
  meeting_link?: string
  session_notes?: string
  goals_discussed?: string
  progress_made?: string
  next_steps?: string
  challenges_faced?: string
  resources_shared?: string
  artist_rating?: number
  volunteer_rating?: number
  artist_feedback?: string
  volunteer_feedback?: string
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show'
  created: string
  updated: string
}

export interface MentalHealthAssessment {
  id: string
  user: string
  assessment_type: 'phq9' | 'gad7' | 'combined'
  assessment_date: string
  phq9_responses?: string
  phq9_score?: number
  phq9_severity?: 'none' | 'mild' | 'moderate' | 'moderately_severe' | 'severe'
  gad7_responses?: string
  gad7_score?: number
  gad7_severity?: 'none' | 'mild' | 'moderate' | 'severe'
  total_score?: number
  overall_risk_level?: 'low' | 'medium' | 'high' | 'crisis'
  notes?: string
  recommendations?: string
  crisis_resources_provided: boolean
  follow_up_needed: boolean
  follow_up_date?: string
  admin_reviewed: boolean
  admin_notes?: string
  is_complete: boolean
  created: string
  updated: string
}

export interface Donation {
  id: string
  donor: string
  artist: string
  amount: number
  currency: 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD'
  donation_type: 'one_time' | 'monthly' | 'artwork_purchase'
  message?: string
  is_anonymous: boolean
  stripe_payment_intent_id?: string
  stripe_customer_id?: string
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled'
  payment_method?: 'card' | 'bank_transfer' | 'paypal' | 'other'
  platform_fee: number
  net_amount: number
  processed_at?: string
  refunded_at?: string
  refund_amount?: number
  refund_reason?: string
  is_recurring: boolean
  subscription_id?: string
  next_billing_date?: string
  created: string
  updated: string
}

// Authentication helpers
export const auth = {
  // Sign up new user
  async signUp(data: {
    email: string
    password: string
  }) {
    try {
      // Create user with auth fields only
      // Note: Custom profile fields should be saved to separate tables after signup
      const user = await pb.collection('users').create({
        email: data.email,
        password: data.password,
        passwordConfirm: data.password
      })

      // Auto-login after signup
      await pb.collection('users').authWithPassword(data.email, data.password)

      return user
    } catch (error) {
      console.error('Sign up error:', error)
      throw error
    }
  },

  // Sign in existing user
  async signIn(email: string, password: string) {
    try {
      const authData = await pb.collection('users').authWithPassword(email, password)
      return authData
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    }
  },

  // Sign out
  async signOut() {
    try {
      pb.authStore.clear()
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  },

  // Get current user
  get currentUser(): User | null {
    return pb.authStore.model as User | null
  },

  // Check if user is authenticated
  get isAuthenticated(): boolean {
    return pb.authStore.isValid
  }
}

// Artist helpers
export const artists = {
  // Get all artists with optional filtering
  async getAll(filters?: {
    medium?: string
    experience_level?: Artist['experience_level']
    availability_for_mentorship?: boolean
  }) {
    try {
      let filterString = ''

      if (filters) {
        const conditions = []
        if (filters.medium) {
          conditions.push(`artistic_mediums ~ '${filters.medium}'`)
        }
        if (filters.experience_level) {
          conditions.push(`experience_level = '${filters.experience_level}'`)
        }
        if (filters.availability_for_mentorship !== undefined) {
          conditions.push(`availability_for_mentorship = ${filters.availability_for_mentorship}`)
        }
        filterString = conditions.join(' && ')
      }

      const artists = await pb.collection('artists').getList(1, 50, {
        filter: filterString,
        expand: 'user',
        sort: '-portfolio_views'
      })

      return artists
    } catch (error) {
      console.error('Get artists error:', error)
      throw error
    }
  },

  // Get artist by ID
  async getById(id: string) {
    try {
      const artist = await pb.collection('artists').getOne(id, {
        expand: 'user'
      })
      return artist
    } catch (error) {
      console.error('Get artist error:', error)
      throw error
    }
  },

  // Create artist profile
  async create(data: Omit<Artist, 'id' | 'created' | 'updated' | 'portfolio_views' | 'total_donations'>) {
    try {
      const artist = await pb.collection('artists').create(data)
      return artist
    } catch (error) {
      console.error('Create artist error:', error)
      throw error
    }
  },

  // Update artist profile
  async update(id: string, data: Partial<Artist>) {
    try {
      const artist = await pb.collection('artists').update(id, data)
      return artist
    } catch (error) {
      console.error('Update artist error:', error)
      throw error
    }
  }
}

// Artwork helpers
export const artworks = {
  // Get artworks by artist
  async getByArtist(artistId: string) {
    try {
      const artworks = await pb.collection('artworks').getList(1, 50, {
        filter: `artist = '${artistId}'`,
        sort: '-is_featured,-views'
      })
      return artworks
    } catch (error) {
      console.error('Get artworks error:', error)
      throw error
    }
  },

  // Get featured artworks
  async getFeatured() {
    try {
      const artworks = await pb.collection('artworks').getList(1, 20, {
        filter: 'is_featured = true && status = "published"',
        expand: 'artist',
        sort: '-views'
      })
      return artworks
    } catch (error) {
      console.error('Get featured artworks error:', error)
      throw error
    }
  },

  // Create new artwork
  async create(data: Omit<Artwork, 'id' | 'created' | 'updated' | 'views' | 'likes'>) {
    try {
      const artwork = await pb.collection('artworks').create({
        ...data,
        views: 0,
        likes: 0
      })
      return artwork
    } catch (error) {
      console.error('Create artwork error:', error)
      throw error
    }
  },

  // Update artwork
  async update(id: string, data: Partial<Artwork>) {
    try {
      const artwork = await pb.collection('artworks').update(id, data)
      return artwork
    } catch (error) {
      console.error('Update artwork error:', error)
      throw error
    }
  },

  // Delete artwork
  async delete(id: string) {
    try {
      await pb.collection('artworks').delete(id)
      return true
    } catch (error) {
      console.error('Delete artwork error:', error)
      throw error
    }
  }
}

// Mentorship helpers
export const mentorship = {
  // Get mentorship requests for a user
  async getRequests(userId: string, type: 'artist' | 'volunteer') {
    try {
      const filter = type === 'artist'
        ? `artist.user = '${userId}'`
        : `volunteer = '${userId}'`

      const requests = await pb.collection('mentorship_requests').getList(1, 50, {
        filter,
        expand: type === 'artist' ? 'volunteer' : 'artist,artist.user',
        sort: '-created'
      })
      return requests
    } catch (error) {
      console.error('Get mentorship requests error:', error)
      throw error
    }
  },

  // Create mentorship request
  async createRequest(data: Omit<MentorshipRequest, 'id' | 'created' | 'updated' | 'status' | 'requested_at'>) {
    try {
      const request = await pb.collection('mentorship_requests').create({
        ...data,
        status: 'pending',
        requested_at: new Date().toISOString()
      })
      return request
    } catch (error) {
      console.error('Create mentorship request error:', error)
      throw error
    }
  }
}

// Assessment helpers
export const assessments = {
  // Get assessments for a user
  async getByUser(userId: string) {
    try {
      const assessments = await pb.collection('mental_health_assessments').getList(1, 50, {
        filter: `user = '${userId}'`,
        sort: '-assessment_date'
      })
      return assessments
    } catch (error) {
      console.error('Get assessments error:', error)
      throw error
    }
  },

  // Create new assessment
  async create(data: Omit<MentalHealthAssessment, 'id' | 'created' | 'updated'>) {
    try {
      const assessment = await pb.collection('mental_health_assessments').create(data)
      return assessment
    } catch (error) {
      console.error('Create assessment error:', error)
      throw error
    }
  }
}

// Donation helpers
export const donations = {
  // Get donations for an artist
  async getByArtist(artistId: string) {
    try {
      const donations = await pb.collection('donations').getList(1, 50, {
        filter: `artist = '${artistId}' && status = 'completed'`,
        sort: '-created'
      })
      return donations
    } catch (error) {
      console.error('Get donations error:', error)
      throw error
    }
  },

  // Create donation
  async create(data: Omit<Donation, 'id' | 'created' | 'updated' | 'status' | 'platform_fee' | 'net_amount'>) {
    try {
      // Calculate platform fee (5% for now)
      const platformFee = data.amount * 0.05
      const netAmount = data.amount - platformFee

      const donation = await pb.collection('donations').create({
        ...data,
        status: 'pending',
        platform_fee: platformFee,
        net_amount: netAmount
      })
      return donation
    } catch (error) {
      console.error('Create donation error:', error)
      throw error
    }
  }
}

// Real-time subscriptions
export const subscribeToCollection = (
  collection: string,
  callback: (data: any) => void
) => {
  return pb.collection(collection).subscribe('*', callback)
}

// Utility functions
export const formatCurrency = (amount: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount)
}

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export const calculateSeverityColor = (severity: string) => {
  switch (severity) {
    case 'none': return 'text-green-600'
    case 'mild': return 'text-yellow-600'
    case 'moderate': return 'text-orange-600'
    case 'moderately_severe': return 'text-red-600'
    case 'severe': return 'text-red-800'
    default: return 'text-gray-600'
  }
}

export default pb
