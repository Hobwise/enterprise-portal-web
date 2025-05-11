import { companyInfo } from '@/lib/companyInfo';
import { motion } from 'framer-motion';

interface SplashScreenProps {
  businessName?: string;
  type?: 'reservation' | 'order';
}

const SplashScreen = ({
  businessName = companyInfo.name,
  type = 'reservation',
}: SplashScreenProps) => {
  const getLoadingMessage = () => {
    switch (type) {
      case 'order':
        return 'Preparing your order experience...';
      case 'reservation':
        return 'Setting up your reservation...';
      default:
        return 'Loading...';
    }
  };

  return (
    <main className='h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100'>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className='text-center space-y-6'
      >
        <div className='relative'>
          <div className='absolute -inset-1 rounded-lg bg-gradient-to-r from-amber-400 to-amber-600 opacity-75 blur'></div>
          <div className='relative bg-white rounded-lg p-8 shadow-xl'>
            <h1 className='text-4xl font-bold text-gray-800 mb-2'>
              {businessName?.split('').map((letter: string, index: number) => (
                <motion.span
                  key={index}
                  initial={{ y: 0 }}
                  animate={{ y: [-5, 0, -5] }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: index * 0.1,
                  }}
                  className='inline-block text-gray-600'
                >
                  {letter}
                </motion.span>
              ))}
            </h1>
            <p className='text-gray-600 mt-4'>{getLoadingMessage()}</p>
          </div>
        </div>
        <div className='flex justify-center'>
          <div className='w-16 h-1 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full animate-pulse'></div>
        </div>
      </motion.div>
    </main>
  );
};

export default SplashScreen;
