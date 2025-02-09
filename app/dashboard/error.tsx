"use client";
import { CustomButton } from "@/components/customButton";
import { Spacer } from "@nextui-org/react";
import Image from "next/image";
import { useEffect } from "react";
import { IoReload } from "react-icons/io5";
import noImage from "../../public/assets/images/no-image.svg";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="absolute top-0 left-0 w-full h-full  flex flex-col justify-center items-center">
      <Image
        src={noImage}
        width={100}
        height={100}
        className={`object-cover rounded-lg h-24`}
        aria-label="uploaded image"
        alt="uploaded image(s)"
      />
      <Spacer y={4} />
      <p className="font-[600]">Oops! Something went wrong</p>
      <Spacer y={4} />
      <CustomButton
        onClick={
          () => window.location.reload()
          // () => reset()
        }
        className="bg-white border px-10 py-4 border-primaryColor rounded-full text-primaryColor"
      >
        <div className="flex items-center gap-2">
          <p>Retry</p>
          <IoReload />
        </div>
      </CustomButton>
    </main>
  );
}
