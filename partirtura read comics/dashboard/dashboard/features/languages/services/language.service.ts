import { apiClient } from '@/infrastructure/api/client/api-client'
import type { Language } from '@/types/languages'

export async function getLanguages(): Promise<Language[]> {
  return apiClient<Language[]>('/admin-languages')
}
