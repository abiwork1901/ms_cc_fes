import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('Credit Card System', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    mockFetch.mockReset();
    // Mock successful initial cards fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ([])
    });
  });

  test('renders initial UI elements', async () => {
    render(<App />);
    
    // Check for main headings
    expect(screen.getByText('Credit Card System')).toBeInTheDocument();
    expect(screen.getByText('Cards')).toBeInTheDocument();
    
    // Check for form inputs
    expect(screen.getByPlaceholderText('Enter cardholder name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter card number')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter credit limit')).toBeInTheDocument();
    
    // Check for submit button
    expect(screen.getByRole('button', { name: /add card/i })).toBeInTheDocument();
    
    // Check for empty state message
    await waitFor(() => {
      expect(screen.getByText('No cards added yet.')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    test('validates name field', async () => {
      render(<App />);
      const nameInput = screen.getByPlaceholderText('Enter cardholder name');
      
      // Test empty name
      await act(async () => {
        fireEvent.change(nameInput, { target: { value: '' } });
        fireEvent.blur(nameInput);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument();
      });
      
      // Test too short name
      await act(async () => {
        fireEvent.change(nameInput, { target: { value: 'A' } });
      });
      
      await waitFor(() => {
        expect(screen.getByText('Name must be at least 2 characters long')).toBeInTheDocument();
      });
      
      // Test invalid characters
      await act(async () => {
        fireEvent.change(nameInput, { target: { value: 'John123' } });
      });
      
      await waitFor(() => {
        expect(screen.getByText('Name can only contain letters and spaces')).toBeInTheDocument();
      });
      
      // Test valid name
      await act(async () => {
        fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      });
      
      await waitFor(() => {
        expect(screen.queryByText('Name is required')).not.toBeInTheDocument();
      });
    });

    test('validates card number field', async () => {
      render(<App />);
      const cardNumberInput = screen.getByPlaceholderText('Enter card number');
      
      // Test empty card number
      await act(async () => {
        fireEvent.change(cardNumberInput, { target: { value: '' } });
        fireEvent.blur(cardNumberInput);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Card number is required')).toBeInTheDocument();
      });
      
      // Test non-numeric input
      await act(async () => {
        fireEvent.change(cardNumberInput, { target: { value: '1234abc' } });
      });
      
      await waitFor(() => {
        expect(screen.getByText('Card number must be numeric and up to 19 digits')).toBeInTheDocument();
      });
      
      // Test valid card number
      await act(async () => {
        fireEvent.change(cardNumberInput, { target: { value: '4111111111111111' } });
      });
      
      await waitFor(() => {
        expect(screen.queryByText('Card number is required')).not.toBeInTheDocument();
      });
    });

    test('validates limit field', async () => {
      render(<App />);
      const limitInput = screen.getByPlaceholderText('Enter credit limit');
      
      // Test empty limit
      await act(async () => {
        fireEvent.change(limitInput, { target: { value: '' } });
        fireEvent.blur(limitInput);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Credit limit is required')).toBeInTheDocument();
      });
      
      // Test negative limit
      await act(async () => {
        fireEvent.change(limitInput, { target: { value: '-100' } });
      });
      
      await waitFor(() => {
        expect(screen.getByText('Credit limit must be greater than 0')).toBeInTheDocument();
      });
      
      // Test valid limit
      await act(async () => {
        fireEvent.change(limitInput, { target: { value: '1000' } });
      });
      
      await waitFor(() => {
        expect(screen.queryByText('Credit limit is required')).not.toBeInTheDocument();
      });
    });
  });

  test('submits form successfully', async () => {
    render(<App />);
    
    // Mock successful card creation
    mockFetch
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          id: 1,
          name: 'John Doe',
          cardNumber: '4111111111111111',
          creditLimit: 1000,
          balance: 0
        })
      }))
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve([{
          id: 1,
          name: 'John Doe',
          cardNumber: '4111111111111111',
          creditLimit: 1000,
          balance: 0
        }])
      }));

    // Fill out the form
    await act(async () => {
      await userEvent.type(screen.getByPlaceholderText('Enter cardholder name'), 'John Doe');
      await userEvent.type(screen.getByPlaceholderText('Enter card number'), '4111111111111111');
      await userEvent.type(screen.getByPlaceholderText('Enter credit limit'), '1000');
    });

    // Submit the form
    await act(async () => {
      const submitButton = screen.getByRole('button', { name: /add card/i });
      await userEvent.click(submitButton);
    });

    // Verify API call
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:8080/api/cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'John Doe',
        cardNumber: '4111111111111111',
        creditLimit: 1000,
      }),
    });

    // Verify form reset
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter cardholder name')).toHaveValue('');
      expect(screen.getByPlaceholderText('Enter card number')).toHaveValue('');
      expect(screen.getByPlaceholderText('Enter credit limit')).toHaveValue('');
    });
  });

  test('handles API errors', async () => {
    render(<App />);
    
    // Mock API error
    mockFetch.mockImplementationOnce(() => Promise.resolve({
      ok: false,
      status: 400,
      headers: new Headers(),
    }));

    // Fill out the form
    await act(async () => {
      await userEvent.type(screen.getByPlaceholderText('Enter cardholder name'), 'John Doe');
      await userEvent.type(screen.getByPlaceholderText('Enter card number'), '4111111111111111');
      await userEvent.type(screen.getByPlaceholderText('Enter credit limit'), '1000');
    });

    // Submit the form
    await act(async () => {
      const submitButton = screen.getByRole('button', { name: /add card/i });
      await userEvent.click(submitButton);
    });

    // Verify error message
    await waitFor(() => {
      expect(screen.getByText(/Invalid card number provided/)).toBeInTheDocument();
    });
  });

  test('displays card list', async () => {
    // Mock cards data
    const mockCards = [
      {
        id: 1,
        name: 'John Doe',
        cardNumber: '4111111111111111',
        creditLimit: 1000,
        balance: 0
      }
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCards
    });

    render(<App />);

    // Wait for cards to load
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('£1000')).toBeInTheDocument();
    });
  });
});
