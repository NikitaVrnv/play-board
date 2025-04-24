// backend/src/routes/adminRoutes.ts

import express, { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authMiddleware } from '../middleware/authMiddleware'

export function createAdminRouter (prisma: PrismaClient) {
  const r = express.Router()

  /* ───────────────────────────────────────────────
     Every admin route below requires a valid ADMIN
     JWT.  If the token is missing or the user is
     not an admin we bail out early.
  ─────────────────────────────────────────────── */
  r.use(authMiddleware)
  r.use((req, res, next) => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' })
    }
    next()
  })

  /* ───────────────────────── dashboard summary ───────────────────────── */
  r.get('/summary', async (_req, res) => {
    try {
      const [
        totalUsers,
        totalGames,
        totalReviews,
        pendingGames,
        pendingReviews
      ] = await Promise.all([
        prisma.user.count(),
        prisma.game.count(),
        prisma.review.count(),
        prisma.game.count({ where: { status: 'PENDING' } }),
        prisma.review.count({ where: { status: 'PENDING' } })
      ])

      const recent = await prisma.activity.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { user: { select: { id: true, username: true } } }
      })

      res.json({
        totalUsers,
        totalGames,
        totalReviews,
        pendingGames,
        pendingReviews,
        recentActivity: recent.map(a => ({
          id: a.id,
          type: a.type,
          title: a.title,
          timestamp: a.createdAt,
          user: a.user
        }))
      })
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Failed to fetch summary' })
    }
  })

  /* ──────────────────────────── time-series ──────────────────────────── */
  r.get('/stats', async (req: Request, res: Response) => {
    const { range = 'monthly', startDate, endDate } = req.query as any
    const end   = endDate   ? new Date(endDate)   : new Date()
    const start = startDate ? new Date(startDate) : new Date(end.getFullYear() - 1, end.getMonth(), 1)

    const bucket = (d: Date) => {
      if (range === 'daily')  return d.toISOString().slice(0, 10)
      if (range === 'weekly') {
        const jan1   = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
        const weekNo = Math.ceil(((d.getTime() - jan1.getTime()) / 86400000 + jan1.getUTCDay() + 1) / 7)
        return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`
      }
      /* monthly */ return d.toISOString().slice(0, 7)
    }

    const group = <T extends { createdAt: Date }>(rows: T[]) => {
      const out: Record<string, number> = {}
      rows.forEach(r => (out[bucket(r.createdAt)] = (out[bucket(r.createdAt)] || 0) + 1))
      return Object.entries(out).map(([date, count]) => ({ date, count }))
    }

    try {
      const [g, u, rv] = await Promise.all([
        prisma.game.findMany   ({ where: { createdAt: { gte: start, lte: end } } }),
        prisma.user.findMany   ({ where: { createdAt: { gte: start, lte: end } } }),
        prisma.review.findMany ({ where: { createdAt: { gte: start, lte: end } } })
      ])

      res.json({
        gameStats:   { timeSeries: group(g),  total: g.length  },
        userStats:   { timeSeries: group(u),  total: u.length  },
        reviewStats: { timeSeries: group(rv), total: rv.length }
      })
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Failed to fetch stats' })
    }
  })

  r.get('/stats/genres', async (_req, res) => {
    try {
      const list = await prisma.game.groupBy({
        by: ['genre'],
        _count: { _all: true }
      })
      res.json(list.map(g => ({ genre: g.genre, count: g._count._all })))
    } catch {
      res.status(500).json({ error: 'Failed to fetch genre stats' })
    }
  })

  r.get('/stats/ratings', async (_req, res) => {
    try {
      const list = await prisma.review.groupBy({
        by: ['rating'],
        _count: { _all: true }
      })
      res.json(list.map(r => ({ rating: r.rating, count: r._count._all })))
    } catch {
      res.status(500).json({ error: 'Failed to fetch rating stats' })
    }
  })

  /* ───────────────────────────── games CRUD ───────────────────────────── */
  r.get('/games', async (_req, res) => {
    const games = await prisma.game.findMany({
      orderBy: { createdAt: 'desc' },
      include: { createdBy: { select: { id: true, username: true } } }
    })
    res.json(games)
  })

  r.post('/games/:id/approve', (req, res) =>
    prisma.game.update({ where: { id: req.params.id }, data: { status: 'APPROVED' } })
      .then(res.json.bind(res))
      .catch(e => { console.error(e); res.status(500).json({ error: 'Failed' }) })
  )

  r.post('/games/:id/reject', (req, res) =>
    prisma.game.update({ where: { id: req.params.id }, data: { status: 'REJECTED' } })
      .then(res.json.bind(res))
      .catch(e => { console.error(e); res.status(500).json({ error: 'Failed' }) })
  )

  /* ─────────────────────────── reviews CRUD ──────────────────────────── */
  r.get('/reviews', (_req, res) =>
    prisma.review.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, username: true, avatar: true } },
        game: { select: { id: true, title: true, coverImage: true } }
      }
    })
      .then(res.json.bind(res))
      .catch(e => { console.error(e); res.status(500).json({ error: 'Failed' }) })
  )

  r.get('/reviews/pending', (_req, res) =>
    prisma.review.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, username: true, avatar: true } },
        game: { select: { id: true, title: true, coverImage: true } }
      }
    })
      .then(res.json.bind(res))
      .catch(e => { console.error(e); res.status(500).json({ error: 'Failed' }) })
  )

  r.post('/reviews/:id/approve', (req, res) =>
    prisma.review.update({ where: { id: req.params.id }, data: { status: 'APPROVED' } })
      .then(res.json.bind(res))
      .catch(e => { console.error(e); res.status(500).json({ error: 'Failed' }) })
  )

  r.post('/reviews/:id/reject', (req, res) =>
    prisma.review.update({ where: { id: req.params.id }, data: { status: 'REJECTED' } })
      .then(res.json.bind(res))
      .catch(e => { console.error(e); res.status(500).json({ error: 'Failed' }) })
  )

  /* ──────────────────────────── users list ──────────────────────────── */
  r.get('/users', async (req: Request, res: Response) => {
    const {
      page,
      pageSize,
      search = '',
      role,
      sort = 'createdAt:desc'
    } = req.query as Record<string, string>

    /* search / filter */
    const where: any = search
      ? {
          OR: [
            { username: { contains: search, mode: 'insensitive' } },
            { email:    { contains: search, mode: 'insensitive' } }
          ]
        }
      : {}
    if (role) where.role = role

    /* sort */
    const [field, dir] = sort.split(':')
    const orderBy = { [field]: dir === 'asc' ? 'asc' : 'desc' } as any

    /* pagination */
    if (page && pageSize) {
      const [items, totalCount] = await Promise.all([
        prisma.user.findMany({
          where, orderBy,
          include: { _count: { select: { games: true, reviews: true } } },
          skip:  (Number(page) - 1) * Number(pageSize),
          take:  Number(pageSize)
        }),
        prisma.user.count({ where })
      ])
      return res.json({ items, totalCount, page: Number(page), pageSize: Number(pageSize) })
    }

    /* no pagination requested */
    const users = await prisma.user.findMany({
      where, orderBy,
      include: { _count: { select: { games: true, reviews: true } } }
    })
    res.json(users)
  })

  /* ─────────────────────────── CSV / JSON export ─────────────────────────── */
  r.get('/export/:type', async (req, res) => {
    const { type } = req.params
    const { format = 'csv' } = req.query as Record<string, string>

    const rows =
      type === 'users'   ? await prisma.user.findMany()   :
      type === 'games'   ? await prisma.game.findMany()   :
      type === 'reviews' ? await prisma.review.findMany() :
      null

    if (!rows) return res.status(400).json({ error: 'Invalid export type' })

    if (format === 'json') return res.json(rows)

    const keys = Object.keys(rows[0] ?? {})
    const csv = [
      keys.join(','),
      ...rows.map((r: any) => keys.map(k => JSON.stringify(r[k] ?? '')).join(','))
    ].join('\n')

    res.header('Content-Type', 'text/csv')
    res.attachment(`${type}.csv`)
    res.send(csv)
  })

  return r
}
