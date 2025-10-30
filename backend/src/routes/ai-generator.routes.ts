import { Router } from 'express'
import { AppError } from '../middlewares/errorHandler'
import { generateContentByAI, generateCompletePackage } from '../services/ai-content-generator.service'
import { getServicesByCompany, serviceCatalog } from '../data/service-catalog'

const router = Router()

// Listar serviços por empresa
router.get('/services/:company', (req, res, next) => {
  try {
    const services = getServicesByCompany(req.params.company)
    res.json({ success: true, data: services })
  } catch (e: any) {
    console.error('Erro ao listar serviços:', e.message)
    next(new AppError(e.message || 'Erro ao listar serviços', 500))
  }
})

// Listar todas empresas e seus serviços
router.get('/catalog', (req, res) => {
  res.json({ success: true, data: serviceCatalog })
})

// Gerar conteúdo por IA
router.post('/generate', async (req, res, next) => {
  try {
    const { company, serviceId, objective, channel, format, channels } = req.body
    
    console.log('📥 Dados recebidos na IA:', JSON.stringify({ company, serviceId, objective, channel, channels, format }, null, 2))
    
    if (!company || !serviceId || !objective) {
      throw new AppError('company, serviceId e objective são obrigatórios', 400)
    }

    // Se channels (array) fornecido, gerar para todos
    if (channels && Array.isArray(channels) && channels.length > 0) {
      console.log('✅ Gerando para múltiplos canais:', channels)
      const packageContent = await generateCompletePackage({ company, serviceId, objective, channels, format })
      return res.json({ success: true, data: packageContent })
    } else if (channel) {
      // Gerar para um canal único (compatibilidade)
      console.log('✅ Gerando para canal único:', channel)
      const content = await generateContentByAI({ company, serviceId, objective, channel, format })
      res.json({ success: true, data: content })
    } else {
      console.error('❌ Nenhum canal fornecido. channels:', channels, 'channel:', channel)
      throw new AppError('channel ou channels é obrigatório. Recebido: channels=' + JSON.stringify(channels) + ', channel=' + channel, 400)
    }
  } catch (e: any) {
    console.error('Erro ao gerar conteúdo:', e.message)
    console.error('Stack:', e.stack)
    next(new AppError(e.message || 'Erro ao gerar conteúdo pela IA', 500))
  }
})

export { router as aiGeneratorRoutes }

