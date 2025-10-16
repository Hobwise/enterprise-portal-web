'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { decodeShortUrl } from '@/lib/urlShortener';

export default function MenuRedirect() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;
  const [error, setError] = useState('');

  useEffect(() => {
    if (code) {
      try {
        // Decode the short URL
        const decodedParams = decodeShortUrl(code);

        if (decodedParams && decodedParams.businessID) {
          // Build the full URL with query parameters
          const queryParams = new URLSearchParams();
          queryParams.set('businessID', decodedParams.businessID);

          if (decodedParams.cooperateID) {
            queryParams.set('cooperateID', decodedParams.cooperateID);
          }

          // Use the decoded business name
          if (decodedParams.businessName) {
            queryParams.set('businessName', decodedParams.businessName);
          }

          if (decodedParams.id) {
            queryParams.set('id', decodedParams.id);
          }

          if (decodedParams.mode) {
            queryParams.set('mode', decodedParams.mode);
          }

          // Redirect to the full URL
          const fullUrl = `/create-order?${queryParams.toString()}`;
          console.log('Redirecting to:', fullUrl);
          router.replace(fullUrl);
        } else {
          console.error('Failed to decode menu URL');
          setError('Invalid menu link. Please check the URL and try again.');
        }
      } catch (err) {
        console.error('Error processing short URL:', err);
        setError('Invalid menu link. Please check the URL and try again.');
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
            <p className="text-gray-600">Redirecting to menu...</p>
          </>
        )}
      </div>
    </div>
  );
}
