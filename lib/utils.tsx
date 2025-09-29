"use client";
import Airbnb from "@/public/assets/icons/airbnb.png";
import FedEx from "@/public/assets/icons/fedex.png";
import Google from "@/public/assets/icons/google.png";
import Hubspot from "@/public/assets/icons/hubspot.png";
import Microsoft from "@/public/assets/icons/microsoft.png";
import {
  CalendarDateTime,
  parseAbsolute,
  parseZonedDateTime,
} from "@internationalized/date";
import { clsx, type ClassValue } from "clsx";
import download from "downloadjs";
import { toPng } from "html-to-image";

import cookie from "js-cookie";
import Image from "next/image";
import toast from "react-hot-toast";
import { twMerge } from "tailwind-merge";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import LoadingAvatar from "../public/assets/images/loadingAvatar.svg";
import { companyInfo } from "./companyInfo";
import { useQueryClient } from '@tanstack/react-query';
import moment from "moment";

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};
export function capitalizeFirstLetterOfEachWord(str: string): string {
  return str
    ?.split(" ")
    ?.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    ?.join(" ");
}

export const saveToLocalStorage = (name, itemToSave) => {
  return typeof window !== "undefined"
    ? localStorage.setItem(name, itemToSave)
    : false;
};
export const getFromLocalStorage = (name) => {
  return typeof window !== "undefined" ? localStorage.getItem(name) : false;
};

export const clearItemLocalStorage = (name) => {
  return typeof window !== "undefined" ? localStorage.removeItem(name) : false;
};
export const getJsonItemFromLocalStorage = (name) => {
  return typeof window !== "undefined"
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
  if (!moment(date, "MMMM Do YYYY, h:mm:ss a", true).isValid()) {
    return "Invalid Date";
  }

  // Convert and format the date
  return moment(date, "MMMM Do YYYY, h:mm:ss a").format("MM/DD/YYYY hh:mmA");
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
  if (typeof window !== "undefined") {
    cookie.set(name, value, options);
  }
};

export const getTokenCookie = (name: string) => {
  if (typeof window !== "undefined") {
    return cookie.get(name);
  }
  return null;
};

export const removeCookie = (name: string) => {
  if (typeof window !== "undefined") {
    cookie.remove(name);
  }
};

type ToastData = {
  position:
    | "top-right"
    | "top-left"
    | "top-center"
    | "bottom-right"
    | "bottom-left"
    | "bottom-center";
  autoClose: number | false;
  hideProgressBar: boolean;
  closeOnClick: boolean;
  pauseOnHover: boolean;
  draggable: boolean;
  progress: number | undefined;
  theme: "light" | "dark";
};

const toastData: ToastData = {
  position: "top-right",
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
  type === "warning" &&
    toast(<Msg title={title} text={text} />, {
      ...toastData,
      icon: '⚠️',
      style: {
        background: '#F59E0B',
        color: '#fff',
      },
    });
  type === "success" &&
    toast.success(<Msg title={title} text={text} />, toastData);
  type === "error" && toast.error(<Msg title={title} text={text} />, toastData);
};
export function getInitials(name: string) {
  const words = name.split(" ");
  const initials = words.map((word) => word.charAt(0));
  return initials.join("").toUpperCase();
}
export const ONEMB = 1048576;
export const THREEMB = 3145728;
export const convertBase64ToImageURL = (base64String: string) => {
  const base64WithoutPrefix = base64String.replace(
    /^data:image\/[a-z]+;base64,/,
    ""
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

  const blob = new Blob(byteArrays, { type: "image/png" });

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
          style={{ objectFit: "cover" }}
          alt={`${companyInfo.name} logo`}
          className="w-[60px] h-[60px]"
        />
      </div>
      <div className="leading-tight flex flex-col text-center">
        <span className=" font-[600] text-[24px]   text-black">
          Hang on a sec!
        </span>

        <span className="text-sm font-[400]    text-[#475367] ">
          Just a moment...
        </span>
      </div>
    </div>
  );
};

export const formatPrice = (price: any, currency: any) => {
  const formatter = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
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

export const formatDateTime = (dateData: any) => {
  const date = new Date(
    Date.UTC(
      dateData.year,
      dateData.month - 1,
      dateData.day,
      dateData.hour,
      dateData.minute,
      dateData.second,
      dateData.millisecond
    )
  );

  return date.toISOString();
};

export const numberOnlyInput = (value: any) => {
  // const regex = /^[0-9]*$/;
  return value.replace(/[^0-9]/g, "");
};

export const submitBookingStatus = (id: number) => {
  if (id === 0) {
    return 1; // Pending -> Confirmed
  } else if (id === 1) {
    return 2; // Confirmed -> Admitted
  } else if (id === 2) {
    return 6; // Admitted -> Closed
  }
  return id; // Return same status if no transition defined
};

export const formatDateTime2 = (inputDate: string) => {
  const zonedDateTime = parseZonedDateTime(inputDate);

  const formatter = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Africa/Lagos",
  });

  const formattedDate = formatter.format(zonedDateTime.toDate());

  return formattedDate;
};

export const reverseFormatDateTime = (formattedDate) => {
  if (formattedDate === undefined) {
    return null;
  }
  const dateString = formattedDate?.endsWith("Z")
    ? formattedDate
    : formattedDate + "Z";
  const parsedDate = parseAbsolute(dateString, "UTC");

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
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
    2,
    "0"
  )}T${String(hour).padStart(2, "0")}:${String(minute).padStart(
    2,
    "0"
  )}:${String(second).padStart(2, "0")}.${String(millisecond).padStart(
    3,
    "0"
  )}`;
};
export const formatDateTimeForPayload3 = (dateTime) => {
  return `${dateTime?.year}-${String(dateTime?.month).padStart(
    2,
    "0"
  )}-${String(dateTime?.day).padStart(2, "0")}`;
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

  const datePart = `${year}-${String(month).padStart(2, "0")}-${String(
    day
  ).padStart(2, "0")}`;

  const timePart = `T${String(hour).padStart(2, "0")}:${String(minute).padStart(
    2,
    "0"
  )}:${String(second).padStart(2, "0")}.${String(millisecond).padStart(
    3,
    "0"
  )}`;

  return datePart + timePart;
};

export const saveAsPDF = async (
  invoiceRef: any,
  filename: string = "invoice.pdf",
  optionsOverride: any = {}
) => {
  const html2pdf = (await import("html2pdf.js/dist/html2pdf.min.js")).default;
  const element = invoiceRef.current;
  const defaultOptions = {
    margin: 0.5,
    filename: filename,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
  };
  const options = {
    ...defaultOptions,
    ...optionsOverride,
    jsPDF: { ...defaultOptions.jsPDF, ...(optionsOverride.jsPDF || {}) },
  };
  html2pdf().from(element).set(options).save();
};

export const printPDF = async (
  invoiceRef: any,
  filename: string = "invoice.pdf"
) => {
  const html2pdf = (await import("html2pdf.js/dist/html2pdf.min.js")).default;
  const element = invoiceRef.current;
  const options = {
    margin: 0.5,
    textAlign: "center",
    filename: filename,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      logging: true,
      letterRendering: true,
    },
    jsPDF: {
      unit: "in",
      format: "a4",
      orientation: "portrait",
      compress: true,
    },
  };

  html2pdf()
    .from(element)
    .set(options)
    .output("blob")
    .then((blob) => {
      const url = URL.createObjectURL(blob);
      const newTab = window.open(url, "_blank");
      newTab.focus();

      newTab.onload = () => {
        newTab.print();
        URL.revokeObjectURL(url);
      };
    });
};

const crypto = require("crypto");

const algorithm = "aes-256-ctr";
const secretKey = "vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3";

export const encrypt = (text: any) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  return {
    iv: iv.toString("hex"),
    content: encrypted.toString("hex"),
  };
};

export const decrypt = (hash: any) => {
  const decipher = crypto.createDecipheriv(
    algorithm,
    secretKey,
    Buffer.from(hash.iv, "hex")
  );
  const decrpyted = Buffer.concat([
    decipher.update(Buffer.from(hash.content, "hex")),
    decipher.final(),
  ]);
  return decrpyted.toString();
};

export const dynamicExportConfig = (response: any, fileName: string) => {
  const blob = new Blob([response.data], {
    type: response.headers["content-type"],
  });

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;

  let filename = fileName;
  const contentDisposition = response.headers["content-disposition"];
  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
    if (filenameMatch.length === 2) {
      filename = filenameMatch[1];
    }
  }

  const contentType = response.headers["content-type"];
  if (contentType.includes("sheet")) {
    filename += ".xlsx";
  } else if (contentType.includes("pdf")) {
    filename += ".pdf";
  }

  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
};

export const companies = [
  { image: Airbnb, title: "Airbnb" },
  { image: Hubspot, title: "Hubspot" },
  { image: Google, title: "Google" },
  { image: Microsoft, title: "Microsoft" },
  { image: FedEx, title: "FedEx" },
];

export const formatKey = (key: string) => {
  const formattedString = key.replace(/^canAccess/, "");

  return formattedString
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .concat(" management");
};

export const formatNumber = (value: string | number) => {
  if (typeof value === "number") {
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
  if (!businessName) return "";
  const names = businessName?.split(" ");
  const firstName = names[0] ?? "";
  const secondName = names[1] ?? "";
  return `${
    firstName && secondName
      ? firstName[0] + secondName[0]
      : firstName
      ? firstName[0]
      : ""
  }`;
};

export function addCommasToNumber(number: number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function formatDate(dateString: string) {
  const date = new Date(dateString);

  const day = date.getDate();
  const month = date.toLocaleString("default", { month: "short" });
  const year = date.getFullYear();

  const dayWithSuffix =
    day +
    (day % 10 === 1 && day !== 11
      ? "st"
      : day % 10 === 2 && day !== 12
      ? "nd"
      : day % 10 === 3 && day !== 13
      ? "rd"
      : "th");

  return `${dayWithSuffix} ${month}., ${year}`;
}

export function resetLoginInfo() {
  try {
    // Clear all storage
    sessionStorage.clear();
    localStorage.clear();
    
    // Remove specific cookies that might persist
    removeCookie("token");
    removeCookie("planCapabilities");
    removeCookie("username");
    removeCookie("jwt");
    
    // Clear any React Query cache if available globally
    if (typeof window !== 'undefined' && (window as any).queryClient) {
      (window as any).queryClient.clear();
    }
    
    // Add a small delay to ensure cleanup completes before redirect
    setTimeout(() => {
      window.location.href = "/auth/login";
    }, 100);
  } catch (error) {
    console.error('Error during logout cleanup:', error);
    // Force redirect even if cleanup fails
    window.location.href = "/auth/login";
  }
}

// export function generateTimeSlots(start: string, end: string) {
//   const times = [];
//   const [startHour, startMinute] = start.split(':').map(Number);
//   const [endHour, endMinute] = end.split(':').map(Number);

//   let currentHour = startHour;
//   let currentMinute = startMinute;

//   while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
//     times.push(formatTo12Hour(currentHour, currentMinute));

//     // Increment by 30 minutes
//     currentMinute += 30;
//     if (currentMinute === 60) {
//       currentMinute = 0;
//       currentHour++;
//     }
//   }

//   times.push(formatTo12Hour(endHour, endMinute));
//   return times;
// }

// export function formatTo12Hour(hour: number, minute: number) {
//   if (hour) {
//     const isPM = hour >= 12;
//     const adjustedHour = hour % 12 === 0 ? 12 : hour % 12;
//     const period = isPM ? 'PM' : 'AM';
//     const formattedMinute = minute.toString().padStart(2, '0');
//     return `${adjustedHour}:${formattedMinute}${period}`;
//   } else {
//     return null;
//   }
// }

export function generateTimeSlots(
  start: string,
  end: string,
  interval: number
): string[] {
  const times: string[] | any = [];
  const startHour = parseInt(start.split(":")[0]);
  const endHour = parseInt(end.split(":")[0]);

  for (let hour = startHour; hour < endHour; hour += interval) {
    const formattedTime = formatTo12Hour(hour);
    times.push(formattedTime);
  }
  times.push(formatTo12Hour(endHour));
  return times;
}

export function formatTo12Hour(hour: number) {
  if (hour) {
    const isPM = hour >= 12;
    const adjustedHour = hour % 12 === 0 ? 12 : hour % 12;
    const period = isPM ? "PM" : "AM";
    return `${adjustedHour}:00${period}`;
  } else {
    return null;
  }
}

export function convertToISO(date: string, time: any) {
  // Parse the time into hours and minutes
  const [timePart, meridiem] = time.match(/(\d+:\d+)(AM|PM)/i).slice(1);
  let [hours, minutes] = timePart.split(":").map(Number);

  // Adjust hours based on AM/PM
  if (meridiem.toUpperCase() === "PM" && hours !== 12) {
    hours += 12;
  } else if (meridiem.toUpperCase() === "AM" && hours === 12) {
    hours = 0;
  }

  // Combine into a Date object
  const dateTime = new Date(date);
  dateTime.setHours(hours + 1, minutes, 0, 0); // Set hours, minutes, and reset seconds/milliseconds

  // Convert to ISO string
  return dateTime.toISOString();
}

export const mapBusinessCategory = (value: number) => {
  switch (value) {
    case 0:
      return "Lounge";
    case 1:
      return "Game House";
    case 2:
      return "Bar";
    case 3:
      return "Restaurant";
    case 4:
      return "Club";
    case 5:
      return "Cafe";
    case 6:
      return "Hotel";
    case 7:
      return "Gallery";
    default:
      return "Unknown";
  }
};

export const mapPaymentStatus = (status: number) => {
  switch (status) {
    case 0:
      return "pending";
    case 1:
      return "active";
    case 2:
      return "expired";
    case 3:
      return "failed";
    case 4:
      return "cancel";
    default:
      return "Unknown";
  }
};

export type ExcelDataType = {
  Name: string;
  Description: string;
  Price: string;
  Availability: string;
};

export const generateXLSX = (
  columns: ExcelDataType[],

  fileName: string = "sample.xlsx"
) => {
  const headers = Object.keys(columns[0]);
  const worksheetData = [
    headers,
    ...columns.map((item) =>
      headers.map((header) => item[header as keyof ExcelDataType])
    ),
  ];
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(blob, fileName);
};

export const formatDateOnly = (dateString: string) => {
  const [datePart, timePart] = dateString.split(", ");
  const [day, month, year] = datePart.split("/").map(Number);
  const [hours, minutes, seconds] = timePart.split(":").map(Number);

  // Create a new Date object in UTC
  const date = new Date(
    Date.UTC(year, month - 1, day, hours, minutes, seconds)
  );

  return date.toISOString();
};

export const phoneNumberPattern = /^(?:\+?234|0)\d{9,11}$/;

export const formatTimeSlot = (dateInput: string) => {
  const date = new Date(dateInput);
  const hours = String(date.getHours()).padStart(2, "0"); // Ensure 2 digits
  const minutes = String(date.getMinutes()).padStart(2, "0"); // Ensure 2 digits
  const seconds = String(date.getSeconds()).padStart(2, "0"); // Ensure 2 digits

  return `${hours}:${minutes}:${seconds}`;
};

export const formatTime = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12; // Convert 0 or 12-23 to 12-hour format
  return `${formattedHours}:${minutes.toString().padStart(2, "0")}${period}`;
};
export const reservationDuration = [
  {
    label: "1hr",
    value: 1,
  },
  {
    label: "2hrs",
    value: 2,
  },
  { label: "3hrs", value: 3 },
  {
    label: "4hrs",
    value: 4,
  },
  {
    label: "5hrs",
    value: 5,
  },
  {
    label: "6hrs",
    value: 6,
  },
  {
    label: "7hrs",
    value: 7,
  },
  {
    label: "8hrs",
    value: 8,
  },
  {
    label: "9hrs",
    value: 9,
  },
  {
    label: "10hrs",
    value: 10,
  },
  {
    label: "11hrs",
    value: 11,
  },
  {
    label: "12hrs",
    value: 12,
  },
];


