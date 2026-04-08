import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import { http, HttpResponse } from 'msw'
import MoodTracker from './MoodTracker'
import { server } from '../../mocks/server'

vi.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="line-chart">Line Chart</div>,
  Bar: () => <div data-testid="bar-chart">Bar Chart</div>
}))

vi.mock('chart.js', () => ({
  Chart: { register: vi.fn() },
  CategoryScale: {},
  LinearScale: {},
  PointElement: {},
  LineElement: {},
  Title: {},
  Tooltip: {},
  Legend: {},
  BarElement: {}
}))

describe('MoodTracker Component', () => {
  test('renders mood insights from fetched history', async () => {
    server.use(
      http.get('http://localhost:3003/api/mood/history', () => HttpResponse.json({
        success: true,
        moods: [
          {
            _id: 'mood-1',
            mood: 'Positive',
            keywords: ['calm'],
            message: 'Feeling better today',
            createdAt: new Date().toISOString()
          },
          {
            _id: 'mood-2',
            mood: 'Very Positive',
            keywords: ['excited'],
            message: 'Today was excellent',
            createdAt: new Date().toISOString()
          }
        ]
      }))
    )

    render(<MoodTracker />)

    expect(await screen.findByText(/Your Mood Insights/i)).toBeInTheDocument()
    expect(screen.getByText(/Most Common Mood/i)).toBeInTheDocument()
    expect(screen.getByText(/Total Entries/i)).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
    expect(screen.getByText(/Feeling better today/i)).toBeInTheDocument()
  })

  test('supports changing the time range filter', async () => {
    const recentDate = new Date().toISOString()
    const oldDate = new Date(Date.now() - (40 * 24 * 60 * 60 * 1000)).toISOString()

    server.use(
      http.get('http://localhost:3003/api/mood/history', () => HttpResponse.json({
        success: true,
        moods: [
          {
            _id: 'mood-recent',
            mood: 'Positive',
            keywords: ['steady'],
            message: 'Recent mood',
            createdAt: recentDate
          },
          {
            _id: 'mood-old',
            mood: 'Negative',
            keywords: ['stressed'],
            message: 'Older mood entry',
            createdAt: oldDate
          }
        ]
      }))
    )

    render(<MoodTracker />)

    expect(await screen.findByText('"Recent mood"')).toBeInTheDocument()
    expect(screen.queryByText(/Older mood entry/i)).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /all time/i }))

    await waitFor(() => {
      expect(screen.getByText(/Older mood entry/i)).toBeInTheDocument()
    })
  })
})
