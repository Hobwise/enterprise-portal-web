'use client';
import Airbnb from '@/public/assets/icons/airbnb.png';
import FedEx from '@/public/assets/icons/fedex.png';
import Google from '@/public/assets/icons/google.png';
import Hubspot from '@/public/assets/icons/hubspot.png';
import Microsoft from '@/public/assets/icons/microsoft.png';
import {
  CalendarDateTime,
  parseAbsolute,
  parseZonedDateTime,
} from '@internationalized/date';
import { clsx, type ClassValue } from 'clsx';
import download from 'downloadjs';
import { toPng } from 'html-to-image';

import cookie from 'js-cookie';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { twMerge } from 'tailwind-merge';

import LoadingAvatar from '../public/assets/images/loadingAvatar.svg';
import { companyInfo } from './companyInfo';

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};
export function capitalizeFirstLetterOfEachWord(str: string): string {
  return str
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

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

export const formatSubscriptionEndDate = (date: string): string => {
  // Ensure the input date is valid
  if (!moment(date, 'MMMM Do YYYY, h:mm:ss a', true).isValid()) {
    return 'Invalid Date';
  }

  // Convert and format the date
  return moment(date, 'MMMM Do YYYY, h:mm:ss a').format('MM/DD/YYYY hh:mmA');
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
      <p className="font-bold text-[17px] pb-1">{title}</p>
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
      className={`absolute top-0 left-0 w-full h-full  flex flex-col justify-center items-center`}
    >
      <div className="animate-bounce">
        <Image
          src={LoadingAvatar}
          style={{ objectFit: 'cover' }}
          alt={`${companyInfo.name} logo`}
          className="w-[60px] h-[60px]"
        />
      </div>
      <div className="leading-tight flex flex-col text-center">
        <span className=" font-[600] text-[24px]   text-black">
          Hang on a Sec!
        </span>

        <span className="text-sm font-[400]    text-[#475367] ">
          Just a moment...
        </span>
      </div>
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
  download(dataUrl, `${qrObject?.name}-qr.png`);
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
      className="animate-spin h-5 w-5 text-current"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        fill="currentColor"
      />
    </svg>
  );
};

export const tableTotalCount = (data: any) => {
  return data?.reduce((sum, category) => sum + category.totalCount, 0);
};

export const formatDateTime = (dateData) => {
  const date = new Date(
    Date.UTC(
      dateData.year,
      dateData.month - 1,
      dateData.day,
      dateData.hour - Math.floor(dateData.offset / 3600000),
      dateData.minute - (dateData.offset % 3600000) / 60000,
      dateData.second,
      dateData.millisecond
    )
  );

  return date.toISOString();
};

export const numberOnlyInput = (value: any) => {
  // const regex = /^[0-9]*$/;
  return value.replace(/[^0-9]/g, '');
};

export const submitBookingStatus = (id: number) => {
  if (id === 0) {
    return 1;
  } else if (id === 1) {
    return 0;
  } else if (id === 2) {
    return 2;
  }
};

export const formatDateTime2 = (inputDate: string) => {
  const zonedDateTime = parseZonedDateTime(inputDate);

  const formatter = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Africa/Lagos',
  });

  const formattedDate = formatter.format(zonedDateTime.toDate());

  return formattedDate;
};

export const reverseFormatDateTime = (formattedDate) => {
  if (formattedDate === undefined) {
    return null;
  }
  const dateString = formattedDate?.endsWith('Z')
    ? formattedDate
    : formattedDate + 'Z';
  const parsedDate = parseAbsolute(dateString, 'UTC');

  const { year, month, day, hour, minute, second, millisecond } = parsedDate;

  return new CalendarDateTime(
    year,
    month,
    day,
    hour,
    minute,
    second,
    millisecond
  );
};

export const formatDateTimeForPayload = (dateTime) => {
  const { year, month, day, hour, minute, second, millisecond } = dateTime;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(
    2,
    '0'
  )}T${String(hour).padStart(2, '0')}:${String(minute).padStart(
    2,
    '0'
  )}:${String(second).padStart(2, '0')}.${String(millisecond).padStart(
    3,
    '0'
  )}`;
};
export const formatDateTimeForPayload3 = (dateTime) => {
  return `${dateTime?.year}-${String(dateTime?.month).padStart(
    2,
    '0'
  )}-${String(dateTime?.day).padStart(2, '0')}`;
};
export const formatDateTimeForPayload2 = (dateTime) => {
  const {
    year,
    month,
    day,
    hour = 0,
    minute = 0,
    second = 0,
    millisecond = 0,
  } = dateTime;

  const datePart = `${year}-${String(month).padStart(2, '0')}-${String(
    day
  ).padStart(2, '0')}`;

  const timePart = `T${String(hour).padStart(2, '0')}:${String(minute).padStart(
    2,
    '0'
  )}:${String(second).padStart(2, '0')}.${String(millisecond).padStart(
    3,
    '0'
  )}`;

  return datePart + timePart;
};

export const saveAsPDF = async (
  invoiceRef: any,
  filename: string = 'invoice.pdf'
) => {
  const html2pdf = (await import('html2pdf.js/dist/html2pdf.min.js')).default;
  const element = invoiceRef.current;
  const options = {
    margin: 0.5,
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' },
  };

  html2pdf().from(element).set(options).save();
};

export const printPDF = async (
  invoiceRef: any,
  filename: string = 'invoice.pdf'
) => {
  const html2pdf = (await import('html2pdf.js/dist/html2pdf.min.js')).default;
  const element = invoiceRef.current;
  const options = {
    margin: 0.5,
    textAlign: 'center',
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      logging: true,
      letterRendering: true,
    },
    jsPDF: {
      unit: 'in',
      format: 'a4',
      orientation: 'landscape',
      compress: true,
    },
  };

  html2pdf()
    .from(element)
    .set(options)
    .output('blob')
    .then((blob) => {
      const url = URL.createObjectURL(blob);
      const newTab = window.open(url, '_blank');
      newTab.focus();

      newTab.onload = () => {
        newTab.print();
        URL.revokeObjectURL(url);
      };
    });
};

const crypto = require('crypto');

const algorithm = 'aes-256-ctr';
const secretKey = 'vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3';

export const encrypt = (text: any) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  return {
    iv: iv.toString('hex'),
    content: encrypted.toString('hex'),
  };
};

export const decrypt = (hash: any) => {
  const decipher = crypto.createDecipheriv(
    algorithm,
    secretKey,
    Buffer.from(hash.iv, 'hex')
  );
  const decrpyted = Buffer.concat([
    decipher.update(Buffer.from(hash.content, 'hex')),
    decipher.final(),
  ]);
  return decrpyted.toString();
};

export const dynamicExportConfig = (response: any, fileName: string) => {
  const blob = new Blob([response.data], {
    type: response.headers['content-type'],
  });

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;

  let filename = fileName;
  const contentDisposition = response.headers['content-disposition'];
  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
    if (filenameMatch.length === 2) {
      filename = filenameMatch[1];
    }
  }

  const contentType = response.headers['content-type'];
  if (contentType.includes('sheet')) {
    filename += '.xlsx';
  } else if (contentType.includes('pdf')) {
    filename += '.pdf';
  }

  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
};

export const companies = [
  { image: Airbnb, title: 'Airbnb' },
  { image: Hubspot, title: 'Hubspot' },
  { image: Google, title: 'Google' },
  { image: Microsoft, title: 'Microsoft' },
  { image: FedEx, title: 'FedEx' },
];

export const formatKey = (key: string) => {
  const formattedString = key.replace(/^canAccess/, '');

  return formattedString
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .concat(' management');
};

export const formatNumber = (value: string | number) => {
  if (typeof value === 'number') {
    return new Intl.NumberFormat().format(value);
  }
  return value;
};

export const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const getInitials2 = (
  businessName: string | undefined | null
): string => {
  if (!businessName) return '';
  const names = businessName.split(' ');
  const firstName = names[0] ?? '';
  const secondName = names[1] ?? '';
  return `${
    firstName && secondName
      ? firstName[0] + secondName[0]
      : firstName
      ? firstName[0]
      : ''
  }`;
};

export function addCommasToNumber(number: number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function formatDate(dateString: string) {
  const date = new Date(dateString);

  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'short' });
  const year = date.getFullYear();

  const dayWithSuffix =
    day +
    (day % 10 === 1 && day !== 11
      ? 'st'
      : day % 10 === 2 && day !== 12
      ? 'nd'
      : day % 10 === 3 && day !== 13
      ? 'rd'
      : 'th');

  return `${dayWithSuffix} ${month}., ${year}`;
}

export function resetLoginInfo() {
  sessionStorage.clear();
  localStorage.clear();
  removeCookie('token');
  window.location.href = '/auth/login';
}
