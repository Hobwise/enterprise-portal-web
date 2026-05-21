"use client";

import Image from "next/image";
import { PiShieldCheckFill } from "react-icons/pi";

interface AuthLeftPanelProps {
  variant?: "wrapped" | "long";
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
}

const FeatureCard = ({ icon, title }: FeatureCardProps) => (
  <div className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/[0.07] text-white">
      {icon}
    </div>
    <p className="whitespace-pre-line text-[15px] font-semibold leading-snug text-white">
      {title}
    </p>
  </div>
);

const AuthLeftPanel = ({ variant = "wrapped" }: AuthLeftPanelProps) => {
  const subtitleWrap =
    variant === "long"
      ? "max-w-full leading-relaxed text-justify"
      : "max-w-[480px]";

  return (
    <div className="relative hidden h-screen flex-col overflow-hidden bg-[#10003F] px-10 py-10 text-white lg:flex lg:w-1/2 xl:px-14">
      <div
        className="pointer-events-none absolute -right-10 top-[8%] h-[280px] w-[280px] rounded-full bg-[#7C69D8]/35 blur-[90px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute right-[18%] top-[20%] h-[320px] w-[320px] rounded-full bg-[#6E54E0]/30 blur-[110px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-[35%] top-[42%] h-[380px] w-[380px] rounded-full bg-[#5F35D2]/35 blur-[120px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-20 top-[55%] h-[340px] w-[340px] rounded-full bg-[#7C69D8]/30 blur-[110px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-16 top-[60%] h-[300px] w-[300px] rounded-full bg-[#6E54E0]/25 blur-[100px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-[20%] bottom-[8%] h-[260px] w-[260px] rounded-full bg-[#7C69D8]/30 blur-[100px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute right-[10%] bottom-[2%] h-[240px] w-[240px] rounded-full bg-[#5F35D2]/25 blur-[100px]"
        aria-hidden
      />

      <div className="relative z-10 flex items-center gap-3">
        <Image
          src="/assets/icons/hobwise-logo.png"
          height={52}
          width={52}
          className="rounded-xl"
          alt="Hobwise logo"
          priority
        />
        <div className="leading-tight">
          <p className="text-[20px] font-bold text-white">Hobwise</p>
          <p className="text-[13px] text-white/60">Hospitality solution</p>
        </div>
      </div>

      <div className="relative z-10 mt-16 flex flex-1 flex-col">
        <h1 className="text-[44px] font-extrabold leading-[1.1] xl:text-[52px]">
          Run your hospitality
          <br />
          business{" "}
          <span className="text-[#A893FF]">Effectively</span>
          <br />
          and <span className="text-[#A893FF]">Efficiently.</span>
        </h1>

        <p className={`mt-7 text-[15px] text-white/60 ${subtitleWrap}`}>
          One calm dashboard for orders, payments, reservations, inventory and
          reports — built for restaurants, bars, hotels and event spaces.
        </p>

        <div className="mt-10 grid grid-cols-2 gap-4">
          <FeatureCard
            icon={
              <Image
                src="/assets/icons/auth/orders.png"
                width={20}
                height={20}
                alt=""
                aria-hidden
              />
            }
            title={"Orders &\nPayments"}
          />
          <FeatureCard
            icon={
              <Image
                src="/assets/icons/auth/calendar.png"
                width={20}
                height={20}
                alt=""
                aria-hidden
              />
            }
            title={"Bookings &\nReservations"}
          />
          <FeatureCard
            icon={
              <Image
                src="/assets/icons/auth/inventory.png"
                width={20}
                height={20}
                alt=""
                aria-hidden
              />
            }
            title={"Inventory &\nSuppliers"}
          />
          <FeatureCard
            icon={
              <Image
                src="/assets/icons/auth/chart.png"
                width={20}
                height={20}
                alt=""
                aria-hidden
              />
            }
            title={"Reports &\nInsights"}
          />
        </div>
      </div>

      <div className="relative z-10 mt-10 flex items-center justify-between text-[13px] text-white/55">
        <p>&copy; 2026 Hobwise. All Rights Reserved</p>
        <div className="flex items-center gap-2">
          <PiShieldCheckFill className="text-base text-white/70" />
          <span>Encrypted Sign in</span>
        </div>
      </div>
    </div>
  );
};

export default AuthLeftPanel;
