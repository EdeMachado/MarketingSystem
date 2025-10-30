import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { AppError } from '../middlewares/errorHandler'

const router = Router()
const prisma = new PrismaClient()

// Projects
router.get('/', async (req, res, next) => {
  try {
    const items = await prisma.project.findMany({ orderBy: { createdAt: 'desc' } })
    res.json({ success: true, data: items })
  } catch (e: any) { next(new AppError(e.message, 500)) }
})

router.post('/', async (req, res, next) => {
  try {
    const { name, clientName, description } = req.body
    if (!name) throw new AppError('Nome é obrigatório', 400)
    const created = await prisma.project.create({ data: { name, clientName, description } })
    res.json({ success: true, data: created })
  } catch (e: any) { next(new AppError(e.message, 500)) }
})

router.put('/:id', async (req, res, next) => {
  try {
    const updated = await prisma.project.update({ where: { id: req.params.id }, data: req.body })
    res.json({ success: true, data: updated })
  } catch (e: any) { next(new AppError(e.message, 500)) }
})

router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.project.delete({ where: { id: req.params.id } })
    res.json({ success: true, message: 'Projeto excluído' })
  } catch (e: any) { next(new AppError(e.message, 500)) }
})

// Tasks (all or filtered)
router.get('/tasks', async (req, res, next) => {
  try {
    const { status, assignee, projectId, priority } = req.query
    const where: any = {}
    if (status) where.status = status
    if (assignee) where.assignee = assignee
    if (projectId) where.projectId = projectId
    if (priority) where.priority = priority
    const tasks = await prisma.task.findMany({ where, orderBy: { createdAt: 'desc' }, include: { project: true } })
    res.json({ success: true, data: tasks })
  } catch (e: any) { next(new AppError(e.message, 500)) }
})

// Tasks by project
router.get('/:projectId/tasks', async (req, res, next) => {
  try {
    const tasks = await prisma.task.findMany({ where: { projectId: req.params.projectId }, orderBy: { createdAt: 'desc' } })
    res.json({ success: true, data: tasks })
  } catch (e: any) { next(new AppError(e.message, 500)) }
})

router.post('/:projectId/tasks', async (req, res, next) => {
  try {
    const { title, description, assignee, priority, startDate, dueDate, estimateH, dependencies, tags } = req.body
    if (!title) throw new AppError('Título é obrigatório', 400)
    const created = await prisma.task.create({ 
      data: { 
        projectId: req.params.projectId, 
        title, 
        description, 
        assignee, 
        priority: priority || 'medium', 
        startDate: startDate ? new Date(startDate) : null,
        dueDate: dueDate ? new Date(dueDate) : null, 
        estimateH,
        dependencies: dependencies ? JSON.stringify(dependencies) : null,
        tags: tags ? JSON.stringify(tags) : null,
      } 
    })
    res.json({ success: true, data: created })
  } catch (e: any) { next(new AppError(e.message, 500)) }
})

// Workload: horas por pessoa
router.get('/tasks/workload', async (req, res, next) => {
  try {
    const tasks = await prisma.task.findMany({ where: { assignee: { not: null } }, select: { assignee: true, estimateH: true, spentH: true } })
    const workload: Record<string, { estimated: number; spent: number }> = {}
    for (const t of tasks) {
      if (!t.assignee) continue
      if (!workload[t.assignee]) workload[t.assignee] = { estimated: 0, spent: 0 }
      workload[t.assignee].estimated += t.estimateH || 0
      workload[t.assignee].spent += t.spentH || 0
    }
    res.json({ success: true, data: Object.entries(workload).map(([assignee, w]) => ({ assignee, ...w })) })
  } catch (e: any) { next(new AppError(e.message, 500)) }
})

// Calendar: tarefas com datas
router.get('/tasks/calendar', async (req, res, next) => {
  try {
    const { start, end } = req.query
    const where: any = {}
    if (start || end) {
      const conditions: any[] = []
      if (start || end) {
        const dateFilter: any = {}
        if (start) dateFilter.gte = new Date(String(start))
        if (end) dateFilter.lte = new Date(String(end))
        conditions.push({ startDate: dateFilter }, { dueDate: dateFilter })
      }
      if (conditions.length > 0) where.OR = conditions
    }
    const tasks = await prisma.task.findMany({ where, include: { project: true }, orderBy: { startDate: 'asc' } })
    res.json({ success: true, data: tasks })
  } catch (e: any) { next(new AppError(e.message, 500)) }
})

router.put('/tasks/:taskId', async (req, res, next) => {
  try {
    const { startDate, dueDate, dependencies, tags, ...rest } = req.body
    const data: any = { ...rest }
    if (startDate !== undefined) data.startDate = startDate ? new Date(startDate) : null
    if (dueDate !== undefined) data.dueDate = dueDate ? new Date(dueDate) : null
    if (dependencies !== undefined) data.dependencies = dependencies ? (Array.isArray(dependencies) ? JSON.stringify(dependencies) : dependencies) : null
    if (tags !== undefined) data.tags = tags ? (Array.isArray(tags) ? JSON.stringify(tags) : tags) : null
    const updated = await prisma.task.update({ where: { id: req.params.taskId }, data })
    res.json({ success: true, data: updated })
  } catch (e: any) { next(new AppError(e.message, 500)) }
})

router.delete('/tasks/:taskId', async (req, res, next) => {
  try {
    await prisma.task.delete({ where: { id: req.params.taskId } })
    res.json({ success: true, message: 'Tarefa excluída' })
  } catch (e: any) { next(new AppError(e.message, 500)) }
})

export { router as projectsRoutes }
