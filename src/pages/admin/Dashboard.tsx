// src/pages/admin/Dashboard.tsx
import { useEffect, useState } from 'react'
import { API } from '@/services/api'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, Calendar } from 'lucide-react'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

/* ─────────────────────── types ─────────────────────── */
type DashboardSummary = {
  totalGames: number
  totalUsers: number
  totalReviews: number
  pendingGames: number
  pendingReviews: number
  recentActivity: {
    id: string
    type: 'game_added' | 'review_added' | 'user_registered'
    title: string
    timestamp: string
    user?: { id: string; username: string }
  }[]
}

type TimeSeriesPoint = { date: string; count: number }

type StatsData = {
  gameStats: { timeSeries: TimeSeriesPoint[] }
  userStats: { timeSeries: TimeSeriesPoint[] }
  reviewStats: { timeSeries: TimeSeriesPoint[] }
}

/* colors */
const COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']

/* ───────────────────────── component ───────────────────────── */
export default function Dashboard() {
  const [summary, setSummary]               = useState<DashboardSummary | null>(null)
  const [series,  setSeries]                = useState<StatsData | null>(null)
  const [loading, setLoading]               = useState(true)
  const [statsLoading, setStatsLoading]     = useState(false)
  const [error,   setError]                 = useState<string | null>(null)
  const [range,   setRange]                 = useState<'daily' | 'weekly' | 'monthly'>('monthly')

  /* ───────────── load ───────────── */
  const loadAll = async () => {
    setLoading(true); setError(null)
    try {
      const s = await API.getAdminSummary()
      setSummary(s)
      await loadSeries(range)
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  const loadSeries = async (r: 'daily' | 'weekly' | 'monthly') => {
    setStatsLoading(true)
    try {
      const d = await API.getAdminStats(r)
      setSeries(d)
    } finally {
      setStatsLoading(false)
    }
  }

  useEffect(() => { loadAll() }, []) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { loadSeries(range) }, [range]) // eslint-disable-line react-hooks/exhaustive-deps

  /* helpers */
  const fmtDate = (d: string) => new Date(d).toLocaleString()

  /* ───────────── render ─────────── */
  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Admin Dashboard</h2>
        <Button variant="outline" onClick={loadAll} disabled={loading || statsLoading}>
          Refresh
        </Button>
      </div>

      {/* error */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center">
          <AlertCircle className="h-4 w-4 mr-2" /> {error}
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* ───────── overview ───────── */}
        <TabsContent value="overview" className="space-y-4">
          {/* stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading
              ? [...Array(5)].map((_, i) => (
                  <Card key={i}>
                    <CardHeader className="pb-2">
                      <Skeleton className="h-5 w-40" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-10 w-16" />
                    </CardContent>
                  </Card>
                ))
              : summary && (
                  <>
                    {[
                      ['Total Games',      summary.totalGames],
                      ['Total Users',      summary.totalUsers],
                      ['Total Reviews',    summary.totalReviews],
                      ['Pending Games',    summary.pendingGames],
                      ['Pending Reviews',  summary.pendingReviews],
                    ].map(([t, v]) => (
                      <Card key={t as string}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">{t}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{v}</div>
                        </CardContent>
                      </Card>
                    ))}
                  </>
                )}
          </div>

          {/* recent activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : summary?.recentActivity.length ? (
                <div className="space-y-4">
                  {summary.recentActivity.map(a => (
                    <div
                      key={a.id}
                      className="flex justify-between border-b pb-3 last:border-0 last:pb-0"
                    >
                      <div>
                        <p className="font-medium">{a.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {a.type.replace('_', ' ')} by {a.user?.username ?? 'Unknown'}
                        </p>
                      </div>
                      <span className="text-sm text-muted-foreground">{fmtDate(a.timestamp)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-6">No recent activity</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ───────── analytics ───────── */}
        <TabsContent value="analytics" className="space-y-4">
          {/* time-range picker */}
          <div className="flex items-center justify-end gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Range:</span>
            <Select value={range} onValueChange={v => setRange(v as any)}>
              <SelectTrigger className="w-32 ml-2">
                <SelectValue placeholder="Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* games */}
            <Card>
              <CardHeader>
                <CardTitle>Games Growth</CardTitle>
                <CardDescription>New games added over time</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {statsLoading || loading ? (
                  <Skeleton className="h-full w-full" />
                ) : series?.gameStats.timeSeries.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={series.gameStats.timeSeries}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke={COLORS[0]}
                        name="Games"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="flex items-center justify-center h-full text-muted-foreground">
                    No data
                  </p>
                )}
              </CardContent>
            </Card>

            {/* users */}
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>New users over time</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {statsLoading || loading ? (
                  <Skeleton className="h-full w-full" />
                ) : series?.userStats.timeSeries.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={series.userStats.timeSeries}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke={COLORS[1]}
                        name="Users"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="flex items-center justify-center h-full text-muted-foreground">
                    No data
                  </p>
                )}
              </CardContent>
            </Card>

            {/* reviews */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Reviews Growth</CardTitle>
                <CardDescription>New reviews over time</CardDescription>
              </CardHeader>
              <CardContent className="h-[320px]">
                {statsLoading || loading ? (
                  <Skeleton className="h-full w-full" />
                ) : series?.reviewStats.timeSeries.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={series.reviewStats.timeSeries}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke={COLORS[2]}
                        name="Reviews"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="flex items-center justify-center h-full text-muted-foreground">
                    No data
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
