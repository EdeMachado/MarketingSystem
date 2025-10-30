import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { AppError } from '../middlewares/errorHandler'
import { schedulerService } from '../services/scheduler.service'

const router = Router()
const prisma = new PrismaClient()

// Listar anúncios
router.get('/', async (req, res, next) => {
  try {
    const { status, stage, channel, company } = req.query
    const where: any = {}
    if (status) where.status = status
    if (stage) where.stage = stage
    if (channel) where.channel = channel
    if (company) where.company = company // Filtrar por empresa
    
    const ads = await prisma.advertisement.findMany({
      where,
      include: { approvals: true },
      orderBy: { createdAt: 'desc' }
    })
    res.json({ success: true, data: ads })
  } catch (e: any) {
    console.error('Erro ao listar anúncios:', e.message)
    console.error('Detalhes:', e)
    next(new AppError(e.message || 'Erro ao listar anúncios. Verifique o console do servidor. Se persistir, pare o backend e rode: npx prisma generate', 500))
  }
})

// Criar anúncio
router.post('/', async (req, res, next) => {
  try {
    const { title, brief, objective, targetAudience, budget, channels, channel, format, company } = req.body
    if (!title) throw new AppError('Título é obrigatório', 400)
    
    // Suporta channels (array) ou channel (string único) para compatibilidade
    const channelsArray = channels && Array.isArray(channels) ? channels : (channel ? [channel] : [])
    if (channelsArray.length === 0) throw new AppError('Selecione ao menos um canal', 400)
    
    const ad = await prisma.advertisement.create({
      data: {
        title,
        brief: brief || null,
        objective: objective || null,
        targetAudience: targetAudience || null,
        budget: budget || null,
        channels: JSON.stringify(channelsArray),
        channel: channelsArray[0] || null, // Mantém primeiro canal para compatibilidade
        format: format || 'post',
        company: company || 'biomed',
        status: 'draft',
        stage: 'planning'
      }
    })
    res.json({ success: true, data: ad })
  } catch (e: any) {
    console.error('Erro ao criar anúncio:', e.message)
    console.error('Stack:', e.stack)
    next(new AppError(e.message || 'Erro ao criar anúncio. Verifique o console do servidor.', 500))
  }
})

// Atualizar anúncio
router.put('/:id', async (req, res, next) => {
  try {
    const { mediaUrls, content, channels, channel, ...rest } = req.body
    const data: any = { ...rest }
    
    if (mediaUrls) {
      data.mediaUrls = Array.isArray(mediaUrls) ? JSON.stringify(mediaUrls) : mediaUrls
    }
    
    // Atualizar canais
    if (channels) {
      const channelsArray = Array.isArray(channels) ? channels : (channel ? [channel] : [])
      data.channels = JSON.stringify(channelsArray)
      data.channel = channelsArray[0] // Mantém primeiro para compatibilidade
    }
    
    const ad = await prisma.advertisement.update({
      where: { id: req.params.id },
      data
    })
    res.json({ success: true, data: ad })
  } catch (e: any) {
    console.error('Erro ao atualizar anúncio:', e.message)
    console.error('Stack:', e.stack)
    next(new AppError(e.message || 'Erro ao atualizar anúncio', 500))
  }
})

// Avançar stage (planejamento -> criação -> aprovação -> agendamento -> publicação)
router.post('/:id/next-stage', async (req, res, next) => {
  try {
    const ad = await prisma.advertisement.findUnique({ where: { id: req.params.id } })
    if (!ad) throw new AppError('Anúncio não encontrado', 404)
    
    const stages = ['planning', 'creation', 'approval', 'scheduling', 'publishing']
    const currentIndex = stages.indexOf(ad.stage)
    
    if (currentIndex === -1 || currentIndex === stages.length - 1) {
      throw new AppError('Não é possível avançar de estágio', 400)
    }
    
    // Validações
    if (ad.stage === 'planning') {
      // Verificar se tem serviceId (serviço selecionado)
      const serviceId = (ad as any).serviceId
      if (!serviceId) {
        throw new AppError('Selecione um serviço antes de avançar', 400)
      }
      // Verificar se tem objetivo
      if (!ad.objective) {
        throw new AppError('Selecione um objetivo antes de avançar', 400)
      }
      // Verificar se tem canais selecionados
      const channels = ad.channels ? JSON.parse(ad.channels) : (ad.channel ? [ad.channel] : [])
      if (channels.length === 0) {
        throw new AppError('Selecione ao menos um canal antes de avançar', 400)
      }
    }
    if (ad.stage === 'creation' && (!ad.content && !ad.mediaUrls)) {
      throw new AppError('Adicione conteúdo antes de avançar', 400)
    }
    if (ad.stage === 'approval' && ad.needsApproval && !ad.approvedAt) {
      throw new AppError('Anúncio precisa ser aprovado antes de avançar', 400)
    }
    if (ad.stage === 'scheduling' && !ad.scheduledAt) {
      throw new AppError('Defina data de publicação antes de avançar', 400)
    }
    
    const nextStage = stages[currentIndex + 1]
    const statusMap: Record<string, string> = {
      planning: 'planning',
      creation: 'creation',
      approval: 'review',
      scheduling: 'scheduled',
      publishing: 'published'
    }
    
    const updated = await prisma.advertisement.update({
      where: { id: req.params.id },
      data: {
        stage: nextStage,
        status: statusMap[nextStage] || ad.status
      }
    })
    
    res.json({ success: true, data: updated })
  } catch (e: any) {
    next(new AppError(e.message, 500))
  }
})

// Solicitar aprovação
router.post('/:id/request-approval', async (req, res, next) => {
  try {
    const { reviewer } = req.body
    if (!reviewer) throw new AppError('Revisor é obrigatório', 400)
    
    const ad = await prisma.advertisement.update({
      where: { id: req.params.id },
      data: { stage: 'approval', status: 'review' }
    })
    
    await prisma.approval.create({
      data: {
        advertisementId: ad.id,
        reviewer,
        status: 'pending'
      }
    })
    
    res.json({ success: true, data: ad })
  } catch (e: any) {
    next(new AppError(e.message, 500))
  }
})

// Aprovar/Rejeitar
router.post('/:id/approve', async (req, res, next) => {
  try {
    const { reviewer, comment, status: approvalStatus } = req.body
    if (!reviewer || !approvalStatus) throw new AppError('Revisor e status são obrigatórios', 400)
    
    // Atualizar aprovação
    const approval = await prisma.approval.findFirst({
      where: { advertisementId: req.params.id, reviewer, status: 'pending' },
      orderBy: { createdAt: 'desc' }
    })
    
    if (approval) {
      await prisma.approval.update({
        where: { id: approval.id },
        data: { status: approvalStatus, comment, decidedAt: new Date() }
      })
    } else {
      await prisma.approval.create({
        data: {
          advertisementId: req.params.id,
          reviewer,
          status: approvalStatus,
          comment,
          decidedAt: new Date()
        }
      })
    }
    
    const currentAd = await prisma.advertisement.findUnique({ where: { id: req.params.id } })
    
    // Se aprovado, atualizar anúncio
    if (approvalStatus === 'approved') {
      const ad = await prisma.advertisement.update({
        where: { id: req.params.id },
        data: {
          approvedAt: new Date(),
          approvedBy: reviewer,
          stage: currentAd?.stage === 'approval' ? 'scheduling' : currentAd?.stage || 'scheduling',
          status: currentAd?.stage === 'approval' ? 'approved' : currentAd?.status || 'approved'
        }
      })
      return res.json({ success: true, data: ad })
    }
    
    res.json({ success: true, message: 'Aprovação registrada' })
  } catch (e: any) {
    next(new AppError(e.message, 500))
  }
})

// Agendar publicação
router.post('/:id/schedule', async (req, res, next) => {
  try {
    const { scheduledAt, scheduledChannel } = req.body
    if (!scheduledAt) throw new AppError('Data de agendamento é obrigatória', 400)
    
    const ad = await prisma.advertisement.update({
      where: { id: req.params.id },
      data: {
        scheduledAt: new Date(scheduledAt),
        scheduledChannel: scheduledChannel || req.body.channel,
        stage: 'scheduling',
        status: 'scheduled'
      }
    })
    
    res.json({ success: true, data: ad })
  } catch (e: any) {
    next(new AppError(e.message, 500))
  }
})

// Publicar anúncio
router.post('/:id/publish', async (req, res, next) => {
  try {
    const ad = await prisma.advertisement.findUnique({ where: { id: req.params.id } })
    if (!ad) throw new AppError('Anúncio não encontrado', 404)
    
    if (ad.needsApproval && !ad.approvedAt) {
      throw new AppError('Anúncio precisa ser aprovado antes de publicar', 400)
    }
    
    let publishedUrl: string | undefined
    let campaignId: string | undefined
    
    // Se for rede social, criar postagem via social service
    if (['instagram', 'facebook', 'linkedin'].includes(ad.channel)) {
      // Aqui você integraria com a API da rede social
      publishedUrl = `https://${ad.channel}.com/posts/mock-${Date.now()}`
    }
    
    // Se for campanha paga (Google Ads, Meta Ads), criar campanha
    if (['google_ads', 'meta_ads'].includes(ad.channel)) {
      const campaign = await prisma.campaign.create({
        data: {
          name: ad.title,
          description: ad.brief || '',
          type: ad.channel === 'google_ads' ? 'google' : ad.channel,
          template: ad.content || '',
          status: 'scheduled',
          scheduledAt: ad.scheduledAt || new Date(),
          budgetPlanned: ad.budget || 0,
          metadata: JSON.stringify({ mediaUrls: ad.mediaUrls || '[]', format: ad.format })
        }
      })
      campaignId = campaign.id
      
      // Agendar campanha se tiver data
      if (ad.scheduledAt) {
        await schedulerService.scheduleCampaign(campaign.id, new Date(ad.scheduledAt))
      }
    }
    
    // Criar asset na biblioteca
    let assetId: string | undefined
    if (req.body.addToLibrary !== false) {
      const mediaUrls = ad.mediaUrls ? JSON.parse(ad.mediaUrls) : []
      const asset = await prisma.asset.create({
        data: {
          name: ad.title,
          type: mediaUrls.length > 0 ? (mediaUrls[0].includes('video') ? 'video' : 'image') : 'text',
          url: mediaUrls[0] || null,
          content: ad.content || null,
          tags: JSON.stringify([ad.channel, ad.format, 'published'])
        }
      })
      assetId = asset.id
    }
    
    // Atualizar anúncio
    const updated = await prisma.advertisement.update({
      where: { id: req.params.id },
      data: {
        publishedAt: new Date(),
        publishedUrl,
        campaignId,
        assetId,
        stage: 'publishing',
        status: 'published'
      }
    })
    
    res.json({ success: true, data: updated })
  } catch (e: any) {
    next(new AppError(e.message, 500))
  }
})

// Adicionar à biblioteca de ativos
router.post('/:id/add-to-library', async (req, res, next) => {
  try {
    const ad = await prisma.advertisement.findUnique({ where: { id: req.params.id } })
    if (!ad) throw new AppError('Anúncio não encontrado', 404)
    
    const mediaUrls = ad.mediaUrls ? JSON.parse(ad.mediaUrls) : []
    const asset = await prisma.asset.create({
      data: {
        name: ad.title,
        type: mediaUrls.length > 0 ? (mediaUrls[0].includes('video') ? 'video' : 'image') : 'text',
        url: mediaUrls[0] || null,
        content: ad.content || null,
        tags: JSON.stringify([ad.channel, ad.format, ad.objective || ''])
      }
    })
    
    await prisma.advertisement.update({
      where: { id: req.params.id },
      data: { assetId: asset.id }
    })
    
    res.json({ success: true, data: asset })
  } catch (e: any) {
    next(new AppError(e.message, 500))
  }
})

// Deletar
router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.advertisement.delete({ where: { id: req.params.id } })
    res.json({ success: true, message: 'Anúncio excluído' })
  } catch (e: any) {
    next(new AppError(e.message, 500))
  }
})

export { router as advertisementRoutes }

