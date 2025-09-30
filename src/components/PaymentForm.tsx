import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Building2, Shield, CreditCard } from 'lucide-react';
import { PaymentFormContent } from './PaymentFormContent';

interface PaymentFormProps {
  onAmountChange: (amount: number) => void;
  isLoading?: boolean;
  hasClientSecret?: boolean;
  amount: string;
  setAmount: (amount: string) => void;
}

export const PaymentForm = ({ onAmountChange, isLoading = false, hasClientSecret = false, amount, setAmount }: PaymentFormProps) => {
  useEffect(() => {
    const numAmount = parseFloat(amount) || 0;
    onAmountChange(numAmount);
  }, [amount, onAmountChange]);

  // If we have a client secret, render with Stripe context
  if (hasClientSecret) {
    return <PaymentFormContent onAmountChange={onAmountChange} isLoading={isLoading} amount={amount} setAmount={setAmount} />;
  }

  // Otherwise, render the form without Stripe hooks
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

        <form className="space-y-6">
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
                Please provide your payment details and billing address.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isLoading && (
                <div className="h-40 flex items-center justify-center border-2 border-dashed border-payment-border rounded-lg">
                  <div className="text-center">
                    <CreditCard className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <div className="text-muted-foreground">Enter an amount above to load payment methods</div>
                  </div>
                </div>
              )}
              {isLoading && (
                <div className="h-40 flex items-center justify-center">
                  <div className="text-muted-foreground">Loading payment form...</div>
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
            type="button"
            disabled={true}
            className="w-full h-12 text-base font-medium shadow-medium opacity-50"
          >
            Pay ${amount || '0.00'} USD
          </Button>

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
