import posthog from 'posthog-js';
import { getJsonItemFromLocalStorage } from './utils';
import { getUserType } from './userTypeUtils';

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

let initialized = false;

const isBrowser = (): boolean => typeof window !== 'undefined';

export const isPostHogEnabled = (): boolean =>
  Boolean(POSTHOG_KEY) && isBrowser();

const debug = (...args: unknown[]): void => {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log('[posthog]', ...args);
  }
};

/**
 * Initializes PostHog once per document. Safe to call from React effects that
 * run twice under StrictMode, and a no-op when the project key is missing so
 * local/dev environments without a key never fire requests.
 */
export const initPostHog = (): void => {
  if (initialized || !isPostHogEnabled()) return;

  posthog.init(POSTHOG_KEY as string, {
    api_host: POSTHOG_HOST,
    autocapture: true,
    // Pageviews are captured manually from the router (see capturePageview) so
    // Next.js App Router transitions are counted exactly once. Leaving this on
    // would double-report every navigation.
    capture_pageview: false,
    rageclick: true,
    person_profiles: 'identified_only',
    // Keep the identity in localStorage so the anonymous -> identified merge
    // survives a reload. Disabling this breaks `$identify` on the next page.
    disable_persistence: false,
    capture_performance: false,
    debug: process.env.NODE_ENV !== 'production',
  });

  initialized = true;
  debug('initialised', { host: POSTHOG_HOST });
};

/**
 * Gate for every public helper.
 *
 * Deliberately only checks that `init()` has been called, not that posthog-js
 * has finished booting. `init` is async, so waiting for `__loaded` would drop
 * the very first `$pageview` (the provider's effects run in the same commit
 * that calls init). posthog-js queues captures made after `init()` and flushes
 * them, so calling immediately is the documented pattern.
 */
const isReady = (): boolean => initialized;

const firstNonEmpty = (...values: unknown[]): string => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim() !== '') return value.trim();
  }
  return '';
};

const buildFullName = (info: Record<string, any>): string => {
  const user = (info?.user ?? {}) as Record<string, any>;
  return firstNonEmpty(
    user.fullName,
    info?.fullName,
    [info?.firstName, info?.lastName].filter(Boolean).join(' '),
    info?.userName,
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : undefined
  );
};

const buildRole = (info: Record<string, any>): string =>
  getUserType(info as any) || 'unknown';

/**
 * Person properties describing the signed-in user. Merged into the existing
 * profile on every identify, so it also doubles as a way to refresh properties
 * that changed since the last page load.
 */
const buildPersonProperties = (info: Record<string, any>) => ({
  email: firstNonEmpty(info.email, info?.user?.email) || undefined,
  name: buildFullName(info) || undefined,
  role: buildRole(info),
  cooperate_id: firstNonEmpty(info.cooperateID) || undefined,
  is_owner: info.isOwner === true,
  // Raw classification fields kept alongside the normalised `role` so you can
  // break down by exact assignment/category without parsing the label.
  staff_type: info.staffType ?? undefined,
  primary_assignment: firstNonEmpty(info.primaryAssignment) || undefined,
  assigned_category_id: firstNonEmpty(info.assignedCategoryId) || undefined,
});

/**
 * Identifies the signed-in user so events are attributed to a person profile
 * instead of an anonymous id.
 *
 * Deliberately does NOT call `posthog.reset()`. PostHog already merges the
 * current anonymous history into the person on `$identify`; resetting first
 * would mint a new anonymous id and orphan the pageview/autocapture events that
 * fired on this page load, splitting one visitor across several ids.
 */
export const identifyUser = (userInfo?: unknown): void => {
  if (!isReady()) return;

  const info = (userInfo ??
    getJsonItemFromLocalStorage('userInformation')) as Record<string, any>;
  if (!info || typeof info !== 'object') return;

  const userId = firstNonEmpty(info.id, info.userId, info.cooperateID);
  if (!userId) {
    debug('identifyUser skipped: no id in payload');
    return;
  }

  // `identify` also pushes the person properties, so re-identifying an already
  // identified visitor is a cheap way to refresh properties that changed.
  const alreadyIdentified =
    posthog.get_property('$isidentified') === true &&
    posthog.get_distinct_id() === userId;

  posthog.identify(userId, buildPersonProperties(info));
  debug('identify', { userId, alreadyIdentified });
};

/**
 * Forces any queued events (pageviews, identify, autocapture) out to PostHog
 * immediately. Must be called before a hard navigation such as
 * `window.location.href`, which tears the page down before the batch timer
 * fires and silently drops the request.
 */
export const flushPostHog = (): void => {
  if (!isReady()) return;
  try {
    posthog.flush();
  } catch (error) {
    debug('flush failed', error);
  }
};

/**
 * Records a routed page view. Called from the router on every navigation so
 * Next.js App Router transitions (which never reload the document) still
 * produce `$pageview` events.
 */
export const capturePageview = (): void => {
  if (!isReady()) return;
  const { pathname, search } = window.location;
  posthog.capture('$pageview', {
    $current_url: `${pathname}${search}`,
    path: pathname,
  });
};

export const trackEvent = (
  event: string,
  properties?: Record<string, unknown>
): void => {
  if (!isReady()) return;
  posthog.capture(event, properties);
};

/**
 * Sign-in. Identifies first so the event lands on the person profile, then
 * flushes: `loginForm` follows this with a full page load.
 */
export const trackSignIn = (userInfo?: unknown): void => {
  const info = (userInfo ??
    getJsonItemFromLocalStorage('userInformation')) as Record<string, any>;
  if (!info || typeof info !== 'object') return;

  identifyUser(info);
  trackEvent('signed in', buildPersonProperties(info));
  flushPostHog();
};

/**
 * Sign-up. `initial_*` prefixed properties are PostHog's convention for the
 * first value of a property, which is what makes the funnel step work — a
 * plain `email` is only read at the time the event fires.
 */
export const trackSignUp = (userInfo?: unknown): void => {
  const info = (userInfo ??
    getJsonItemFromLocalStorage('userInformation')) as Record<string, any>;
  if (!info || typeof info !== 'object') return;

  identifyUser(info);

  const name = buildFullName(info);
  trackEvent('signed up', {
    $initial_email: firstNonEmpty(info.email, info?.user?.email) || undefined,
    $initial_name: name || undefined,
    ...buildPersonProperties(info),
  });
  flushPostHog();
};

/**
 * Captures a signup attempt before the account is verified. No backend id
 * exists yet, so this stays on the anonymous id and the later `$identify` in
 * the email-confirmation step merges it into the finished person.
 */
export const trackSignUpStarted = (formData: {
  firstName?: string;
  lastName?: string;
  email?: string;
}): void => {
  if (!isReady()) return;

  const fullName = [formData?.firstName, formData?.lastName]
    .filter(Boolean)
    .join(' ');

  trackEvent('sign up started', {
    $initial_email: firstNonEmpty(formData?.email) || undefined,
    $initial_name: fullName || undefined,
  });
};

/**
 * Sign-out. Must capture before `resetPostHog()`, otherwise the reset swaps the
 * distinct id and the logout is attributed to a different person.
 */
export const trackSignOut = (): void => {
  if (!isReady()) return;
  trackEvent('signed out');
  flushPostHog();
  resetPostHog();
};

/**
 * Clears the identified person so a later sign-in on the same browser starts
 * from a clean anonymous state.
 */
export const resetPostHog = (): void => {
  if (!isReady()) return;
  posthog.reset();
};
