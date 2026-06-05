export type Environment = 'sandbox' | 'production';

const BASE_URLS: Record<Environment, string> = {
  sandbox: 'https://api.sandbox.hit-pay.com',
  production: 'https://api.hit-pay.com',
};

export interface PaymentRequestParams {
  customerEmail?: string;
  customerName?: string;
  amount: string;
  currency: string;
  paymentMethod: string;
  generateQr: boolean;
  generateDirectLink: boolean;
  redirectUrl?: string;
}

export interface QrCodeData {
  qr_code: string;           // In sandbox: signed mock payment URL. In production: raw QR data string.
  qr_code_expiry: string | null;
  qr_image_mime: string | null;
}

export interface DirectLink {
  direct_link_url: string;
  direct_link_app_url: string | null;
  expiry_time: string | null;
}

export interface PaymentRequestResponse {
  id: string;
  status: string;
  amount: string;
  currency: string;
  url: string;
  qr_code_data?: QrCodeData;
  direct_link?: DirectLink;
}

export async function getPaymentRequestStatus(
  id: string,
  apiKey: string,
  environment: Environment = 'sandbox'
): Promise<PaymentRequestResponse> {
  const response = await fetch(`${BASE_URLS[environment]}/v1/payment-requests/${id}`, {
    headers: { 'X-BUSINESS-API-KEY': apiKey },
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  return response.json() as Promise<PaymentRequestResponse>;
}

export async function createPaymentRequest(
  params: PaymentRequestParams,
  apiKey: string,
  environment: Environment = 'sandbox'
): Promise<PaymentRequestResponse> {
  const body = new URLSearchParams();
  if (params.customerEmail) body.append('customer_email', params.customerEmail);
  if (params.customerName) body.append('customer_name', params.customerName);
  body.append('amount', params.amount);
  body.append('currency', params.currency);
  body.append('payment_methods[]', params.paymentMethod);

  if (params.generateQr) {
    body.append('generate_qr', '1');
  } else if (params.generateDirectLink) {
    body.append('generate_direct_link', '1');
  }
  if (params.redirectUrl) body.append('redirect_url', params.redirectUrl);

  const response = await fetch(`${BASE_URLS[environment]}/v1/payment-requests`, {
    method: 'POST',
    headers: {
      'X-BUSINESS-API-KEY': apiKey,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json() as Promise<PaymentRequestResponse>;
}
