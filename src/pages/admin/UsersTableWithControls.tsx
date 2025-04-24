// src/pages/admin/UsersTableWithControls.tsx
import { useCallback, useEffect, useMemo, useState } from 'react'
import { API } from '@/services/api'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card'
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ChevronLeft, ChevronRight, RefreshCw, Save, Search } from 'lucide-react'

/* ───────────────────────── types ───────────────────────── */
type Role = 'user' | 'admin'
type SortField = 'username' | 'email' | 'createdAt'
type SortDir = 'asc' | 'desc'

interface User {
  id: string
  username: string
  email: string
  role: Role
  createdAt: string
}

/* ───────────────────────── component ───────────────────── */
export default function UsersTableWithControls() {
  /* query state */
  const [page, setPage]           = useState(1)
  const [pageSize, setPageSize]   = useState(10)
  const [search, setSearch]       = useState('')
  const [role, setRole]           = useState<Role | 'all'>('all')
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortDir, setSortDir]     = useState<SortDir>('desc')

  /* data */
  const [rows,   setRows]   = useState<User[]>([])
  const [total,  setTotal]  = useState(0)
  const [loading,setLoading]= useState(false)

  /* fetch */
  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const { items, totalCount } = await API.getAdminUsers({
        page,
        pageSize,
        search,
        role: role === 'all' ? undefined : role,
        sort: `${sortField}:${sortDir}`,
      })
      setRows(items)
      setTotal(totalCount)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, search, role, sortField, sortDir])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  /* pages */
  const pageCount = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize])

  const toggleSort = (field: SortField) => {
    if (field === sortField) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortField(field); setSortDir('asc') }
  }

  /* save preferences */
  const savePref = async () => {
    await API.saveAdminPreference({
      entity: 'users-table',
      payload: { pageSize, sortField, sortDir, roleFilter: role },
    })
  }

  /* ────────────── render ────────────── */
  return (
    <Card className="space-y-4">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Users</CardTitle>

          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={fetchUsers}>
              <RefreshCw className={loading ? 'animate-spin' : ''} size={16} />
            </Button>
            <Button onClick={savePref}>
              <Save size={16} className="mr-2" /> Save view
            </Button>
          </div>
        </div>

        {/* filters */}
        <div className="flex flex-wrap gap-3 pt-4">
          <div className="relative">
            <Search size={14} className="absolute left-2 top-2 text-muted-foreground" />
            <Input
              placeholder="Search username / email…"
              value={search}
              className="pl-7 w-56"
              onChange={e => { setSearch(e.target.value); setPage(1) }}
            />
          </div>

          <Select value={role} onValueChange={v => { setRole(v as any); setPage(1) }}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>

          <Select value={String(pageSize)} onValueChange={v => { setPageSize(+v); setPage(1) }}>
            <SelectTrigger className="w-28">
              <SelectValue placeholder="Size" />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 20, 50].map(n => (
                <SelectItem key={n} value={String(n)}>
                  {n} / page
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      {/* table */}
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {(['username', 'email', 'createdAt'] as SortField[]).map(f => (
                <TableHead
                  key={f}
                  className="cursor-pointer select-none"
                  onClick={() => toggleSort(f)}
                >
                  {f === 'createdAt' ? 'Joined' : f.charAt(0).toUpperCase() + f.slice(1)}
                  {sortField === f && <span className="ml-1">{sortDir === 'asc' ? '▲' : '▼'}</span>}
                </TableHead>
              ))}
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  Loading…
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No users
                </TableCell>
              </TableRow>
            ) : (
              rows.map(u => (
                <TableRow key={u.id}>
                  <TableCell>{u.username}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>{u.role}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>

      {/* pagination */}
      <div className="flex justify-end items-center gap-2 px-6 pb-4">
        <Button
          size="icon"
          variant="ghost"
          disabled={page === 1}
          onClick={() => setPage(p => Math.max(1, p - 1))}
        >
          <ChevronLeft size={16} />
        </Button>
        <span className="text-sm">
          Page {page} / {pageCount}
        </span>
        <Button
          size="icon"
          variant="ghost"
          disabled={page === pageCount}
          onClick={() => setPage(p => Math.min(pageCount, p + 1))}
        >
          <ChevronRight size={16} />
        </Button>
      </div>
    </Card>
  )
}
