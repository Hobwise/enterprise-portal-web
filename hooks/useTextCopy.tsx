'use client';
import { useState } from 'react';

const useTextCopy = (textToCopy: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const handleCopyClick = () => {
    navigator.clipboard.writeText(textToCopy);
    setTimeout(() => {
      setIsOpen(false);
    }, 2000);
  };

  return { handleCopyClick, isOpen, setIsOpen };
};

export default useTextCopy;
