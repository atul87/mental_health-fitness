import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, test, expect } from 'vitest';
import Chatbot from './Chatbot';
import { offlineChatHandler } from '../../mocks/handlers';

// Mock Three.js Canvas — it crashes in jsdom without a WebGL context
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }) => <div data-testid="mock-canvas">{children}</div>,
}));
vi.mock('@react-three/drei', () => ({
  Sphere: () => null,
  MeshDistortMaterial: () => null,
  Float: () => null,
}));

// Mock AuthContext to inject a logged-in user
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'user-123', name: 'Test User' } }),
  AuthProvider: ({ children }) => <>{children}</>,
}));

describe('Chatbot Component', () => {
  test('renders chat input and shows online status by default', async () => {
    render(<Chatbot />);

    // Wait for history to load
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Share your thoughts/i)).not.toBeDisabled();
    });

    expect(screen.getByText(/Online and ready to help/i)).toBeInTheDocument();
  });

  test('sends a message and receives a bot reply in online mode', async () => {
    const { container } = render(<Chatbot />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Share your thoughts/i)).not.toBeDisabled();
    });

    fireEvent.change(screen.getByPlaceholderText(/Share your thoughts/i), {
      target: { value: 'I feel anxious' },
    });

    // MSW intercepts POST /api/chatbot/chat → returns online mode response
    const form = container.querySelector('.chat-form');
    fireEvent.submit(form);

    expect(
      await screen.findByText(/I'm here to support you./i)
    ).toBeInTheDocument();
  });

  test('switches to offline mode when API call fails', async () => {
    const { server } = await import('../../mocks/server');

    // Override chatbot endpoint to simulate a network failure
    server.use(offlineChatHandler);

    const { container } = render(<Chatbot />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Share your thoughts/i)).not.toBeDisabled();
    });

    fireEvent.change(screen.getByPlaceholderText(/Share your thoughts/i), {
      target: { value: 'I feel anxious' },
    });

    const form = container.querySelector('.chat-form');
    fireEvent.submit(form);

    // On error → chatMode becomes 'offline' → UI shows "AI offline mode"
    expect(await screen.findByText(/AI offline mode/i)).toBeInTheDocument();
  });
});
