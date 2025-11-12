// Configuração de pagamento - MercadoPago
// Email do vendedor: pana74269@gmail.com

export const PAYMENT_CONFIG = {
  sellerEmail: 'pana74269@gmail.com',
  plans: {
    monthly: {
      price: 12.90,
      name: 'Plano Mensal',
      description: 'Acesso completo ao app de emagrecimento',
    },
    annual: {
      price: 25.00,
      name: 'Plano Anual',
      description: 'Acesso vitalício ao app de emagrecimento',
    },
  },
};

// Função para criar link de pagamento do MercadoPago
export async function createPaymentLink(plan: 'monthly' | 'annual', userEmail: string) {
  const planData = PAYMENT_CONFIG.plans[plan];
  
  // URL do MercadoPago para criar link de pagamento
  // Você precisará configurar sua conta no MercadoPago e obter o Access Token
  const mercadoPagoUrl = 'https://www.mercadopago.com.br/checkout/v1/redirect';
  
  return {
    paymentUrl: mercadoPagoUrl,
    plan: planData,
    sellerEmail: PAYMENT_CONFIG.sellerEmail,
  };
}

// Alternativa: PagSeguro
export function createPagSeguroLink(plan: 'monthly' | 'annual') {
  const planData = PAYMENT_CONFIG.plans[plan];
  
  // Link do PagSeguro (você precisa criar os links no painel do PagSeguro)
  const pagSeguroBaseUrl = 'https://pagseguro.uol.com.br/checkout/v2/payment.html';
  
  return {
    paymentUrl: pagSeguroBaseUrl,
    plan: planData,
    sellerEmail: PAYMENT_CONFIG.sellerEmail,
  };
}

// Alternativa: PIX (mais simples e direto)
export function generatePixPayment(plan: 'monthly' | 'annual') {
  const planData = PAYMENT_CONFIG.plans[plan];
  
  return {
    pixKey: PAYMENT_CONFIG.sellerEmail, // Usando email como chave PIX
    amount: planData.price,
    description: planData.description,
  };
}
