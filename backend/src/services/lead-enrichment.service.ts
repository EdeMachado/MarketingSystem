import { PrismaClient, Contact, Company } from '@prisma/client'
import dns from 'dns'
import { promisify } from 'util'

const prisma = new PrismaClient()
const resolveMx = promisify(dns.resolveMx)

const disposableDomains = new Set([
	'mailinator.com',
	'10minutemail.com',
	'guerrillamail.com',
	'yopmail.com',
	'getnada.com',
])

export function normalizeName(name?: string | null): string | null {
	if (!name) return null
	return name.toLowerCase().replace(/\s+/g, ' ').trim()
}

export function normalizeAddress(address?: string | null): string | null {
	if (!address) return null
	return address.toLowerCase().replace(/\s+/g, ' ').trim()
}

export function isLikelyValidEmailFormat(email?: string | null): boolean {
	if (!email) return false
	const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i
	return re.test(email)
}

function getEmailDomain(email: string): string | null {
	const parts = email.split('@')
	return parts.length === 2 ? parts[1].toLowerCase() : null
}

export async function hasMxRecords(domain: string): Promise<boolean> {
	try {
		const records = await resolveMx(domain)
		return Array.isArray(records) && records.length > 0
	} catch {
		return false
	}
}

export async function validateEmail(email?: string | null): Promise<{ valid: boolean; reason?: string }> {
	if (!email) return { valid: false, reason: 'missing' }
	if (!isLikelyValidEmailFormat(email)) return { valid: false, reason: 'format' }
	const domain = getEmailDomain(email)
	if (!domain) return { valid: false, reason: 'domain' }
	if (disposableDomains.has(domain)) return { valid: false, reason: 'disposable' }
	const mx = await hasMxRecords(domain)
	if (!mx) return { valid: false, reason: 'no_mx' }
	return { valid: true }
}

export function detectWhatsappFromPhone(phone?: string | null): { whatsapp?: string; detected: boolean } {
	if (!phone) return { detected: false }
	// Heurística simples: normaliza telefone, assume que WhatsApp = telefone informado
	const digits = phone.replace(/\D/g, '')
	if (digits.length < 10) return { detected: false }
	const intl = digits.startsWith('55') ? digits : `55${digits}`
	return { whatsapp: intl, detected: true }
}

export async function enrichContact(contact: Contact): Promise<Partial<Contact>> {
	const updates: Partial<Contact> = {}
	if (contact.email) {
		const result = await validateEmail(contact.email)
		updates.emailValid = result.valid
		updates.emailValidatedAt = new Date()
		if (!result.valid) updates.validationReason = result.reason
	}
	if (contact.phone && !contact.whatsappDetected) {
		const d = detectWhatsappFromPhone(contact.phone)
		if (d.detected) {
			updates.whatsapp = d.whatsapp as any
			updates.whatsappDetected = true as any
		}
	}
	updates.enrichedAt = new Date() as any
	return updates
}

export async function enrichCompany(company: Company): Promise<Partial<Company>> {
	const updates: Partial<Company> = {}
	if (company.email) {
		const result = await validateEmail(company.email)
		updates.emailValid = result.valid as any
		updates.emailValidatedAt = new Date() as any
	}
	if (company.phone && !company.whatsappDetected) {
		const d = detectWhatsappFromPhone(company.phone)
		if (d.detected) {
			updates.whatsapp = d.whatsapp
			updates.whatsappDetected = true as any
		}
	}
	updates.normalizedName = normalizeName(company.name) as any
	updates.normalizedAddress = normalizeAddress(company.address) as any
	updates.enrichedAt = new Date() as any
	return updates
}

export async function enrichContactsByFilter(where: any): Promise<number> {
	const contacts = await prisma.contact.findMany({ where })
	let updated = 0
	for (const c of contacts) {
		const data = await enrichContact(c)
		if (Object.keys(data).length) {
			await prisma.contact.update({ where: { id: c.id }, data })
			updated++
		}
	}
	return updated
}

export async function enrichCompaniesByFilter(where: any): Promise<number> {
	const companies = await prisma.company.findMany({ where })
	let updated = 0
	for (const co of companies) {
		const data = await enrichCompany(co)
		if (Object.keys(data).length) {
			await prisma.company.update({ where: { id: co.id }, data })
			updated++
		}
	}
	return updated
}
