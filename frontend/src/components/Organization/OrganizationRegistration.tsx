import React, { useState } from 'react';
import './OrganizationRegistration.css';

interface OrganizationRegistrationData {
  name: string;
  description: string;
  contactEmail: string;
  website: string;
}

interface OrganizationRegistrationProps {
  onRegistrationSuccess?: (organizationId: string) => void;
  onCancel?: () => void;
}

const OrganizationRegistration: React.FC<OrganizationRegistrationProps> = ({
  onRegistrationSuccess,
  onCancel
}) => {
  const [formData, setFormData] = useState<OrganizationRegistrationData>({
    name: '',
    description: '',
    contactEmail: '',
    website: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) {
      return 'Organization name is required';
    }
    if (formData.name.length < 2) {
      return 'Organization name must be at least 2 characters long';
    }
    if (!formData.contactEmail.trim()) {
      return 'Contact email is required';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      return 'Please enter a valid email address';
    }
    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      return 'Website must be a valid URL (starting with http:// or https://)';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/organizations/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setSuccess(true);
      
      // Call success callback after a short delay to show success message
      setTimeout(() => {
        if (onRegistrationSuccess) {
          onRegistrationSuccess(data.data.id);
        }
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="organization-registration success">
        <div className="success-message">
          <div className="success-icon">✅</div>
          <h2>Registration Successful!</h2>
          <p>
            Your organization has been registered successfully. 
            You will receive a verification email shortly.
          </p>
          <p className="verification-note">
            <strong>Note:</strong> Your organization will need to be verified 
            before you can start posting tasks and managing volunteers.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="organization-registration">
      <div className="registration-header">
        <h1>Register Your Organization</h1>
        <p>Join the Good Grid platform and start making a positive impact in your community</p>
      </div>

      <form onSubmit={handleSubmit} className="registration-form">
        <div className="form-group">
          <label htmlFor="name" className="form-label">
            Organization Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="form-input"
            placeholder="Enter your organization name"
            maxLength={200}
            required
          />
          <div className="input-help">
            The official name of your organization as it should appear publicly
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="contactEmail" className="form-label">
            Contact Email *
          </label>
          <input
            type="email"
            id="contactEmail"
            name="contactEmail"
            value={formData.contactEmail}
            onChange={handleInputChange}
            className="form-input"
            placeholder="contact@yourorganization.com"
            required
          />
          <div className="input-help">
            Primary email for communication and verification
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="website" className="form-label">
            Website
          </label>
          <input
            type="url"
            id="website"
            name="website"
            value={formData.website}
            onChange={handleInputChange}
            className="form-input"
            placeholder="https://www.yourorganization.com"
          />
          <div className="input-help">
            Your organization's official website (optional)
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description" className="form-label">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="form-textarea"
            placeholder="Describe your organization's mission, goals, and the type of work you do..."
            maxLength={2000}
            rows={6}
          />
          <div className="input-help">
            Tell volunteers and freelancers about your organization's mission and impact
            ({formData.description.length}/2000 characters)
          </div>
        </div>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        <div className="form-actions">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="cancel-btn"
              disabled={loading}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Registering...
              </>
            ) : (
              'Register Organization'
            )}
          </button>
        </div>
      </form>

      <div className="registration-info">
        <h3>What happens next?</h3>
        <div className="info-steps">
          <div className="info-step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h4>Verification Process</h4>
              <p>Our team will review your organization and verify its legitimacy</p>
            </div>
          </div>
          <div className="info-step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h4>Account Activation</h4>
              <p>Once verified, you'll receive access to the organization dashboard</p>
            </div>
          </div>
          <div className="info-step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h4>Start Posting Tasks</h4>
              <p>Create tasks, manage volunteers, and track your impact</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationRegistration;