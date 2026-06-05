'use client';

import { useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';
import { Event, Currency, formatAmountForApi, CURRENCY_SYMBOLS } from '@/lib/events';
import { Environment, PaymentRequestResponse } from '@/lib/hitpay';
import { PaymentMethodOption } from '@/lib/payment-methods';

const environment = (process.env.NEXT_PUBLIC_HITPAY_ENV ?? 'sandbox') as Environment;

const MAX_POLL = 60;
const POLL_INTERVAL_MS = 3000;

const ALL_CURRENCIES: Currency[] = ['SGD', 'MYR', 'PHP'];

interface CheckoutSectionProps {
  event: Event;
  currency: Currency;
  paymentMethods: PaymentMethodOption[];
  onCurrencyChange: (c: Currency) => void;
  onBackToEvents: () => void;
}

export default function CheckoutSection({
  event,
  currency,
  paymentMethods,
  onCurrencyChange,
  onBackToEvents,
}: CheckoutSectionProps) {
  const [email, setEmail] = useState('');
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [activeMethod, setActiveMethod] = useState<PaymentMethodOption | null>(null);
  const [activeResult, setActiveResult] = useState<PaymentRequestResponse | null>(null);
  const [pollCount, setPollCount] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'completed' | 'expired'>('pending');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const pollRef = useRef(0);
  const mockWindowRef = useRef<Window | null>(null);
  const router = useRouter();

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [event.id]);

  // Reset active payment when currency changes
  useEffect(() => {
    setActiveKey(null);
    setActiveMethod(null);
    setActiveResult(null);
    setError(null);
  }, [currency]);

  // Poll QR payment status
  useEffect(() => {
    if (!activeResult || paymentStatus !== 'pending') return;

    pollRef.current = 0;
    setPollCount(0);

    const interval = setInterval(async () => {
      pollRef.current += 1;
      setPollCount(pollRef.current);

      if (pollRef.current >= MAX_POLL) {
        clearInterval(interval);
        setPaymentStatus('expired');
        return;
      }

      try {
        const res = await fetch(
          `/api/payment-request/status?id=${activeResult.id}&region=${activeMethod?.apiKeyRegion}&env=${environment}`
        );
        const data = await res.json();
        if (data.status === 'completed') {
          clearInterval(interval);
          setPaymentStatus('completed');
          if (mockWindowRef.current && !mockWindowRef.current.closed) {
            mockWindowRef.current.close();
          }
          const params = new URLSearchParams({
            event: event.name,
            amount: displayAmount,
            method: activeMethod?.name ?? '',
            id: activeResult.id,
          });
          router.push(`/success?${params.toString()}`);
        }
      } catch {
        // continue polling silently
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [activeResult?.id, paymentStatus]);

  const amount = formatAmountForApi(event.basePrice, currency);
  const symbol = CURRENCY_SYMBOLS[currency];
  const displayAmount = `${symbol}${parseFloat(amount).toLocaleString()}`;

  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const emailValid = isValidEmail(email);

  const callAPI = async (method: PaymentMethodOption): Promise<PaymentRequestResponse> => {
    const res = await fetch('/api/payment-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_email: email.trim(),
        amount,
        currency: currency.toLowerCase(),
        payment_method: method.id,
        generate_qr: method.type === 'qr',
        generate_direct_link: method.type === 'direct_link',
        redirect_url: `${window.location.origin}/success?${new URLSearchParams({
          event: event.name,
          amount: displayAmount,
          method: method.name,
        }).toString()}`,
        api_key_region: method.apiKeyRegion,
        environment,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
    return data as PaymentRequestResponse;
  };

  const handleMethodClick = async (method: PaymentMethodOption) => {
    const key = `${method.id}_${method.type}`;

    // Collapse if same method clicked again
    if (activeKey === key && !loadingKey) {
      setActiveKey(null);
      setActiveMethod(null);
      setActiveResult(null);
      return;
    }

    setLoadingKey(key);
    setError(null);
    setActiveResult(null);

    try {
      const data = await callAPI(method);
      setActiveKey(key);
      setActiveMethod(method);
      setActiveResult(data);
      setPaymentStatus('pending');
      setPollCount(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setActiveKey(null);
    } finally {
      setLoadingKey(null);
    }
  };

  const handleRegenerate = async () => {
    if (!activeMethod) return;
    setIsRegenerating(true);
    try {
      const data = await callAPI(activeMethod);
      setActiveResult(data);
      setPaymentStatus('pending');
      setPollCount(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsRegenerating(false);
    }
  };

  const qrMethods = paymentMethods.filter((m) => m.type === 'qr');
  const directLinkMethods = paymentMethods.filter((m) => m.type === 'direct_link');

  const renderMethodRow = (m: PaymentMethodOption, typeKey: 'qr' | 'direct_link') => {
    const key = `${m.id}_${typeKey}`;
    const isLoading = loadingKey === key;
    const isActive = activeKey === key;
    const isDisabled = loadingKey !== null && !isLoading;

    return (
      <div
        key={key}
        className={`rounded-xl border-2 overflow-hidden transition-all ${
          isActive ? 'border-indigo-500' : 'border-gray-200'
        }`}
      >
        {/* Method header — always visible */}
        <button
          onClick={() => handleMethodClick(m)}
          disabled={isDisabled}
          className={`flex items-center gap-3 w-full px-4 py-3 text-left transition-colors ${
            isActive
              ? 'bg-indigo-50'
              : isDisabled
              ? 'bg-white opacity-50 cursor-not-allowed'
              : 'bg-white hover:bg-gray-50 cursor-pointer'
          }`}
        >
          <div className="w-8 h-8 shrink-0 flex items-center justify-center">
            {isLoading ? (
              <svg className="w-5 h-5 animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <Image src={m.icon} alt={m.name} width={32} height={32} className="object-contain rounded" />
            )}
          </div>
          <span className="text-sm font-medium text-gray-800 flex-1">{m.name}</span>
          <span
            className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
              m.type === 'qr' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
            }`}
          >
            {m.type === 'qr' ? 'QR' : 'Direct Link'}
          </span>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ${isActive ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Expanded content */}
        {isActive && activeResult && (
          <div className="border-t border-indigo-100">
            {activeResult.qr_code_data ? (
              <QRContent
                result={activeResult}
                method={m}
                environment={environment}
                pollCount={pollCount}
                paymentStatus={paymentStatus}
                isRegenerating={isRegenerating}
                onRegenerate={handleRegenerate}
                onOpenMockWindow={(win) => { mockWindowRef.current = win; }}
              />
            ) : activeResult.direct_link ? (
              <DirectLinkContent result={activeResult} method={m} environment={environment} onOpenWindow={(win) => { mockWindowRef.current = win; }} />
            ) : null}
          </div>
        )}
      </div>
    );
  };

  return (
    <div ref={ref} className="mt-6 sm:mt-8 scroll-mt-20 bg-white rounded-2xl border border-gray-200 p-4 sm:p-6">
      {/* Header row: event name + currency selector + back */}
      <div className="flex items-start justify-between gap-3 mb-5">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold text-gray-900 leading-snug">{event.name}</h2>
          <p className="text-sm text-gray-500 mt-0.5">1 ticket &middot; {displayAmount}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <select
            value={currency}
            onChange={(e) => onCurrencyChange(e.target.value as Currency)}
            className="text-sm border border-gray-300 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {ALL_CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Email field (optional) */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email address <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="jane@example.com"
          className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
            email && !emailValid ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
        />
        {email && !emailValid && (
          <p className="mt-1 text-xs text-red-500">Enter a valid email address</p>
        )}
      </div>

      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Payment Method</p>
      <div className="space-y-2">
        {qrMethods.map((m) => renderMethodRow(m, 'qr'))}
        {directLinkMethods.map((m) => renderMethodRow(m, 'direct_link'))}
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2 mt-4">
          {error}
        </div>
      )}
    </div>
  );
}

// ─── QR expanded content ──────────────────────────────────────────────────────

interface QRContentProps {
  result: PaymentRequestResponse;
  method: PaymentMethodOption;
  environment: Environment;
  pollCount: number;
  paymentStatus: 'pending' | 'completed' | 'expired';
  isRegenerating: boolean;
  onRegenerate: () => void;
  onOpenMockWindow: (win: Window | null) => void;
}

function QRContent({
  result,
  method,
  environment,
  pollCount,
  paymentStatus,
  isRegenerating,
  onRegenerate,
  onOpenMockWindow,
}: QRContentProps) {
  const symbol = CURRENCY_SYMBOLS[result.currency.toUpperCase() as keyof typeof CURRENCY_SYMBOLS] ?? '';
  const displayAmount = `${symbol}${parseFloat(result.amount).toLocaleString()}`;

  return (
    <div className="p-5 flex flex-col items-center bg-white">
      <div className="bg-gray-50 rounded-xl px-4 py-2.5 mb-4 w-full">
        <p className="text-xs text-gray-500 mb-0.5">Original amount (payment request currency)</p>
        <p className="text-xl font-bold text-indigo-600">{displayAmount}</p>
      </div>

      <div className="p-3 border border-gray-200 rounded-xl mb-4">
        <QRCodeSVG value={result.qr_code_data!.qr_code} size={188} level="M" includeMargin={false} />
      </div>

      {paymentStatus === 'completed' ? (
        <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          Payment completed!
        </div>
      ) : paymentStatus === 'expired' ? (
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-2">QR code expired</p>
          <button
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="text-sm text-indigo-600 hover:underline disabled:opacity-50"
          >
            {isRegenerating ? 'Generating…' : 'Generate new QR code'}
          </button>
        </div>
      ) : (
        <div className="text-center space-y-2.5 w-full">
          <p className="text-sm text-gray-600 font-medium">Use your phone&apos;s camera to scan and pay.</p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Waiting for payment… ({pollCount}/{MAX_POLL})
          </div>
          {environment === 'sandbox' && (
            <button
              onClick={() => {
                const win = window.open(result.qr_code_data!.qr_code, '_blank');
                onOpenMockWindow(win);
              }}
              className="block text-sm text-indigo-600 hover:underline font-medium w-full"
            >
              Simulate Scan
            </button>
          )}
          <button
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            {isRegenerating ? 'Generating…' : 'Generate new QR code'}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Direct link expanded content ────────────────────────────────────────────

function DirectLinkContent({
  result,
  method,
  environment,
  onOpenWindow,
}: {
  result: PaymentRequestResponse;
  method: PaymentMethodOption;
  environment: Environment;
  onOpenWindow: (win: Window | null) => void;
}) {
  const symbol = CURRENCY_SYMBOLS[result.currency.toUpperCase() as keyof typeof CURRENCY_SYMBOLS] ?? '';
  const displayAmount = `${symbol}${parseFloat(result.amount).toLocaleString()}`;
  const isSandbox = environment === 'sandbox';

  return (
    <div className="p-5 flex flex-col bg-white gap-3">
      <div className="bg-gray-50 rounded-xl px-4 py-2.5">
        <p className="text-xs text-gray-500 mb-0.5">Amount</p>
        <p className="text-xl font-bold text-indigo-600">{displayAmount}</p>
      </div>

      <button
        onClick={() => {
          const win = window.open(result.direct_link!.direct_link_url, '_blank');
          onOpenWindow(win);
        }}
        className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition-colors"
      >
        Continue with {method.name}
        <svg className="w-4 h-4 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </button>

      {result.direct_link!.direct_link_app_url && (
        <div className="text-center">
          <a
            href={result.direct_link!.direct_link_app_url}
            className="text-sm text-indigo-600 hover:underline"
          >
            Open in app instead
          </a>
        </div>
      )}

      {/* Redirect info box */}
      <div className="flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
        <svg className="w-8 h-8 text-gray-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
        </svg>
        <p className="text-sm text-gray-500 leading-snug">
          After clicking &ldquo;Continue&rdquo;, you will be securely redirected directly to{' '}
          <span className="font-medium text-gray-700">{method.name}</span> to complete your payment.{' '}
          {isSandbox
            ? 'In this demo, a mock payment page simulates the experience. In production, customers are taken directly to the provider\'s app or website.'
            : 'No redirects through HitPay\'s hosted checkout. The payment flow stays entirely within your app.'}
        </p>
      </div>
    </div>
  );
}
