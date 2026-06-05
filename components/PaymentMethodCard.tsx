'use client';

import Image from 'next/image';
import { PaymentMethodOption } from '@/lib/payment-methods';

interface PaymentMethodCardProps {
  method: PaymentMethodOption;
  isLoading?: boolean;
  isSelected?: boolean;
  isDisabled?: boolean;
  onSelect: (method: PaymentMethodOption) => void;
}

export default function PaymentMethodCard({
  method,
  isLoading = false,
  isSelected = false,
  isDisabled = false,
  onSelect,
}: PaymentMethodCardProps) {
  return (
    <button
      onClick={() => onSelect(method)}
      disabled={isDisabled}
      className={`flex items-center gap-2 p-3 rounded-xl border-2 text-left w-full transition-all ${
        isLoading || isSelected
          ? 'border-indigo-500 bg-indigo-50'
          : isDisabled
          ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
          : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50 cursor-pointer'
      }`}
    >
      <div className="w-8 h-8 shrink-0 flex items-center justify-center">
        {isLoading ? (
          <svg className="w-5 h-5 animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        ) : (
          <Image
            src={method.icon}
            alt={method.name}
            width={32}
            height={32}
            className="object-contain rounded"
          />
        )}
      </div>
      <span className="text-sm font-medium text-gray-800 flex-1 leading-tight">
        {method.name}
      </span>
      <span
        className={`text-xs px-1.5 py-0.5 rounded-full font-semibold shrink-0 ${
          method.type === 'qr'
            ? 'bg-green-100 text-green-700'
            : 'bg-blue-100 text-blue-700'
        }`}
      >
        {method.type === 'qr' ? 'QR' : 'Direct Link'}
      </span>
    </button>
  );
}
