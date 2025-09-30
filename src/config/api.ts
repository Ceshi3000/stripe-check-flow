// API 配置文件
// 后端 API 地址从环境变量读取，如未配置则使用本地开发地址

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

export const API_ENDPOINTS = {
  createPaymentIntent: `${API_BASE_URL}/api/create-payment-intent`,
  confirmPayment: `${API_BASE_URL}/api/confirm-payment`,
  health: `${API_BASE_URL}/health`,
};
