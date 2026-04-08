import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import Exercises from './Exercises'

describe('Exercises Component', () => {
  test('starts, pauses, and resets the exercise timer', async () => {
    vi.useFakeTimers()
    try {
      render(<Exercises />)

      fireEvent.click(screen.getAllByRole('button', { name: /start exercise/i })[0])

      expect(screen.getByText(/Timer 00:00/i)).toBeInTheDocument()

      await act(async () => {
        vi.advanceTimersByTime(3000)
      })

      expect(screen.getByText(/Timer 00:03/i)).toBeInTheDocument()

      fireEvent.click(screen.getByRole('button', { name: /pause/i }))

      await act(async () => {
        vi.advanceTimersByTime(3000)
      })

      expect(screen.getByText(/Timer 00:03/i)).toBeInTheDocument()

      fireEvent.click(screen.getByRole('button', { name: /reset/i }))
      expect(screen.getByText(/Timer 00:00/i)).toBeInTheDocument()
    } finally {
      vi.useRealTimers()
    }
  })

  test('completes an exercise and closes the active panel', async () => {
    render(<Exercises />)

    fireEvent.click(screen.getAllByRole('button', { name: /start exercise/i })[0])
    expect(screen.getByText(/Target duration:/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /complete/i }))

    await waitFor(() => {
      expect(screen.queryByText(/Target duration:/i)).not.toBeInTheDocument()
    })
  })
})
