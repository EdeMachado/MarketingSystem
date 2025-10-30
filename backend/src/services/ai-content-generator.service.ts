import { getServiceById } from '../data/service-catalog'

interface GenerateContentRequest {
  company: string
  serviceId: string
  objective: 'conversao' | 'awareness' | 'engagement'
  channel?: 'email' | 'instagram' | 'facebook' | 'google_ads' | 'meta_ads' | 'linkedin' | 'whatsapp'
  channels?: string[] // Array de canais
  format?: string
}

interface GeneratedContent {
  email?: {
    subject: string[]
    body: string
    cta: string
  }
  social?: {
    caption: string[]
    hashtags: string[]
  }
  ads?: {
    headline: string[]
    description: string[]
    cta: string
  }
  whatsapp?: {
    message: string
  }
}

// Gerador de conteúdo baseado em templates e IA simulada
// Em produção, você integraria com OpenAI/GPT ou similar
export async function generateContentByAI(req: GenerateContentRequest): Promise<GeneratedContent> {
  if (!req.company || !req.serviceId) {
    throw new Error('company e serviceId são obrigatórios')
  }
  
  const service = getServiceById(req.company, req.serviceId)
  
  if (!service) {
    throw new Error(`Serviço ${req.serviceId} não encontrado para empresa ${req.company}. Empresas disponíveis: biomed, advocacia`)
  }

  // Seleciona CTA baseado no objetivo
  const ctaOptions = service.ctaOptions || ['Saiba mais', 'Entre em contato', 'Agende agora']
  const painPoints = service.painPoints || ['Problema comum', 'Dificuldade frequente']
  const benefits = service.benefits || ['Benefício principal', 'Solução eficaz']
  const keyMessages = service.keyMessages || ['Mensagem principal', 'Valor agregado']
  
  const cta = ctaOptions[0]
  const painPoint = painPoints[Math.floor(Math.random() * painPoints.length)]
  const benefit = benefits[Math.floor(Math.random() * benefits.length)]
  const keyMessage = keyMessages[Math.floor(Math.random() * keyMessages.length)]

  const result: GeneratedContent = {}

  // Email
  if (req.channel && ['email', 'whatsapp'].includes(req.channel)) {
    const subjects = [
      `💡 ${service.name}: ${benefit}`,
      `✨ ${keyMessage}`,
      `🏆 ${cta}`
    ]

    const body = `
Olá! 👋

Você sabia que ${painPoint.toLowerCase()}? 

Na ${req.company === 'biomed' ? 'Biomed' : 'Nossa Advocacia'}, oferecemos ${service.name.toLowerCase()} para ${benefit.toLowerCase()}.

${service.description}

${keyMessage}

🎯 ${cta}

Estamos à disposição para ajudar!
${req.company === 'biomed' ? 'Equipe Biomed' : 'Equipe Jurídica'}
    `.trim()

    result.email = {
      subject: subjects,
      body,
      cta
    }

    if (req.channel === 'whatsapp') {
      result.whatsapp = {
        message: `Olá! 👋\n\n${body.replace(/^/gm, '')}`
      }
    }
  }

  // Social Media (Instagram, Facebook, LinkedIn)
  if (req.channel && ['instagram', 'facebook', 'linkedin'].includes(req.channel)) {
    const captions = [
      `${keyMessage} 💪\n\n${service.description}\n\n${benefit}\n\n${cta}`,
      `Você já enfrentou ${painPoint.toLowerCase()}? 😔\n\n${service.description}\n\n${benefit}\n\n✨ ${cta}`,
      `${service.name} 🎯\n\n${keyMessage}\n\n${service.description}\n\n${cta}`
    ]

    const hashtags = [
      ...(req.company === 'biomed' ? ['#Biomed', '#Saude', '#Estetica'] : ['#Direito', '#Advocacia', '#Justica']),
      `#${service.category}`,
      `#${service.name.replace(/\s/g, '')}`,
      req.objective === 'conversao' ? '#Oferta' : req.objective === 'awareness' ? '#Conscientizacao' : '#Engajamento'
    ]

    result.social = {
      caption: captions,
      hashtags
    }
  }

  // Google Ads / Meta Ads
  if (req.channel && ['google_ads', 'meta_ads'].includes(req.channel)) {
    const headlines = [
      `${service.name} - ${benefit}`,
      `${cta}`,
      `${keyMessage}`
    ]

    const descriptions = [
      `${service.description} ${benefit}. ${cta}`,
      `${painPoint}? ${service.name} pode ajudar. ${benefit}. ${cta}`,
      `${keyMessage} ${service.description} ${cta}`
    ]

    result.ads = {
      headline: headlines,
      description: descriptions,
      cta
    }
  }

  return result
}

// Gera pacote completo para múltiplos canais
export async function generateCompletePackage(req: GenerateContentRequest) {
  const channels = req.channels || (req.channel ? [req.channel] : [])
  const packageContent: any = {}

  for (const channel of channels) {
    const content = await generateContentByAI({ ...req, channel: channel as any })
    packageContent[channel] = content
  }

  return packageContent
}

