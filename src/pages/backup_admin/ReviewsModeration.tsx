// src/pages/admin/ReviewsModeration.tsx
import { useEffect, useState } from "react"
import { API } from "../../services/api"
import { Review, ApprovalStatus } from "../../types"
import { toast } from "../../components/ui/sonner"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Input } from "../../components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog"
import { Skeleton } from "../../components/ui/skeleton"
import { Search, RefreshCw, Filter, X, Info, Star, CheckCircle, XCircle, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"

// Extend Review type to include status for this component
type ReviewWithStatus = Review & {
  status: ApprovalStatus
}

type FilterState = {
  status: ApprovalStatus | 'ALL'
  rating: string // 'ALL' or '1' to '5'
  search: string
}

export default function ReviewsModeration() {
  const [reviews, setReviews] = useState<ReviewWithStatus[]>([])
  const [filteredReviews, setFilteredReviews] = useState<ReviewWithStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReview, setSelectedReview] = useState<ReviewWithStatus | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null)
  const [filters, setFilters] = useState<FilterState>({
    status: 'PENDING',
    rating: 'ALL',
    search: ''
  })
  const [selectedReviews, setSelectedReviews] = useState<Set<string>>(new Set())
  const [selectAll, setSelectAll] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    avgRating: 0
  })

  // Load reviews data
  const loadReviews = async () => {
    setLoading(true)
    try {
      const allReviews = await API.getAdminReviews()
      setReviews(allReviews)
      
      // Calculate stats
      const pending = allReviews.filter(r => r.status === 'PENDING').length
      const approved = allReviews.filter(r => r.status === 'APPROVED').length
      const rejected = allReviews.filter(r => r.status === 'REJECTED').length
      
      const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0)
      const avgRating = allReviews.length > 0 ? totalRating / allReviews.length : 0
      
      setStats({
        total: allReviews.length,
        pending,
        approved,
        rejected,
        avgRating
      })
      
      applyFilters(allReviews, filters)
    } catch (error) {
      console.error("Failed to load reviews", error)
      toast.error("Failed to load reviews")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReviews()
  }, [])

  // Apply filters
  const applyFilters = (reviewsList: ReviewWithStatus[], currentFilters: FilterState) => {
    let result = [...reviewsList]
    
    // Filter by status
    if (currentFilters.status !== 'ALL') {
      result = result.filter(review => review.status === currentFilters.status)
    }
    
    // Filter by rating
    if (currentFilters.rating !== 'ALL') {
      const ratingValue = parseInt(currentFilters.rating)
      result = result.filter(review => review.rating === ratingValue)
    }
    
    // Filter by search (username or game title)
    if (currentFilters.search) {
      const searchLower = currentFilters.search.toLowerCase()
      result = result.filter(review => 
        (review.user?.username && review.user.username.toLowerCase().includes(searchLower)) || 
        (review.game?.title && review.game.title.toLowerCase().includes(searchLower)) ||
        (review.comment && review.comment.toLowerCase().includes(searchLower))
      )
    }
    
    setFilteredReviews(result)
  }

  useEffect(() => {
    applyFilters(reviews, filters)
  }, [filters, reviews])

  // Handle filter changes
  const updateFilter = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value as any }))
    setSelectedReviews(new Set())
    setSelectAll(false)
  }

  // Reset filters
  const resetFilters = () => {
    setFilters({
      status: 'PENDING',
      rating: 'ALL',
      search: ''
    })
    setSelectedReviews(new Set())
    setSelectAll(false)
  }

  // Action functions
  const openConfirmDialog = (review: ReviewWithStatus, action: 'approve' | 'reject') => {
    setSelectedReview(review)
    setActionType(action)
    setConfirmDialogOpen(true)
  }

  const handleAction = async () => {
    if (!selectedReview || !actionType) return
    
    try {
      if (actionType === 'approve') {
        await API.approveReview(selectedReview.id)
        toast.success(`Review approved`)
      } else {
        await API.rejectReview(selectedReview.id)
        toast.success(`Review rejected`)
      }
      
      // Update local state
      setReviews(prev => 
        prev.map(r => 
          r.id === selectedReview.id 
            ? { ...r, status: actionType === 'approve' ? 'APPROVED' : 'REJECTED' } 
            : r
        )
      )
      
      setSelectedReviews(prev => {
        const updated = new Set(prev)
        updated.delete(selectedReview.id)
        return updated
      })
      
      // Update stats
      const newStatus = actionType === 'approve' ? 'APPROVED' : 'REJECTED'
      const oldStatus = selectedReview.status
      
      setStats(prev => {
        const updated = { ...prev }
        
        if (oldStatus === 'PENDING') updated.pending--
        else if (oldStatus === 'APPROVED') updated.approved--
        else if (oldStatus === 'REJECTED') updated.rejected--
        
        if (newStatus === 'APPROVED') updated.approved++
        else if (newStatus === 'REJECTED') updated.rejected++
        
        return updated
      })
    } catch (error: any) {
      toast.error(error.message || "Action failed")
    } finally {
      setConfirmDialogOpen(false)
      setSelectedReview(null)
      setActionType(null)
    }
  }

  // Batch actions
  const handleBatchAction = async (action: 'approve' | 'reject') => {
    if (selectedReviews.size === 0) return
    
    try {
      const reviewIds = Array.from(selectedReviews)
      const actionPromises = reviewIds.map(id => 
        action === 'approve' ? API.approveReview(id) : API.rejectReview(id)
      )
      
      await Promise.all(actionPromises)
      
      // Update local state
      const updatedReviews = [...reviews].map(r => 
        selectedReviews.has(r.id) 
          ? { ...r, status: action === 'approve' ? 'APPROVED' : 'REJECTED' } 
          : r
      )
      
      setReviews(updatedReviews as ReviewWithStatus[])
      
      // Update stats
      const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED'
      
      setStats(prev => {
        const updated = { ...prev }
        const statusCounts = { PENDING: 0, APPROVED: 0, REJECTED: 0 }
        
        // Count reviews by status before the change
        selectedReviews.forEach(id => {
          const review = reviews.find(r => r.id === id)
          if (review) statusCounts[review.status]++
        })
        
        // Update counts
        updated.pending -= statusCounts.PENDING || 0
        updated.approved -= statusCounts.APPROVED || 0
        updated.rejected -= statusCounts.REJECTED || 0
        
        // Add to new status
        if (newStatus === 'APPROVED') updated.approved += selectedReviews.size
        else if (newStatus === 'REJECTED') updated.rejected += selectedReviews.size
        
        return updated
      })
      
      toast.success(`${selectedReviews.size} reviews ${action === 'approve' ? 'approved' : 'rejected'}`)
      setSelectedReviews(new Set())
      setSelectAll(false)
    } catch (error) {
      toast.error("Batch action failed")
    }
  }

  // Selection handling
  const toggleSelectReview = (id: string) => {
    setSelectedReviews(prev => {
      const updated = new Set(prev)
      if (updated.has(id)) {
        updated.delete(id)
      } else {
        updated.add(id)
      }
      return updated
    })
  }

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedReviews(new Set())
    } else {
      setSelectedReviews(new Set(filteredReviews.map(r => r.id)))
    }
    setSelectAll(!selectAll)
  }

  // Show review details
  const showReviewDetails = (review: ReviewWithStatus) => {
    setSelectedReview(review)
    setDetailsOpen(true)
  }

  // Render rating stars
  const renderRatingStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star 
            key={i}
            size={16}
            className={i < rating ? "fill-yellow-500 text-yellow-500" : "text-gray-300"}
          />
        ))}
      </div>
    )
  }

  // Render status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline">Pending</Badge>
      case 'APPROVED':
        return <Badge variant="default" className="bg-green-600">Approved</Badge>
      case 'REJECTED':
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Review Moderation</h2>
        <Button onClick={loadReviews} size="sm" variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <StatCard title="Total Reviews" value={stats.total} />
        <StatCard title="Pending" value={stats.pending} />
        <StatCard title="Approved" value={stats.approved} status="approved" />
        <StatCard title="Rejected" value={stats.rejected} status="rejected" />
        <StatCard 
          title="Avg. Rating" 
          value={stats.avgRating.toFixed(1)} 
          icon={<Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />} 
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Reviews List</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search reviews..."
                  value={filters.search}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  className="pl-8 pr-8 w-[200px]"
                />
                {filters.search && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full aspect-square p-0 hover:bg-transparent"
                    onClick={() => updateFilter('search', '')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <Select 
                value={filters.status} 
                onValueChange={(value) => updateFilter('status', value)}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
              
              <Select 
                value={filters.rating} 
                onValueChange={(value) => updateFilter('rating', value)}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Ratings</SelectItem>
                  <SelectItem value="1">★ (1 Star)</SelectItem>
                  <SelectItem value="2">★★ (2 Stars)</SelectItem>
                  <SelectItem value="3">★★★ (3 Stars)</SelectItem>
                  <SelectItem value="4">★★★★ (4 Stars)</SelectItem>
                  <SelectItem value="5">★★★★★ (5 Stars)</SelectItem>
                </SelectContent>
              </Select>
              
              {(filters.search || filters.status !== 'PENDING' || filters.rating !== 'ALL') && (
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 bg-card rounded border flex justify-between items-center">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-9 w-20" />
                    <Skeleton className="h-9 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground">No reviews found</div>
              <Button variant="outline" size="sm" className="mt-4" onClick={resetFilters}>
                Reset Filters
              </Button>
            </div>
          ) : (
            <>
              {selectedReviews.size > 0 && (
                <div className="flex justify-between items-center mb-4 p-2 bg-muted rounded">
                  <span>{selectedReviews.size} reviews selected</span>
                  <div className="space-x-2">
                    <Button size="sm" onClick={() => handleBatchAction('approve')}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve All
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleBatchAction('reject')}>
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject All
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setSelectedReviews(new Set())}>
                      <X className="h-4 w-4 mr-2" />
                      Clear
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="mb-2 flex items-center">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="select-all" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                    Select All
                  </label>
                </div>
              </div>
              
              <div className="space-y-4">
                {filteredReviews.map((review) => (
                  <div 
                    key={review.id} 
                    className={`p-4 bg-card rounded border flex items-start ${
                      selectedReviews.has(review.id) ? 'border-primary' : ''
                    }`}
                  >
                    <div className="flex items-center h-5 mr-4 mt-1">
                      <input
                        type="checkbox"
                        checked={selectedReviews.has(review.id)}
                        onChange={() => toggleSelectReview(review.id)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{review.user?.username}</span>
                          <span className="text-muted-foreground">on</span>
                          <span className="font-medium italic">{review.game?.title}</span>
                          {renderStatusBadge(review.status)}
                        </div>
                        <div className="flex items-center gap-2">
                          {renderRatingStars(review.rating)}
                          <span className="text-sm text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-sm mt-1 line-clamp-2">"{review.comment}"</p>
                    </div>
                    
                    <div className="ml-4 space-x-2 flex items-start">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => showReviewDetails(review)}
                      >
                        <Info className="h-4 w-4 mr-2" />
                        Details
                      </Button>
                      
                      {review.status === 'PENDING' && (
                        <>
                          <Button 
                            size="sm" 
                            onClick={() => openConfirmDialog(review, 'approve')}
                          >
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            onClick={() => openConfirmDialog(review, 'reject')}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      
                      {(review.status === 'APPROVED' || review.status === 'REJECTED') && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            {review.status === 'REJECTED' && (
                              <DropdownMenuItem onClick={() => openConfirmDialog(review, 'approve')}>
                                Approve Instead
                              </DropdownMenuItem>
                            )}
                            {review.status === 'APPROVED' && (
                              <DropdownMenuItem onClick={() => openConfirmDialog(review, 'reject')}>
                                Reject Instead
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Review Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        {selectedReview && (
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Review Details</DialogTitle>
              <DialogDescription>
                Review for {selectedReview.game?.title}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-semibold">User</p>
                  <p>{selectedReview.user?.username}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold">Rating</p>
                  <div className="flex items-center">
                    {renderRatingStars(selectedReview.rating)}
                    <span className="ml-2">{selectedReview.rating}/5</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold">Status</p>
                  <p>{renderStatusBadge(selectedReview.status)}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-semibold">Game</p>
                <p>{selectedReview.game?.title}</p>
              </div>
              
              <div>
                <p className="text-sm font-semibold">Date Submitted</p>
                <p>{new Date(selectedReview.createdAt).toLocaleString()}</p>
              </div>
              
              <div>
                <p className="text-sm font-semibold">Comment</p>
                <div className="border p-3 rounded bg-muted mt-1">
                  <p className="text-sm">{selectedReview.comment || "No comment provided."}</p>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              {selectedReview.status === 'PENDING' && (
                <>
                  <Button onClick={() => openConfirmDialog(selectedReview, 'approve')} className="mr-2">
                    Approve
                  </Button>
                  <Button variant="destructive" onClick={() => openConfirmDialog(selectedReview, 'reject')}>
                    Reject
                  </Button>
                </>
              )}
              <Button variant="outline" onClick={() => setDetailsOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        {selectedReview && actionType && (
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Confirm {actionType === 'approve' ? 'Approval' : 'Rejection'}</DialogTitle>
              <DialogDescription>
                Are you sure you want to {actionType} this review?
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <p className="text-sm">
                <span className="font-semibold">{selectedReview.user?.username}</span> on {selectedReview.game?.title}:
              </p>
              <div className="flex items-center mt-1 mb-2">
                {renderRatingStars(selectedReview.rating)}
              </div>
              <div className="border p-3 rounded bg-muted">
                <p className="text-sm">{selectedReview.comment}</p>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant={actionType === 'approve' ? 'default' : 'destructive'} 
                onClick={handleAction}
              >
                {actionType === 'approve' ? 'Approve' : 'Reject'}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}

type StatCardProps = {
  title: string
  value: string | number
  status?: 'pending' | 'approved' | 'rejected'
  icon?: React.ReactNode
}

const StatCard = ({ title, value, status, icon }: StatCardProps) => {
  let bgColor = 'bg-card'
  
  if (status === 'approved') bgColor = 'bg-green-50 dark:bg-green-900/20'
  else if (status === 'rejected') bgColor = 'bg-red-50 dark:bg-red-900/20'
  
  return (
    <div className={`rounded-lg border p-3 ${bgColor}`}>
      <div className="flex justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {icon}
      </div>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  )
}