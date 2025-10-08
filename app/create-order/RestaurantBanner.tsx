'use client';
import Image from 'next/image';
import { HiMenuAlt3 } from 'react-icons/hi';

interface RestaurantBannerProps {
  businessName?: string;
  menuConfig?: {
    image?: string;
    backgroundColour?: string;
    textColour?: string;
  };
  showMenuButton?: boolean;
  onMenuClick?: () => void;
  baseString?: string;
}

const RestaurantBanner = ({
  businessName,
  menuConfig,
  showMenuButton = false,
  onMenuClick,
  baseString,
}: RestaurantBannerProps) => {
  // Construct image source properly
  const imageSrc = menuConfig?.image
    ? (baseString && menuConfig.image ? `${baseString}${menuConfig.image}` : `data:image/jpeg;base64,${menuConfig.image}`)
    : null;

  return (
    <div className="relative w-full">
      {/* Restaurant Banner */}
      <div className="relative h-[192px] w-full overflow-hidden">
        {imageSrc ? (
          <Image
            fill
            className="object-cover"
            src={imageSrc}
            alt="restaurant banner"
            priority
          />
        ) : (
          <div
            className="w-full h-full"
            style={{
              backgroundColor: menuConfig?.backgroundColour || '#D3D3D3',
            }}
          />
        )}

        {/* Restaurant Name Overlay */}
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none">
          <h1
            className="text-2xl font-bold text-center px-4"
            style={{ color: menuConfig?.textColour || 'white' }}
          >
            {businessName || 'Restaurant Menu'}
          </h1>
        </div>
      </div>

      {/* Hamburger Menu Icon - Outside overflow container */}
      {showMenuButton && onMenuClick && (
        <button
          onClick={onMenuClick}
          className="absolute top-4 left-4 z-50 p-2 bg-white hover:bg-gray-50 rounded-lg shadow-lg transition-colors border border-gray-200"
          aria-label="Menu"
        >
          <HiMenuAlt3 className="text-gray-700 text-2xl" />
        </button>
      )}
    </div>
  );
};

export default RestaurantBanner;
