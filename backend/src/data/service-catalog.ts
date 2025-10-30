// Catálogo de serviços por empresa/vertical

export interface ServiceCatalog {
  company: string
  services: {
    id: string
    name: string
    category: string
    description: string
    targetAudience: string
    painPoints: string[]
    benefits: string[]
    ctaOptions: string[]
    toneOfVoice: string
    keyMessages: string[]
  }[]
}

export const serviceCatalog: ServiceCatalog[] = [
  {
    company: 'biomed',
    services: [
      {
        id: 'estetica-facial',
        name: 'Estética Facial',
        category: 'Estética',
        description: 'Tratamentos faciais incluindo limpeza de pele, peeling, harmonização, botox, preenchimento',
        targetAudience: 'Mulheres e homens 25-55 anos, interessados em aparência e bem-estar',
        painPoints: ['Sinais de envelhecimento', 'Acne e manchas', 'Falta de autoestima', 'Pele sem vida'],
        benefits: ['Pele rejuvenescida', 'Autoestima elevada', 'Resultados visíveis', 'Tratamento seguro e profissional'],
        ctaOptions: ['Agende sua avaliação gratuita', 'Transforme sua pele hoje', 'Saiba mais sobre nossos tratamentos'],
        toneOfVoice: 'Cuidado, profissional, confiável, acolhedor, empoderador',
        keyMessages: ['Sua beleza é nossa prioridade', 'Resultados comprovados', 'Equipe especializada', 'Tecnologia de ponta']
      },
      {
        id: 'exames-laboratoriais',
        name: 'Exames Laboratoriais',
        category: 'Saúde',
        description: 'Exames de sangue, urina, imagem para check-up completo e diagnósticos',
        targetAudience: 'Pessoas de todas as idades que precisam fazer exames de rotina ou específicos',
        painPoints: ['Dificuldade para agendar', 'Resultados demoram', 'Não entende os resultados', 'Medo de exames'],
        benefits: ['Agendamento rápido', 'Resultados em até 24h', 'Laudo detalhado e explicativo', 'Ambiente seguro e confortável'],
        ctaOptions: ['Agende seus exames', 'Cuide da sua saúde hoje', 'Check-up completo com desconto'],
        toneOfVoice: 'Profissional, confiável, preocupado com saúde, claro e didático',
        keyMessages: ['Sua saúde em primeiro lugar', 'Resultados confiáveis', 'Atendimento humanizado', 'Tecnologia de ponta']
      },
      {
        id: 'check-up-executivo',
        name: 'Check-up Executivo',
        category: 'Saúde',
        description: 'Pacote completo de exames para executivos e profissionais ocupados',
        targetAudience: 'Executivos, empresários, profissionais 35+ anos com rotina corrida',
        painPoints: ['Falta tempo', 'Rotina estressante', 'Não cuida da saúde', 'Medo de descobrir problemas'],
        benefits: ['Pacote completo em um dia', 'Agendamento flexível', 'Laudo para empresa', 'Prevenção de doenças'],
        ctaOptions: ['Invista na sua saúde', 'Check-up completo hoje', 'Priorize seu bem-estar'],
        toneOfVoice: 'Profissional, eficiente, direto, valoriza o tempo do cliente',
        keyMessages: ['Sua saúde é seu maior investimento', 'Prevenção é o melhor remédio', 'Resultado em um dia']
      },
      {
        id: 'harmonizacao-facial',
        name: 'Harmonização Facial',
        category: 'Estética',
        description: 'Botox, preenchimento, bioestimuladores para harmonização facial',
        targetAudience: 'Mulheres e homens 30-50 anos buscando rejuvenescimento natural',
        painPoints: ['Rugas e linhas de expressão', 'Volume facial perdido', 'Assimetria facial', 'Desconfiança com procedimentos'],
        benefits: ['Resultado natural', 'Sem cirurgia', 'Recuperação rápida', 'Profissionais certificados'],
        ctaOptions: ['Rejuvenesça de forma natural', 'Harmonize seu rosto', 'Agende sua avaliação'],
        toneOfVoice: 'Elegante, discreto, profissional, moderno',
        keyMessages: ['Beleza natural', 'Resultados duradouros', 'Segurança em primeiro lugar']
      }
    ]
  },
  {
    company: 'advocacia',
    services: [
      {
        id: 'direito-civil',
        name: 'Direito Civil',
        category: 'Jurídico',
        description: 'Contratos, divórcios, inventários, indenizações, questões familiares',
        targetAudience: 'Pessoas físicas que precisam de assistência jurídica em questões civis',
        painPoints: ['Processos demoram muito', 'Não entendem os procedimentos', 'Custos altos', 'Falta de informação'],
        benefits: ['Atendimento personalizado', 'Processos otimizados', 'Transparência total', 'Sucesso comprovado'],
        ctaOptions: ['Resolva sua questão jurídica', 'Agende uma consulta', 'Fale com nosso especialista'],
        toneOfVoice: 'Profissional, confiável, empático, claro e acessível',
        keyMessages: ['Justiça ao seu alcance', 'Experiência comprovada', 'Atendimento humanizado', 'Resultados eficientes']
      },
      {
        id: 'direito-trabalhista',
        name: 'Direito Trabalhista',
        category: 'Jurídico',
        description: 'Recisões, FGTS, horas extras, acidente de trabalho, assédio',
        targetAudience: 'Trabalhadores que tiveram seus direitos violados ou precisam de orientação trabalhista',
        painPoints: ['Medo de perder o emprego', 'Não conhece seus direitos', 'Empresa não respeita', 'Falta de dinheiro'],
        benefits: ['Consultoria gratuita', 'Receba o que é seu direito', 'Sem custos iniciais', 'Vitória com sucesso'],
        ctaOptions: ['Defenda seus direitos', 'Receba o que você merece', 'Consultoria gratuita'],
        toneOfVoice: 'Empático, acessível, corajoso, firme, protetor',
        keyMessages: ['Seus direitos importam', 'Não fique calado', 'Vitórias comprovadas', 'Atendimento rápido']
      },
      {
        id: 'direito-previdenciario',
        name: 'Direito Previdenciário',
        category: 'Jurídico',
        description: 'Aposentadorias, auxílio-doença, BPC, revisões, pensão por morte',
        targetAudience: 'Pessoas que precisam acessar benefícios previdenciários ou revisar valores',
        painPoints: ['INSS demora muito', 'Benefício negado', 'Valor menor que deveria', 'Burocracia'],
        benefits: ['Aprovação mais rápida', 'Revisão de valores', 'Expertise no INSS', 'Sucesso em 95% dos casos'],
        ctaOptions: ['Acesse seus benefícios', 'Reveja seu benefício', 'Aposentadoria garantida'],
        toneOfVoice: 'Acolhedor, paciente, informativo, esperançoso, determinante',
        keyMessages: ['Seu futuro depende disso', 'Não desista', 'Aprovação mais rápida', 'Valor correto']
      },
      {
        id: 'consultoria-empresarial',
        name: 'Consultoria Empresarial',
        category: 'Jurídico',
        description: 'Contratos empresariais, compliance, societário, tributário',
        targetAudience: 'Empresários, MEIs, pequenas e médias empresas',
        painPoints: ['Leis complexas', 'Risco de multas', 'Contratos mal feitos', 'Falta de compliance'],
        benefits: ['Empresa protegida', 'Economia de tempo e dinheiro', 'Compliance garantido', 'Crescimento seguro'],
        ctaOptions: ['Proteja sua empresa', 'Evite multas e problemas', 'Cresça com segurança'],
        toneOfVoice: 'Profissional, estratégico, confiável, consultivo, parceiro',
        keyMessages: ['Sua empresa protegida', 'Crescimento seguro', 'Expertise empresarial', 'Compliance garantido']
      }
    ]
  }
]

export function getServicesByCompany(company: string) {
  const catalog = serviceCatalog.find(c => c.company === company)
  return catalog?.services || []
}

export function getServiceById(company: string, serviceId: string) {
  const services = getServicesByCompany(company)
  return services.find(s => s.id === serviceId)
}

