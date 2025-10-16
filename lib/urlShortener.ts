export function encodeMenuUrl(params: {
  businessID: string;
  cooperateID?: string;
  businessName: string;
  id?: string;
  mode?: string;
}): string {
  const jsonString = JSON.stringify(params);

  const base64 = Buffer.from(jsonString).toString("base64");

  const urlSafe = base64
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  return urlSafe;
}

export function decodeMenuUrl(encoded: string): {
  businessID: string;
  cooperateID?: string;
  businessName: string;
  id?: string;
  mode?: string;
} | null {
  try {
    let base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");

    while (base64.length % 4) {
      base64 += "=";
    }

    const jsonString = Buffer.from(base64, "base64").toString("utf-8");
    const params = JSON.parse(jsonString);

    return params;
  } catch (error) {
    console.error("Error decoding menu URL:", error);
    return null;
  }
}

export function generateShortMenuUrl(
  baseUrl: string,
  params: {
    businessID: string;
    cooperateID?: string;
    businessName: string;
    id?: string;
    mode?: string;
  }
): string {
  const encoded = encodeMenuUrl(params);
  return `${baseUrl}/m/${encoded}`;
}

export function encodeMenuUrlBrowser(params: {
  businessID: string;
  cooperateID?: string;
  businessName: string;
  id?: string;
  mode?: string;
}): string {
  // Use abbreviated single-letter keys to drastically reduce length
  // b = businessID, c = cooperateID, n = businessName, i = id, m = mode
  const abbreviated: any = {
    b: params.businessID,
  };

  if (params.cooperateID) abbreviated.c = params.cooperateID;
  if (params.businessName) abbreviated.n = params.businessName;
  if (params.id) abbreviated.i = params.id;
  if (params.mode) abbreviated.m = params.mode;

  // Convert to compact JSON string (no spaces)
  const jsonString = JSON.stringify(abbreviated);

  const base64 = btoa(unescape(encodeURIComponent(jsonString)));
  const urlSafe = base64
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  return urlSafe;
}

export function decodeMenuUrlBrowser(encoded: string): {
  businessID: string;
  cooperateID?: string;
  businessName: string;
  id?: string;
  mode?: string;
} | null {
  try {
    // Restore base64 from URL-safe format
    let base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");

    // Add padding if needed
    while (base64.length % 4) {
      base64 += "=";
    }

    // Decode from base64 using browser API
    const jsonString = decodeURIComponent(escape(atob(base64)));

    // Parse JSON
    const abbreviated = JSON.parse(jsonString);

    // Convert abbreviated keys back to full keys
    // b = businessID, c = cooperateID, n = businessName, i = id, m = mode
    const params: any = {
      businessID: abbreviated.b,
      businessName: abbreviated.n || '',
    };

    if (abbreviated.c) params.cooperateID = abbreviated.c;
    if (abbreviated.i) params.id = abbreviated.i;
    if (abbreviated.m) params.mode = abbreviated.m;

    return params;
  } catch (error) {
    console.error("Error decoding menu URL:", error);
    return null;
  }
}

/**
 * Compress UUID by removing dashes only (simpler and more reliable)
 */
function compressUUID(uuid: string): string {
  if (!uuid) return '';
  // Simply remove dashes - keeps it as hex which is reliable
  return uuid.replace(/-/g, '');
}

/**
 * Decompress UUID back to original format by adding dashes
 */
function decompressUUID(compressed: string): string {
  try {
    if (!compressed || compressed.length !== 32) {
      console.error('Invalid compressed UUID length:', compressed);
      return '';
    }
    // Add dashes back in UUID format: 8-4-4-4-12
    return `${compressed.substring(0, 8)}-${compressed.substring(8, 12)}-${compressed.substring(12, 16)}-${compressed.substring(16, 20)}-${compressed.substring(20, 32)}`;
  } catch (error) {
    console.error('Error decompressing UUID:', error);
    return '';
  }
}

/**
 * Browser-safe version of generateShortMenuUrl
 * Uses compressed UUIDs with minimal business name
 */
export function generateShortMenuUrlBrowser(
  baseUrl: string,
  params: {
    businessID: string;
    cooperateID?: string;
    businessName: string;
    id?: string;
    mode?: string;
  }
): string {
  // Create a compact structure with abbreviated keys
  const compact: any = {
    b: compressUUID(params.businessID),
    n: params.businessName, // Keep business name (needed for page to work)
  };

  // Add cooperateID if present (compressed)
  if (params.cooperateID) {
    compact.c = compressUUID(params.cooperateID);
  }

  // Add QR id if present (compressed)
  if (params.id) {
    compact.i = compressUUID(params.id);
  }

  // Add mode as single character: v=view
  if (params.mode === 'view') {
    compact.m = 'v';
  }

  // Convert to JSON and encode
  const jsonString = JSON.stringify(compact);
  const encoded = btoa(unescape(encodeURIComponent(jsonString)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  return `${baseUrl}/m/${encoded}`;
}

/**
 * Decode the short URL back to parameters
 */
export function decodeShortUrl(encoded: string): {
  businessID: string;
  cooperateID?: string;
  businessName: string;
  id?: string;
  mode?: string;
} | null {
  try {
    console.log('Decoding short URL:', encoded);

    // Decode from base64
    let base64 = encoded
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    while (base64.length % 4) {
      base64 += '=';
    }

    // Decode the JSON string
    const jsonString = decodeURIComponent(escape(atob(base64)));
    console.log('Decoded JSON string:', jsonString);

    const compact = JSON.parse(jsonString);
    console.log('Compact object:', compact);

    // Decompress UUIDs and map abbreviated keys back
    const businessID = decompressUUID(compact.b);
    console.log('Decompressed businessID:', businessID);

    const result: any = {
      businessID: businessID,
      businessName: compact.n || '',
    };

    if (compact.c) {
      result.cooperateID = decompressUUID(compact.c);
      console.log('Decompressed cooperateID:', result.cooperateID);
    }

    if (compact.i) {
      result.id = decompressUUID(compact.i);
      console.log('Decompressed id:', result.id);
    }

    if (compact.m === 'v') {
      result.mode = 'view';
    }

    console.log('Final decoded result:', result);
    return result;
  } catch (error) {
    console.error('Error decoding short URL:', error);
    return null;
  }
}

/**
 * Browser-safe version of generateShortReservationUrl
 * For all reservations listing page
 */
export function generateShortReservationUrlBrowser(
  baseUrl: string,
  params: {
    businessId: string;
    cooperateID?: string;
    businessName: string;
  }
): string {
  const compact: any = {
    b: compressUUID(params.businessId),
    n: params.businessName,
  };

  if (params.cooperateID) {
    compact.c = compressUUID(params.cooperateID);
  }

  // Convert to JSON and encode
  const jsonString = JSON.stringify(compact);
  const encoded = btoa(unescape(encodeURIComponent(jsonString)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  return `${baseUrl}/r/${encoded}`;
}

/**
 * Browser-safe version for single reservation URL
 */
export function generateShortSingleReservationUrlBrowser(
  baseUrl: string,
  params: {
    reservationId: string;
  }
): string {
  const compact: any = {
    r: compressUUID(params.reservationId),
  };

  // Convert to JSON and encode
  const jsonString = JSON.stringify(compact);
  const encoded = btoa(unescape(encodeURIComponent(jsonString)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  return `${baseUrl}/r/${encoded}`;
}

/**
 * Decode the short reservation URL back to parameters
 */
export function decodeShortReservationUrl(encoded: string): {
  businessId?: string;
  cooperateID?: string;
  businessName?: string;
  reservationId?: string;
} | null {
  try {
    console.log('Decoding short reservation URL:', encoded);

    // Decode from base64
    let base64 = encoded
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    while (base64.length % 4) {
      base64 += '=';
    }

    // Decode the JSON string
    const jsonString = decodeURIComponent(escape(atob(base64)));
    console.log('Decoded JSON string:', jsonString);

    const compact = JSON.parse(jsonString);
    console.log('Compact object:', compact);

    const result: any = {};

    // Check if this is a single reservation (has 'r' key) or all reservations (has 'b' key)
    if (compact.r) {
      // Single reservation
      result.reservationId = decompressUUID(compact.r);
      console.log('Decompressed reservationId:', result.reservationId);
    } else if (compact.b) {
      // All reservations
      result.businessId = decompressUUID(compact.b);
      result.businessName = compact.n || '';
      console.log('Decompressed businessId:', result.businessId);

      if (compact.c) {
        result.cooperateID = decompressUUID(compact.c);
        console.log('Decompressed cooperateID:', result.cooperateID);
      }
    }

    console.log('Final decoded reservation result:', result);
    return result;
  } catch (error) {
    console.error('Error decoding short reservation URL:', error);
    return null;
  }
}
