'use client';

import { Event, Currency } from '@/lib/events';
import EventCard from '@/components/EventCard';

interface EventsSectionProps {
  events: Event[];
  currency: Currency;
  selectedEvent: Event | null;
  onEventSelect: (event: Event) => void;
}

export default function EventsSection({
  events,
  currency,
  selectedEvent,
  onEventSelect,
}: EventsSectionProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          currency={currency}
          isSelected={selectedEvent?.id === event.id}
          onSelect={onEventSelect}
        />
      ))}
    </div>
  );
}
