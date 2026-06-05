'use client';

import { Currency } from '@/lib/events';

const ALL_CURRENCIES: Currency[] = ['SGD', 'MYR', 'PHP'];

interface HeaderProps {
  currency: Currency;
  onCurrencyChange: (currency: Currency) => void;
}

export default function Header({ currency, onCurrencyChange }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2 sm:gap-3">
        <span className="font-bold text-lg text-gray-900">StagePass</span>
        <span className="hidden sm:inline text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
          Powered by HitPay
        </span>
      </div>
      <select
        value={currency}
        onChange={(e) => onCurrencyChange(e.target.value as Currency)}
        className="text-sm border border-gray-300 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        {ALL_CURRENCIES.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
    </header>
  );
}
