'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { decodeShortReservationUrl } from '@/lib/urlShortener';

export default function ReservationRedirect() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;
  const [error, setError] = useState('');

  useEffect(() => {
    if (code) {
      try {
        // Decode the short URL
        const decodedParams = decodeShortReservationUrl(code);

        if (decodedParams) {
          // Check if it's a single reservation or all reservations
          if (decodedParams.reservationId) {
            // Single reservation redirect
            const fullUrl = `/reservation/select-reservation/single-reservation?reservationId=${decodedParams.reservationId}`;
            console.log('Redirecting to single reservation:', fullUrl);
            router.replace(fullUrl);
          } else if (decodedParams.businessId) {
            // All reservations redirect
            const queryParams = new URLSearchParams();
            queryParams.set('businessName', decodedParams.businessName || '');
            queryParams.set('businessId', decodedParams.businessId);

            if (decodedParams.cooperateID) {
              queryParams.set('cooperateID', decodedParams.cooperateID);
            }

            const fullUrl = `/reservation/select-reservation?${queryParams.toString()}`;
            console.log('Redirecting to all reservations:', fullUrl);
            router.replace(fullUrl);
          } else {
            console.error('Failed to decode reservation URL');
            setError('Invalid reservation link. Please check the URL and try again.');
          }
        } else {
          console.error('Failed to decode reservation URL');
          setError('Invalid reservation link. Please check the URL and try again.');
        }
      } catch (err) {
        console.error('Error processing short URL:', err);
        setError('Invalid reservation link. Please check the URL and try again.');
      }
    }
  }, [code, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        {error ? (
          <>
            <div className="text-red-500 text-xl mb-4">⚠️</div>
            <p className="text-gray-700 font-medium mb-2">Oops!</p>
            <p className="text-gray-600">{error}</p>
          </>
        ) : (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primaryColor mx-auto mb-4"></div>
            <p className="text-gray-600">Redirecting to reservation...</p>
          </>
        )}
      </div>
    </div>
  );
}
