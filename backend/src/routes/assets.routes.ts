import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { AppError } from '../middlewares/errorHandler'

const router = Router()
const prisma = new PrismaClient()

// Assets
router.get('/assets', async (req, res, next) => {
  try {
    const { company, type } = req.query
    const where: any = {}
    if (company) where.company = company
    if (type) where.type = type
    const items = await prisma.asset.findMany({ where, orderBy: { createdAt: 'desc' } })
    res.json({ success: true, data: items })
  } catch (e: any) { next(new AppError(e.message, 500)) }
})

router.post('/assets', async (req, res, next) => {
  try {
    const { name, type, url, content, tags, company } = req.body
    if (!name || !type) throw new AppError('Nome e tipo são obrigatórios', 400)
    const created = await prisma.asset.create({ 
      data: { 
        name, 
        type, 
        url, 
        content, 
        tags: tags ? JSON.stringify(tags) : null,
        company: company || 'biomed'
      } 
    })
    res.json({ success: true, data: created })
  } catch (e: any) { next(new AppError(e.message, 500)) }
})

router.put('/assets/:id', async (req, res, next) => {
  try {
    const updated = await prisma.asset.update({ where: { id: req.params.id }, data: req.body })
    res.json({ success: true, data: updated })
  } catch (e: any) { next(new AppError(e.message, 500)) }
})

router.delete('/assets/:id', async (req, res, next) => {
  try {
    await prisma.asset.delete({ where: { id: req.params.id } })
    res.json({ success: true, message: 'Ativo excluído' })
  } catch (e: any) { next(new AppError(e.message, 500)) }
})

// Creatives
router.get('/creatives', async (req, res, next) => {
  try {
    const items = await prisma.creative.findMany({ orderBy: { createdAt: 'desc' } })
    res.json({ success: true, data: items })
  } catch (e: any) { next(new AppError(e.message, 500)) }
})

router.post('/creatives', async (req, res, next) => {
  try {
    const { title, channel, description, body, assetIds } = req.body
    if (!title || !channel) throw new AppError('Título e canal são obrigatórios', 400)
    const created = await prisma.creative.create({ data: { title, channel, description, body, assetIds: assetIds ? JSON.stringify(assetIds) : null } })
    res.json({ success: true, data: created })
  } catch (e: any) { next(new AppError(e.message, 500)) }
})

router.put('/creatives/:id', async (req, res, next) => {
  try {
    const updated = await prisma.creative.update({ where: { id: req.params.id }, data: req.body })
    res.json({ success: true, data: updated })
  } catch (e: any) { next(new AppError(e.message, 500)) }
})

router.delete('/creatives/:id', async (req, res, next) => {
  try {
    await prisma.creative.delete({ where: { id: req.params.id } })
    res.json({ success: true, message: 'Criativo excluído' })
  } catch (e: any) { next(new AppError(e.message, 500)) }
})

// Approvals
router.get('/creatives/:id/approvals', async (req, res, next) => {
  try {
    const items = await prisma.approval.findMany({ where: { creativeId: req.params.id }, orderBy: { createdAt: 'desc' } })
    res.json({ success: true, data: items })
  } catch (e: any) { next(new AppError(e.message, 500)) }
})

router.post('/creatives/:id/approvals', async (req, res, next) => {
  try {
    const { reviewer, status, comment } = req.body
    if (!reviewer) throw new AppError('Revisor é obrigatório', 400)
    const created = await prisma.approval.create({ data: { creativeId: req.params.id, reviewer, status: status || 'pending', comment, decidedAt: status && status !== 'pending' ? new Date() : null } })
    res.json({ success: true, data: created })
  } catch (e: any) { next(new AppError(e.message, 500)) }
})

export { router as assetsRoutes }
