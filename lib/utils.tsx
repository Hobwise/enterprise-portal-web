'use client';
import { clsx, type ClassValue } from 'clsx';
import { toast } from 'react-toastify';
import { twMerge } from 'tailwind-merge';

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
