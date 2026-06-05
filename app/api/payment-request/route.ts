import { NextRequest, NextResponse } from 'next/server';
import { createPaymentRequest, Environment } from '@/lib/hitpay';

const API_KEYS: Record<string, string | undefined> = {
  SG: process.env.HITPAY_API_KEY_SG,
  MY: process.env.HITPAY_API_KEY_MY,
  PH: process.env.HITPAY_API_KEY_PH,
  ID: process.env.HITPAY_API_KEY_ID,
  TH: process.env.HITPAY_API_KEY_TH,
};

interface RouteBody {
  customer_email: string;
  customer_name: string;
  amount: string;
  currency: string;
  payment_method: string;
  generate_qr: boolean;
  generate_direct_link: boolean;
  redirect_url?: string;
  api_key_region: string;
  environment: Environment;
}

export async function POST(req: NextRequest) {
  const body: RouteBody = await req.json();

  const apiKey = API_KEYS[body.api_key_region];
  if (!apiKey) {
    return NextResponse.json(
      { message: `API key not configured for region: ${body.api_key_region}` },
      { status: 500 }
    );
  }

  try {
    const result = await createPaymentRequest(
      {
        customerEmail: body.customer_email,
        customerName: body.customer_name,
        amount: body.amount,
        currency: body.currency,
        paymentMethod: body.payment_method,
        generateQr: body.generate_qr,
        generateDirectLink: body.generate_direct_link,
        redirectUrl: body.redirect_url,
      },
      apiKey,
      body.environment
    );
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message }, { status: 500 });
  }
}
