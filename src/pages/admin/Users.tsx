// src/pages/admin/Users.tsx
import { useEffect, useState } from 'react'
import { API } from '@/services/api'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Search, RefreshCw, Users as UsersIcon } from 'lucide-react'

/* ───────────────────────── component ───────────────────────── */
export default function Users() {
  const [rows,       setRows]       = useState<any[]>([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [role,       setRole]       = useState<'all' | 'user' | 'admin'>('all')

  const fetch = async () => {
    setLoading(true)
    try {
      const data = await API.getAdminUsers({
        search,
        role: role === 'all' ? undefined : role,
      })
      setRows(data)
    } catch {
      // eslint-disable-next-line no-console
      console.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetch() }, [search, role]) // eslint-disable-line react-hooks/exhaustive-deps

  const reset = () => {
    setSearch('')
    setRole('all')
  }

  /* counts */
  const adminCnt  = rows.filter(u => u.role === 'admin').length
  const regularCnt= rows.filter(u => u.role === 'user').length

  /* ───────────── render ───────────── */
  return (
    <div className="space-y-4">
      {/* header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">User Management</h2>
        <Button variant="outline" size="sm" onClick={fetch}>
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </div>

      {/* stats */}
      <Card>
        <CardHeader>
          <CardTitle>User Statistics</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            ['Total Users', rows.length],
            ['Admin Users', adminCnt],
            ['Regular Users', regularCnt],
          ].map(([t, v]) => (
            <div key={t as string} className="flex items-center gap-3">
              <UsersIcon className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">{t}</p>
                <p className="text-xl font-semibold">{v}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* list */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Users List</CardTitle>

            {/* filters */}
            <div className="flex gap-2">
              {/* search */}
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-8 w-48"
                />
                {search && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => setSearch('')}
                  >
                    ×
                  </Button>
                )}
              </div>

              {/* role */}
              <Select value={role} onValueChange={v => setRole(v as any)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>

              {(search || role !== 'all') && (
                <Button variant="ghost" size="sm" onClick={reset}>
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-center py-8">Loading…</p>
          ) : rows.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No users found</p>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-center">Games</TableHead>
                    <TableHead className="text-center">Reviews</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {rows.map(u => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.username}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        <Badge variant={u.role === 'admin' ? 'default' : 'outline'}>
                          {u.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">{u._count?.games ?? 0}</TableCell>
                      <TableCell className="text-center">{u._count?.reviews ?? 0}</TableCell>
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
