// Portfolio Management - Upload and Manage Artwork
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { auth, artworks as artworksHelpers, Artwork, User } from '@/lib/pocketbase'
import {
  Palette,
  Plus,
  Upload,
  Edit,
  Trash2,
  Eye,
  Star,
  Image as ImageIcon,
  Save,
  X,
  ArrowLeft,
  Grid,
  List,
  Search
} from 'lucide-react'

interface ArtworkFormData {
  title: string
  description: string
  medium: string
  dimensions: string
  year_created: number
  price: number
  is_for_sale: boolean
  image: File | null
  tags: string
  status: 'draft' | 'published' | 'sold' | 'archived'
}

const ART_MEDIUMS = [
  'Oil Painting', 'Acrylic Painting', 'Watercolor', 'Digital Art', 'Photography',
  'Sculpture', 'Drawing', 'Printmaking', 'Mixed Media', 'Ceramics',
  'Textiles', 'Installation', 'Performance', 'Video Art', 'Other'
]

const ARTWORK_STATUS = [
  { value: 'draft', label: 'Draft', color: 'secondary' },
  { value: 'published', label: 'Published', color: 'default' },
  { value: 'sold', label: 'Sold', color: 'destructive' },
  { value: 'archived', label: 'Archived', color: 'outline' }
]

export default function PortfolioPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<User | null>(null)
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null)

  const [formData, setFormData] = useState<ArtworkFormData>({
    title: '',
    description: '',
    medium: '',
    dimensions: '',
    year_created: new Date().getFullYear(),
    price: 0,
    is_for_sale: false,
    image: null,
    tags: '',
    status: 'draft'
  })

  useEffect(() => {
    checkAuthAndLoadArtworks()
  }, [])

  const checkAuthAndLoadArtworks = async () => {
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
    await loadArtworks()
  }

  const loadArtworks = async () => {
    try {
      setIsLoading(true)
      const artworksData = await artworksHelpers.getByArtist(user?.id || '')
      setArtworks(artworksData.items as unknown as Artwork[])
    } catch (error) {
      console.error('Error loading artworks:', error)
      toast({
        title: "Error",
        description: "Failed to load artworks.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      medium: '',
      dimensions: '',
      year_created: new Date().getFullYear(),
      price: 0,
      is_for_sale: false,
      image: null,
      tags: '',
      status: 'draft'
    })
    setEditingArtwork(null)
  }

  const openAddDialog = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const openEditDialog = (artwork: Artwork) => {
    setFormData({
      title: artwork.title,
      description: artwork.description || '',
      medium: artwork.medium,
      dimensions: artwork.dimensions || '',
      year_created: artwork.year_created || new Date().getFullYear(),
      price: artwork.price || 0,
      is_for_sale: artwork.is_for_sale,
      image: null, // Will be handled separately
      tags: artwork.tags || '',
      status: artwork.status
    })
    setEditingArtwork(artwork)
    setIsDialogOpen(true)
  }

  const handleInputChange = (field: keyof ArtworkFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File Type",
          description: "Please select an image file.",
          variant: "destructive",
        })
        return
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        })
        return
      }

      setFormData(prev => ({ ...prev, image: file }))
    }
  }

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a title for your artwork.",
        variant: "destructive",
      })
      return false
    }

    if (!formData.medium) {
      toast({
        title: "Validation Error",
        description: "Please select an artistic medium.",
        variant: "destructive",
      })
      return false
    }

    if (formData.is_for_sale && (!formData.price || formData.price <= 0)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid price for your artwork.",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setIsUploading(true)
    try {
      const artworkData = {
        artist: user!.id,
        title: formData.title,
        description: formData.description,
        medium: formData.medium,
        dimensions: formData.dimensions,
        year_created: formData.year_created,
        price: formData.price,
        is_for_sale: formData.is_for_sale,
        image: '/placeholder-artwork.png', // Default placeholder
        tags: formData.tags,
        status: formData.status,
        views: editingArtwork?.views || 0,
        likes: editingArtwork?.likes || 0,
        is_featured: editingArtwork?.is_featured || false
      }

      if (editingArtwork) {
        // Update existing artwork
        await artworksHelpers.update(editingArtwork.id, artworkData)
        toast({
          title: "Artwork Updated",
          description: "Your artwork has been successfully updated.",
        })
      } else {
        // Create new artwork
        await artworksHelpers.create(artworkData)
        toast({
          title: "Artwork Added",
          description: "Your artwork has been successfully added to your portfolio!",
        })
      }

      setIsDialogOpen(false)
      resetForm()
      await loadArtworks()
    } catch (error) {
      console.error('Error saving artwork:', error)
      toast({
        title: "Save Failed",
        description: "Failed to save artwork. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (artwork: Artwork) => {
    if (!confirm('Are you sure you want to delete this artwork? This action cannot be undone.')) {
      return
    }

    try {
      // await artworks.delete(artwork.id)
      toast({
        title: "Feature Coming Soon",
        description: "Artwork deletion will be implemented in the next update.",
      })
    } catch (error) {
      console.error('Error deleting artwork:', error)
      toast({
        title: "Delete Failed",
        description: "Failed to delete artwork. Please try again.",
        variant: "destructive",
      })
    }
  }

  const filteredArtworks = artworks.filter(artwork =>
    artwork.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artwork.medium.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (artwork.tags && artwork.tags.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your portfolio...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Portfolio Management</h1>
            <p className="text-muted-foreground">
              Manage your artwork collection and showcase your creativity
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={openAddDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Add Artwork
          </Button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search artworks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Artworks Grid/List */}
      {filteredArtworks.length > 0 ? (
        <div className={
          viewMode === 'grid'
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-4"
        }>
          {filteredArtworks.map((artwork) => (
            <Card key={artwork.id} className="overflow-hidden">
              {/* Artwork Image Placeholder */}
              <div className="aspect-square bg-muted flex items-center justify-center">
                <ImageIcon className="h-12 w-12 text-muted-foreground" />
              </div>

              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold truncate">{artwork.title}</h3>
                    <Badge variant={ARTWORK_STATUS.find(s => s.value === artwork.status)?.color as any}>
                      {ARTWORK_STATUS.find(s => s.value === artwork.status)?.label}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground">{artwork.medium}</p>

                  {artwork.price && artwork.price > 0 && (
                    <p className="font-semibold text-primary">${artwork.price}</p>
                  )}

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{artwork.views} views</span>
                    <span>{artwork.likes} likes</span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(artwork)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(artwork)}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <ImageIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No artworks found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? 'Try adjusting your search terms.' : 'Start building your portfolio by adding your first artwork.'}
          </p>
          {!searchTerm && (
            <Button onClick={openAddDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Artwork
            </Button>
          )}
        </div>
      )}

      {/* Add/Edit Artwork Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingArtwork ? 'Edit Artwork' : 'Add New Artwork'}
            </DialogTitle>
            <DialogDescription>
              {editingArtwork ? 'Update your artwork details' : 'Add a new piece to your portfolio'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Image Upload */}
            <div className="space-y-3">
              <Label>Artwork Image</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {formData.image ? formData.image.name : 'Click to upload artwork image'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG up to 5MB
                  </p>
                </label>
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Artwork title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="medium">Medium *</Label>
                <Select value={formData.medium} onValueChange={(value) => handleInputChange('medium', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select medium" />
                  </SelectTrigger>
                  <SelectContent>
                    {ART_MEDIUMS.map((medium) => (
                      <SelectItem key={medium} value={medium}>
                        {medium}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your artwork, inspiration, technique..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dimensions">Dimensions</Label>
                <Input
                  id="dimensions"
                  placeholder="e.g., 24x36 inches"
                  value={formData.dimensions}
                  onChange={(e) => handleInputChange('dimensions', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Year Created</Label>
                <Input
                  id="year"
                  type="number"
                  placeholder="2024"
                  value={formData.year_created}
                  onChange={(e) => handleInputChange('year_created', parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ARTWORK_STATUS.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="for_sale"
                  checked={formData.is_for_sale}
                  onCheckedChange={(checked) => handleInputChange('is_for_sale', checked)}
                />
                <Label htmlFor="for_sale" className="text-sm font-normal">
                  This artwork is for sale
                </Label>
              </div>

              {formData.is_for_sale && (
                <div className="space-y-2">
                  <Label htmlFor="price">Price (USD)</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                placeholder="e.g., abstract, nature, portrait, modern"
                value={formData.tags}
                onChange={(e) => handleInputChange('tags', e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isUploading}>
              <Save className="h-4 w-4 mr-2" />
              {isUploading ? 'Saving...' : editingArtwork ? 'Update Artwork' : 'Add Artwork'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
