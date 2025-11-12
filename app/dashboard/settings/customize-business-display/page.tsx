"use client";

import Layout from "@/components/ui/dashboard/menu/preview-menu/layout";
import Preview from "@/components/ui/dashboard/menu/preview-menu/preview";
import dynamic from "next/dynamic";

const DynamicMetaTag = dynamic(() => import("@/components/dynamicMetaTag"), {
  ssr: false,
});

const CustomizeBusinessDisplay = () => {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-[24px] leading-8 font-semibold mb-2">
          Customize Business Display
        </h1>
        <p className="text-sm text-grey600">
          Customize how your customers see your menus and place orders
        </p>
      </div>
      <section className="flex justify-between gap-10 ">
        <Layout />
        <Preview />
      </section>
      <DynamicMetaTag
        route="Customize Business Display"
        description="Customize how your menu appears to customers"
      />
    </>
  );
};

export default CustomizeBusinessDisplay;
