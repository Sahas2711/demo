import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { authApi } from '@/api/authApi'
import { server } from '@/test/mocks/server'

describe('authApi', () => {
  it('logs in successfully', async () => {
    const response = await authApi.login({ email: 'admin@inventra.test', password: 'password123' })

    expect(response.data.accessToken).toBe('access-token')
    expect(response.data.user.role).toBe('ADMIN')
  })

  it('registers successfully with an explicit role', async () => {
    const response = await authApi.register({
      name: 'Staff User',
      email: 'staff@inventra.test',
      password: 'password123',
      role: 'STAFF',
    })

    expect(response.data.user.email).toBe('staff@inventra.test')
    expect(response.data.user.role).toBe('STAFF')
  })

  it('surfaces validation failures from login', async () => {
    await expect(authApi.login({ email: '', password: '' })).rejects.toMatchObject({
      response: { status: 401 },
    })
  })

  it('surfaces duplicate registration errors', async () => {
    await expect(authApi.register({
      name: 'Existing User',
      email: 'existing@inventra.test',
      password: 'password123',
      role: 'ADMIN',
    })).rejects.toMatchObject({
      response: { status: 409 },
    })
  })

  it('refreshes and logs out the session', async () => {
    await expect(authApi.refresh()).resolves.toMatchObject({ data: { refreshToken: 'refresh-token' } })
    await expect(authApi.logout()).resolves.toMatchObject({ data: { message: 'Logged out successfully' } })
  })

  it('rejects network errors cleanly', async () => {
    server.use(http.post('http://localhost:8080/v1/auth/login', () => HttpResponse.error()))

    await expect(authApi.login({ email: 'admin@inventra.test', password: 'password123' })).rejects.toBeTruthy()
  })
})
