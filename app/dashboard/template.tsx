"use client";
import dynamic from "next/dynamic";

const DynamicMetaTag = dynamic(() => import("@/components/dynamicMetaTag"), {
  ssr: false,
});
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <div>
      {children}
      <DynamicMetaTag />
    </div>
  );
}
