const express = require('express');
const Stripe = require('stripe');
const cors = require('cors');
require('dotenv').config();

const app = express();

// 初始化 Stripe
const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey) {
  console.error('ERROR: STRIPE_SECRET_KEY is not set');
  process.exit(1);
}
const stripe = new Stripe(stripeKey, { apiVersion: '2025-08-27.basil' });

// 日志函数
const logStep = (step, details) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[API] ${step}${detailsStr}`);
};

// 中间件
app.use(cors());
app.use(express.json());

// 托管静态文件（前端支付页面）
app.use(express.static('public'));

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 创建支付意向 API
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    logStep('Create payment intent started');

    const { amount } = req.body;

    if (!amount || amount <= 0) {
      logStep('Invalid amount', { amount });
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    // 转换金额为美分
    const amountInCents = Math.round(amount * 100);
    logStep('Processing payment intent', { amount, amountInCents });

    // 创建 PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      description: 'Apa High Income Opportunity Fund, L.p.',
      metadata: {
        company: 'Apa High Income Opportunity Fund, L.p.',
        service: 'Real Estate Services'
      },
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never',
      },
    });

    logStep('PaymentIntent created', {
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret?.substring(0, 20) + '...'
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep('ERROR', { message: errorMessage });
    res.status(500).json({ error: errorMessage });
  }
});

// 确认支付 API（可选接口，前端可用于验证支付状态）
app.post('/api/confirm-payment', async (req, res) => {
  try {
    logStep('Confirm payment started');

    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      logStep('Missing paymentIntentId');
      return res.status(400).json({ error: 'Payment Intent ID is required' });
    }

    logStep('Retrieving payment from Stripe', { paymentIntentId });

    // 从 Stripe 获取支付信息
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    logStep('Payment retrieved', {
      status: paymentIntent.status,
      amount: paymentIntent.amount
    });

    res.json({
      success: true,
      status: paymentIntent.status,
      paymentIntentId: paymentIntent.id
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep('ERROR', { message: errorMessage });
    res.status(500).json({ error: errorMessage });
  }
});

// 启动服务器
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`========================================`);
  console.log(`✅ Payment API Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`========================================`);
});
