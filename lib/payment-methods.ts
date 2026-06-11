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
  qrInstruction?: string;
  /** If set, method is only shown in the listed environments. Omit to show in all. */
  environments?: Array<'sandbox' | 'production'>;
}

export const PAYMENT_METHODS_BY_CURRENCY: Record<Currency, PaymentMethodOption[]> = {
  SGD: [
    { id: 'paynow_online',    name: 'PayNow',           type: 'qr',          apiKeyRegion: 'SG', requiresRedirectUrl: false, icon: '/icons/paynow_online.svg',    qrInstruction: 'Please use your banking app to scan the QR code below to complete payment.'    },
    { id: 'shopee_pay',       name: 'ShopeePay',        type: 'qr',          apiKeyRegion: 'SG', requiresRedirectUrl: false, icon: '/icons/shopee_pay.png',       qrInstruction: 'Please use the ShopeePay app to scan the QR code below to complete payment.' },
    { id: 'upi_qr',           name: 'UPI',              type: 'qr',          apiKeyRegion: 'SG', requiresRedirectUrl: false, icon: '/icons/upi_qr.svg',           qrInstruction: 'Please use any UPI app to scan the QR code below to complete payment.',       environments: ['production'] },
    { id: 'grabpay_direct',   name: 'GrabPay',          type: 'direct_link', apiKeyRegion: 'SG', requiresRedirectUrl: true,  icon: '/icons/grabpay_direct.png'   },
    { id: 'grabpay_paylater', name: 'GrabPay Later',    type: 'direct_link', apiKeyRegion: 'SG', requiresRedirectUrl: true,  icon: '/icons/grabpay_paylater.png',                                                                                                    environments: ['production'] },
    { id: 'shopback',         name: 'ShopBack',         type: 'direct_link', apiKeyRegion: 'SG', requiresRedirectUrl: true,  icon: '/icons/shopback_qr.svg',                                                                                                         environments: ['production'] },
  ],
  MYR: [
    { id: 'duitnow',          name: 'DuitNow',          type: 'qr',          apiKeyRegion: 'MY', requiresRedirectUrl: false, icon: '/icons/duitnow.png',          qrInstruction: 'Please use your banking app to scan the QR code below to complete payment.'         },
    { id: 'shopee_pay',       name: 'ShopeePay',        type: 'qr',          apiKeyRegion: 'MY', requiresRedirectUrl: false, icon: '/icons/shopee_pay.png',       qrInstruction: 'Please use the ShopeePay app to scan the QR code below to complete payment.'      },
    { id: 'touch_n_go',       name: "Touch 'n Go",      type: 'direct_link', apiKeyRegion: 'MY', requiresRedirectUrl: true,  icon: '/icons/touch_n_go.svg'       },
    { id: 'grabpay_direct',   name: 'GrabPay',          type: 'direct_link', apiKeyRegion: 'MY', requiresRedirectUrl: true,  icon: '/icons/grabpay_direct.png'   },
  ],
  PHP: [
    { id: 'qrph_netbank',     name: 'QR Ph',            type: 'qr',          apiKeyRegion: 'PH', requiresRedirectUrl: false, icon: '/icons/qrph_netbank.png',     qrInstruction: 'Please use your banking app to scan the QR code below to complete payment.',   environments: ['production'] },
    { id: 'grabpay_direct',   name: 'GrabPay',          type: 'direct_link', apiKeyRegion: 'PH', requiresRedirectUrl: true,  icon: '/icons/grabpay_direct.png'   },
    { id: 'gcash',            name: 'GCash',            type: 'direct_link', apiKeyRegion: 'PH', requiresRedirectUrl: true,  icon: '/icons/gcash.svg',                                                                                                                environments: ['production'] },
  ],
  IDR: [
    { id: 'ifpay_qris',       name: 'QRIS',             type: 'qr',          apiKeyRegion: 'ID', requiresRedirectUrl: false, icon: '/icons/ifpay_qris.png',       qrInstruction: 'Please use any QRIS-supported app to scan the QR code below to complete payment.' },
  ],
  THB: [
    { id: 'opn_prompt_pay',    name: 'PromptPay',        type: 'qr',          apiKeyRegion: 'SG', requiresRedirectUrl: false, icon: '/icons/opn_prompt_pay.svg',    qrInstruction: 'Please use your banking app to scan the QR code below to complete payment.'      },
    { id: 'opn_true_money_qr', name: 'TrueMoney',        type: 'qr',          apiKeyRegion: 'SG', requiresRedirectUrl: false, icon: '/icons/opn_true_money_qr.svg', qrInstruction: 'Please use the TrueMoney Wallet app to scan the QR code below to complete payment.' },
  ],
  // VND payments route through the SG business account (cross-border)
  VND: [
    { id: 'vietqr_zalopay',   name: 'VietQR',           type: 'qr',          apiKeyRegion: 'SG', requiresRedirectUrl: false, icon: '/icons/vietqr_zalopay.png',   qrInstruction: 'Please use your banking app to scan the QR code below to complete payment.'         },
    { id: 'zalopay',          name: 'ZaloPay',          type: 'qr',          apiKeyRegion: 'SG', requiresRedirectUrl: false, icon: '/icons/zalopay.png',          qrInstruction: 'Please use the ZaloPay app to scan the QR code below to complete payment.'          },
    { id: 'zalopay',          name: 'ZaloPay',          type: 'direct_link', apiKeyRegion: 'SG', requiresRedirectUrl: true,  icon: '/icons/zalopay.png'          },
  ],
};
