// Artist Dashboard - Portfolio, Mentorship, Mental Health, Donations
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Palette,
  Users,
  Heart,
  DollarSign,
  TrendingUp,
  Plus,
  Settings,
  Camera,
  MessageCircle,
  Brain,
  Star,
  Eye,
  Heart as HeartIcon
} from 'lucide-react'
import { auth, artworks, donations, assessments, Artwork, Donation } from '@/lib/pocketbase'

export default function ArtistDashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState(auth.currentUser)
  const [stats, setStats] = useState({
    artworks: 0,
    views: 0,
    donations: 0,
    totalRaised: 0,
    mentorshipRequests: 0,
    assessments: 0
  })
  const [recentArtworks, setRecentArtworks] = useState<Artwork[]>([])
  const [recentDonations, setRecentDonations] = useState<Donation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check authentication
    if (!auth.isAuthenticated) {
      router.push('/sign-in')
      return
    }

    // Check if user is an artist
    if (user?.role !== 'artist') {
      router.push('/dashboard')
      return
    }

    loadDashboardData()
  }, [router, user])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      const userId = user?.id || ''

      // Load user's artworks
      const artworksData = await artworks.getByArtist(userId)
      setRecentArtworks(artworksData.items.slice(0, 3) as unknown as Artwork[])

      // Load user's donations
      const donationsData = await donations.getByArtist(userId)
      setRecentDonations(donationsData.items.slice(0, 3) as unknown as Donation[])

      // Load user's mentorship requests
      const { mentorship } = await import('@/lib/pocketbase')
      const mentorshipData = await mentorship.getRequests(userId, 'artist')

      // Load user's assessments
      const { assessments } = await import('@/lib/pocketbase')
      const assessmentsData = await assessments.getByUser(userId)

      // Calculate stats
      const totalViews = artworksData.items.reduce((sum, artwork) => sum + artwork.views, 0)
      const totalDonations = donationsData.items.length
      const totalRaised = donationsData.items
        .filter(d => d.status === 'completed')
        .reduce((sum, donation) => sum + donation.amount, 0)

      setStats({
        artworks: artworksData.items.length,
        views: totalViews,
        donations: totalDonations,
        totalRaised: totalRaised,
        mentorshipRequests: mentorshipData.items.length,
        assessments: assessmentsData.items.length
      })

    } catch (error) {
      console.error('Error loading dashboard data:', error)
      // Set fallback stats
      setStats(prevStats => ({
        ...prevStats,
        mentorshipRequests: 0,
        assessments: 0
      }))
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your artist dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Artist Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.first_name}! Manage your portfolio and track your impact.
          </p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Artwork
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Profile Settings
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Items</CardTitle>
            <Palette className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.artworks}</div>
            <p className="text-xs text-muted-foreground">
              Total artworks in portfolio
            </p>
          </CardContent>
        </Card>


        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.views}</div>
            <p className="text-xs text-muted-foreground">
              Portfolio engagement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mentorship</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.mentorshipRequests}</div>
            <p className="text-xs text-muted-foreground">
              Active mentorship requests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assessments</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.assessments}</div>
            <p className="text-xs text-muted-foreground">
              Health check-ins completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <Camera className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Manage Portfolio</CardTitle>
            <CardDescription>
              Add new artwork, edit existing pieces, and organize your gallery
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Go to Portfolio</Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <MessageCircle className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Find Mentorship</CardTitle>
            <CardDescription>
              Connect with experienced mentors for guidance and support
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">Browse Mentors</Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <Brain className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Mental Health Check</CardTitle>
            <CardDescription>
              Take assessments and track your wellbeing over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">Start Assessment</Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Artworks</CardTitle>
            <CardDescription>Your latest portfolio additions</CardDescription>
          </CardHeader>
          <CardContent>
            {recentArtworks.length > 0 ? (
              <div className="space-y-4">
                {recentArtworks.map((artwork) => (
                  <div key={artwork.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{artwork.title}</p>
                      <p className="text-sm text-muted-foreground">{artwork.views} views</p>
                    </div>
                    <Badge variant={artwork.is_featured ? "default" : "secondary"}>
                      {artwork.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No artworks yet. Add your first piece to get started!
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Donations</CardTitle>
            <CardDescription>Support from your community</CardDescription>
          </CardHeader>
          <CardContent>
            {recentDonations.length > 0 ? (
              <div className="space-y-4">
                {recentDonations.map((donation) => (
                  <div key={donation.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">${donation.amount}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(donation.created).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={donation.status === 'completed' ? "default" : "secondary"}>
                      {donation.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No donations yet. Share your work to attract supporters!
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
