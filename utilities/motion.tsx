'use client';
import { motion } from 'framer-motion';

import { MotionProps } from 'framer-motion';
import { FC } from 'react';

interface MotionPropsCustom {
  children: React.ReactNode;
  className?: string;
}

const Motion: FC<MotionPropsCustom & MotionProps> = ({
  children,
  className,
  animate,
  initial,
  transition,
}) => {
  return (
    <motion.div
      className={className}
      initial={initial}
      animate={animate}
      transition={transition}
    >
      {children}
    </motion.div>
  );
};

export default Motion;
