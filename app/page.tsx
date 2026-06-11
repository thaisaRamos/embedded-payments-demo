'use client';

import { useState, useEffect } from 'react';
import { Currency, Event, EVENTS } from '@/lib/events';
import { Environment } from '@/lib/hitpay';
import { PAYMENT_METHODS_BY_CURRENCY } from '@/lib/payment-methods';
import Header from '@/components/Header';
import EventsSection from '@/components/EventsSection';
import CheckoutSection from '@/components/CheckoutSection';

export default function Home() {
  const [currency, setCurrency] = useState<Currency>('SGD');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [environment, setEnvironment] = useState<Environment>(
    (process.env.NEXT_PUBLIC_HITPAY_ENV ?? 'sandbox') as Environment
  );

  useEffect(() => {
    const saved = sessionStorage.getItem('hp_checkout_state');
    if (!saved) return;
    sessionStorage.removeItem('hp_checkout_state');
    try {
      const { eventId, currency: c, environment: e } = JSON.parse(saved);
      const event = EVENTS.find((ev) => ev.id === eventId);
      if (event) {
        setSelectedEvent(event);
        setCurrency(c);
        setEnvironment(e);
      }
    } catch {}
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        currency={currency}
        onCurrencyChange={setCurrency}
        environment={environment}
        onEnvironmentChange={setEnvironment}
      />
      {environment === 'sandbox' ? (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-xs sm:text-sm text-amber-700">
          <span className="font-semibold">Sandbox mode</span> — no real payments will be made.
        </div>
      ) : (
        <div className="bg-green-50 border-b border-green-200 px-4 py-2 text-center text-xs sm:text-sm text-green-700">
          <span className="font-semibold">Live mode</span> — real payments will be processed. Use this mode to see the actual payment apps in action.
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
            environment={environment}
            paymentMethods={PAYMENT_METHODS_BY_CURRENCY[currency] ?? []}
            onCurrencyChange={setCurrency}
            onBackToEvents={() => setSelectedEvent(null)}
          />
        )}
      </main>
    </div>
  );
}
