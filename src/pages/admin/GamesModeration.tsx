// src/pages/admin/GamesModeration.tsx
import { useEffect, useState } from 'react'
import { API } from '@/services/api'
import { Game, ApprovalStatus } from '@/types'

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
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Search,
  RefreshCw,
  Info,
  CheckCircle,
  X,
  XCircle,
} from 'lucide-react'

/* types */
type GameWithStatus = Game & { status: ApprovalStatus }

type FilterState = { status: ApprovalStatus | 'ALL'; search: string }

export default function GamesModeration() {
  /* data */
  const [games,    setGames]    = useState<GameWithStatus[]>([])
  const [filtered, setFiltered] = useState<GameWithStatus[]>([])
  const [loading,  setLoading]  = useState(true)

  /* selection & dialogs */
  const [selected,     setSelected]     = useState<Set<string>>(new Set())
  const [selectAll,    setSelectAll]    = useState(false)
  const [actGame,      setActGame]      = useState<GameWithStatus | null>(null)
  const [confirmOpen,  setConfirmOpen]  = useState(false)
  const [confirmType,  setConfirmType]  = useState<'approve' | 'reject' | null>(null)

  /* filters */
  const [filters, setFilters] = useState<FilterState>({
    status: 'PENDING',
    search: '',
  })

  /* ───────────────────── load ───────────────────── */
  const loadGames = async () => {
    setLoading(true)
    try {
      const data = await API.getAdminGames()
      setGames(data)
      applyFilters(data, filters)
    } catch {
      toast.error('Failed to fetch games')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadGames() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  /* ───────────────────── filter ─────────────────── */
  const applyFilters = (list: GameWithStatus[], f: FilterState) => {
    let res = [...list]
    if (f.status !== 'ALL') res = res.filter(g => g.status === f.status)
    if (f.search) {
      const q = f.search.toLowerCase()
      res = res.filter(
        g =>
          g.title.toLowerCase().includes(q) ||
          g.createdBy?.username?.toLowerCase().includes(q),
      )
    }
    setFiltered(res)
  }

  useEffect(() => applyFilters(games, filters), [games, filters])

  const setFilter = (k: keyof FilterState, v: string) =>
    setFilters(p => ({ ...p, [k]: v }))

  const resetFilters = () => setFilters({ status: 'PENDING', search: '' })

  const badge = (s: ApprovalStatus) =>
    s === 'PENDING'  ? <Badge variant="outline">Pending</Badge> :
    s === 'APPROVED' ? <Badge className="bg-green-600 text-white">Approved</Badge> :
                       <Badge variant="destructive">Rejected</Badge>

  /* ───────────────────── selection ─────────────── */
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
      setSelected(new Set(filtered.map(g => g.id)))
    }
    setSelectAll(!selectAll)
  }

  /* ───────────────────── actions ───────────────── */
  const askConfirm = (g: GameWithStatus, t: 'approve' | 'reject') => {
    setActGame(g)
    setConfirmType(t)
    setConfirmOpen(true)
  }

  const perform = async () => {
    if (!actGame || !confirmType) return
    try {
      if (confirmType === 'approve') await API.approveGame(actGame.id)
      else                            await API.rejectGame(actGame.id)

      toast.success(`Game ${confirmType}d`)
      setGames(p =>
        p.map(g =>
          g.id === actGame.id
            ? { ...g, status: confirmType === 'approve' ? 'APPROVED' : 'REJECTED' }
            : g,
        ),
      )
    } catch {
      toast.error('Action failed')
    } finally {
      setConfirmOpen(false)
      setActGame(null)
      setConfirmType(null)
    }
  }

  const batch = async (t: 'approve' | 'reject') => {
    if (!selected.size) return
    try {
      await Promise.all(
        Array.from(selected).map(id =>
          t === 'approve' ? API.approveGame(id) : API.rejectGame(id),
        ),
      )
      toast.success(`${selected.size} games ${t}d`)
      setGames(p =>
        p.map(g =>
          selected.has(g.id)
            ? { ...g, status: t === 'approve' ? 'APPROVED' : 'REJECTED' }
            : g,
        ),
      )
      setSelected(new Set())
      setSelectAll(false)
    } catch {
      toast.error('Batch failed')
    }
  }

  /* ───────────────────── render ────────────────── */
  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Game Moderation</h2>
        <Button variant="outline" size="sm" onClick={loadGames}>
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </div>

      {/* list card */}
      <Card>
        <CardHeader>
          <CardTitle>Games List</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* filters */}
          <div className="flex flex-wrap gap-2">
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

            {(filters.search || filters.status !== 'PENDING') && (
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

          {/* list */}
          {loading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No games found</p>
          ) : (
            <>
              {/* select-all */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={toggleAll}
                  className="mr-2"
                />
                <span className="text-sm">Select all</span>
              </div>

              {filtered.map(g => (
                <div
                  key={g.id}
                  className={`border rounded p-4 flex justify-between items-start ${
                    selected.has(g.id) ? 'border-primary' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={selected.has(g.id)}
                      onChange={() => toggle(g.id)}
                      className="mt-1"
                    />

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{g.title}</span>
                        {badge(g.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {g.genre} — by {g.createdBy?.username}
                      </p>
                    </div>
                  </div>

                  {/* actions */}
                  <div className="space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setActGame(g)
                        setConfirmType(null)
                        setConfirmOpen(true)
                      }}
                    >
                      <Info className="h-4 w-4 mr-1" /> Details
                    </Button>

                    {g.status === 'PENDING' && (
                      <>
                        <Button size="sm" onClick={() => askConfirm(g, 'approve')}>
                          <CheckCircle className="h-4 w-4 mr-1" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => askConfirm(g, 'reject')}
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

      {/* confirm / details dialog */}
      {actGame && (
        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {confirmType
                  ? `${confirmType === 'approve' ? 'Approve' : 'Reject'} "${actGame.title}"?`
                  : actGame.title}
              </DialogTitle>
            </DialogHeader>

            {!confirmType && (
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Genre:</span> {actGame.genre}
                </p>
                <p>
                  <span className="font-medium">Description:</span>{' '}
                  {actGame.description}
                </p>
                <p>
                  <span className="font-medium">Submitted by:</span>{' '}
                  {actGame.createdBy?.username}
                </p>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                Close
              </Button>

              {confirmType && (
                <Button
                  variant={confirmType === 'approve' ? 'default' : 'destructive'}
                  onClick={perform}
                >
                  {confirmType === 'approve' ? 'Approve' : 'Reject'}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
