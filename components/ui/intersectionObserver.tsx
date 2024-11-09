// import React, { useState, useEffect, ReactNode, useRef } from 'react';
// import { useIntersection } from 'react-use';

// interface IntersectionContextType {
//   inView: boolean;
// }

// export const IntersectionContext = React.createContext<IntersectionContextType>({ inView: true });

// interface IntersectionObserverProps {
//   children: ReactNode;
//   reset?: boolean;
// }

// export const IntersectionObserver: React.FC<IntersectionObserverProps> = ({ children, reset = true }) => {
//   const [inView, setInView] = useState(false);
//   const intersectionRef = useRef<HTMLDivElement>(null);
//   const intersection = useIntersection(intersectionRef, {
//     threshold: 0.3,
//   });

//   useEffect(() => {
//     const inViewNow = !!intersection && intersection.intersectionRatio > 0.3;
//     if (inViewNow) {
//       setInView(true);
//     } else if (reset) {
//       setInView(false);
//     }
//   }, [intersection, reset]);

//   return (
//     <IntersectionContext.Provider value={{ inView }}>
//       <div ref={intersectionRef}>{children}</div>
//     </IntersectionContext.Provider>
//   );
// };

import React, { useState, useEffect, ReactNode, useRef } from 'react';
import { useIntersection } from 'react-use';

interface IntersectionContextType {
  inView: boolean;
}

export const IntersectionContext = React.createContext<IntersectionContextType>({ inView: true });

interface IntersectionObserverProps {
  children: ReactNode;
  reset?: boolean;
  delay?: number; // Optional delay prop to control entry delay
}

export const IntersectionObserver: React.FC<IntersectionObserverProps> = ({ children, reset = true, delay = 10 }) => {
  // Default delay set to 500ms
  const [inView, setInView] = useState(false);
  const intersectionRef = useRef<HTMLDivElement>(null);
  const intersection = useIntersection(intersectionRef, {
    threshold: 0.3,
  });

  useEffect(() => {
    const inViewNow = !!intersection && intersection.intersectionRatio > 0.3;

    if (inViewNow) {
      const timeoutId = setTimeout(() => {
        setInView(true);
      }, delay); // Use the specified delay to set inView to true

      return () => clearTimeout(timeoutId); // Cleanup the timeout on unmount
    } else if (reset) {
      setInView(false);
    }
  }, [intersection, reset, delay]);

  return (
    <IntersectionContext.Provider value={{ inView }}>
      <div ref={intersectionRef}>{children}</div>
    </IntersectionContext.Provider>
  );
};
