# StagePass — HitPay Embedded Payments Demo

A demo event ticketing app that showcases two HitPay payment features for one-time payments:

- **Embedded QR** (`generate_qr`): The QR code is rendered directly inside your own checkout UI — no redirect to HitPay's hosted page.
- **Direct Link** (`generate_direct_link`): A one-tap redirect to the provider's payment page (GrabPay, Touch 'n Go, ZaloPay, GCash) with optional app deep link.

## Prerequisites

- Node.js 18+
- HitPay sandbox API keys (one per market)

## Setup

```bash
git clone <repo-url>
cd hitpay-event-ticketing-demo
npm install
cp .env.local.example .env.local
```

Edit `.env.local` and fill in your HitPay sandbox API keys.

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The header has a **Sandbox / Production** toggle — use it to switch between environments without restarting the server.

## Currency → API key mapping

| Currency | API key | Payment methods |
|---|---|---|
| SGD | `HITPAY_API_KEY_SG` | PayNow, ShopeePay, GrabPay, GrabPay PayLater, UPI, WeChatPay, Atome, ShopBack (QR) · GrabPay, TNG cross-border, ZaloPay cross-border (Direct Link) |
| MYR | `HITPAY_API_KEY_MY` | ShopeePay, GrabPay, GrabPay PayLater, DuitNow, Touch 'n Go, Atome (QR) · GrabPay, Touch 'n Go (Direct Link) |
| PHP | `HITPAY_API_KEY_PH` | GrabPay, GCash, QRPH (QR) · GrabPay, GCash (Direct Link) |
| VND | `HITPAY_API_KEY_SG` | VietQR, ZaloPay (QR) · ZaloPay (Direct Link) |
| IDR | `HITPAY_API_KEY_ID` | QRIS (QR only) |
| THB | `HITPAY_API_KEY_TH` | PromptPay, TrueMoney (QR only) |

## API reference

- [Embedded QR payments](https://docs.hitpayapp.com/apis/guide/embedded-qr-code-payments/domestic-qr)
- [Payment Request API](https://docs.hitpayapp.com/apis/api-reference/payment-requests)
