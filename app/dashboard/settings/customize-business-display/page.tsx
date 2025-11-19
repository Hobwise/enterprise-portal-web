"use client";

import Layout from "@/components/ui/dashboard/menu/preview-menu/layout";
import Preview from "@/components/ui/dashboard/menu/preview-menu/preview";
import dynamic from "next/dynamic";

const DynamicMetaTag = dynamic(() => import("@/components/dynamicMetaTag"), {
  ssr: false,
});

const CustomizeBusinessDisplay = () => {
  return (
    <div className="mb-6  p-5">
      <section className="flex justify-between gap-10">
        <Layout />
        <Preview />
      </section>
      <DynamicMetaTag
        route="Customize Business Display"
        description="Customize how your menu appears to customers"
      />
    </div>
  );
};

export default CustomizeBusinessDisplay;
