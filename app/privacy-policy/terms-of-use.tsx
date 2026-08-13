import React from "react";
import { termsItems, TermsAndConditionsContent } from "./TermsAndConditionsContent";

export default function TermsOfUse() {
  return (
    <div className="w-full flex space-x-4 px-4 lg:px-10 font-satoshi text-[#000000CC] pt-44 lg:pt-36">
      <div className="w-[20%] border-r border-r-[#C4C4C480] py-8 space-y-8 fixed h-screen lg:block hidden">
        {termsItems.map((each) => (
          <a href={`#${each}`} className="py-8" key={each}>
            <p className="text-sm cursor-pointer py-3">{each}</p>
          </a>
        ))}
      </div>
      <div className="w-full lg:w-[80%] py-8 space-y-8 overflow-y-auto lg:pl-[24%] lg:h-[77vh]">
        <TermsAndConditionsContent />
      </div>
    </div>
  );
}
