// Volunteer Dashboard - Mentorship and support management
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Users,
  MessageCircle,
  Heart,
  Brain,
  Clock,
  CheckCircle,
  Star,
  Calendar,
  UserCheck,
  MessageSquare,
  AlertTriangle
} from 'lucide-react'
import { auth } from '@/lib/pocketbase'

export default function VolunteerDashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState(auth.currentUser)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check authentication
    if (!auth.isAuthenticated) {
      router.push('/sign-in')
      return
    }

    // Check if user is volunteer
    if (user?.role !== 'volunteer') {
      router.push('/dashboard')
      return
    }

    setIsLoading(false)
  }, [router, user])

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading volunteer dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Volunteer Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Track your mentorship impact and support activities.
          </p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Session
          </Button>
          <Button variant="outline">
            <MessageSquare className="h-4 w-4 mr-2" />
            Messages
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Mentees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              Currently supporting
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessions Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.8</div>
            <p className="text-xs text-muted-foreground">
              From mentees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              New mentorship requests
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>My Mentees</CardTitle>
            <CardDescription>Artists you are actively supporting</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  name: 'Sarah Johnson',
                  medium: 'Photography',
                  lastSession: '2 days ago',
                  nextSession: 'Tomorrow 2:00 PM',
                  progress: 'Strong progress in portfolio development'
                },
                {
                  name: 'Carlos Rodriguez',
                  medium: 'Digital Art',
                  lastSession: '5 days ago',
                  nextSession: 'Next week',
                  progress: 'Working on creative confidence'
                },
                {
                  name: 'Maya Patel',
                  medium: 'Sculpture',
                  lastSession: '1 week ago',
                  nextSession: 'Friday 10:00 AM',
                  progress: 'Exploring new techniques'
                }
              ].map((mentee, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{mentee.name}</h4>
                    <Badge variant="outline">{mentee.medium}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{mentee.progress}</p>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Last: {mentee.lastSession}</span>
                    <span>Next: {mentee.nextSession}</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline">Schedule Session</Button>
                    <Button size="sm" variant="ghost">View Progress</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Sessions</CardTitle>
            <CardDescription>Your mentorship schedule</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  mentee: 'Sarah Johnson',
                  date: 'Tomorrow',
                  time: '2:00 PM',
                  type: 'Virtual',
                  topic: 'Portfolio Review'
                },
                {
                  mentee: 'Maya Patel',
                  date: 'Friday',
                  time: '10:00 AM',
                  type: 'In-person',
                  topic: 'Material Selection'
                },
                {
                  mentee: 'Carlos Rodriguez',
                  date: 'Next Monday',
                  time: '3:00 PM',
                  type: 'Virtual',
                  topic: 'Creative Block Solutions'
                }
              ].map((session, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{session.mentee}</p>
                      <p className="text-xs text-muted-foreground">
                        {session.date} • {session.time} • {session.type}
                      </p>
                      <p className="text-xs text-primary">{session.topic}</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Upcoming</Badge>
                </div>
              ))}
            </div>
            <Button className="w-full mt-4">
              <Calendar className="h-4 w-4 mr-2" />
              View Full Calendar
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Additional Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Mentorship Requests</CardTitle>
            <CardDescription>New artists seeking your guidance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <div className="text-2xl font-bold text-primary">3</div>
              <p className="text-sm text-muted-foreground">Pending requests</p>
            </div>
            <Button className="w-full">
              Review Requests
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mental Health Support</CardTitle>
            <CardDescription>Track mentee wellbeing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                <span className="text-yellow-600">⚠️</span> 1 mentee needs follow-up
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="text-red-600">🚨</span> 1 crisis case flagged
              </p>
              <Button variant="outline" className="w-full mt-2">
                <Heart className="h-4 w-4 mr-2" />
                View Assessments
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Impact</CardTitle>
            <CardDescription>Your contribution summary</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Sessions</span>
                <Badge variant="default">147</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Artists Helped</span>
                <Badge variant="default">23</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Success Stories</span>
                <Badge variant="default">12</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">This Month</span>
                <Badge variant="secondary">+8 sessions</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
