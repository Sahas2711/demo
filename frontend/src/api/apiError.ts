import type { AxiosError } from 'axios'

interface ApiErrorResponse {
  message?: string
  status?: number
  path?: string
}

export function extractApiError(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  const axiosErr = err as AxiosError<ApiErrorResponse>
  return axiosErr?.response?.data?.message ?? fallback
}
