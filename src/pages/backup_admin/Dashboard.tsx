// src/pages/admin/Dashboard.tsx
import { useEffect, useState } from 'react';
import { API } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Types
type DashboardSummary = {
  totalGames: number;
  totalUsers: number;
  totalReviews: number;
  pendingGames: number;
  pendingReviews: number;
  recentActivity: Array<{
    id: string;
    type: string;
    title: string;
    timestamp: string;
    user?: {
      id: string;
      username: string;
    }
  }>;
};

type GenreStats = Array<{
  genre: string;
  count: number;
}>;

type RatingDistribution = Array<{
  rating: number;
  count: number;
}>;

type TimeSeriesData = {
  gameStats: {
    timeSeries: Array<{ date: string; count: number }>;
    total: number;
  };
  userStats: {
    timeSeries: Array<{ date: string; count: number }>;
    total: number;
  };
  reviewStats: {
    timeSeries: Array<{ date: string; count: number }>;
    total: number;
  };
};

// Chart colors
const COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

export default function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [genreStats, setGenreStats] = useState<GenreStats | null>(null);
  const [ratingDistribution, setRatingDistribution] = useState<RatingDistribution | null>(null);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  // Load all dashboard data
  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load summary data
      const summaryData = await API.getAdminSummary();
      setSummary(summaryData);
      
      // Load time series data based on selected time range
      await loadTimeSeriesData(timeRange);
      
      // Load genre stats
      try {
        const genreData = await API.getAdminGenreStats();
        setGenreStats(genreData);
      } catch (err) {
        console.error('Failed to load genre stats:', err);
      }
      
      // Load rating distribution
      try {
        const ratingData = await API.getAdminRatingDistribution();
        setRatingDistribution(ratingData);
      } catch (err) {
        console.error('Failed to load rating distribution:', err);
      }
      
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Load time series data for a specific range
  const loadTimeSeriesData = async (range: 'daily' | 'weekly' | 'monthly') => {
    setStatsLoading(true);
    try {
      const data = await API.getAdminStats(range);
      setTimeSeriesData(data);
    } catch (err) {
      console.error(`Failed to load ${range} time series data:`, err);
    } finally {
      setStatsLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    loadDashboardData();
  }, []);

  // When time range changes, reload time series data
  useEffect(() => {
    loadTimeSeriesData(timeRange);
  }, [timeRange]);

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // Get activity type label
  const getActivityTypeLabel = (type: string) => {
    switch (type) {
      case 'game_added':
        return 'Game Added';
      case 'review_added':
        return 'Review Posted';
      case 'user_registered':
        return 'User Registered';
      default:
        return 'Activity';
    }
  };

  // Format time period label for charts
  const formatTimePeriodLabel = (period: string) => {
    if (!period) return '';
    
    if (timeRange === 'daily') {
      return new Date(period).toLocaleDateString();
    } else if (timeRange === 'weekly') {
      const [year, week] = period.split('-W');
      return `Week ${week}, ${year}`;
    } else {
      const [year, month] = period.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      return date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Admin Dashboard</h2>
        <Button 
          variant="outline" 
          onClick={loadDashboardData} 
          disabled={loading || statsLoading}
        >
          Refresh Data
        </Button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            {error}
          </p>
        </div>
      )}
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              <>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Card key={i}>
                    <CardHeader className="pb-2">
                      <Skeleton className="h-5 w-40" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-10 w-16" />
                    </CardContent>
                  </Card>
                ))}
              </>
            ) : (
              <>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Games</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{summary?.totalGames || 0}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{summary?.totalUsers || 0}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{summary?.totalReviews || 0}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Pending Games</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{summary?.pendingGames || 0}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{summary?.pendingReviews || 0}</div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
          
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex justify-between border-b pb-4 last:border-0 last:pb-0">
                      <div>
                        <Skeleton className="h-5 w-48 mb-1" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="h-4 w-32" />
                    </div>
                  ))}
                </div>
              ) : summary?.recentActivity && summary.recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {summary.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex justify-between border-b pb-4 last:border-0 last:pb-0">
                      <div>
                        <p className="font-medium">{activity.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {getActivityTypeLabel(activity.type)} by {activity.user?.username || 'Unknown user'}
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(activity.timestamp)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No recent activity
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          {/* Time Period Selector */}
          <div className="flex items-center justify-end">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Time Range:</span>
            </div>
            <Select value={timeRange} onValueChange={(value: 'daily' | 'weekly' | 'monthly') => setTimeRange(value)}>
              <SelectTrigger className="w-[150px] ml-2">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Time Series Charts */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Games Growth */}
            <Card>
              <CardHeader>
                <CardTitle>Games Growth</CardTitle>
                <CardDescription>New games added over time</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {statsLoading || loading ? (
                  <Skeleton className="h-full w-full" />
                ) : timeSeriesData && timeSeriesData.gameStats.timeSeries.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timeSeriesData.gameStats.timeSeries}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={formatTimePeriodLabel}
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={formatTimePeriodLabel}
                        formatter={(value) => [`${value}`, 'New Games']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="count" 
                        stroke={COLORS[0]} 
                        activeDot={{ r: 8 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No game growth data available
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* User Growth */}
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>New user registrations over time</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {statsLoading || loading ? (
                  <Skeleton className="h-full w-full" />
                ) : timeSeriesData && timeSeriesData.userStats.timeSeries.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timeSeriesData.userStats.timeSeries}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={formatTimePeriodLabel}
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={formatTimePeriodLabel}
                        formatter={(value) => [`${value}`, 'New Users']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="count" 
                        stroke={COLORS[1]} 
                        activeDot={{ r: 8 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No user growth data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Genre Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Games by Genre</CardTitle>
              <CardDescription>Distribution of games across genres</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              {statsLoading || loading ? (
                <Skeleton className="h-full w-full" />
              ) : genreStats && genreStats.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={genreStats}
                    margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="genre" 
                      angle={-45}
                      textAnchor="end"
                      height={70}
                    />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}`, 'Games']} />
                    <Bar dataKey="count" fill={COLORS[2]}>
                      {genreStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No genre data available
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Rating Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Rating Distribution</CardTitle>
              <CardDescription>Distribution of ratings across all reviews</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              {statsLoading || loading ? (
                <Skeleton className="h-full w-full" />
              ) : ratingDistribution && ratingDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={ratingDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={120}
                      dataKey="count"
                      nameKey="rating"
                      label={({ rating, count, percent }) => `${rating} ★: ${count} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {ratingDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value} Reviews`, `${name} Stars`]} />
                    <Legend formatter={(value) => `${value} Stars`} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No rating data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}