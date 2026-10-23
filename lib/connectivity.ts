// Connectivity checks used to gate prefetching.
//
// Prefetching (menu sections, order details) is a bandwidth luxury: it should
// only run while the connection can afford it. Offline, every prefetch is a
// failing request that competes with the user's own actions and stacks retry
// timers, so prefetch loops consult these helpers before each request and back
// off as soon as the browser reports the connection is gone.
//
// This matches the detection `useOfflineQueueSync` and `lib/offlineQueue` use,
// so prefetching and the offline queue agree on when the app is offline.

export const isNetworkOnline = (): boolean =>
  typeof navigator === 'undefined' || navigator.onLine !== false;
