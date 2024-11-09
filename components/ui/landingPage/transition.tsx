import React, { useContext, useMemo, ReactNode } from 'react';
import { motion, useViewportScroll, Transition as FramerTransition } from 'framer-motion';
import { IntersectionContext, IntersectionObserver } from '../intersectionObserver';
import { StaggerWrap } from './staggerWrap';

interface FadeInUpProps {
  children: ReactNode;
  reset?: boolean;
  duration?: number;
  easing?: [number, number, number, number];
}

const FadeInUp: React.FC<FadeInUpProps> = ({ children, reset = true, duration = 2, easing = [0, 0.78, 0.42, 0.98] }) => {
  const { inView } = useContext(IntersectionContext);

  const transition: FramerTransition = useMemo(
    () => ({
      duration,
      ease: easing,
    }),
    [duration, easing]
  );

  const variants = {
    hidden: {
      opacity: 0,
      y: 20,
      transition,
    },
    show: {
      opacity: 1,
      y: 0,
      transition,
    },
  };

  return (
    <motion.div initial="hidden" animate={inView ? 'show' : 'hidden'} variants={variants}>
      {children}
    </motion.div>
  );
};

interface TransitionProps {
  children: ReactNode;
}

export const Transition: React.FC<TransitionProps> = ({ children }) => (
  <IntersectionObserver>
    <StaggerWrap>
      <FadeInUp>{children}</FadeInUp>
    </StaggerWrap>
  </IntersectionObserver>
);
