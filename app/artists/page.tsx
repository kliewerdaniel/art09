// ArtSaaS Artists Gallery Page
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ThemeToggle } from '@/components/theme-toggle'
import { Palette, Search, Filter, MapPin, ExternalLink, Heart, Users, Star } from 'lucide-react'

// Mock artist data - in real app this would come from PocketBase
const mockArtists = [
  {
    id: 'artist_001',
    user: {
      first_name: 'Sarah',
      last_name: 'Chen',
      location: 'San Francisco, CA',
      profile_image: null
    },
    artistic_mediums: ['painting', 'mixed_media'],
    experience_level: 'advanced',
    portfolio_website: 'https://sarahchen.art',
    instagram_handle: '@sarahchen_art',
    artistic_statement: 'My work explores the intersection of cultural identity and personal narrative through abstract painting and mixed media installations.',
    portfolio_views: 245,
    total_donations: 1250.00,
    artworks: [
      {
        id: 'artwork_001',
        title: 'Cultural Threads',
        medium: 'mixed_media',
        image: null,
        is_featured: true,
        views: 67,
        likes: 23
      },
      {
        id: 'artwork_002',
        title: 'Memory Palace',
        medium: 'painting',
        image: null,
        is_featured: false,
        views: 89,
        likes: 34
      }
    ]
  },
  {
    id: 'artist_002',
    user: {
      first_name: 'Mike',
      last_name: 'Rodriguez',
      location: 'New York, NY',
      profile_image: null
    },
    artistic_mediums: ['photography', 'digital_art'],
    experience_level: 'professional',
    portfolio_website: 'https://mikerodriguez.photo',
    instagram_handle: '@mike_streetphoto',
    artistic_statement: 'I capture the raw energy of city life, focusing on the beauty found in everyday moments and urban decay.',
    portfolio_views: 189,
    total_donations: 890.00,
    artworks: [
      {
        id: 'artwork_003',
        title: 'Neon Nights',
        medium: 'photography',
        image: null,
        is_featured: true,
        views: 156,
        likes: 67
      }
    ]
  }
]

export default function ArtistsPage() {
  const [artists, setArtists] = useState(mockArtists)
  const [searchTerm, setSearchTerm] = useState('')
  const [mediumFilter, setMediumFilter] = useState('all')
  const [experienceFilter, setExperienceFilter] = useState('all')

  const filteredArtists = artists.filter(artist => {
    const matchesSearch = artist.user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         artist.user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         artist.artistic_statement.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesMedium = mediumFilter === 'all' || artist.artistic_mediums.includes(mediumFilter)
    const matchesExperience = experienceFilter === 'all' || artist.experience_level === experienceFilter

    return matchesSearch && matchesMedium && matchesExperience
  })

  const allMediums = Array.from(new Set(artists.flatMap(artist => artist.artistic_mediums)))

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Palette className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">ArtSaaS</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/artists">
              <Button variant="ghost">Artists</Button>
            </Link>
            <Link href="/sign-in">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button>Get Started</Button>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="py-12 px-4 bg-muted/50">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Discover Amazing Artists
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Explore the portfolios of talented artists, support their work, and connect with the creative community
          </p>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{artists.length}</div>
              <div className="text-sm text-muted-foreground">Artists</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {artists.reduce((sum, artist) => sum + artist.artworks.length, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Artworks</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {artists.reduce((sum, artist) => sum + artist.portfolio_views, 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Portfolio Views</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                ${artists.reduce((sum, artist) => sum + artist.total_donations, 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center space-x-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search artists..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4 w-full md:w-auto">
              <Select value={mediumFilter} onValueChange={setMediumFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Medium" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Mediums</SelectItem>
                  {allMediums.map(medium => (
                    <SelectItem key={medium} value={medium}>
                      {medium.replace('_', ' ').toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={experienceFilter} onValueChange={setExperienceFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Artists Grid */}
      <section className="py-8 px-4">
        <div className="container mx-auto">
          {filteredArtists.length === 0 ? (
            <div className="text-center py-12">
              <Palette className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No artists found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or filters
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArtists.map((artist) => (
                <Card key={artist.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {artist.user.first_name} {artist.user.last_name}
                        </CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          {artist.user.location}
                        </CardDescription>
                      </div>
                      <Badge variant={
                        artist.experience_level === 'professional' ? 'default' :
                        artist.experience_level === 'advanced' ? 'secondary' : 'outline'
                      }>
                        {artist.experience_level}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {artist.artistic_statement}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {artist.artistic_mediums.map((medium) => (
                        <Badge key={medium} variant="outline" className="text-xs">
                          {medium.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {artist.portfolio_views}
                        </span>
                        <span className="flex items-center">
                          <Heart className="h-4 w-4 mr-1" />
                          {artist.total_donations > 0 ? `$${artist.total_donations}` : '0'}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 mr-1" />
                        {artist.artworks.length}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button asChild className="flex-1">
                        <Link href={`/artists/${artist.id}`}>
                          View Portfolio
                        </Link>
                      </Button>
                      {artist.portfolio_website && (
                        <Button variant="outline" size="icon" asChild>
                          <a href={artist.portfolio_website} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-12 px-4 bg-muted/50">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Are you an artist?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join our community to showcase your work, find mentorship, and connect with supporters who believe in your artistic vision.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/sign-up">
                Join as Artist
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/sign-up">
                Become a Volunteer
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Palette className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">ArtSaaS</span>
          </div>
          <p className="text-muted-foreground">
            Supporting artists through community, mentorship, and creative collaboration
          </p>
        </div>
      </footer>
    </div>
  )
}
