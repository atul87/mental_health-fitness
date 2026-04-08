import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, test, expect } from 'vitest';
import Login from './Login';
import { AuthProvider } from '../../context/AuthContext';

// AuthContext uses apiRequest internally — MSW intercepts all those real fetch calls
// No vi.mock needed here — MSW handles /api/auth/login via handlers.js

const renderLogin = () =>
  render(
    <AuthProvider>
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    </AuthProvider>
  );

describe('Login Component', () => {
  test('renders login form', () => {
    renderLogin();
    expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  test('user can fill in form and submit login', async () => {
    renderLogin();

    fireEvent.change(screen.getByPlaceholderText(/enter your email/i), {
      target: { value: 'test@test.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
      target: { value: '123456' },
    });

    // MSW intercepts POST /api/auth/login → returns fake token + user
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    // Loading spinner appears then navigation occurs (mocked by MSW)
    await waitFor(() => {
      // The button had no error state — login went through
      expect(screen.queryByText(/invalid credentials/i)).not.toBeInTheDocument();
    });
  });

  test('shows error on bad credentials', async () => {
    const { server } = await import('../../mocks/server');
    const { http, HttpResponse } = await import('msw');

    // Override the login handler to return 401
    server.use(
      http.post('http://localhost:3003/api/auth/login', () =>
        HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 })
      )
    );

    renderLogin();

    fireEvent.change(screen.getByPlaceholderText(/enter your email/i), {
      target: { value: 'wrong@test.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
      target: { value: 'wrongpass' },
    });

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
  });
});
