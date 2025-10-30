import validator from 'validator';

// Validar email
export const isValidEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  
  // Validação básica com validator
  if (!validator.isEmail(email)) return false;
  
  // Filtrar emails descartáveis e suspeitos
  const disposableEmails = [
    'tempmail',
    'guerrillamail',
    'mailinator',
    '10minutemail',
    'throwaway',
  ];
  
  const domain = email.split('@')[1]?.toLowerCase();
  if (domain && disposableEmails.some(d => domain.includes(d))) {
    return false;
  }
  
  return true;
};

// Normalizar telefone brasileiro
export const normalizePhone = (phone: string): string => {
  if (!phone) return '';
  
  // Remove tudo que não é número
  let cleaned = phone.replace(/\D/g, '');
  
  // Se começa com 0, remover
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }
  
  // Se tem 11 dígitos e começa com 9, é celular
  if (cleaned.length === 11 && cleaned.startsWith('9')) {
    return `+55${cleaned}`;
  }
  
  // Se tem 10 dígitos, é fixo
  if (cleaned.length === 10) {
    return `+55${cleaned}`;
  }
  
  // Se já tem código do país
  if (cleaned.startsWith('55')) {
    return `+${cleaned}`;
  }
  
  // Adicionar código do país se não tiver
  if (cleaned.length >= 10 && cleaned.length <= 11) {
    return `+55${cleaned}`;
  }
  
  return phone; // Retornar original se não conseguir normalizar
};

// Validar telefone brasileiro
export const isValidPhone = (phone: string): boolean => {
  if (!phone) return false;
  
  const cleaned = normalizePhone(phone);
  
  // Telefone brasileiro: +55XXXXXXXXXXX (11 ou 10 dígitos após +55)
  const brazilianPhoneRegex = /^\+55[1-9][0-9]{9,10}$/;
  
  return brazilianPhoneRegex.test(cleaned);
};

// Validar WhatsApp (assume que qualquer celular brasileiro pode ser WhatsApp)
export const isValidWhatsApp = (phone: string): boolean => {
  if (!phone) return false;
  
  const cleaned = normalizePhone(phone);
  
  // WhatsApp: celular brasileiro (11 dígitos após +55, começando com 9)
  const whatsappRegex = /^\+55[1-9][9][0-9]{8}$/;
  
  return whatsappRegex.test(cleaned);
};

// Extrair CEP de endereço
export const extractCEP = (address: string): string | null => {
  if (!address) return null;
  
  // CEP formato: 00000-000 ou 00000000
  const cepRegex = /\d{5}-?\d{3}/;
  const match = address.match(cepRegex);
  
  return match ? match[0].replace(/\D/g, '') : null;
};


