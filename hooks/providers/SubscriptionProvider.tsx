'use client';

import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import useSubscription from '@/hooks/cachedEndpoints/useSubscription';

export type PlanCapabilities = Record<string, boolean | number | undefined>;

interface SubscriptionContextValue {
  subscription: any;
  planCapabilities: PlanCapabilities;
  isLoading: boolean;
  isError: boolean;
  isReady: boolean;
  hasCapability: (key: string) => boolean;
  refetch: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextValue | undefined>(
  undefined,
);

export const SubscriptionProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { data, isLoading, isError, refetch } = useSubscription();
  const [hasResolvedOnce, setHasResolvedOnce] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setHasResolvedOnce(true);
    }
  }, [isLoading]);

  const value = useMemo<SubscriptionContextValue>(() => {
    const planCapabilities: PlanCapabilities =
      data?.planCapabilities ?? {};
    return {
      subscription: data,
      planCapabilities,
      isLoading,
      isError,
      isReady: hasResolvedOnce,
      hasCapability: (key) => Boolean(planCapabilities[key]),
      refetch,
    };
  }, [data, isLoading, isError, hasResolvedOnce, refetch]);

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscriptionContext = (): SubscriptionContextValue => {
  const ctx = useContext(SubscriptionContext);
  if (ctx === undefined) {
    throw new Error(
      'useSubscriptionContext must be used within a SubscriptionProvider',
    );
  }
  return ctx;
};
