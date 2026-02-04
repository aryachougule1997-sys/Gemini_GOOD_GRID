import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import OrganizationRegistration from '../OrganizationRegistration';

// Mock fetch
global.fetch = jest.fn();

describe('OrganizationRegistration', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it('renders registration form correctly', () => {
    render(<OrganizationRegistration />);
    
    expect(screen.getByText('Register Your Organization')).toBeInTheDocument();
    expect(screen.getByLabelText(/Organization Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Contact Email/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Website/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Register Organization/ })).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(<OrganizationRegistration />);
    
    const submitButton = screen.getByRole('button', { name: /Register Organization/ });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Organization name is required/)).toBeInTheDocument();
    });
  });

  it('validates email format', async () => {
    render(<OrganizationRegistration />);
    
    const nameInput = screen.getByLabelText(/Organization Name/);
    const emailInput = screen.getByLabelText(/Contact Email/);
    const submitButton = screen.getByRole('button', { name: /Register Organization/ });

    fireEvent.change(nameInput, { target: { value: 'Test Organization' } });
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Please enter a valid email address/)).toBeInTheDocument();
    });
  });

  it('validates website URL format', async () => {
    render(<OrganizationRegistration />);
    
    const nameInput = screen.getByLabelText(/Organization Name/);
    const emailInput = screen.getByLabelText(/Contact Email/);
    const websiteInput = screen.getByLabelText(/Website/);
    const submitButton = screen.getByRole('button', { name: /Register Organization/ });

    fireEvent.change(nameInput, { target: { value: 'Test Organization' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(websiteInput, { target: { value: 'invalid-url' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Website must be a valid URL/)).toBeInTheDocument();
    });
  });

  it('submits form successfully', async () => {
    const mockResponse = {
      success: true,
      data: {
        id: 'org-123',
        name: 'Test Organization',
        contactEmail: 'test@example.com',
        verified: false
      }
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const onRegistrationSuccess = jest.fn();
    render(<OrganizationRegistration onRegistrationSuccess={onRegistrationSuccess} />);
    
    const nameInput = screen.getByLabelText(/Organization Name/);
    const emailInput = screen.getByLabelText(/Contact Email/);
    const descriptionInput = screen.getByLabelText(/Description/);
    const submitButton = screen.getByRole('button', { name: /Register Organization/ });

    fireEvent.change(nameInput, { target: { value: 'Test Organization' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(descriptionInput, { target: { value: 'A test organization for testing purposes' } });
    
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/organizations/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test Organization',
          contactEmail: 'test@example.com',
          description: 'A test organization for testing purposes',
          website: ''
        }),
      });
    });

    await waitFor(() => {
      expect(screen.getByText('Registration Successful!')).toBeInTheDocument();
    });

    // Wait for success callback
    await waitFor(() => {
      expect(onRegistrationSuccess).toHaveBeenCalledWith('org-123');
    }, { timeout: 3000 });
  });

  it('handles registration errors', async () => {
    const mockErrorResponse = {
      success: false,
      error: 'Organization with this email already exists'
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => mockErrorResponse
    });

    render(<OrganizationRegistration />);
    
    const nameInput = screen.getByLabelText(/Organization Name/);
    const emailInput = screen.getByLabelText(/Contact Email/);
    const submitButton = screen.getByRole('button', { name: /Register Organization/ });

    fireEvent.change(nameInput, { target: { value: 'Test Organization' } });
    fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });
    
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Organization with this email already exists/)).toBeInTheDocument();
    });
  });

  it('shows loading state during submission', async () => {
    (fetch as jest.Mock).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));

    render(<OrganizationRegistration />);
    
    const nameInput = screen.getByLabelText(/Organization Name/);
    const emailInput = screen.getByLabelText(/Contact Email/);
    const submitButton = screen.getByRole('button', { name: /Register Organization/ });

    fireEvent.change(nameInput, { target: { value: 'Test Organization' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    fireEvent.click(submitButton);

    expect(screen.getByText(/Registering.../)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('calls onCancel when cancel button is clicked', () => {
    const onCancel = jest.fn();
    render(<OrganizationRegistration onCancel={onCancel} />);
    
    const cancelButton = screen.getByRole('button', { name: /Cancel/ });
    fireEvent.click(cancelButton);

    expect(onCancel).toHaveBeenCalled();
  });

  it('updates character count for description', () => {
    render(<OrganizationRegistration />);
    
    const descriptionInput = screen.getByLabelText(/Description/);
    const testText = 'This is a test description';
    
    fireEvent.change(descriptionInput, { target: { value: testText } });

    expect(screen.getByText(`${testText.length}/2000 characters`)).toBeInTheDocument();
  });

  it('clears error when user starts typing', async () => {
    render(<OrganizationRegistration />);
    
    const submitButton = screen.getByRole('button', { name: /Register Organization/ });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Organization name is required/)).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText(/Organization Name/);
    fireEvent.change(nameInput, { target: { value: 'Test' } });

    await waitFor(() => {
      expect(screen.queryByText(/Organization name is required/)).not.toBeInTheDocument();
    });
  });

  it('displays registration process information', () => {
    render(<OrganizationRegistration />);
    
    expect(screen.getByText('What happens next?')).toBeInTheDocument();
    expect(screen.getByText('Verification Process')).toBeInTheDocument();
    expect(screen.getByText('Account Activation')).toBeInTheDocument();
    expect(screen.getByText('Start Posting Tasks')).toBeInTheDocument();
  });
});