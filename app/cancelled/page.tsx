import Link from 'next/link';

interface Props {
  searchParams: Promise<{
    event?: string;
  }>;
}

export default async function CancelledPage({ searchParams }: Props) {
  const params = await searchParams;
  const eventName = params.event;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-3">
        <span className="font-bold text-lg text-gray-900">StagePass</span>
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
          Powered by HitPay
        </span>
      </header>

      <main className="max-w-lg mx-auto px-6 py-14">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">Payment Cancelled</h1>
        <p className="text-gray-500 text-sm text-center mb-8">
          {eventName
            ? `Your payment for "${eventName}" was not completed.`
            : 'Your payment was not completed.'}{' '}
          Please select a ticket and try again.
        </p>

        <div className="bg-white rounded-2xl border border-gray-200 px-5 py-4 mb-8">
          <p className="text-sm font-semibold text-gray-700 mb-3">What you can do</p>
          <ul className="space-y-2.5">
            {[
              'Go back and choose a different payment method',
              'Ensure your payment details are correct',
              'Contact support if the issue persists',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <span className="mt-0.5 w-4 h-4 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <svg className="w-2.5 h-2.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
                <span className="text-sm text-gray-600">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <Link
          href="/"
          className="block w-full text-center bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition-colors"
        >
          Try again
        </Link>
      </main>
    </div>
  );
}
