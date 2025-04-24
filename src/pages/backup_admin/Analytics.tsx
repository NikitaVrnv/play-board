// src/pages/admin/Analytics.tsx

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { API } from "@/services/api"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { Download, RefreshCw } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#d14476", "#4dabf5"];

// Simple date range type
type DateRange = {
  from: Date;
  to: Date;
};

type TimelinePoint = {
  date: string;
  users: number;
  games: number;
  reviews: number;
};

export default function Analytics() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date()
  })
  
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');
  
  // User activity over time
  const { data: timelineData, isLoading: timelineLoading, refetch: refetchTimeline } = useQuery({
    queryKey: ["admin-user-timeline", dateRange],
    queryFn: () => API.getAdminStats("custom", {
      startDate: format(dateRange.from, "yyyy-MM-dd"),
      endDate: format(dateRange.to, "yyyy-MM-dd")
    }),
  })
  
  const refreshData = () => {
    refetchTimeline();
  }
  
  const handleExport = async (dataType: 'users' | 'games' | 'reviews') => {
    try {
      const blob = await API.exportAdminData(dataType, exportFormat);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${dataType}-export.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  }
  
  // Sample data for when API doesn't return anything
  const sampleTimelineData: TimelinePoint[] = [
    { date: "2023-01-01", users: 5, games: 2, reviews: 8 },
    { date: "2023-01-02", users: 3, games: 1, reviews: 5 },
    { date: "2023-01-03", users: 7, games: 3, reviews: 12 },
    { date: "2023-01-04", users: 4, games: 2, reviews: 6 },
    { date: "2023-01-05", users: 8, games: 4, reviews: 15 },
  ]
  
  // Distribution data
  const distributionData = [
    { name: "Users", value: 150 },
    { name: "Games", value: 75 },
    { name: "Reviews", value: 230 },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h1>
        <div className="flex items-center gap-2">
          {/* We'll skip DateRangePicker for now */}
          <Button variant="outline" size="icon" onClick={refreshData} className="ml-2">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="export">Export Data</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Activity Timeline</CardTitle>
              <CardDescription>New users, games and reviews over time</CardDescription>
            </CardHeader>
            <CardContent>
              {timelineLoading ? (
                <div className="h-80 flex items-center justify-center text-muted">Loading timeline data...</div>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={timelineData?.timeline || sampleTimelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="users" 
                      stroke="#8884d8" 
                      activeDot={{ r: 8 }} 
                      name="New Users" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="games" 
                      stroke="#82ca9d" 
                      name="Games Submitted" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="reviews" 
                      stroke="#ffc658" 
                      name="Reviews Written" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Content Distribution</CardTitle>
                <CardDescription>Distribution of users, games and reviews</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={distributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}`, 'Count']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Activity by Type</CardTitle>
                <CardDescription>Content creation activity</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={timelineData?.timeline || sampleTimelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="games" fill="#82ca9d" name="Games" />
                    <Bar dataKey="reviews" fill="#ffc658" name="Reviews" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Export Data</CardTitle>
              <CardDescription>Export your data in different formats</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="font-medium">Format:</span>
                  <Select
                    value={exportFormat}
                    onValueChange={(value) => setExportFormat(value as 'csv' | 'json')}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Users Data</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Export all user accounts and their metadata.
                      </p>
                      <Button 
                        className="w-full" 
                        onClick={() => handleExport('users')}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Export Users
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Games Data</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Export all games and their metadata.
                      </p>
                      <Button 
                        className="w-full" 
                        onClick={() => handleExport('games')}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Export Games
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Reviews Data</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Export all reviews and their metadata.
                      </p>
                      <Button 
                        className="w-full" 
                        onClick={() => handleExport('reviews')}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Export Reviews
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
