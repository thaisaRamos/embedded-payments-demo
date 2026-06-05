export type Currency = 'SGD' | 'MYR' | 'PHP' | 'IDR' | 'THB' | 'VND';

export interface Event {
  id: string;
  name: string;
  type: string;
  date: string;
  basePrice: number;
  image: string;
}

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  SGD: 'S$',
  MYR: 'RM',
  PHP: '₱',
  IDR: 'Rp',
  THB: '฿',
  VND: '₫',
};

export const FX_RATES: Record<Currency, number> = {
  SGD: 1,
  MYR: 3.45,
  PHP: 43,
  IDR: 11500,
  THB: 26,
  VND: 17500,
};

export function convertPrice(basePriceSGD: number, currency: Currency): number {
  const converted = basePriceSGD * FX_RATES[currency];
  if (currency === 'IDR' || currency === 'VND') {
    return Math.round(converted / 500) * 500;
  }
  if (currency === 'PHP') {
    return Math.round(converted);
  }
  return Math.round(converted * 100) / 100;
}

export function formatAmountForApi(basePriceSGD: number, currency: Currency): string {
  const amount = convertPrice(basePriceSGD, currency);
  if (currency === 'IDR' || currency === 'VND' || currency === 'PHP') {
    return String(Math.round(amount));
  }
  return amount.toFixed(2);
}

export const EVENTS: Event[] = [
  {
    id: 'sunset-music-festival',
    name: 'Sunset Music Festival',
    type: 'Outdoor Concert',
    date: 'Aug 15, 2026',
    basePrice: 120,
    image: '/events/sunset-music-festival.svg',
  },
  {
    id: 'asia-tech-summit',
    name: 'Asia Tech Summit 2026',
    type: 'Conference',
    date: 'Sep 22, 2026',
    basePrice: 280,
    image: '/events/asia-tech-summit.svg',
  },
  {
    id: 'city-night-run',
    name: 'City Night Run',
    type: 'Sports',
    date: 'Oct 5, 2026',
    basePrice: 45,
    image: '/events/city-night-run.svg',
  },
  {
    id: 'digital-art-expo',
    name: 'Digital Art Expo',
    type: 'Exhibition',
    date: 'Nov 12, 2026',
    basePrice: 35,
    image: '/events/digital-art-expo.svg',
  },
];
