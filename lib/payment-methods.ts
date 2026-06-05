import { Currency } from '@/lib/events';

export type PaymentMethodType = 'qr' | 'direct_link';
export type ApiKeyRegion = 'SG' | 'MY' | 'PH' | 'ID' | 'TH';

export interface PaymentMethodOption {
  id: string;
  name: string;
  type: PaymentMethodType;
  apiKeyRegion: ApiKeyRegion;
  requiresRedirectUrl: boolean;
  icon: string;
}

export const PAYMENT_METHODS_BY_CURRENCY: Record<Currency, PaymentMethodOption[]> = {
  SGD: [
    { id: 'paynow_online',    name: 'PayNow',           type: 'qr',          apiKeyRegion: 'SG', requiresRedirectUrl: false, icon: '/icons/paynow_online.svg'    },
    { id: 'shopee_pay',       name: 'ShopeePay',        type: 'qr',          apiKeyRegion: 'SG', requiresRedirectUrl: false, icon: '/icons/shopee_pay.png'       },
    { id: 'grabpay_direct',   name: 'GrabPay',          type: 'direct_link', apiKeyRegion: 'SG', requiresRedirectUrl: true,  icon: '/icons/grabpay_direct.png'   },
  ],
  MYR: [
    { id: 'duitnow',          name: 'DuitNow',          type: 'qr',          apiKeyRegion: 'MY', requiresRedirectUrl: false, icon: '/icons/duitnow.png'          },
    { id: 'shopee_pay',       name: 'ShopeePay',        type: 'qr',          apiKeyRegion: 'MY', requiresRedirectUrl: false, icon: '/icons/shopee_pay.png'       },
    { id: 'touch_n_go',       name: "Touch 'n Go",      type: 'direct_link', apiKeyRegion: 'MY', requiresRedirectUrl: true,  icon: '/icons/touch_n_go.svg'       },
    { id: 'grabpay_direct',   name: 'GrabPay',          type: 'direct_link', apiKeyRegion: 'MY', requiresRedirectUrl: true,  icon: '/icons/grabpay_direct.png'   },
  ],
  PHP: [
    { id: 'grabpay_direct',   name: 'GrabPay',          type: 'direct_link', apiKeyRegion: 'PH', requiresRedirectUrl: true,  icon: '/icons/grabpay_direct.png'   },
  ],
  IDR: [
    { id: 'ifpay_qris',       name: 'QRIS',             type: 'qr',          apiKeyRegion: 'ID', requiresRedirectUrl: false, icon: '/icons/ifpay_qris.png'       },
  ],
  THB: [
    { id: 'opn_prompt_pay',    name: 'PromptPay',        type: 'qr',          apiKeyRegion: 'SG', requiresRedirectUrl: false, icon: '/icons/opn_prompt_pay.svg'    },
    { id: 'opn_true_money_qr', name: 'TrueMoney',        type: 'qr',          apiKeyRegion: 'SG', requiresRedirectUrl: false, icon: '/icons/opn_true_money_qr.svg' },
  ],
  // VND payments route through the SG business account (cross-border)
  VND: [
    { id: 'vietqr_zalopay',   name: 'VietQR',           type: 'qr',          apiKeyRegion: 'SG', requiresRedirectUrl: false, icon: '/icons/vietqr_zalopay.png'   },
    { id: 'zalopay',          name: 'ZaloPay',          type: 'qr',          apiKeyRegion: 'SG', requiresRedirectUrl: false, icon: '/icons/zalopay.png'          },
    { id: 'zalopay',          name: 'ZaloPay',          type: 'direct_link', apiKeyRegion: 'SG', requiresRedirectUrl: true,  icon: '/icons/zalopay.png'          },
  ],
};
