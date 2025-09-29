// Admin Dashboard - Full platform management and analytics
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

import {
  Users,
  Palette,
  MessageCircle,
  Brain,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings,
  Shield,
  BarChart3
} from 'lucide-react'
import { auth } from '@/lib/pocketbase'

export default function AdminDashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState(auth.currentUser)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check authentication
    if (!auth.isAuthenticated) {
      router.push('/sign-in')
      return
    }

    // Check if user is admin
    if (user?.role !== 'admin') {
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
            <p className="text-muted-foreground">Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive platform management and analytics overview
          </p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Settings className="h-4 w-4 mr-2" />
            System Settings
          </Button>
          <Button variant="outline">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Artists</CardTitle>
            <Palette className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8%</span> active this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+15%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Crisis Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-red-600">
              Require immediate attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Overview Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Platform Activity</CardTitle>
            <CardDescription>Recent activity across the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: 'New artist registration', user: 'Maria Gonzalez', time: '2 min ago' },
                { action: 'Mentorship request matched', user: 'System', time: '5 min ago' },
                { action: 'Donation processed', user: 'Alex Chen', time: '12 min ago' },
                { action: 'Assessment completed', user: 'Sarah Johnson', time: '18 min ago' },
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">by {activity.user}</p>
                    </div>
                  </div>
                  <Badge variant="secondary">{activity.time}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Actions</CardTitle>
            <CardDescription>Items requiring admin attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { task: 'Review 3 crisis assessments', priority: 'critical', count: 3 },
                { task: 'Approve user registrations', priority: 'high', count: 12 },
                { task: 'Moderate reported content', priority: 'medium', count: 5 },
                { task: 'Process refund requests', priority: 'low', count: 2 },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Clock className={`h-4 w-4 ${
                      item.priority === 'critical' ? 'text-red-600' :
                      item.priority === 'high' ? 'text-orange-600' :
                      'text-yellow-600'
                    }`} />
                    <div>
                      <p className="text-sm font-medium">{item.task}</p>
                      <p className="text-xs text-muted-foreground">{item.count} pending</p>
                    </div>
                  </div>
                  <Badge variant={
                    item.priority === 'critical' ? 'destructive' :
                    item.priority === 'high' ? 'default' :
                    'secondary'
                  }>
                    {item.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Admin Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Manage user accounts and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Users: <strong>1,234</strong></p>
              <p className="text-sm text-muted-foreground">Pending Approvals: <strong>12</strong></p>
              <Button className="w-full mt-4">
                Manage Users
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mentorship Program</CardTitle>
            <CardDescription>Oversight of mentorship matching and sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Active Pairs: <strong>87</strong></p>
              <p className="text-sm text-muted-foreground">Pending Requests: <strong>156</strong></p>
              <Button className="w-full mt-4">
                Process Matchmaking
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Monitor database and API performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Database Status: <strong className="text-green-600">Healthy</strong></p>
              <p className="text-sm text-muted-foreground">Response Time: <strong>245ms</strong></p>
              <Button variant="outline" className="w-full mt-4">
                View System Logs
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
