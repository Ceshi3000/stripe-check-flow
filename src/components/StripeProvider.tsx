import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { ReactNode, useMemo } from 'react';

// Read Stripe publishable key from environment variable or use default test key
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51SD4zLA2QTJvbUnXdzAbeCaOxAUMWM5mTbWRvNePOREw80Esn5UH8WsxCzoHyg1oQlzPL8gqeRBaD5EYPcW5C08700E35AihoL';

const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

interface StripeProviderProps {
  children: ReactNode;
  clientSecret?: string;
}

export const StripeProvider = ({ children, clientSecret }: StripeProviderProps) => {
  // Only render Elements when we have a clientSecret for payments
  if (!clientSecret) {
    console.log('🔄 StripeProvider: No clientSecret, rendering children without Stripe Elements');
    return <>{children}</>;
  }

  console.log('✅ StripeProvider: Initializing with clientSecret:', clientSecret.slice(0, 20) + '...');

  // Use useMemo to create stable options object and force re-render when clientSecret changes
  const options = useMemo(() => ({
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: 'rgb(59, 130, 246)',
        colorBackground: 'rgb(255, 255, 255)',
        colorText: 'rgb(51, 65, 85)',
        colorDanger: 'rgb(239, 68, 68)',
        fontFamily: 'system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
    },
  }), [clientSecret]);

  return (
    <Elements stripe={stripePromise} options={options} key={clientSecret}>
      {children}
    </Elements>
  );
};
