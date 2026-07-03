import Photo1 from '@/public/assets/images/landing-v2/photo-1.jpg';
import Photo2 from '@/public/assets/images/landing-v2/photo-2.jpg';
import Photo3 from '@/public/assets/images/landing-v2/photo-3.jpg';
import Photo4 from '@/public/assets/images/landing-v2/photo-4.jpg';
import Image from 'next/image';

const photos = [
  { src: Photo1, alt: 'Guests enjoying coffee at a restaurant' },
  { src: Photo2, alt: 'Modern restaurant interior' },
  { src: Photo3, alt: 'Chef presenting a plated dish' },
  { src: Photo4, alt: 'Grilled dish with fries and sauce' },
];

export default function PhotoStrip() {
  return (
    <section className='bg-white px-6 lg:px-16 py-8'>
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
        {photos.map((each) => (
          <Image
            key={each.alt}
            src={each.src}
            alt={each.alt}
            className='w-full h-auto object-cover'
          />
        ))}
      </div>
    </section>
  );
}
