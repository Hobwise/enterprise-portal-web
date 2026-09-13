"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { getJsonItemFromLocalStorage } from "@/lib/utils";
import useGetBusiness from "@/hooks/cachedEndpoints/useGetBusiness";

interface BusinessLogoProps {
  containerClass?: string;
  textColor?: string;
}

/**
 * Renders the signed-in business's logo + name in place of the Hobwise
 * `CompanyLogo` on the order/POS surfaces.
 *
 * The logo comes from the business-details endpoint (`useGetBusiness`) because
 * the `business` localStorage entry only carries `logoImage` on the
 * select-business login path — the direct login path stores the name but no
 * logo. The name falls back to localStorage so it shows instantly before the
 * fetch resolves.
 */
const BusinessLogo = ({
  containerClass = "flex gap-2 items-center",
  textColor = "text-black font-lexend text-[20px] font-[600]",
}: BusinessLogoProps) => {
  const { data } = useGetBusiness();
  const [storedName, setStoredName] = useState("");

  useEffect(() => {
    const stored = getJsonItemFromLocalStorage("business");
    if (Array.isArray(stored) && stored[0]?.businessName) {
      setStoredName(stored[0].businessName);
    }
  }, []);

  const businessName = data?.businessName || storedName;
  const logoImage = data?.logoImage;

  return (
    <div className={containerClass}>
      {logoImage && (
        <Image
          src={`data:image/jpeg;base64,${logoImage}`}
          height={40}
          width={40}
          className="h-10 w-10 rounded-md object-cover"
          alt={businessName || "business logo"}
          unoptimized
        />
      )}
      {businessName && (
        <span className={`${textColor} max-w-[220px] truncate`}>
          {businessName}
        </span>
      )}
    </div>
  );
};

export default BusinessLogo;
