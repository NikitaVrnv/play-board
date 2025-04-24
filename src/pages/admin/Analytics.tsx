// src/pages/admin/Analytics.tsx
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { API } from '@/services/api'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RefreshCw, Download } from 'lucide-react'

/* colors */
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#d14476', '#4dabf5']

/* sample fallback */
const sample = [
  { date: '2023-01-01', users: 5, games: 2, reviews: 8 },
  { date: '2023-01-02', users: 3, games: 1, reviews: 5 },
  { date: '2023-01-03', users: 7, games: 3, reviews: 12 },
  { date: '2023-01-04', users: 4, games: 2, reviews: 6 },
  { date: '2023-01-05', users: 8, games: 4, reviews: 15 },
]

export default function Analytics() {
  const [exportFmt, setExportFmt] = useState<'csv' | 'json'>('csv')

  /* last 30 days */
  const from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const to   = new Date()

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-analytics', from, to],
    queryFn : () =>
      API.getAdminStats('custom', {
        startDate: format(from, 'yyyy-MM-dd'),
        endDate  : format(to,   'yyyy-MM-dd'),
      }),
  })

  const exportData = async (type: 'users' | 'games' | 'reviews') => {
    try {
      const blob = await API.exportAdminData(type, exportFmt)
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href      = url
      a.download  = `${type}-export.${exportFmt}`
      document.body.appendChild(a)
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      // eslint-disable-next-line no-console
      console.error('Export failed')
    }
  }

  /* distribution pie placeholder */
  const dist = [
    { name: 'Users',   value: 150 },
    { name: 'Games',   value: 75  },
    { name: 'Reviews', value: 230 },
  ]

  /* ───────── render ───────── */
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h1>
        <Button variant="outline" size="icon" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        {/* overview */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User / Game / Review Timeline</CardTitle>
              <CardDescription>Last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-80 flex items-center justify-center text-muted-foreground">
                  Loading…
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={data?.timeline ?? sample}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="users"   stroke={COLORS[0]} name="Users" />
                    <Line type="monotone" dataKey="games"   stroke={COLORS[1]} name="Games" />
                    <Line type="monotone" dataKey="reviews" stroke={COLORS[2]} name="Reviews" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Content Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dist}
                      cx="50%"
                      cy="50%"
                      labelLine
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {dist.map((e, i) => (
                        <Cell key={e.name} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* bar */}
            <Card>
              <CardHeader>
                <CardTitle>Daily Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data?.timeline ?? sample}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="games"   fill={COLORS[1]} name="Games" />
                    <Bar dataKey="reviews" fill={COLORS[2]} name="Reviews" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* export */}
        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Export Data</CardTitle>
              <CardDescription>Choose format & content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="font-medium">Format:</span>
                <Select value={exportFmt} onValueChange={v => setExportFmt(v as any)}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(['users', 'games', 'reviews'] as const).map(t => (
                  <Card key={t}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg capitalize">{t}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button
                        className="w-full"
                        onClick={() => exportData(t)}
                      >
                        <Download className="h-4 w-4 mr-2" /> Export
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
