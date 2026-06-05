'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';
import { PaymentRequestResponse, Environment } from '@/lib/hitpay';
import { PaymentMethodOption } from '@/lib/payment-methods';
import { CURRENCY_SYMBOLS } from '@/lib/events';

const MAX_POLL = 60;
const POLL_INTERVAL_MS = 3000;

interface ResultCardProps {
  result: PaymentRequestResponse;
  selectedMethod: PaymentMethodOption;
  environment: Environment;
  onResult: (result: PaymentRequestResponse) => void;
  onReset: () => void;
}

export default function ResultCard({
  result,
  selectedMethod,
  environment,
  onResult,
  onReset,
}: ResultCardProps) {
  const isQr = !!result.qr_code_data;
  const isDirectLink = !!result.direct_link;

  return (
    <div className="mt-8">
      {isQr && result.qr_code_data && (
        <QRCard
          result={result}
          selectedMethod={selectedMethod}
          environment={environment}
          onResult={onResult}
          onReset={onReset}
        />
      )}

      {isDirectLink && result.direct_link && (
        <DirectLinkCard
          result={result}
          selectedMethod={selectedMethod}
          onReset={onReset}
        />
      )}

      {!isQr && !isDirectLink && result.url && (
        <FallbackCard result={result} onReset={onReset} />
      )}
    </div>
  );
}

// ─── QR Card ─────────────────────────────────────────────────────────────────

interface QRCardProps {
  result: PaymentRequestResponse;
  selectedMethod: PaymentMethodOption;
  environment: Environment;
  onResult: (result: PaymentRequestResponse) => void;
  onReset: () => void;
}

function QRCard({ result, selectedMethod, environment, onResult, onReset }: QRCardProps) {
  const [pollCount, setPollCount] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'completed' | 'expired'>('pending');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const pollRef = useRef(0);

  useEffect(() => {
    if (paymentStatus !== 'pending') return;

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
          `/api/payment-request/status?id=${result.id}&region=${selectedMethod.apiKeyRegion}&env=${environment}`
        );
        const data = await res.json();
        if (data.status === 'completed') {
          clearInterval(interval);
          setPaymentStatus('completed');
        }
      } catch {
        // continue polling silently
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [result.id, selectedMethod.apiKeyRegion, environment, paymentStatus]);

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const res = await fetch('/api/payment-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: result.amount,
          currency: result.currency,
          payment_method: selectedMethod.id,
          generate_qr: true,
          generate_direct_link: false,
          api_key_region: selectedMethod.apiKeyRegion,
          environment,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPaymentStatus('pending');
        onResult(data);
      }
    } finally {
      setIsRegenerating(false);
    }
  };

  const symbol = CURRENCY_SYMBOLS[result.currency.toUpperCase() as keyof typeof CURRENCY_SYMBOLS] ?? '';
  const displayAmount = `${symbol}${parseFloat(result.amount).toLocaleString()}`;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      {/* Method header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 flex items-center justify-center shrink-0">
          <Image
            src={selectedMethod.icon}
            alt={selectedMethod.name}
            width={36}
            height={36}
            className="object-contain rounded"
          />
        </div>
        <span className="font-semibold text-gray-900 text-lg">{selectedMethod.name}</span>
      </div>

      {/* Amount */}
      <div className="bg-gray-50 rounded-xl px-4 py-3 mb-5">
        <p className="text-xs text-gray-500 mb-0.5">Original amount (payment request currency)</p>
        <p className="text-2xl font-bold text-indigo-600">{displayAmount}</p>
      </div>

      {/* QR code — rendered client-side from qr_code string */}
      <div className="flex justify-center mb-5">
        <div className="p-4 border border-gray-200 rounded-2xl bg-white">
          <QRCodeSVG
            value={result.qr_code_data!.qr_code}
            size={200}
            level="M"
            includeMargin={false}
          />
        </div>
      </div>

      {/* Status */}
      {paymentStatus === 'completed' ? (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full font-semibold text-sm mb-5">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Payment completed!
          </div>
        </div>
      ) : paymentStatus === 'expired' ? (
        <div className="text-center mb-5">
          <p className="text-sm text-gray-500 mb-3">QR code expired</p>
          <button
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="text-sm text-indigo-600 hover:underline disabled:opacity-50"
          >
            {isRegenerating ? 'Generating…' : 'Generate new QR code'}
          </button>
        </div>
      ) : (
        <div className="text-center space-y-3">
          <p className="text-sm text-gray-600 font-medium">
            Complete payment via {selectedMethod.name}
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Waiting for payment… ({pollCount}/{MAX_POLL})
          </div>
          {environment === 'sandbox' && (
            <a
              href={result.qr_code_data!.qr_code}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm text-indigo-600 hover:underline"
            >
              Complete Mock Payment (for testing)
            </a>
          )}
          <button
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="block w-full text-sm text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            {isRegenerating ? 'Generating…' : 'Generate new QR code'}
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-100 text-center">
        <button
          onClick={onReset}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          Pay a different way
        </button>
      </div>
    </div>
  );
}

// ─── Direct Link Card ─────────────────────────────────────────────────────────

interface DirectLinkCardProps {
  result: PaymentRequestResponse;
  selectedMethod: PaymentMethodOption;
  onReset: () => void;
}

function DirectLinkCard({ result, selectedMethod, onReset }: DirectLinkCardProps) {
  const symbol = CURRENCY_SYMBOLS[result.currency.toUpperCase() as keyof typeof CURRENCY_SYMBOLS] ?? '';
  const displayAmount = `${symbol}${parseFloat(result.amount).toLocaleString()}`;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 flex items-center justify-center shrink-0">
          <Image
            src={selectedMethod.icon}
            alt={selectedMethod.name}
            width={36}
            height={36}
            className="object-contain rounded"
          />
        </div>
        <span className="font-semibold text-gray-900 text-lg">{selectedMethod.name}</span>
      </div>

      <div className="bg-gray-50 rounded-xl px-4 py-3 mb-6">
        <p className="text-xs text-gray-500 mb-0.5">Amount</p>
        <p className="text-2xl font-bold text-indigo-600">{displayAmount}</p>
      </div>

      <p className="text-sm text-gray-500 text-center mb-5">
        You will be redirected to complete your payment
      </p>

      <a
        href={result.direct_link!.direct_link_url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition-colors mb-3"
      >
        Open in {selectedMethod.name}
      </a>

      {result.direct_link!.direct_link_app_url && (
        <div className="text-center mb-3">
          <a
            href={result.direct_link!.direct_link_app_url}
            className="text-sm text-indigo-600 hover:underline"
          >
            Open in app instead
          </a>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-100 text-center">
        <button
          onClick={onReset}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          Pay a different way
        </button>
      </div>
    </div>
  );
}

// ─── Fallback Card ────────────────────────────────────────────────────────────

function FallbackCard({
  result,
  onReset,
}: {
  result: PaymentRequestResponse;
  onReset: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
      <p className="text-sm text-gray-500 mb-5">Complete your payment on the HitPay checkout page</p>
      <a
        href={result.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block bg-indigo-600 text-white font-semibold px-8 py-3 rounded-xl hover:bg-indigo-700 transition-colors mb-6"
      >
        Go to Checkout
      </a>
      <div className="pt-4 border-t border-gray-100">
        <button
          onClick={onReset}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          Pay a different way
        </button>
      </div>
    </div>
  );
}
