import { NextRequest, NextResponse } from 'next/server';
import { getPaymentRequestStatus, Environment } from '@/lib/hitpay';

const API_KEYS: Record<string, { sandbox?: string; production?: string }> = {
  SG: { sandbox: process.env.HITPAY_API_KEY_SG, production: process.env.HITPAY_API_KEY_SG_PRODUCTION },
  MY: { sandbox: process.env.HITPAY_API_KEY_MY, production: process.env.HITPAY_API_KEY_MY_PRODUCTION },
  PH: { sandbox: process.env.HITPAY_API_KEY_PH, production: process.env.HITPAY_API_KEY_PH_PRODUCTION },
  ID: { sandbox: process.env.HITPAY_API_KEY_ID, production: process.env.HITPAY_API_KEY_ID_PRODUCTION },
  TH: { sandbox: process.env.HITPAY_API_KEY_TH, production: process.env.HITPAY_API_KEY_TH_PRODUCTION },
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const region = searchParams.get('region') ?? 'SG';
  const environment = (searchParams.get('env') ?? 'sandbox') as Environment;

  if (!id) {
    return NextResponse.json({ message: 'Missing id' }, { status: 400 });
  }

  const apiKey = API_KEYS[region]?.[environment];
  if (!apiKey) {
    return NextResponse.json(
      { message: `API key not configured for region: ${region}` },
      { status: 500 }
    );
  }

  try {
    const result = await getPaymentRequestStatus(id, apiKey, environment);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message }, { status: 500 });
  }
}
