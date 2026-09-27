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

/**
 * Initializes PostHog once per document. Safe to call from React effects that
 * run twice under StrictMode, and a no-op when the project key is missing so
 * local/dev environments without a key never fire requests.
 */
export const initPostHog = (): void => {
  if (initialized || !isPostHogEnabled()) return;

  posthog.init(POSTHOG_KEY as string, {
    api_host: POSTHOG_HOST,
    defaults: '2026-05-30',
    autocapture: true,
    capture_pageview: true,
    person_profiles: 'identified_only',
  });

  initialized = true;
};

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
 * Identifies the signed-in user so events are attributed to a person profile
 * instead of an anonymous id. Resets first when the browser is switching to a
 * different account so the previous user's properties are not merged in.
 */
export const identifyUser = (userInfo?: unknown): void => {
  if (!initialized || !isPostHogEnabled()) return;

  const info = (userInfo ??
    getJsonItemFromLocalStorage('userInformation')) as Record<string, any>;
  if (!info || typeof info !== 'object') return;

  const userId = firstNonEmpty(info.id, info.userId, info.cooperateID);
  if (!userId) return;

  const name = buildFullName(info);
  const role = buildRole(info);

  if (posthog.get_distinct_id() !== userId) {
    posthog.reset();
  }

  posthog.identify(userId, {
    email: firstNonEmpty(info.email, info?.user?.email) || undefined,
    name: name || undefined,
    role,
    cooperate_id: firstNonEmpty(info.cooperateID) || undefined,
    is_owner: info.isOwner === true,
    // Raw classification fields kept alongside the normalised `role` so you can
    // break down by exact assignment/category without parsing the label.
    staff_type: info.staffType ?? undefined,
    primary_assignment: firstNonEmpty(info.primaryAssignment) || undefined,
    assigned_category_id: firstNonEmpty(info.assignedCategoryId) || undefined,
  });
};

/**
 * Clears the identified person so a later sign-in on the same browser starts
 * from a clean anonymous state.
 */
export const resetPostHog = (): void => {
  if (!initialized || !isPostHogEnabled()) return;
  posthog.reset();
};

export const trackEvent = (
  event: string,
  properties?: Record<string, unknown>
): void => {
  if (!initialized || !isPostHogEnabled()) return;
  posthog.capture(event, properties);
};
