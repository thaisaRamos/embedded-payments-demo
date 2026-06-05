'use client';

import { useState } from 'react';
import { Currency, Event, EVENTS } from '@/lib/events';
import { PAYMENT_METHODS_BY_CURRENCY } from '@/lib/payment-methods';
import Header from '@/components/Header';
import EventsSection from '@/components/EventsSection';
import CheckoutSection from '@/components/CheckoutSection';

export default function Home() {
  const [currency, setCurrency] = useState<Currency>('SGD');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        currency={currency}
        onCurrencyChange={setCurrency}
      />
      {process.env.NEXT_PUBLIC_HITPAY_ENV !== 'production' && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-xs sm:text-sm text-amber-700 font-medium">
          You are currently in <span className="font-bold">Sandbox</span> mode. No real payments will be made.
        </div>
      )}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Upcoming Events</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            Select a ticket to see HitPay&apos;s embedded payment options in action
          </p>
        </div>

        <EventsSection
          events={EVENTS}
          currency={currency}
          selectedEvent={selectedEvent}
          onEventSelect={setSelectedEvent}
        />

        {selectedEvent && (
          <CheckoutSection
            event={selectedEvent}
            currency={currency}
            paymentMethods={PAYMENT_METHODS_BY_CURRENCY[currency] ?? []}
            onCurrencyChange={setCurrency}
            onBackToEvents={() => setSelectedEvent(null)}
          />
        )}
      </main>
    </div>
  );
}
