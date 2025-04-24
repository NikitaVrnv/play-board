// src/pages/admin/UsersTableWithControls.tsx
import { useCallback, useEffect, useMemo, useState } from 'react'
import { API } from '@/services/api'                                  // <-- thin API wrapper
import {
  Card, CardHeader, CardTitle, CardContent,
  Button, Input, Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue, Table, TableBody,
  TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import { ChevronLeft, ChevronRight, RefreshCw, Save, Search } from 'lucide-react'

/*
  ────────────────────────────────────────────────────────────────────────────────
  Types
  ────────────────────────────────────────────────────────────────────────────────
*/
type Role = 'user' | 'admin'
type SortField = 'username' | 'email' | 'createdAt'
type SortDir   = 'asc' | 'desc'

interface User {
  id: string
  username: string
  email: string
  role: Role
  createdAt: string
}

/*
  ────────────────────────────────────────────────────────────────────────────────
  Component
  ────────────────────────────────────────────────────────────────────────────────
*/
export default function UsersTableWithControls() {
  /* ------------------------------- query state ------------------------------ */
  const [page,       setPage]       = useState(1)
  const [pageSize,   setPageSize]   = useState(10)
  const [search,     setSearch]     = useState('')
  const [role,       setRole]       = useState<Role | 'all'>('all')
  const [sortField,  setSortField]  = useState<SortField>('createdAt')
  const [sortDir,    setSortDir]    = useState<SortDir>('desc')

  /* ------------------------------- data state ------------------------------- */
  const [rows, setRows]       = useState<User[]>([])
  const [total, setTotal]     = useState(0)
  const [loading, setLoading] = useState(false)

  /* -------------------------------- helpers --------------------------------- */
  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const { items, totalCount } = await API.getAdminUsers({
        page, pageSize, search,
        role: role === 'all' ? undefined : role,
        sort: `${sortField}:${sortDir}`,
      })
      setRows(items)
      setTotal(totalCount)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, search, role, sortField, sortDir])

  /* fetch whenever deps change */
  useEffect(() => { fetchUsers() }, [fetchUsers])

  /* total pages derived */
  const pageCount = useMemo(() => Math.ceil(total / pageSize || 1), [total, pageSize])

  /* toggle ascending / descending when a header is clicked */
  const toggleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  /* -------------------------------- save UI --------------------------------- */
  const saveCurrentSettings = async () => {
    await API.saveAdminPreference({
      entity: 'users-table',
      payload: { pageSize, sortField, sortDir, roleFilter: role },
    })
  }

  /* ────────────────────────────────────────────────────────────────────────── */
  /*                                   render                                  */
  /* ────────────────────────────────────────────────────────────────────────── */
  return (
    <Card className="space-y-4">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Users</CardTitle>

          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={fetchUsers}>
              <RefreshCw className={loading ? 'animate-spin' : ''} size={16}/>
            </Button>
            <Button onClick={saveCurrentSettings}>
              <Save size={16} className="mr-2"/> Save current view
            </Button>
          </div>
        </div>

        {/* filters */}
        <div className="flex flex-wrap gap-3 pt-4">
          {/* search box */}                                            {/* pattern from Users.tsx :contentReference[oaicite:0]{index=0}&#8203;:contentReference[oaicite:1]{index=1} */}
          <div className="relative">
            <Search size={14} className="absolute left-2 top-2 text-muted-foreground"/>
            <Input
              placeholder="Search username / email…"
              value={search}
              className="pl-7 w-56"
              onChange={e => { setSearch(e.target.value); setPage(1) }}
            />
          </div>

          {/* role filter */}
          <Select value={role} onValueChange={val => { setRole(val as any); setPage(1) }}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Role"/>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>

          {/* page size */}
          <Select value={String(pageSize)} onValueChange={val => { setPageSize(+val); setPage(1) }}>
            <SelectTrigger className="w-28">
              <SelectValue placeholder="Page size"/>
            </SelectTrigger>
            <SelectContent>
              {[5,10,20,50].map(n => <SelectItem key={n} value={String(n)}>{n} / page</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {['username','email','createdAt'].map(field => (
                <TableHead
                  key={field}
                  onClick={() => toggleSort(field as SortField)}
                  className="cursor-pointer select-none"
                >
                  {field === 'createdAt' ? 'Joined' : field.charAt(0).toUpperCase() + field.slice(1)}
                  {sortField === field && (
                    <span className="ml-1">{sortDir === 'asc' ? '▲' : '▼'}</span>
                  )}
                </TableHead>
              ))}
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-10">Loading…</TableCell></TableRow>
            ) : rows.length ? (
              rows.map(u => (
                <TableRow key={u.id}>
                  <TableCell>{u.username}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <span className={
                      u.role === 'admin'
                        ? 'px-2 py-0.5 rounded bg-primary text-primary-foreground text-xs'
                        : 'px-2 py-0.5 rounded border text-xs'
                    }>
                      {u.role}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={4} className="text-center py-10">No users found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>

        {/* pagination bar (bottom-right) */}
        <div className="flex justify-end items-center gap-2 mt-4">
          <Button
            size="icon" variant="outline" disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            <ChevronLeft size={16}/>
          </Button>
          <span className="text-sm">
            Page {page} / {pageCount}
          </span>
          <Button
            size="icon" variant="outline" disabled={page === pageCount}
            onClick={() => setPage(p => p + 1)}
          >
            <ChevronRight size={16}/>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
