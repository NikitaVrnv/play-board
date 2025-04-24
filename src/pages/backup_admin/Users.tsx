// src/pages/admin/Users.tsx

import { useEffect, useState } from "react"
import { API } from "@/services/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, RefreshCw, Users as UsersIcon } from "lucide-react"

export default function Users() {
  const [users, setUsers] = useState<Array<any>>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all") // Changed from empty string to "all"

  const loadUsers = async () => {
    setLoading(true)
    try {
      const data = await API.getAdminUsers({
        search: searchTerm,
        role: roleFilter !== "all" ? roleFilter : undefined,
      })
      setUsers(data)
    } catch (error) {
      console.error("Failed to load users", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [searchTerm, roleFilter])

  const resetFilters = () => {
    setSearchTerm("")
    setRoleFilter("all")
  }

  const clearSearch = () => {
    setSearchTerm("")
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">User Management</h2>
        <Button onClick={loadUsers} size="sm" variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Statistics</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard 
            title="Total Users" 
            value={users.length} 
            icon={<UsersIcon className="h-4 w-4" />} 
            loading={loading} 
          />
          <StatCard 
            title="Admin Users" 
            value={users.filter(u => u.role === "admin").length} 
            icon={<UsersIcon className="h-4 w-4" />} 
            loading={loading} 
          />
          <StatCard 
            title="Regular Users" 
            value={users.filter(u => u.role === "user").length} 
            icon={<UsersIcon className="h-4 w-4" />} 
            loading={loading} 
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Users List</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-8 w-[200px]"
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full aspect-square p-0 hover:bg-transparent"
                    onClick={clearSearch}
                  >
                    X
                  </Button>
                )}
              </div>
              
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              
              {(searchTerm || roleFilter !== "all") && (
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground">No users found</div>
              <Button variant="outline" size="sm" className="mt-4" onClick={resetFilters}>
                Reset Filters
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-center">Games Submitted</TableHead>
                    <TableHead className="text-center">Reviews Submitted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.username}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        <Badge variant={u.role === "admin" ? "default" : "outline"}>
                          {u.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">{u._count?.games || 0}</TableCell>
                      <TableCell className="text-center">{u._count?.reviews || 0}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

type StatCardProps = {
  title: string
  value: number
  icon: React.ReactNode
  loading?: boolean
}

const StatCard = ({ title, value, icon, loading }: StatCardProps) => (
  <div className="flex items-center space-x-4 rounded-md border p-4">
    <div className="flex-shrink-0 rounded-full p-2 bg-primary/10">
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium leading-none">{title}</p>
      {loading ? (
        <div className="h-6 w-16 mt-1 bg-muted animate-pulse rounded" />
      ) : (
        <p className="text-2xl font-bold">{value}</p>
      )}
    </div>
  </div>
)