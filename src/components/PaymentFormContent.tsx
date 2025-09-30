import { useState, useEffect } from 'react';
import { useStripe, useElements, PaymentElement, AddressElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Building2, Shield, CreditCard, MapPin } from 'lucide-react';

interface PaymentFormContentProps {
  onAmountChange: (amount: number) => void;
  isLoading?: boolean;
  amount: string;
  setAmount: (amount: string) => void;
}

export const PaymentFormContent = ({ onAmountChange, isLoading = false, amount, setAmount }: PaymentFormContentProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  // Debug Stripe initialization
  console.log('💳 PaymentFormContent render:', {
    stripe: !!stripe,
    elements: !!elements,
    amount,
    isLoading
  });

  useEffect(() => {
    const numAmount = parseFloat(amount) || 0;
    onAmountChange(numAmount);
  }, [amount]); // Removed onAmountChange dependency to prevent infinite loops

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    console.log('🚀 Payment submission started');
    console.log('Stripe available:', !!stripe);
    console.log('Elements available:', !!elements);
    console.log('Amount:', amount);

    if (!stripe || !elements) {
      console.error('❌ Stripe or Elements not available');
      toast({
        title: "Payment System Error",
        description: "Payment system is not ready. Please refresh the page and try again.",
        variant: "destructive",
      });
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      console.error('❌ Invalid amount:', amount);
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid payment amount.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      console.log('💳 Confirming payment with Stripe...');
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
        redirect: 'if_required'
      });

      console.log('Stripe response:', { error, paymentIntent });

      if (error) {
        console.error('❌ Stripe payment error:', error);
        toast({
          title: "Payment Failed",
          description: error.message || "An error occurred while processing your payment.",
          variant: "destructive",
        });
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log('✅ Payment succeeded, confirming with backend...');
        
        // Extract billing details from elements
        const addressElement = elements.getElement('address');
        let billingDetails = null;
        
        if (addressElement) {
          const addressValue = await addressElement.getValue();
          if (addressValue.complete) {
            billingDetails = {
              name: addressValue.value.name,
              phone: addressValue.value.phone,
              address: addressValue.value.address
            };
          }
        }
        
        // Payment succeeded, confirm with backend
        try {
          const { API_ENDPOINTS } = await import('@/config/api');
          
          const response = await fetch(API_ENDPOINTS.confirmPayment, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              paymentIntentId: paymentIntent.id,
              billingDetails
            })
          });

          console.log('Backend confirm response status:', response.status);

          if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ Backend confirmation error:', errorData);
            toast({
              title: "Payment Processed",
              description: "Payment successful but couldn't save details. Please contact support.",
              variant: "default",
            });
          } else {
            const data = await response.json();
            console.log('✅ Payment fully confirmed:', data);
            window.location.href = '/payment-success';
          }
        } catch (confirmError) {
          console.error('❌ Backend confirmation exception:', confirmError);
          toast({
            title: "Payment Processed",
            description: "Payment successful but couldn't save details. Please contact support if needed.",
            variant: "default",
          });
        }
      } else {
        console.log('ℹ️ Payment not completed yet, status:', paymentIntent?.status);
        toast({
          title: "Payment Processing",
          description: "Your payment is being processed. Please wait...",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('❌ Payment exception:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: "Payment Error",
        description: `Payment failed: ${errorMessage}. Please check your connection and try again.`,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-payment-bg py-12 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Building2 className="h-8 w-8 text-primary mr-2" />
            <h1 className="text-2xl font-bold text-foreground">Apa High Income Opportunity Fund, L.p.</h1>
          </div>
          <p className="text-muted-foreground">Secure Payment Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount Input Card */}
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Payment Amount
              </CardTitle>
              <CardDescription>
                Enter the payment amount according to our quoted solution price or discussed pricing plan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (USD)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-muted-foreground">$</span>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Element Card */}
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
              <CardDescription>
                Please provide your payment details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isLoading && stripe && elements && (
                <PaymentElement
                  options={{
                    layout: {
                      type: 'tabs',
                    },
                  }}
                  onReady={() => {
                    console.log('✅ PaymentElement is ready!');
                  }}
                  onLoadError={(error) => {
                    console.error('❌ PaymentElement load error:', error);
                  }}
                />
              )}
              {(isLoading || !stripe || !elements) && (
                <div className="h-40 flex items-center justify-center">
                  <div className="text-muted-foreground">
                    {isLoading ? 'Loading payment form...' : 'Initializing payment system...'}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Billing Address Card */}
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Billing Address
              </CardTitle>
              <CardDescription>
                Please provide your complete billing address information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isLoading && stripe && elements && (
                <AddressElement
                  options={{
                    mode: 'billing',
                    allowedCountries: ['US'],
                  }}
                  onChange={(event) => {
                    if (event.complete) {
                      console.log('✅ Address is complete:', event.value);
                    }
                  }}
                />
              )}
              {(isLoading || !stripe || !elements) && (
                <div className="h-40 flex items-center justify-center">
                  <div className="text-muted-foreground">
                    {isLoading ? 'Loading address form...' : 'Initializing address system...'}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card className="shadow-soft bg-secondary/50">
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground mb-3">Accepted Payment Methods:</div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Credit Card</Badge>
                <Badge variant="outline">Debit Card</Badge>
                <Badge variant="outline">Amazon Pay</Badge>
                <Badge variant="outline">Google Pay</Badge>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!stripe || !elements || isProcessing || !amount || parseFloat(amount) <= 0}
            className="w-full h-12 text-base font-medium shadow-medium"
          >
            {isProcessing
              ? 'Processing...'
              : !stripe || !elements
                ? 'Loading payment system...'
                : `Pay $${amount || '0.00'} USD`
            }
          </Button>

          {/* Debug Info in Development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
              Debug: Stripe={!!stripe}, Elements={!!elements}, Amount={amount}
            </div>
          )}

          {/* Error message when Stripe is not ready */}
          {!stripe || !elements ? (
            <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
              💡 Payment system is loading. Make sure you've entered an amount above $0.01 to initialize the payment form.
            </div>
          ) : null}

          {/* Security Notice */}
          <div className="flex items-center justify-center text-sm text-muted-foreground">
            <Shield className="h-4 w-4 mr-2" />
            Secured by Stripe - Your payment information is encrypted and secure
          </div>
        </form>
      </div>
    </div>
  );
};
