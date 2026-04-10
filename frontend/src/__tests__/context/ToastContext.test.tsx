import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ToastProvider, useToast } from '@/context/ToastContext'
import { renderWithProviders, screen, waitForElementToBeRemoved } from '../test-utils'

function ToastConsumer() {
  const { showToast } = useToast()
  return (
    <div>
      <button onClick={() => showToast('Saved successfully', 'success')}>Show Success</button>
      <button onClick={() => showToast('Something failed')}>Show Error</button>
    </div>
  )
}

describe('ToastContext', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('throws when used outside ToastProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    expect(() => renderWithProviders(<ToastConsumer />)).toThrow(/useToast must be used within/i)
    spy.mockRestore()
  })

  it('renders provider children and shows toasts from consumers', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <ToastProvider>
        <ToastConsumer />
      </ToastProvider>,
    )

    await user.click(screen.getByRole('button', { name: /show success/i }))
    await user.click(screen.getByRole('button', { name: /show error/i }))

    expect(screen.getByText('Saved successfully')).toBeInTheDocument()
    expect(screen.getByText('Something failed')).toBeInTheDocument()
  })

  it('removes toast messages after the timeout', async () => {
    vi.useFakeTimers()
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderWithProviders(
      <ToastProvider>
        <ToastConsumer />
      </ToastProvider>,
    )

    await user.click(screen.getByRole('button', { name: /show success/i }))
    const toast = screen.getByText('Saved successfully')
    vi.advanceTimersByTime(4000)

    await waitForElementToBeRemoved(toast)
  })
})
