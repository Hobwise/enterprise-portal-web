import { ArrowRight2 } from '@/public/assets/svg';
import { Transition } from './transition';
import { getInitials2 } from '@/lib/utils';
import Link from 'next/link';
import { RESERVATIONS_URL } from '@/utilities/routes';

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

export default function ReservationCard({ image, businessName, reservationName, id, each }: IReservationCard) {
  const handleView = () => {
    localStorage.setItem('reservation', JSON.stringify(each));
  };

  return (
    <Transition key={id}>
      <div
        role="contentinfo"
        className="bg-white rounded-xl font-satoshi w-full px-2.5 pt-2.5 pb-4 relative space-y-2.5 h-[265px]"
        style={{ boxShadow: '0px 4px 12px 0px #31363F1A' }}
      >
        {image ? (
          <img src={`data:image/png;base64,${image}`} alt="reservation" className="rounded-lg w-full h-[150px] object-cover" />
        ) : (
          <div className="w-full h-[150px] bg-[#DDDCFE] text-primaryColor font-medium text-[80px] font-bricolage_grotesque flex items-center justify-center uppercase">
            <p>{getInitials2(reservationName)}</p>
          </div>
        )}

        <div className="px-2 space-y-4">
          <div className="space-y-1.5">
            <p className="text-[#282828] font-medium text-[15px] capitalize truncate">{reservationName}</p>
            <p className="text-[#808B9F] text-xs">{businessName}</p>
          </div>
          <div>
            <Link href={`${RESERVATIONS_URL}/${id}`} onClick={handleView}>
              <div className="flex justify-between items-center" role="button">
                <p className="font-medium text-primaryColor">Reserve</p>
                <ArrowRight2 className="text-primaryColor" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </Transition>
  );
}
