// Mentorship Requests - Browse and Manage Mentorship Opportunities
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { auth, mentorship, artists, User, MentorshipRequest } from '@/lib/pocketbase'
import {
  MessageCircle,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Send,
  Calendar,
  MapPin,
  Users,
  Star,
  MessageSquare
} from 'lucide-react'

const MENTORSHIP_TYPES = [
  { value: 'virtual', label: 'Virtual' },
  { value: 'in_person', label: 'In-Person' },
  { value: 'both', label: 'Both' }
]

const FREQUENCY_OPTIONS = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'bi_weekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'as_needed', label: 'As Needed' }
]

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'secondary', icon: Clock },
  accepted: { label: 'Accepted', color: 'default', icon: CheckCircle },
  rejected: { label: 'Declined', color: 'destructive', icon: XCircle },
  completed: { label: 'Completed', color: 'default', icon: CheckCircle }
}

export default function MentorshipRequestsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [requests, setRequests] = useState<MentorshipRequest[]>([])
  const [availableMentors, setAvailableMentors] = useState<any[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  const [newRequest, setNewRequest] = useState({
    volunteer: '',
    request_message: '',
    preferred_mentorship_type: 'virtual' as 'virtual' | 'in_person' | 'both',
    preferred_frequency: 'weekly' as 'weekly' | 'bi_weekly' | 'monthly' | 'as_needed',
    goals: '',
    special_requirements: ''
  })

  useEffect(() => {
    checkAuthAndLoadData()
  }, [])

  const checkAuthAndLoadData = async () => {
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

    if (currentUser.role === 'artist') {
      await loadArtistRequests()
    } else if (currentUser.role === 'volunteer') {
      await loadVolunteerRequests()
    }

    await loadAvailableMentors()
  }

  const loadArtistRequests = async () => {
    try {
      const requestsData = await mentorship.getRequests(user!.id, 'artist')
      setRequests(requestsData.items as unknown as MentorshipRequest[])
    } catch (error) {
      console.error('Error loading artist requests:', error)
      toast({
        title: "Error",
        description: "Failed to load mentorship requests.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadVolunteerRequests = async () => {
    try {
      const requestsData = await mentorship.getRequests(user!.id, 'volunteer')
      setRequests(requestsData.items as unknown as MentorshipRequest[])
    } catch (error) {
      console.error('Error loading volunteer requests:', error)
      toast({
        title: "Error",
        description: "Failed to load mentorship requests.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadAvailableMentors = async () => {
    try {
      const mentorsData = await artists.getAll({ availability_for_mentorship: true })
      setAvailableMentors(mentorsData.items)
    } catch (error) {
      console.error('Error loading mentors:', error)
    }
  }

  const handleCreateRequest = async () => {
    if (!newRequest.volunteer || !newRequest.request_message.trim()) {
      toast({
        title: "Validation Error",
        description: "Please select a mentor and provide a message.",
        variant: "destructive",
      })
      return
    }

    try {
      await mentorship.createRequest({
        artist: user!.id,
        volunteer: newRequest.volunteer,
        request_message: newRequest.request_message,
        preferred_mentorship_type: newRequest.preferred_mentorship_type,
        preferred_frequency: newRequest.preferred_frequency,
        goals: newRequest.goals,
        special_requirements: newRequest.special_requirements
      })

      toast({
        title: "Request Sent",
        description: "Your mentorship request has been sent successfully!",
      })

      setIsDialogOpen(false)
      setNewRequest({
        volunteer: '',
        request_message: '',
        preferred_mentorship_type: 'virtual',
        preferred_frequency: 'weekly',
        goals: '',
        special_requirements: ''
      })

      await checkAuthAndLoadData()
    } catch (error) {
      console.error('Error creating request:', error)
      toast({
        title: "Request Failed",
        description: "Failed to send mentorship request. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleRequestAction = async (requestId: string, action: 'accept' | 'reject') => {
    try {
      // Mock implementation - would update request status in real app
      toast({
        title: action === 'accept' ? 'Request Accepted' : 'Request Declined',
        description: `You have ${action === 'accept' ? 'accepted' : 'declined'} the mentorship request.`,
      })
      await checkAuthAndLoadData()
    } catch (error) {
      console.error('Error updating request:', error)
      toast({
        title: "Action Failed",
        description: "Failed to update request. Please try again.",
        variant: "destructive",
      })
    }
  }

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.request_message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.goals?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = filterType === 'all' || request.preferred_mentorship_type === filterType
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus

    return matchesSearch && matchesType && matchesStatus
  })

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading mentorship requests...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Mentorship Requests</h1>
            <p className="text-muted-foreground">
              {user?.role === 'artist'
                ? 'Find mentors and manage your mentorship requests'
                : 'Review and manage mentorship requests from artists'
              }
            </p>
          </div>
        </div>

        {user?.role === 'artist' && (
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Request Mentorship
          </Button>
        )}
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="virtual">Virtual</SelectItem>
              <SelectItem value="in_person">In-Person</SelectItem>
              <SelectItem value="both">Both</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="rejected">Declined</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Available Mentors Section (for artists) */}
      {user?.role === 'artist' && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Available Mentors
            </CardTitle>
            <CardDescription>
              Browse experienced artists who are available for mentorship
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableMentors.slice(0, 6).map((mentor) => (
                <Card key={mentor.id} className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{mentor.user?.first_name} {mentor.user?.last_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {mentor.artistic_mediums?.join(', ')}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        <span className="text-xs text-muted-foreground">
                          {mentor.experience_level}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length > 0 ? (
          filteredRequests.map((request) => {
            const StatusIcon = STATUS_CONFIG[request.status as keyof typeof STATUS_CONFIG]?.icon || Clock
            const statusConfig = STATUS_CONFIG[request.status as keyof typeof STATUS_CONFIG]

            return (
              <Card key={request.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <StatusIcon className="h-5 w-5 text-muted-foreground" />
                        <Badge variant={statusConfig?.color as any}>
                          {statusConfig?.label}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(request.created).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 className="font-semibold mb-2">
                        {user?.role === 'artist' ? 'To: Mentor' : 'From: Artist'}
                      </h3>

                      <p className="text-muted-foreground mb-3">
                        {request.request_message}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Preferred Type:</span>
                          <p className="text-muted-foreground capitalize">
                            {request.preferred_mentorship_type.replace('_', '-')}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium">Frequency:</span>
                          <p className="text-muted-foreground capitalize">
                            {request.preferred_frequency?.replace('_', '-')}
                          </p>
                        </div>
                        {request.goals && (
                          <div>
                            <span className="font-medium">Goals:</span>
                            <p className="text-muted-foreground">{request.goals}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {user?.role === 'volunteer' && request.status === 'pending' && (
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          onClick={() => handleRequestAction(request.id, 'accept')}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRequestAction(request.id, 'reject')}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Decline
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })
        ) : (
          <div className="text-center py-12">
            <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No mentorship requests found</h3>
            <p className="text-muted-foreground mb-4">
              {user?.role === 'artist'
                ? 'Start your mentorship journey by requesting guidance from experienced artists.'
                : 'No mentorship requests to review at this time.'
              }
            </p>
            {user?.role === 'artist' && (
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Request Mentorship
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Create Request Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Request Mentorship</DialogTitle>
            <DialogDescription>
              Connect with an experienced artist for guidance and support
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Select a Mentor</Label>
              <Select value={newRequest.volunteer} onValueChange={(value) => setNewRequest(prev => ({ ...prev, volunteer: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a mentor" />
                </SelectTrigger>
                <SelectContent>
                  {availableMentors.map((mentor) => (
                    <SelectItem key={mentor.id} value={mentor.id}>
                      {mentor.user?.first_name} {mentor.user?.last_name} - {mentor.artistic_mediums?.join(', ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Describe what you're looking to learn, your goals, and why you're seeking mentorship..."
                value={newRequest.request_message}
                onChange={(e) => setNewRequest(prev => ({ ...prev, request_message: e.target.value }))}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Preferred Mentorship Type</Label>
                <Select value={newRequest.preferred_mentorship_type} onValueChange={(value) => setNewRequest(prev => ({ ...prev, preferred_mentorship_type: value as any }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MENTORSHIP_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Preferred Frequency</Label>
                <Select value={newRequest.preferred_frequency} onValueChange={(value) => setNewRequest(prev => ({ ...prev, preferred_frequency: value as any }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FREQUENCY_OPTIONS.map((freq) => (
                      <SelectItem key={freq.value} value={freq.value}>
                        {freq.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="goals">Your Goals</Label>
              <Textarea
                id="goals"
                placeholder="What specific goals do you want to achieve through mentorship?"
                value={newRequest.goals}
                onChange={(e) => setNewRequest(prev => ({ ...prev, goals: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements">Special Requirements</Label>
              <Textarea
                id="requirements"
                placeholder="Any special accommodations or requirements? (optional)"
                value={newRequest.special_requirements}
                onChange={(e) => setNewRequest(prev => ({ ...prev, special_requirements: e.target.value }))}
                rows={2}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateRequest}>
              <Send className="h-4 w-4 mr-2" />
              Send Request
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
