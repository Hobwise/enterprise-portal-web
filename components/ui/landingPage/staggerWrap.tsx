import React, { useContext, ReactNode } from 'react';
import { motion, MotionProps } from 'framer-motion';
import { IntersectionContext } from '../intersectionObserver';

interface StaggerContextType {
  stagger: boolean;
}

export const StaggerContext = React.createContext<StaggerContextType>({
  stagger: false,
});

interface StaggerWrapProps extends MotionProps {
  children: ReactNode;
  delayOrder?: number;
  delay?: number;
  childrenDelay?: number;
}

export const StaggerWrap: React.FC<StaggerWrapProps> = ({ children, delayOrder, delay = 0, childrenDelay = 1, ...rest }) => {
  const { inView } = useContext(IntersectionContext);

  const variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        delay,
        staggerChildren: childrenDelay,
      },
    },
  };

  return (
    <StaggerContext.Provider value={{ stagger: true }}>
      <motion.div initial="hidden" animate={inView ? 'show' : 'hidden'} exit="hidden" variants={variants} {...rest}>
        {children}
      </motion.div>
    </StaggerContext.Provider>
  );
};
