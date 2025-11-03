import { PrismaClient } from '@prisma/client';
import { generateSEOContent } from './seo.service';
import { createSeoPage, generateSlug, generateExportableHTML } from './seo-page.service';
import { dispatchMultiChannel } from './multi-channel-dispatcher.service';
import { generateMultiChannelTemplates } from './template-generator.service';
import { sendBulkEmails } from './email.service';
import { sendBulkWhatsApp } from './whatsapp.service';
import { postToMultiplePlatforms } from './social.service';
import {
  trackEmailSent,
  trackWhatsAppSent,
  trackInstagramPost,
  trackFacebookPost,
  trackLinkedInPost,
  trackTelegramMessage,
} from './channel-cost-tracker.service';
import { uploadSeoPageToSite } from './ftp-upload.service';
import { submitUrlToGoogle } from './google-search-console.service';

const prisma = new PrismaClient();

interface AutoPublishConfig {
  topic: string;
  keywords: string[];
  contentType?: 'article' | 'landing' | 'blog';
  channels: ('email' | 'whatsapp' | 'instagram' | 'facebook' | 'linkedin' | 'telegram' | 'site')[];
  targetContacts?: 'all' | 'segment'; // Todo mundo ou segmento específico
  segmentId?: string; // Se for segmento
  saveToSite?: boolean; // Salvar como página SEO no site
}

interface PublishResult {
  success: boolean;
  seoPage?: {
    id: string;
    slug: string;
    url: string;
    uploadedToSite?: boolean;
    googleSubmitted?: boolean;
  };
  campaign?: {
    id: string;
    name: string;
  };
  channels: {
    [key: string]: {
      success: boolean;
      sent?: number;
      failed?: number;
      message?: string;
    };
  };
  summary: {
    totalChannels: number;
    successfulChannels: number;
    totalSent: number;
  };
}

// Publicação automática completa
export const autoPublish = async (config: AutoPublishConfig): Promise<PublishResult> => {
  const {
    topic,
    keywords,
    contentType = 'article',
    channels,
    targetContacts = 'all',
    segmentId,
    saveToSite = true,
  } = config;

  const result: PublishResult = {
    success: false,
    channels: {},
    summary: {
      totalChannels: channels.length,
      successfulChannels: 0,
      totalSent: 0,
    },
  };

  try {
    // PASSO 1: Gerar conteúdo SEO otimizado
    console.log(`📝 Gerando conteúdo SEO para: ${topic}`);
    const seoContent = await generateSEOContent(topic, keywords, contentType);

    // PASSO 2: Salvar como página SEO (se solicitado)
    let seoPageId: string | undefined;
    if (saveToSite) {
      try {
        console.log(`💾 Salvando página SEO no site...`);
        const seoPage = await createSeoPage({
          title: seoContent.title,
          metaDescription: seoContent.metaDescription,
          slug: generateSlug(topic),
          h1: seoContent.h1,
          h2s: seoContent.h2,
          content: seoContent.content,
          keywords: seoContent.keywords,
          contentType,
          wordCount: seoContent.wordCount,
          readabilityScore: seoContent.readabilityScore,
        });

        seoPageId = seoPage.id;
        result.seoPage = {
          id: seoPage.id,
          slug: seoPage.slug,
          url: `https://grupobiomed.com/${seoPage.slug}`,
        };

        console.log(`✅ Página SEO criada: ${seoPage.slug}`);

        // AUTOMAÇÃO: Upload automático para o site (se FTP configurado)
        if (saveToSite) {
          try {
            console.log(`📤 Fazendo upload automático para o site...`);
            const html = generateExportableHTML(seoPage);
            const uploadResult = await uploadSeoPageToSite(html, seoPage.slug);

            if (uploadResult.success && uploadResult.url) {
              console.log(`✅ Página publicada no site: ${uploadResult.url}`);
              result.seoPage.url = uploadResult.url;
              result.seoPage.uploadedToSite = true;

              // Atualizar no banco
              // @ts-ignore - Campos adicionados no schema, Prisma Client será regenerado
              await prisma.seoPage.update({
                where: { id: seoPageId },
                data: {
                  uploadedToSite: true,
                  uploadedAt: new Date(),
                },
              });

              // AUTOMAÇÃO: Submeter ao Google automaticamente (se configurado)
              try {
                console.log(`🔍 Submetendo ao Google automaticamente...`);
                const googleResult = await submitUrlToGoogle(uploadResult.url);
                if (googleResult.success) {
                  console.log(`✅ Submetido ao Google: ${googleResult.message}`);
                  result.seoPage.googleSubmitted = true;

                  // Atualizar no banco
                  // @ts-ignore - Campos adicionados no schema, Prisma Client será regenerado
                  await prisma.seoPage.update({
                    where: { id: seoPageId },
                    data: {
                      googleSubmitted: true,
                      googleSubmittedAt: new Date(),
                    },
                  });
                }
              } catch (googleError: any) {
                console.log(`⚠️ Erro ao submeter ao Google: ${googleError.message}`);
                // Continua mesmo se falhar
              }
            } else {
              console.log(`ℹ️ Upload não configurado: ${uploadResult.message}`);
              console.log(`   Configure FTP_HOST, FTP_USER, FTP_PASS no .env para upload automático`);
            }
          } catch (uploadError: any) {
            console.error(`⚠️ Erro ao fazer upload: ${uploadError.message}`);
            // Continua mesmo se falhar
          }
        }
      } catch (error: any) {
        console.error(`⚠️ Erro ao salvar página SEO: ${error.message}`);
        // Continua mesmo se falhar
      }
    }

    // PASSO 3: Buscar contatos
    console.log(`📇 Buscando contatos...`);
    let contacts: any[] = [];

    if (targetContacts === 'all') {
      contacts = await prisma.contact.findMany({
        where: {
          status: 'active',
          optOut: false,
        },
        select: {
          id: true,
          email: true,
          phone: true,
          name: true,
        },
      });
    } else if (targetContacts === 'segment' && segmentId) {
      const segment = await prisma.segment.findUnique({
        where: { id: segmentId },
      });

      if (segment) {
        // Aplicar filtros do segmento (simplificado - pode ser melhorado)
        const filters = JSON.parse(segment.filters);
        // Por enquanto, buscar todos os ativos se for segmento dinâmico
        contacts = await prisma.contact.findMany({
          where: {
            status: 'active',
            optOut: false,
          },
          select: {
            id: true,
            email: true,
            phone: true,
            name: true,
          },
        });
      }
    }

    console.log(`📇 ${contacts.length} contatos encontrados`);

    // PASSO 4: Gerar templates para cada canal
    console.log(`🎨 Gerando templates multi-canal...`);
    const templates = generateMultiChannelTemplates({
      title: seoContent.title,
      content: seoContent.content,
    });

    // PASSO 5: Criar campanha no banco
    const campaignName = `Auto: ${topic} - ${new Date().toLocaleDateString('pt-BR')}`;
    const campaign = await prisma.campaign.create({
      data: {
        name: campaignName,
        description: `Publicação automática gerada para "${topic}"`,
        type: channels.includes('email') ? 'email' : channels[0] || 'email',
        status: 'running',
        subject: seoContent.title,
        template: templates.email || seoContent.content,
        metadata: JSON.stringify({
          autoPublished: true,
          topic,
          keywords,
          contentType,
          seoPageId,
          channels,
        }),
        startedAt: new Date(),
      },
    });

    result.campaign = {
      id: campaign.id,
      name: campaign.name,
    };

    // Associar contatos à campanha
    if (contacts.length > 0) {
      await prisma.campaignContact.createMany({
        data: contacts.map((contact) => ({
          campaignId: campaign.id,
          contactId: contact.id,
          status: 'pending',
        })),
      });
    }

    // PASSO 6: Publicar em cada canal simultaneamente
    console.log(`🚀 Publicando em ${channels.length} canais...`);

    const channelPromises = channels.map(async (channel) => {
      try {
        switch (channel) {
          case 'email':
            const emailContacts = contacts.filter((c) => c.email);
            if (emailContacts.length === 0) {
              result.channels.email = {
                success: false,
                message: 'Nenhum contato com email encontrado',
              };
              return;
            }

            const emailResult = await sendBulkEmails(
              emailContacts.map((c) => ({
                email: c.email!,
                phone: '',
                name: c.name,
                variables: {},
              })),
              seoContent.title,
              templates.email || seoContent.content
            );

            const emailCount = emailResult.success || 0;
            trackEmailSent(emailCount); // Registrar uso
            result.channels.email = {
              success: true,
              sent: emailCount,
              failed: emailResult.failed || 0,
            };
            result.summary.totalSent += emailCount;
            result.summary.successfulChannels += 1;
            console.log(`✅ Email: ${emailCount} enviados`);
            break;

          case 'whatsapp':
            const whatsappContacts = contacts.filter((c) => c.phone);
            if (whatsappContacts.length === 0) {
              result.channels.whatsapp = {
                success: false,
                message: 'Nenhum contato com WhatsApp encontrado',
              };
              return;
            }

            const whatsappResult = await sendBulkWhatsApp(
              whatsappContacts.map((c) => ({
                email: '',
                phone: c.phone!,
                name: c.name,
                variables: {},
              })),
              templates.whatsapp || seoContent.content
            );

            const whatsappCount = whatsappResult.success || 0;
            trackWhatsAppSent(whatsappCount); // Registrar uso e custo
            result.channels.whatsapp = {
              success: true,
              sent: whatsappCount,
              failed: whatsappResult.failed || 0,
            };
            result.summary.totalSent += whatsappCount;
            result.summary.successfulChannels += 1;
            console.log(`✅ WhatsApp: ${whatsappCount} enviados`);
            break;

          case 'instagram':
          case 'facebook':
          case 'linkedin':
            const socialMessage = `${seoContent.title}\n\n${seoContent.metaDescription}\n\n🔗 Saiba mais em: ${result.seoPage?.url || 'grupobiomed.com'}`;
            const socialResult = await postToMultiplePlatforms(
              [channel],
              socialMessage
            );

            if (socialResult[0]?.success) {
              // Registrar uso
              if (channel === 'instagram') trackInstagramPost(1);
              if (channel === 'facebook') trackFacebookPost(1);
              if (channel === 'linkedin') trackLinkedInPost(1);
              
              result.channels[channel] = {
                success: true,
                sent: 1,
              };
              result.summary.totalSent += 1;
              result.summary.successfulChannels += 1;
              console.log(`✅ ${channel}: Publicado com sucesso`);
            } else {
              result.channels[channel] = {
                success: false,
                message: socialResult[0]?.error || 'Erro desconhecido',
              };
            }
            break;

          case 'telegram':
            // Telegram - implementar quando tiver API
            trackTelegramMessage(0); // Por enquanto não usa, mas registra
            result.channels.telegram = {
              success: false,
              message: 'Telegram ainda não configurado',
            };
            break;

          case 'site':
            // Site já foi publicado no passo 2
            result.channels.site = {
              success: saveToSite && !!seoPageId,
              sent: saveToSite && seoPageId ? 1 : 0,
              message: saveToSite && seoPageId
                ? `Publicado em: ${result.seoPage?.url}`
                : 'Página não salva',
            };
            if (saveToSite && seoPageId) {
              result.summary.totalSent += 1;
              result.summary.successfulChannels += 1;
            }
            break;
        }
      } catch (error: any) {
        console.error(`❌ Erro ao publicar em ${channel}:`, error.message);
        result.channels[channel] = {
          success: false,
          message: error.message,
        };
      }
    });

    // Aguardar todos os canais
    await Promise.allSettled(channelPromises);

    // Atualizar status da campanha
    await prisma.campaign.update({
      where: { id: campaign.id },
      data: {
        status: 'completed',
        completedAt: new Date(),
      },
    });

    result.success = result.summary.successfulChannels > 0;
    console.log(`🎉 Publicação concluída! ${result.summary.successfulChannels}/${result.summary.totalChannels} canais com sucesso`);

    return result;
  } catch (error: any) {
    console.error('❌ Erro na publicação automática:', error);
    throw new Error(`Erro ao publicar automaticamente: ${error.message}`);
  }
};

