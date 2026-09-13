'use client';
import FAQs from '@/components/ui/landingPage/faq';
import Cta from '@/components/ui/landingPage/v2/cta';
import LandingFooter from '@/components/ui/landingPage/v2/footer';
import Hero from '@/components/ui/landingPage/v2/hero';
import Hospira from '@/components/ui/landingPage/v2/hospira';
import LandingNav from '@/components/ui/landingPage/v2/nav';
import Outcomes from '@/components/ui/landingPage/v2/outcomes';
import PainPoints from '@/components/ui/landingPage/v2/painPoints';
import PhotoStrip from '@/components/ui/landingPage/v2/photoStrip';
import PricingSection from '@/components/ui/landingPage/v2/pricingSection';

export default function HomeComponent() {
  return (
    <div className='overflow-y-scroll scroll-smooth h-screen bg-[#F8F8F8]'>
      <main className='relative overflow-x-hidden font-satoshi text-center'>
        <LandingNav />
        <Hero />
        <PainPoints />
        <Outcomes />
        <PhotoStrip />
        <Hospira />
        <PricingSection />
        <FAQs />
        <Cta />
        <LandingFooter />
      </main>
    </div>
  );
}
