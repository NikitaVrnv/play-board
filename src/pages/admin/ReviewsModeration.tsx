// src/pages/admin/ReviewsModeration.tsx
import { useEffect, useState } from 'react'
import { API } from '@/services/api'
import { Review, ApprovalStatus } from '@/types'

import { toast } from '@/components/ui/sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Search,
  RefreshCw,
  Info,
  Star,
  CheckCircle,
  X,
  XCircle,
} from 'lucide-react'

/* ──────────────────────────────────────────────────────────────────────────── */
/* types                                                                     */
type ReviewWithStatus = Review & { status: ApprovalStatus }

type FilterState = {
  status: ApprovalStatus | 'ALL'
  rating: string /* 'ALL' | '1'-'5' */
  search: string
}

/* ──────────────────────────────────────────────────────────────────────────── */
export default function ReviewsModeration() {
  /* data */
  const [reviews,         setReviews]         = useState<ReviewWithStatus[]>([])
  const [filtered,        setFiltered]        = useState<ReviewWithStatus[]>([])
  const [loading,         setLoading]         = useState(true)

  /* ui / selection */
  const [selected,        setSelected]        = useState<Set<string>>(new Set())
  const [selectAll,       setSelectAll]       = useState(false)

  /* dialogs */
  const [detailsOpen,     setDetailsOpen]     = useState(false)
  const [confirmOpen,     setConfirmOpen]     = useState(false)
  const [confirmType,     setConfirmType]     = useState<'approve' | 'reject' | null>(null)
  const [activeReview,    setActiveReview]    = useState<ReviewWithStatus | null>(null)

  /* filters */
  const [filters, setFilters] = useState<FilterState>({
    status : 'PENDING',
    rating : 'ALL',
    search : '',
  })

  /* quick stats */
  const [stats, setStats] = useState({
    total    : 0,
    pending  : 0,
    approved : 0,
    rejected : 0,
    avg      : 0,
  })

  /* ───────────────────────────────── load + derive ───────────────────────── */
  const loadReviews = async () => {
    setLoading(true)
    try {
      const data = await API.getAdminReviews()
      setReviews(data)
      applyFilters(data, filters)

      const totals = {
        total    : data.length,
        pending  : data.filter(r => r.status === 'PENDING').length,
        approved : data.filter(r => r.status === 'APPROVED').length,
        rejected : data.filter(r => r.status === 'REJECTED').length,
        avg      : data.length ? data.reduce((s, r) => s + r.rating, 0) / data.length : 0,
      }
      setStats(totals)
    } catch (e) {
      toast.error('Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadReviews() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  /* ────────────────────────────── filtering ──────────────────────────────── */
  const applyFilters = (list: ReviewWithStatus[], f: FilterState) => {
    let res = [...list]

    if (f.status !== 'ALL') res = res.filter(r => r.status === f.status)
    if (f.rating !== 'ALL') res = res.filter(r => r.rating === Number(f.rating))
    if (f.search) {
      const q = f.search.toLowerCase()
      res = res.filter(
        r =>
          r.user?.username?.toLowerCase().includes(q) ||
          r.game?.title?.toLowerCase().includes(q)   ||
          r.comment?.toLowerCase().includes(q),
      )
    }
    setFiltered(res)
  }

  /* re-run when filters / data change */
  useEffect(() => applyFilters(reviews, filters), [reviews, filters])

  /* helpers ---------------------------------------------------------------- */
  const setFilter = (k: keyof FilterState, v: string) =>
    setFilters(prev => ({ ...prev, [k]: v }))

  const resetFilters = () => {
    setFilters({ status: 'PENDING', rating: 'ALL', search: '' })
    setSelected(new Set())
    setSelectAll(false)
  }

  const renderBadge = (s: ApprovalStatus) =>
    s === 'PENDING'  ? <Badge variant="outline">Pending</Badge> :
    s === 'APPROVED' ? <Badge className="bg-green-600 text-white">Approved</Badge> :
                       <Badge variant="destructive">Rejected</Badge>

  const renderStars = (n: number) => (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          className={i < n ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}
        />
      ))}
    </div>
  )

  /* ────────────────────────────── actions ───────────────────────────────── */
  const askConfirm = (rev: ReviewWithStatus, action: 'approve' | 'reject') => {
    setActiveReview(rev)
    setConfirmType(action)
    setConfirmOpen(true)
  }

  const performAction = async () => {
    if (!activeReview || !confirmType) return
    try {
      if (confirmType === 'approve') {
        await API.approveReview(activeReview.id)
      } else {
        await API.rejectReview(activeReview.id)
      }
      toast.success(`Review ${confirmType}d`)
      setReviews(prev =>
        prev.map(r =>
          r.id === activeReview.id
            ? { ...r, status: confirmType === 'approve' ? 'APPROVED' : 'REJECTED' }
            : r,
        ),
      )
    } catch {
      toast.error('Action failed')
    } finally {
      setConfirmOpen(false)
      setActiveReview(null)
      setConfirmType(null)
    }
  }

  /* batch ------------------------------------------------------------------ */
  const batch = async (action: 'approve' | 'reject') => {
    if (!selected.size) return
    try {
      await Promise.all(
        Array.from(selected).map(id =>
          action === 'approve' ? API.approveReview(id) : API.rejectReview(id),
        ),
      )
      toast.success(`${selected.size} reviews ${action}d`)
      setReviews(prev =>
        prev.map(r =>
          selected.has(r.id)
            ? { ...r, status: action === 'approve' ? 'APPROVED' : 'REJECTED' }
            : r,
        ),
      )
      setSelected(new Set())
      setSelectAll(false)
    } catch {
      toast.error('Batch failed')
    }
  }

  /* ────────────────────────────── selection ─────────────────────────────── */
  const toggle = (id: string) =>
    setSelected(p => {
      const s = new Set(p)
      s.has(id) ? s.delete(id) : s.add(id)
      return s
    })

  const toggleAll = () => {
    if (selectAll) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filtered.map(r => r.id)))
    }
    setSelectAll(!selectAll)
  }

  /* ─────────────────────────────── render ───────────────────────────────── */
  return (
    <div className="space-y-4">
      {/* header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Review Moderation</h2>

        <Button variant="outline" size="sm" onClick={loadReviews}>
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </div>

      {/* quick-stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          ['Total Reviews',  stats.total],
          ['Pending',        stats.pending],
          ['Approved',       stats.approved],
          ['Rejected',       stats.rejected],
          ['Avg. Rating',    stats.avg.toFixed(1)],
        ].map(([t, v]) => (
          <Card key={t as string}>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">{t}</p>
              <p className="text-2xl font-bold">{v}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* list card */}
      <Card>
        <CardHeader>
          <CardTitle>Reviews List</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* filters */}
          <div className="flex flex-wrap gap-2">
            {/* search */}
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search…"
                value={filters.search}
                onChange={e => setFilter('search', e.target.value)}
                className="pl-8 w-48"
              />
              {filters.search && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setFilter('search', '')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* status */}
            <Select value={filters.status} onValueChange={v => setFilter('status', v)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(s => (
                  <SelectItem key={s} value={s}>
                    {s[0] + s.slice(1).toLowerCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* rating */}
            <Select value={filters.rating} onValueChange={v => setFilter('rating', v)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All ratings</SelectItem>
                {[1, 2, 3, 4, 5].map(n => (
                  <SelectItem key={n} value={String(n)}>
                    {'★'.repeat(n)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(filters.search ||
              filters.status !== 'PENDING' ||
              filters.rating !== 'ALL') && (
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                <X className="h-4 w-4 mr-1" /> Reset
              </Button>
            )}
          </div>

          {/* selection bar */}
          {selected.size > 0 && (
            <div className="flex justify-between items-center p-2 bg-muted rounded">
              <span>{selected.size} selected</span>
              <div className="space-x-2">
                <Button size="sm" onClick={() => batch('approve')}>
                  <CheckCircle className="h-4 w-4 mr-1" /> Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => batch('reject')}
                >
                  <XCircle className="h-4 w-4 mr-1" /> Reject
                </Button>
              </div>
            </div>
          )}

          {/* table/list */}
          {loading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No reviews found
            </p>
          ) : (
            <>
              {/* select-all */}
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={toggleAll}
                  className="mr-2"
                />
                <span className="text-sm">Select all</span>
              </div>

              {/* list items */}
              {filtered.map(r => (
                <div
                  key={r.id}
                  className={`border rounded p-4 flex gap-4 items-start ${
                    selected.has(r.id) ? 'border-primary' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected.has(r.id)}
                    onChange={() => toggle(r.id)}
                    className="mt-1"
                  />

                  <div className="flex-1 space-y-1">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{r.user?.username}</span>
                        <span className="text-muted-foreground">on</span>
                        <span className="italic">{r.game?.title}</span>
                        {renderBadge(r.status)}
                      </div>
                      <div className="flex items-center gap-2">
                        {renderStars(r.rating)}
                        <span className="text-xs text-muted-foreground">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm line-clamp-2">"{r.comment}"</p>
                  </div>

                  {/* actions */}
                  <div className="space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setActiveReview(r)
                        setDetailsOpen(true)
                      }}
                    >
                      <Info className="h-4 w-4 mr-1" /> Details
                    </Button>

                    {r.status === 'PENDING' && (
                      <>
                        <Button size="sm" onClick={() => askConfirm(r, 'approve')}>
                          <CheckCircle className="h-4 w-4 mr-1" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => askConfirm(r, 'reject')}
                        >
                          <XCircle className="h-4 w-4 mr-1" /> Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}
        </CardContent>
      </Card>

      {/* details dialog */}
      {activeReview && (
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                Review by {activeReview.user?.username} on {activeReview.game?.title}
              </DialogTitle>
              <DialogDescription className="flex items-center gap-2">
                {renderStars(activeReview.rating)}
                {renderBadge(activeReview.status)}
              </DialogDescription>
            </DialogHeader>

            <p className="whitespace-pre-line">{activeReview.comment}</p>

            <DialogFooter>
              <Button onClick={() => setDetailsOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* confirm dialog */}
      {activeReview && confirmType && (
        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {confirmType === 'approve' ? 'Approve' : 'Reject'} review?
              </DialogTitle>
              <DialogDescription>
                This action can be reverted from the API but not here in the UI.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setConfirmOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant={confirmType === 'approve' ? 'default' : 'destructive'}
                onClick={performAction}
              >
                {confirmType === 'approve' ? 'Approve' : 'Reject'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
