import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import Profile from './Profile'
import { server } from '../../mocks/server'

const mocks = vi.hoisted(() => ({
  updateUser: vi.fn(),
  logout: vi.fn(),
  user: {
    id: 'user-123',
    name: 'Test User',
    email: 'test@test.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test@test.com',
    bio: 'Testing profile bio',
    goals: ['Track mood daily', 'Practice meditation'],
    joinDate: '2026-01-10T10:00:00.000Z',
    isAnonymous: false
  }
}))

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: mocks.user,
    updateUser: mocks.updateUser,
    logout: mocks.logout
  })
}))

describe('Profile Component', () => {
  beforeEach(() => {
    mocks.updateUser.mockReset()
    mocks.logout.mockReset()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('renders profile summary counts from authenticated endpoints', async () => {
    server.use(
      http.get('http://localhost:3003/api/mood/history', () => HttpResponse.json({
        success: true,
        moods: [{ _id: 'mood-1' }, { _id: 'mood-2' }, { _id: 'mood-3' }]
      })),
      http.get('http://localhost:3003/api/journal', () => HttpResponse.json({
        success: true,
        entries: [{ _id: 'journal-1' }, { _id: 'journal-2' }]
      })),
      http.get('http://localhost:3003/api/exercises/history', () => HttpResponse.json({
        success: true,
        history: [{ _id: 'exercise-1' }]
      }))
    )

    render(<Profile />)

    expect(await screen.findByText(/3 total mood entries recorded/i)).toBeInTheDocument()
    expect(screen.getByText(/2 reflections saved privately/i)).toBeInTheDocument()
    expect(screen.getByText(/1 guided wellness sessions completed/i)).toBeInTheDocument()
  })

  test('saves edited profile details and updates auth context', async () => {
    render(<Profile />)

    fireEvent.click(screen.getByRole('button', { name: /edit profile/i }))

    fireEvent.change(screen.getByDisplayValue(/Test User/i), {
      target: { value: 'Updated User' }
    })
    fireEvent.change(screen.getByDisplayValue(/Testing profile bio/i), {
      target: { value: 'Updated profile bio' }
    })
    fireEvent.change(screen.getByDisplayValue(/Track mood daily, Practice meditation/i), {
      target: { value: 'Track mood daily, Sleep better' }
    })

    fireEvent.click(screen.getByRole('button', { name: /^save$/i }))

    await waitFor(() => {
      expect(mocks.updateUser).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Updated User',
          bio: 'Updated profile bio',
          goals: ['Track mood daily', 'Sleep better']
        })
      )
    })
  })

  test('logs out after confirmation', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    render(<Profile />)
    fireEvent.click(screen.getByRole('button', { name: /logout/i }))

    expect(mocks.logout).toHaveBeenCalledTimes(1)
  })
})
