import { useState, useCallback, useRef, useEffect } from 'react';
import { StripeProvider } from '@/components/StripeProvider';
import { PaymentForm } from '@/components/PaymentForm';

const Index = () => {
  const [clientSecret, setClientSecret] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState<string>('');
  const lastAmountRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const isCreatingRef = useRef<boolean>(false);

  // 清理函数，组件卸载时清理timeout
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleAmountChange = useCallback(async (amount: number) => {
    console.log('🔄 handleAmountChange called with amount:', amount);

    // 严格防止重复调用
    if (isCreatingRef.current) {
      console.log('⚠️ Already creating payment intent, ignoring call');
      return;
    }

    // 清理之前的timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // 如果金额没有变化，不创建新的PaymentIntent
    if (amount === lastAmountRef.current) {
      console.log('⚠️ Amount unchanged, skipping call');
      return;
    }

    if (amount <= 0) {
      console.log('❌ Amount is 0 or negative, clearing clientSecret');
      setClientSecret('');
      lastAmountRef.current = amount;
      return;
    }

    // 防抖处理，避免频繁调用
    timeoutRef.current = setTimeout(async () => {
      if (isCreatingRef.current || isLoading) {
        console.log('⚠️ Already processing, skipping call');
        return;
      }

      isCreatingRef.current = true;
      setIsLoading(true);
      lastAmountRef.current = amount;
      console.log('🚀 Creating payment intent for amount:', amount);

      try {
        const { API_ENDPOINTS } = await import('@/config/api');
        console.log('📡 Calling create-payment-intent API...');

        const response = await fetch(API_ENDPOINTS.createPaymentIntent, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ amount })
        });

        console.log('📥 API response status:', response.status);

        if (!response.ok) {
          const errorData = await response.json();
          console.error('❌ API error:', errorData);
          throw new Error(errorData.error || 'Failed to create payment intent');
        }

        const data = await response.json();
        console.log('📥 API response data:', { hasClientSecret: !!data.clientSecret });

        if (data && data.clientSecret) {
          console.log('✅ Received clientSecret:', data.clientSecret.slice(0, 20) + '...');
          setClientSecret(data.clientSecret);
        } else {
          console.error('❌ No clientSecret in response:', data);
          throw new Error('No clientSecret received from server');
        }
      } catch (error) {
        console.error('❌ Failed to create payment intent:', error);
        setClientSecret('');
      } finally {
        setIsLoading(false);
        isCreatingRef.current = false;
      }
    }, 1000); // 增加防抖时间到1秒
  }, [isLoading]);

  return (
    <StripeProvider clientSecret={clientSecret}>
      <PaymentForm
        onAmountChange={handleAmountChange}
        isLoading={isLoading}
        hasClientSecret={!!clientSecret}
        amount={amount}
        setAmount={setAmount}
      />
    </StripeProvider>
  );
};

export default Index;
