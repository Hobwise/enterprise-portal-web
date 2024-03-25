'use client';
import { clsx, type ClassValue } from 'clsx';
import { toast } from 'react-toastify';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};
export const saveToLocalStorage = (name, itemToSave) => {
  return localStorage.setItem(name, itemToSave);
};
export const getFromLocalStorage = (name) => {
  return localStorage.getItem(name);
};
export const getJsonItemFromLocalStorage = (name) => {
  return JSON.parse(localStorage.getItem(name));
};

export const saveJsonItemToLocalStorage = (
  name: string,
  itemToSave: any
): void => {
  localStorage.setItem(name, JSON.stringify(itemToSave));
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
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: false,
  progress: undefined,
};

interface notifyType {
  message?: string;
  type?: string;
}
export const notify = ({ message, type }: notifyType) => {
  type === 'warning' && toast.warn(message, toastData);
  type === 'success' && toast.success(message, toastData);
  type === 'error' && toast.error(message, toastData);
};
