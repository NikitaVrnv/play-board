// src/pages/admin/GamesModeration.tsx
import { useEffect, useState } from "react"
import { API } from "@/services/api"
import { Game, ApprovalStatus } from "@/types"
import { toast } from "@/components/ui/sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Search,
  RefreshCw,
  X,
  Info,
  AlertCircle,
  CheckCircle,
  XCircle,
  MoreHorizontal,
} from "lucide-react"
import { formatDate } from "@/utils/dateUtils"

type GameWithStatus = Game & {
  status: ApprovalStatus
}

type FilterState = {
  status: ApprovalStatus | "ALL"
  search: string
}

export default function GamesModeration() {
  const [games, setGames] = useState<GameWithStatus[]>([])
  const [filteredGames, setFilteredGames] = useState<GameWithStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState(false)
  const [selectedGame, setSelectedGame] = useState<GameWithStatus | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null)
  const [filters, setFilters] = useState<FilterState>({ status: "PENDING", search: "" })
  const [selectedGames, setSelectedGames] = useState<Set<string>>(new Set())
  const [selectAll, setSelectAll] = useState(false)

  useEffect(() => {
    loadGames()
  }, [])

  const loadGames = async () => {
    setLoading(true)
    setApiError(false)

    try {
      const allGames = await API.getAdminGames()
      setGames(allGames)
      applyFilters(allGames, filters)
    } catch (error) {
      console.error("API Error:", error)
      toast.error("Failed to fetch games from API")
      setApiError(true)
      setGames([])
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = (gamesList: GameWithStatus[], currentFilters: FilterState) => {
    let result = [...gamesList]

    if (currentFilters.status !== "ALL") {
      result = result.filter((g) => g.status === currentFilters.status)
    }

    if (currentFilters.search) {
      const q = currentFilters.search.toLowerCase()
      result = result.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          (g.createdBy?.username && g.createdBy.username.toLowerCase().includes(q))
      )
    }

    setFilteredGames(result)
  }

  useEffect(() => {
    applyFilters(games, filters)
  }, [filters, games])

  const updateFilter = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value as any }))
    setSelectedGames(new Set())
    setSelectAll(false)
  }

  const resetFilters = () => {
    setFilters({ status: "PENDING", search: "" })
    setSelectedGames(new Set())
    setSelectAll(false)
  }

  const openConfirmDialog = (game: GameWithStatus, action: "approve" | "reject") => {
    setSelectedGame(game)
    setActionType(action)
    setConfirmDialogOpen(true)
  }

  const handleAction = async () => {
    if (!selectedGame || !actionType) return

    try {
      if (actionType === "approve") {
        await API.approveGame(selectedGame.id)
      } else {
        await API.rejectGame(selectedGame.id)
      }

      toast.success(`Game "${selectedGame.title}" ${actionType}d`)
      setGames((prev) =>
        prev.map((g) =>
          g.id === selectedGame.id
            ? { ...g, status: actionType === "approve" ? "APPROVED" : "REJECTED" }
            : g
        )
      )
    } catch (error: any) {
      toast.error(error?.message || "Failed to process action")
    } finally {
      setConfirmDialogOpen(false)
      setSelectedGame(null)
      setActionType(null)
    }
  }

  const handleBatchAction = async (action: "approve" | "reject") => {
    if (selectedGames.size === 0) return

    try {
      const promises = Array.from(selectedGames).map((id) =>
        action === "approve" ? API.approveGame(id) : API.rejectGame(id)
      )
      await Promise.all(promises)

      toast.success(`Batch ${action} successful`)
      setGames((prev) =>
        prev.map((g) =>
          selectedGames.has(g.id)
            ? { ...g, status: action === "approve" ? "APPROVED" : "REJECTED" }
            : g
        )
      )
    } catch (error) {
      toast.error("Batch action failed")
    } finally {
      setSelectedGames(new Set())
      setSelectAll(false)
    }
  }

  const toggleSelectGame = (id: string) => {
    setSelectedGames((prev) => {
      const updated = new Set(prev)
      updated.has(id) ? updated.delete(id) : updated.add(id)
      return updated
    })
  }

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedGames(new Set())
    } else {
      setSelectedGames(new Set(filteredGames.map((g) => g.id)))
    }
    setSelectAll(!selectAll)
  }

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="outline">Pending</Badge>
      case "APPROVED":
        return <Badge className="bg-green-600 text-white">Approved</Badge>
      case "REJECTED":
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Game Moderation</h2>
        <Button onClick={loadGames} size="sm" variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {apiError && (
        <div className="p-4 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100 border-l-4 border-yellow-500">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            API failed. Make sure the backend is running.
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Games List</CardTitle>
            <div className="flex gap-2 items-center">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={filters.search}
                  onChange={(e) => updateFilter("search", e.target.value)}
                  className="pl-8 w-[180px]"
                />
              </div>

              <Select value={filters.status} onValueChange={(v) => updateFilter("status", v)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>

              {(filters.search || filters.status !== "PENDING") && (
                <Button size="icon" variant="ghost" onClick={resetFilters}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between p-4 border rounded">
                  <Skeleton className="w-40 h-5" />
                  <Skeleton className="w-20 h-9" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {filteredGames.length === 0 ? (
                <div className="text-center text-muted-foreground">No games found</div>
              ) : (
                <>
                  {selectedGames.size > 0 && (
                    <div className="flex justify-between p-2 bg-muted rounded">
                      <span>{selectedGames.size} selected</span>
                      <div className="space-x-2">
                        <Button size="sm" onClick={() => handleBatchAction("approve")}>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleBatchAction("reject")}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={toggleSelectAll}
                      className="mr-2"
                    />
                    <span className="text-sm">Select all</span>
                  </div>

                  {filteredGames.map((game) => (
                    <div
                      key={game.id}
                      className={`border rounded p-4 flex justify-between items-center ${
                        selectedGames.has(game.id) ? "border-primary" : ""
                      }`}
                    >
                      <div className="flex gap-4 items-center">
                        <input
                          type="checkbox"
                          checked={selectedGames.has(game.id)}
                          onChange={() => toggleSelectGame(game.id)}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{game.title}</span>
                            {renderStatusBadge(game.status)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {game.genre} — by {game.createdBy?.username}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => showGameDetails(game)}>
                          <Info className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                        {game.status === "PENDING" ? (
                          <>
                            <Button size="sm" onClick={() => openConfirmDialog(game, "approve")}>
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => openConfirmDialog(game, "reject")}
                            >
                              Reject
                            </Button>
                          </>
                        ) : (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="outline">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              {game.status === "APPROVED" ? (
                                <DropdownMenuItem onClick={() => openConfirmDialog(game, "reject")}>
                                  Reject instead
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => openConfirmDialog(game, "approve")}>
                                  Approve instead
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        {selectedGame && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedGame.title}</DialogTitle>
              <DialogDescription>
                Submitted by {selectedGame.createdBy?.username || "unknown"}
              </DialogDescription>
            </DialogHeader>
            <div className="py-2 text-sm">{selectedGame.description}</div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDetailsOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        {selectedGame && actionType && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm {actionType}</DialogTitle>
              <DialogDescription>
                Are you sure you want to {actionType} "{selectedGame.title}"?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant={actionType === "approve" ? "default" : "destructive"}
                onClick={handleAction}
              >
                {actionType === "approve" ? "Approve" : "Reject"}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
