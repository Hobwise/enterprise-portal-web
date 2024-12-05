'use client';
import { ArrowRight2, LocationIcon } from '@/public/assets/svg';
import { getInitials2 } from '@/lib/utils';
import { RESERVATIONS_URL } from '@/utilities/routes';
import { useRouter } from 'next/navigation';

interface IReservationCard {
  image: string;
  reservationFee: string;
  businessName: string;
  businessAddress: string;
  address: string;
  reservationName: string;
  id: string;
  each: any;
}

export default function ReservationCard({ image, businessName, reservationName, id, each, businessAddress }: IReservationCard) {
  const router = useRouter();

  const handleView = () => {
    localStorage.setItem('reservation', JSON.stringify(each));
    router.push(`${RESERVATIONS_URL}/${id}`);
  };

  return (
    <div
      role="contentinfo"
      className="bg-white rounded-xl font-satoshi w-full px-2.5 pt-2.5 pb-4 relative space-y-2.5 h-[295px] cursor-pointer"
      style={{ boxShadow: '0px 4px 12px 0px #31363F1A' }}
      onClick={handleView}
      key={id}
    >
      {image ? (
        <img src={`data:image/png;base64,${image}`} alt="reservation" className="rounded-lg w-full h-[150px] object-cover" />
      ) : (
        <div className="w-full h-[150px] bg-[#DDDCFE] text-primaryColor font-medium text-[80px] font-bricolage_grotesque flex items-center justify-center uppercase">
          <p>{getInitials2(reservationName)}</p>
        </div>
      )}

      <div className="px-2 space-y-4">
        <div className="space-y-2">
          <p className="text-[#282828] font-medium text-[15px] capitalize truncate">{reservationName}</p>

          <div className="space-y-1">
            <p className="text-[#808B9F] text-xs capitalize">{businessName}</p>
            <div className="flex items-center space-x-1">
              <LocationIcon />
              <p className="text-xs text-[#44444A] truncate capitalize">{businessAddress}</p>
            </div>
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center" role="button">
            <p className="font-medium text-primaryColor">Reserve</p>
            <ArrowRight2 className="text-primaryColor" />
          </div>
        </div>
      </div>
    </div>
  );
}
