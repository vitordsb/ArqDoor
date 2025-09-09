import { apiRequest } from '@/lib/queryClient'
import { Ticket, Step } from '@/lib/Interfaces'

export async function getStepsForTicket(ticketId: number): Promise<Step[]> {
  const res = await apiRequest('GET', `/step/${ticketId}`)
  const json = await res.json().catch(() => ({}))
  return json?.steps ?? []
}

export async function signDocument(ticketId: number, password: string, email?: string) {
  const validate = await apiRequest('POST', '/auth/login', { email, password })
  if (!validate.ok) return false
  const res = await apiRequest('PATCH', `/ticket/signature/${ticketId}`, { signature: true, password })
  return res.ok
}

export async function createProposal(
  steps: Array<{ title: string; price: number }>,
  file?: File | Blob
) {
  const fd = new FormData()
  fd.append('steps', JSON.stringify(steps))
  if (file) fd.append('File', file)
  const res = await apiRequest('POST', `/upload/pdf/`, fd)
  console.log(res)
  return res.ok
}
