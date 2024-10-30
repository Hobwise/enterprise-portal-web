import React, { useState, useEffect, ReactNode, useRef } from 'react';
import { useIntersection } from 'react-use';

interface IntersectionContextType {
  inView: boolean;
}

export const IntersectionContext = React.createContext<IntersectionContextType>({ inView: true });

interface IntersectionObserverProps {
  children: ReactNode;
  reset?: boolean;
}

export const IntersectionObserver: React.FC<IntersectionObserverProps> = ({ children, reset = true }) => {
  const [inView, setInView] = useState(false);
  const intersectionRef = useRef<HTMLDivElement>(null);
  const intersection = useIntersection(intersectionRef, {
    threshold: 0.3,
  });

  useEffect(() => {
    const inViewNow = !!intersection && intersection.intersectionRatio > 0.3;
    if (inViewNow) {
      setInView(true);
    } else if (reset) {
      setInView(false);
    }
  }, [intersection, reset]);

  return (
    <IntersectionContext.Provider value={{ inView }}>
      <div ref={intersectionRef}>{children}</div>
    </IntersectionContext.Provider>
  );
};
