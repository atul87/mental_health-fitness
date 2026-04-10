import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import Journal from './Journal';

// MSW intercepts: GET /api/journal (returns []) and POST /api/journal (returns new entry)

describe('Journal Component', () => {
  test('renders empty journal list', async () => {
    render(<Journal />);
    // Wait for async fetch to complete
    expect(await screen.findByText(/Start your journaling journey/i)).toBeInTheDocument();
  });

  test('user can create a journal entry via UI', async () => {
    render(<Journal />);

    // Wait for initial load
    await screen.findByText(/Start your journaling journey/i);

    // Open the "New Entry" modal
    fireEvent.click(screen.getByRole('button', { name: /new entry/i }));

    // Fill in title
    fireEvent.change(screen.getByPlaceholderText(/Entry title/i), {
      target: { value: 'My Great Day' },
    });

    // Fill in content
    fireEvent.change(screen.getByPlaceholderText(/Take a deep breath/i), {
      target: { value: 'Feeling great today!' },
    });

    // MSW intercepts POST /api/journal and returns the new entry
    fireEvent.click(screen.getByRole('button', { name: /save entry/i }));

    // The new entry should now appear in the list
    expect(await screen.findByText(/Feeling great today!/i)).toBeInTheDocument();
  });
});
