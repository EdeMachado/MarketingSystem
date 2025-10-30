import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { AppError } from '../middlewares/errorHandler'

const router = Router()
const prisma = new PrismaClient()

function getHour(dt?: Date | null) { return dt ? new Date(dt).getHours() : null }
function getWeekday(dt?: Date | null) { return dt ? new Date(dt).getDay() : null } // 0=Domingo

// 1) Heatmap: melhor horário e dia (aberturas/cliques por hora/dia)
router.get('/send-time-heatmap', async (req, res, next) => {
  try {
    const cc = await prisma.campaignContact.findMany({ select: { sentAt: true, openedAt: true, clickedAt: true } })
    const matrix: Record<string, { sent: number; opens: number; clicks: number }> = {}
    for (const r of cc) {
      const d = r.sentAt || r.openedAt || r.clickedAt
      if (!d) continue
      const h = getHour(d)
      const wd = getWeekday(d)
      if (h == null || wd == null) continue
      const key = `${wd}-${h}`
      if (!matrix[key]) matrix[key] = { sent: 0, opens: 0, clicks: 0 }
      matrix[key].sent += 1
      if (r.openedAt) matrix[key].opens += 1
      if (r.clickedAt) matrix[key].clicks += 1
    }
    res.json({ success: true, data: matrix })
  } catch (e: any) {
    next(new AppError(e.message, 500))
  }
})

// 2) Assuntos com melhor desempenho (CTR por subject)
router.get('/subject-performance', async (req, res, next) => {
  try {
    const campaigns = await prisma.campaign.findMany({ select: { id: true, subject: true } })
    const performance: Array<{ subject: string; sent: number; opens: number; clicks: number; ctr: number; or: number }> = []
    for (const c of campaigns) {
      const [sent, opened, clicked] = await Promise.all([
        prisma.campaignContact.count({ where: { campaignId: c.id, status: { in: ['sent', 'delivered', 'opened', 'clicked'] } } }),
        prisma.campaignContact.count({ where: { campaignId: c.id, openedAt: { not: null } } }),
        prisma.campaignContact.count({ where: { campaignId: c.id, clickedAt: { not: null } } }),
      ])
      const ctr = sent > 0 ? (clicked / sent) * 100 : 0
      const or = sent > 0 ? (opened / sent) * 100 : 0
      performance.push({ subject: c.subject || '(sem assunto)', sent, opens: opened, clicks: clicked, ctr, or })
    }
    performance.sort((a, b) => b.ctr - a.ctr)
    res.json({ success: true, data: performance.slice(0, 20) })
  } catch (e: any) {
    next(new AppError(e.message, 500))
  }
})

// 3) Domínios com melhor/ pior desempenho (open/click)
router.get('/domain-performance', async (req, res, next) => {
  try {
    const ccs = await prisma.campaignContact.findMany({ include: { contact: { select: { email: true } } } })
    const stats: Record<string, { total: number; opens: number; clicks: number }> = {}
    for (const r of ccs) {
      const email = r.contact?.email
      const domain = email?.split('@')[1]?.toLowerCase()
      if (!domain) continue
      if (!stats[domain]) stats[domain] = { total: 0, opens: 0, clicks: 0 }
      stats[domain].total += 1
      if (r.openedAt) stats[domain].opens += 1
      if (r.clickedAt) stats[domain].clicks += 1
    }
    const arr = Object.entries(stats).map(([domain, s]) => ({ domain, total: s.total, openRate: s.total ? (s.opens / s.total) * 100 : 0, clickRate: s.total ? (s.clicks / s.total) * 100 : 0 }))
    arr.sort((a, b) => b.clickRate - a.clickRate)
    res.json({ success: true, data: arr.slice(0, 20) })
  } catch (e: any) {
    next(new AppError(e.message, 500))
  }
})

// 4) Fadiga de frequência: queda de open/click com nº de envios por contato
router.get('/frequency-fatigue', async (req, res, next) => {
  try {
    const ccs = await prisma.campaignContact.findMany({ select: { contactId: true, openedAt: true, clickedAt: true, sentAt: true } })
    const byContact: Record<string, Array<{ sentAt: Date | null; openedAt: Date | null; clickedAt: Date | null }>> = {}
    for (const r of ccs) {
      (byContact[r.contactId] = byContact[r.contactId] || []).push(r)
    }
    const bins: Record<number, { total: number; opens: number; clicks: number }> = {}
    for (const list of Object.values(byContact)) {
      list.sort((a, b) => (a.sentAt?.getTime() || 0) - (b.sentAt?.getTime() || 0))
      list.forEach((r, idx) => {
        const bin = idx + 1
        if (!bins[bin]) bins[bin] = { total: 0, opens: 0, clicks: 0 }
        bins[bin].total += 1
        if (r.openedAt) bins[bin].opens += 1
        if (r.clickedAt) bins[bin].clicks += 1
      })
    }
    const series = Object.entries(bins).map(([n, s]) => ({ sendNumber: Number(n), openRate: s.total ? (s.opens / s.total) * 100 : 0, clickRate: s.total ? (s.clicks / s.total) * 100 : 0 }))
    series.sort((a, b) => a.sendNumber - b.sendNumber)
    res.json({ success: true, data: series.slice(0, 20) })
  } catch (e: any) {
    next(new AppError(e.message, 500))
  }
})

// 5) Reengajamento: contatos sem abrir em X dias, mas com email válido
router.get('/reengagement', async (req, res, next) => {
  try {
    const days = Number(req.query.days || 30)
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    const contacts = await prisma.contact.findMany({ where: { email: { not: null }, emailValid: { not: false }, optOut: false } })
    const ids = contacts.map(c => c.id)
    const openedRecently = await prisma.campaignContact.findMany({ where: { contactId: { in: ids }, openedAt: { gte: since } }, select: { contactId: true } })
    const openedSet = new Set(openedRecently.map(r => r.contactId))
    const candidates = contacts.filter(c => !openedSet.has(c.id))
    res.json({ success: true, data: { days, total: candidates.length, sample: candidates.slice(0, 50) } })
  } catch (e: any) {
    next(new AppError(e.message, 500))
  }
})

// 6) Recomendações automáticas simples com base nos dados
router.get('/recommendations', async (req, res, next) => {
  try {
    const [{ data: heatmap }, subjects, fatigue] = await Promise.all([
      (async () => {
        const cc = await prisma.campaignContact.findMany({ select: { sentAt: true, openedAt: true, clickedAt: true } })
        const agg: Record<string, { sent: number; opens: number; clicks: number }> = {}
        for (const r of cc) {
          const d = r.sentAt || r.openedAt || r.clickedAt
          if (!d) continue
          const h = getHour(d)
          const wd = getWeekday(d)
          if (h == null || wd == null) continue
          const key = `${wd}-${h}`
          if (!agg[key]) agg[key] = { sent: 0, opens: 0, clicks: 0 }
          agg[key].sent += 1
          if (r.openedAt) agg[key].opens += 1
          if (r.clickedAt) agg[key].clicks += 1
        }
        return { data: agg }
      })(),
      prisma.campaign.findMany({ select: { id: true, subject: true } }).then(async (cs) => {
        const perf: Array<{ subject: string; ctr: number }> = []
        for (const c of cs) {
          const [sent, clicked] = await Promise.all([
            prisma.campaignContact.count({ where: { campaignId: c.id, status: { in: ['sent', 'delivered', 'opened', 'clicked'] } } }),
            prisma.campaignContact.count({ where: { campaignId: c.id, clickedAt: { not: null } } }),
          ])
          perf.push({ subject: c.subject || '(sem assunto)', ctr: sent ? (clicked / sent) * 100 : 0 })
        }
        perf.sort((a, b) => b.ctr - a.ctr)
        return perf.slice(0, 5)
      }),
      (async () => {
        const series: any[] = []
        const ccs = await prisma.campaignContact.findMany({ select: { contactId: true, openedAt: true, clickedAt: true, sentAt: true } })
        const byContact: Record<string, Array<{ sentAt: Date | null; openedAt: Date | null; clickedAt: Date | null }>> = {}
        for (const r of ccs) {
          (byContact[r.contactId] = byContact[r.contactId] || []).push(r)
        }
        const bins: Record<number, { total: number; opens: number; clicks: number }> = {}
        for (const list of Object.values(byContact)) {
          list.sort((a, b) => (a.sentAt?.getTime() || 0) - (b.sentAt?.getTime() || 0))
          list.forEach((r, idx) => {
            const bin = idx + 1
            if (!bins[bin]) bins[bin] = { total: 0, opens: 0, clicks: 0 }
            bins[bin].total += 1
            if (r.openedAt) bins[bin].opens += 1
            if (r.clickedAt) bins[bin].clicks += 1
          })
        }
        Object.entries(bins).forEach(([n, s]) => series.push({ n: Number(n), openRate: s.total ? (s.opens / s.total) * 100 : 0, clickRate: s.total ? (s.clicks / s.total) * 100 : 0 }))
        series.sort((a, b) => a.n - b.n)
        return series
      })(),
    ])

    // Melhor hora/dia (pela taxa de clique)
    let best: { key: string; rate: number } | null = null
    for (const [k, v] of Object.entries(heatmap)) {
      const rate = v.sent ? v.clicks / v.sent : 0
      if (!best || rate > best.rate) best = { key: k, rate }
    }

    const recs: string[] = []
    if (best) {
      const [wdStr, hourStr] = best.key.split('-')
      const wd = Number(wdStr)
      const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
      recs.push(`Agende envios em ${weekdays[wd]} por volta de ${hourStr}:00 (melhor CTR histórico).`)
    }
    if (subjects[0]) recs.push(`Use mais variações similares ao assunto com melhor CTR: "${subjects[0].subject}".`)
    if (fatigue.length >= 2 && fatigue[1].openRate < fatigue[0].openRate) recs.push('Reduza a frequência para novos contatos: a taxa de abertura cai após múltiplos envios.')

    res.json({ success: true, data: { recommendations: recs, topSubjects: subjects } })
  } catch (e: any) {
    next(new AppError(e.message, 500))
  }
})

export { router as insightsRoutes }
