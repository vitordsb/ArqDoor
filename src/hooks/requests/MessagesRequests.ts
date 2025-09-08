import { apiRequest } from '@/lib/queryClient'
import { Ticket, Step, StepStatus } from '@/lib/Interfaces'

export async function getStepsForTicket(ticketId: number): Promise<Step[]> {
  const res = await apiRequest('GET', `/steps/ticket/${ticketId}`)
  const json = await res.json().catch(() => ({}))
  return json?.steps ?? []
}

export async function updateStep(stepId: number, body: Partial<Step>) {
  const res = await apiRequest('PATCH', `/steps/${stepId}`, body)
  return res.ok
}

export async function deleteStep(stepId: number) {
  const res = await apiRequest('DELETE', `/steps/${stepId}`)
  return res.ok
}

export async function updateTicketStatus(ticketId: number, status: Ticket['status']) {
  const res = await apiRequest('PATCH', `/tickets/${ticketId}/status`, { status })
  return res.ok
}

export async function destroyTicket(ticketId: number) {
  const res = await apiRequest('DELETE', `/ticket/${ticketId}`)
  return res.ok
}

export async function buscarPDF(ticketId: number): Promise<{ blob: Blob; blobUrl: string; filename?: string } | null> {
  const res = await apiRequest('GET', `/attachment/ticket/${ticketId}`)
  if (!res.ok) return null
  const blob = await res.blob()
  const blobUrl = URL.createObjectURL(blob)
  const filename = `contrato-ticket-${ticketId}.pdf`
  return { blob, blobUrl, filename }
}

export async function signDocument(ticketId: number, password: string, email?: string) {
  const validate = await apiRequest('POST', '/auth/login', { email, password })
  if (!validate.ok) return false
  const res = await apiRequest('POST', `/tickets/${ticketId}/sign`)
  return res.ok
}

export async function createProposal(
  steps: Array<{ title: string; price: number }>,
  file?: File
) {
  const fd = new FormData()
  fd.append('steps', JSON.stringify(steps))
  if (file) fd.append('file', file)
  const res = await apiRequest('POST', '/tickets/proposal', fd)
  return res.ok
}
