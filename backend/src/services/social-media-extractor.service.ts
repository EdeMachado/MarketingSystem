import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Buscar perfis de redes sociais de uma empresa a partir do website
 */
export interface SocialMediaProfiles {
  linkedin?: string;
  instagram?: string;
  facebook?: string;
  telegram?: string;
  twitter?: string;
  youtube?: string;
  whatsapp?: string;
}

/**
 * Extrair perfis de redes sociais do website da empresa
 */
export const extractSocialMediaFromWebsite = async (website: string): Promise<SocialMediaProfiles> => {
  const profiles: SocialMediaProfiles = {};

  if (!website) {
    return profiles;
  }

  try {
    // Normalizar URL
    let url = website;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }

    // Buscar páginas comuns onde redes sociais aparecem
    const pagesToCheck = [
      '', // Página principal
      '/contato',
      '/contact',
      '/fale-conosco',
      '/contact-us',
      '/sobre',
      '/about',
      '/sobre-nos',
      '/about-us',
    ];

    for (const page of pagesToCheck) {
      try {
        const pageUrl = url.replace(/\/$/, '') + page;
        const response = await axios.get(pageUrl, {
          timeout: 5000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          },
        });

        const $ = cheerio.load(response.data);

        // Buscar links de redes sociais
        $('a[href]').each((_, element) => {
          const href = $(element).attr('href') || '';
          const text = $(element).text().toLowerCase();

          // LinkedIn
          if (!profiles.linkedin) {
            if (href.includes('linkedin.com/company/') || href.includes('linkedin.com/in/')) {
              profiles.linkedin = href.startsWith('http') ? href : `https://${href.replace(/^\/\//, '')}`;
            } else if (text.includes('linkedin') || $(element).attr('aria-label')?.toLowerCase().includes('linkedin')) {
              const fullUrl = href.startsWith('http') ? href : `${url}${href}`;
              if (fullUrl.includes('linkedin.com')) {
                profiles.linkedin = fullUrl;
              }
            }
          }

          // Instagram
          if (!profiles.instagram) {
            if (href.includes('instagram.com/')) {
              profiles.instagram = href.startsWith('http') ? href : `https://${href.replace(/^\/\//, '')}`;
            } else if (text.includes('instagram') || $(element).attr('aria-label')?.toLowerCase().includes('instagram')) {
              const fullUrl = href.startsWith('http') ? href : `${url}${href}`;
              if (fullUrl.includes('instagram.com')) {
                profiles.instagram = fullUrl;
              }
            }
          }

          // Facebook
          if (!profiles.facebook) {
            if (href.includes('facebook.com/') || href.includes('fb.com/')) {
              profiles.facebook = href.startsWith('http') ? href : `https://${href.replace(/^\/\//, '')}`;
            } else if (text.includes('facebook') || text.includes('fb ') || $(element).attr('aria-label')?.toLowerCase().includes('facebook')) {
              const fullUrl = href.startsWith('http') ? href : `${url}${href}`;
              if (fullUrl.includes('facebook.com') || fullUrl.includes('fb.com')) {
                profiles.facebook = fullUrl;
              }
            }
          }

          // Telegram
          if (!profiles.telegram) {
            if (href.includes('t.me/') || href.includes('telegram.me/')) {
              profiles.telegram = href.startsWith('http') ? href : `https://${href.replace(/^\/\//, '')}`;
            } else if (text.includes('telegram') || $(element).attr('aria-label')?.toLowerCase().includes('telegram')) {
              const fullUrl = href.startsWith('http') ? href : `${url}${href}`;
              if (fullUrl.includes('t.me') || fullUrl.includes('telegram.me')) {
                profiles.telegram = fullUrl;
              }
            }
          }

          // Twitter/X
          if (!profiles.twitter) {
            if (href.includes('twitter.com/') || href.includes('x.com/')) {
              profiles.twitter = href.startsWith('http') ? href : `https://${href.replace(/^\/\//, '')}`;
            } else if (text.includes('twitter') || $(element).attr('aria-label')?.toLowerCase().includes('twitter')) {
              const fullUrl = href.startsWith('http') ? href : `${url}${href}`;
              if (fullUrl.includes('twitter.com') || fullUrl.includes('x.com')) {
                profiles.twitter = fullUrl;
              }
            }
          }

          // YouTube
          if (!profiles.youtube) {
            if (href.includes('youtube.com/') || href.includes('youtu.be/')) {
              profiles.youtube = href.startsWith('http') ? href : `https://${href.replace(/^\/\//, '')}`;
            } else if (text.includes('youtube') || $(element).attr('aria-label')?.toLowerCase().includes('youtube')) {
              const fullUrl = href.startsWith('http') ? href : `${url}${href}`;
              if (fullUrl.includes('youtube.com') || fullUrl.includes('youtu.be')) {
                profiles.youtube = fullUrl;
              }
            }
          }
        });

        // Buscar em meta tags (alguns sites usam)
        $('meta[property^="og:"], meta[name^="twitter:"]').each((_, element) => {
          const property = $(element).attr('property') || $(element).attr('name') || '';
          const content = $(element).attr('content') || '';

          if (content.includes('linkedin.com') && !profiles.linkedin) {
            profiles.linkedin = content;
          }
          if (content.includes('instagram.com') && !profiles.instagram) {
            profiles.instagram = content;
          }
          if (content.includes('facebook.com') && !profiles.facebook) {
            profiles.facebook = content;
          }
        });

        // Se já encontrou todas as principais, pode parar
        if (profiles.linkedin && profiles.instagram && profiles.facebook) {
          break;
        }

      } catch (error) {
        // Continuar tentando outras páginas
        continue;
      }
    }

    return profiles;
  } catch (error: any) {
    console.error(`Erro ao extrair redes sociais de ${website}:`, error.message);
    return profiles;
  }
};

/**
 * Buscar WhatsApp Business de uma empresa (se disponível publicamente)
 */
export const findWhatsAppBusiness = async (website: string, phone?: string): Promise<string | undefined> => {
  try {
    let url = website;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }

    // Buscar em páginas de contato
    const contactPages = ['/contato', '/contact', '/fale-conosco'];

    for (const page of contactPages) {
      try {
        const pageUrl = url.replace(/\/$/, '') + page;
        const response = await axios.get(pageUrl, {
          timeout: 5000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        });

        // Buscar padrões de WhatsApp
        const whatsappRegex = /(?:https?:\/\/)?(?:wa\.me\/|api\.whatsapp\.com\/send\?phone=)([\d+]+)/gi;
        const matches = response.data.match(whatsappRegex);

        if (matches && matches.length > 0) {
          // Extrair número
          const phoneMatch = matches[0].match(/([\d+]+)/);
          if (phoneMatch) {
            return phoneMatch[1];
          }
        }

        // Buscar por texto "whatsapp" seguido de número
        const whatsappTextRegex = /whatsapp[:\s]*([+\d\s\(\)\-]+)/gi;
        const textMatches = response.data.match(whatsappTextRegex);
        if (textMatches) {
          const phoneMatch = textMatches[0].match(/([\d+]+)/);
          if (phoneMatch) {
            return phoneMatch[1];
          }
        }

      } catch {
        continue;
      }
    }

    // Se temos telefone, assumir que pode ter WhatsApp
    if (phone) {
      const cleanPhone = phone.replace(/\D/g, '');
      if (cleanPhone.length >= 10) {
        // Retornar no formato internacional (assumindo Brasil)
        const intl = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
        return intl;
      }
    }

    return undefined;
  } catch {
    return undefined;
  }
};


