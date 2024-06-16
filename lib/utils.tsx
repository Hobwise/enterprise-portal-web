'use client';
import { clsx, type ClassValue } from 'clsx';
import download from 'downloadjs';
import { toPng } from 'html-to-image';
import cookie from 'js-cookie';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { twMerge } from 'tailwind-merge';
import hobink from '../public/assets/images/hobink.png';

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const saveToLocalStorage = (name, itemToSave) => {
  return typeof window !== 'undefined'
    ? localStorage.setItem(name, itemToSave)
    : false;
};
export const getFromLocalStorage = (name) => {
  return typeof window !== 'undefined' ? localStorage.getItem(name) : false;
};

export const clearItemLocalStorage = (name) => {
  return typeof window !== 'undefined' ? localStorage.removeItem(name) : false;
};
export const getJsonItemFromLocalStorage = (name) => {
  return typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem(name))
    : false;
};

export const saveJsonItemToLocalStorage = (
  name: string,
  itemToSave: any
): void => {
  localStorage.setItem(name, JSON.stringify(itemToSave));
};

// export const setTokenCookie = (token: string) => {
//   cookie.set('token', token, {
//     expires: 30,
//     path: '/',
//     sameSite: 'strict',
//     secure: process.env.NODE_ENV === 'production',
//   });
// };

export const setTokenCookie = (
  name: string,
  value: string,
  options?: cookie.CookieAttributes
) => {
  if (typeof window !== 'undefined') {
    cookie.set(name, value, options);
  }
};

export const getTokenCookie = (name: string) => {
  if (typeof window !== 'undefined') {
    return cookie.get(name);
  }
  return null;
};

export const removeCookie = (name: string) => {
  if (typeof window !== 'undefined') {
    cookie.remove(name);
  }
};

type ToastData = {
  position:
    | 'top-right'
    | 'top-left'
    | 'top-center'
    | 'bottom-right'
    | 'bottom-left'
    | 'bottom-center';
  autoClose: number | false;
  hideProgressBar: boolean;
  closeOnClick: boolean;
  pauseOnHover: boolean;
  draggable: boolean;
  progress: number | undefined;
  theme: 'light' | 'dark';
};

const toastData: ToastData = {
  position: 'top-right',
  autoClose: 5000,
  hideProgressBar: true,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: false,
  progress: undefined,
};

interface notifyType {
  title?: any;
  text?: any;
  type?: string;
}

const Msg = ({ title, text }: { title: string; text: string }) => {
  return (
    <div>
      <p className='font-bold text-[17px] pb-1'>{title}</p>
      <p>{text}</p>
    </div>
  );
};
export const notify = ({ title, text, type }: notifyType) => {
  type === 'warning' &&
    toast.warn(<Msg title={title} text={text} />, toastData);
  type === 'success' &&
    toast.success(<Msg title={title} text={text} />, toastData);
  type === 'error' && toast.error(<Msg title={title} text={text} />, toastData);
};
export function getInitials(name: string) {
  const words = name.split(' ');
  const initials = words.map((word) => word.charAt(0));
  return initials.join('').toUpperCase();
}
export const ONEMB = 1048576;
export const THREEMB = 3145728;
export const convertBase64ToImageURL = (base64String: string) => {
  const base64WithoutPrefix = base64String.replace(
    /^data:image\/[a-z]+;base64,/,
    ''
  );

  const byteCharacters = atob(base64WithoutPrefix);
  const byteArrays = [];
  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  const blob = new Blob(byteArrays, { type: 'image/png' });

  const imageURL = URL.createObjectURL(blob);

  return imageURL;
};

export const imageCompressOptions = {
  maxSizeMB: 0.2,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
};

export const CustomLoading = () => {
  return (
    <div
      className={`loadingContainer bg-white flex flex-col justify-center items-center`}
    >
      <div className='animate-bounce'>
        <Image src={hobink} style={{ objectFit: 'cover' }} alt='hobink logo' />
      </div>
      <p className='text-center loading-text text-primaryColor'>Loading...</p>
    </div>
  );
};

export const formatPrice = (price: any) => {
  const formatter = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return formatter.format(price);
};

export const downloadQRImage = async (qrObject, qrRef) => {
  if (qrRef.current === null) {
    return;
  }

  const dataUrl = await toPng(qrRef.current);
  download(dataUrl, `${qrObject?.name}-qr-code.png`);
};
// export const downloadQRpdf = async (qrObject, qrRef) => {
//   if (qrRef.current === null) {
//     return;
//   }
//   const canvas = await html2canvas(qrRef.current);
//   const dataUrl = canvas.toDataURL('image/png');
//   const pdf = new jsPDF();
//   pdf.addImage(dataUrl, 'PNG', 10, 10, 180, 180);
//   pdf.save(`${qrObject?.name}-qr-code.pdf`);
// };
export const SmallLoader = () => {
  return (
    <svg
      className='animate-spin h-5 w-5 text-current'
      fill='none'
      viewBox='0 0 24 24'
      xmlns='http://www.w3.org/2000/svg'
    >
      <circle
        className='opacity-25'
        cx='12'
        cy='12'
        r='10'
        stroke='currentColor'
        strokeWidth='4'
      />
      <path
        className='opacity-75'
        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
        fill='currentColor'
      />
    </svg>
  );
};
