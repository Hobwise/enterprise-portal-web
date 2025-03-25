'use client';
import useLogout from '@/hooks/cachedEndpoints/useLogout';
import { PiSealWarningDuotone } from 'react-icons/pi';

interface ILogoutModal {
  isOpen: boolean;
  onOpenChange: (arg: any) => void;
  externalLogout?: () => void;
}

const LogoutModal = ({ isOpen, onOpenChange, externalLogout }: ILogoutModal) => {
  const { isLoading, logoutFn } = useLogout();
  const handleLogout = async () => {
    await logoutFn();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999] bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
        <div className="flex flex-col items-center gap-2">
          <PiSealWarningDuotone className="text-red-500 text-5xl mt-2" />
          <p className="text-black text-center w-full mb-4">Are you sure you want to log out?</p>
        </div>
        <div className="flex justify-center gap-4">
          <button 
            className="border border-gray-300 text-black px-4 py-2 rounded-lg" 
            onClick={onOpenChange}
          >
            Cancel
          </button>
          <button 
            className="border border-red-500 text-red-500  px-4 py-2 rounded-lg flex items-center justify-center"
            onClick={() => { externalLogout ? externalLogout() : handleLogout(); }}
            disabled={isLoading}
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor" />
              </svg>
            ) : (
              'Logout'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
