// StripeAccountSettings.tsx
// Admin page for connecting Stripe account (Express onboarding)
import React, { useState } from 'react';
import { Button, Alert, Spinner } from 'react-bootstrap';

const STRIPE_ONBOARD_URL = '/api/stripe/onboard-link';

const StripeAccountSettings: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConnectStripe = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(STRIPE_ONBOARD_URL, { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError('Failed to get Stripe onboarding link.');
      }
    } catch (err) {
      setError('Error connecting to Stripe.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-4">
      <h4>Stripe Payments</h4>
      <p>To collect payments, connect your Stripe account:</p>
      {error && <Alert variant="danger">{error}</Alert>}
      <Button onClick={handleConnectStripe} disabled={loading} variant="primary">
        {loading ? <Spinner animation="border" size="sm" className="me-2" /> : null}
        Connect Stripe Account
      </Button>
    </div>
  );
};

export default StripeAccountSettings;
