'use client';

import { Event, Currency, convertPrice, CURRENCY_SYMBOLS } from '@/lib/events';

interface EventCardProps {
  event: Event;
  currency: Currency;
  isSelected: boolean;
  onSelect: (event: Event) => void;
}

export default function EventCard({ event, currency, isSelected, onSelect }: EventCardProps) {
  const price = convertPrice(event.basePrice, currency);
  const symbol = CURRENCY_SYMBOLS[currency];

  const formatted =
    currency === 'IDR' || currency === 'VND'
      ? price.toLocaleString()
      : price.toLocaleString(undefined, { minimumFractionDigits: currency === 'PHP' ? 0 : 2 });

  return (
    <div
      onClick={() => onSelect(event)}
      className={`rounded-2xl border-2 overflow-hidden cursor-pointer transition-all ${
        isSelected
          ? 'border-indigo-500 shadow-lg shadow-indigo-100'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
      }`}
    >
      <div className="h-36 relative overflow-hidden">
        <img
          src={event.image}
          alt={event.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 px-4 py-2 bg-gradient-to-t from-black/50 to-transparent">
          <span className="text-xs font-semibold text-white/90 uppercase tracking-wide">
            {event.type}
          </span>
        </div>
      </div>
      <div className="p-4 bg-white">
        <div className="font-semibold text-gray-900 mb-1 leading-snug">{event.name}</div>
        <div className="text-sm text-gray-500 mb-4">{event.date}</div>
        <div className="flex items-center justify-between">
          <span className="font-bold text-lg text-gray-900">
            {symbol}{formatted}
          </span>
          <button
            onClick={() => onSelect(event)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm px-4"
          >
            Get Tickets
          </button>
        </div>
      </div>
    </div>
  );
}
