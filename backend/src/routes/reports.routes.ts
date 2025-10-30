import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { AppError } from '../middlewares/errorHandler'

const router = Router()
const prisma = new PrismaClient()

function parsePeriod(q: any) {
  const startDate = q.startDate ? new Date(String(q.startDate)) : undefined
  const endDate = q.endDate ? new Date(String(q.endDate)) : undefined
  return { startDate, endDate }
}

// Overview: totals and rates (period optional)
router.get('/overview', async (req, res, next) => {
  try {
    const { startDate, endDate } = parsePeriod(req.query)

    // Base where for events within period
    const openWhere: any = {}
    const clickWhere: any = {}
    const ccWhereSent: any = { status: { in: ['sent', 'delivered', 'opened', 'clicked'] } }
    if (startDate || endDate) {
      if (startDate) openWhere.openedAt = { ...(openWhere.openedAt || {}), gte: startDate }
      if (endDate) openWhere.openedAt = { ...(openWhere.openedAt || {}), lte: endDate }
      if (startDate) clickWhere.clickedAt = { ...(clickWhere.clickedAt || {}), gte: startDate }
      if (endDate) clickWhere.clickedAt = { ...(clickWhere.clickedAt || {}), lte: endDate }
      if (startDate || endDate) ccWhereSent.sentAt = {}
      if (startDate) ccWhereSent.sentAt.gte = startDate
      if (endDate) ccWhereSent.sentAt.lte = endDate
    }

    const [totalCampaigns, totalContacts, sent, opens, clicks, failed] = await Promise.all([
      prisma.campaign.count(),
      prisma.contact.count(),
      prisma.campaignContact.count({ where: ccWhereSent }),
      prisma.openEvent.count({ where: openWhere }),
      prisma.clickEvent.count({ where: clickWhere }),
      prisma.campaignContact.count({ where: { status: 'failed', ...(startDate || endDate ? { sentAt: ccWhereSent.sentAt } : {}) } }),
    ])

    const openRate = sent > 0 ? (opens / sent) * 100 : 0
    const clickRate = sent > 0 ? (clicks / sent) * 100 : 0
    const bounceRate = sent > 0 ? (failed / sent) * 100 : 0

    res.json({ success: true, data: { totalCampaigns, totalContacts, sent, opens, clicks, failed, openRate, clickRate, bounceRate } })
  } catch (e: any) {
    next(new AppError(e.message, 500))
  }
})

// Channels distribution (campaigns by type)
router.get('/channels', async (req, res, next) => {
  try {
    const groups = await prisma.campaign.groupBy({ by: ['type'], _count: { type: true } })
    res.json({ success: true, data: groups.map(g => ({ type: g.type, count: (g as any)._count.type })) })
  } catch (e: any) {
    next(new AppError(e.message, 500))
  }
})

// Top email domains in contacts
router.get('/domains', async (req, res, next) => {
  try {
    const contacts = await prisma.contact.findMany({ where: { email: { not: null } }, select: { email: true } })
    const counts: Record<string, number> = {}
    for (const c of contacts) {
      const domain = String(c.email).split('@')[1]?.toLowerCase()
      if (!domain) continue
      counts[domain] = (counts[domain] || 0) + 1
    }
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 20).map(([domain, count]) => ({ domain, count }))
    res.json({ success: true, data: top })
  } catch (e: any) {
    next(new AppError(e.message, 500))
  }
})

// Bounces (failed sends) by period
router.get('/bounces', async (req, res, next) => {
  try {
    const { startDate, endDate } = parsePeriod(req.query)
    const where: any = { status: 'failed' }
    if (startDate || endDate) {
      where.sentAt = {}
      if (startDate) where.sentAt.gte = startDate
      if (endDate) where.sentAt.lte = endDate
    }
    const total = await prisma.campaignContact.count({ where })
    res.json({ success: true, data: { total } })
  } catch (e: any) {
    next(new AppError(e.message, 500))
  }
})

// Top links by period (reuses click events)
router.get('/links', async (req, res, next) => {
  try {
    const { startDate, endDate } = parsePeriod(req.query)
    const where: any = {}
    if (startDate || endDate) {
      where.clickedAt = {}
      if (startDate) where.clickedAt.gte = startDate
      if (endDate) where.clickedAt.lte = endDate
    }
    const clicks = await prisma.clickEvent.groupBy({ by: ['url'], where, _count: { url: true }, orderBy: { _count: { url: 'desc' } }, take: 20 })
    res.json({ success: true, data: clicks.map(c => ({ url: c.url, count: (c as any)._count.url })) })
  } catch (e: any) {
    next(new AppError(e.message, 500))
  }
})

export { router as reportsRoutes }
