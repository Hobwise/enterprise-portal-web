import { companyInfo } from '@/lib/companyInfo';

const SplashScreen = ({
  businessName = companyInfo.name,
}: {
  businessName?: any;
}) => {
  return (
    <main className="h-screen grid w-full place-content-center bg-primaryColor">
      <div className="text-4xl font-bold text-gray-800">
        {businessName?.split("").map((letter, index) => (
          <span
            key={index}
            className="inline-block animate-bounce text-white"
            style={{
              animationDelay: `${index * 0.1}s`,
              animationDuration: "1s",
            }}
          >
            {letter}
          </span>
        ))}
      </div>
    </main>
  );
};

export default SplashScreen;
