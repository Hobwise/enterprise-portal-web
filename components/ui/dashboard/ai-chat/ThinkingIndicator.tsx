"use client";

import SparkleIcon from "./SparkleIcon";

const ThinkingIndicator = () => {
  return (
    <div className="flex animate-ai-pop flex-col items-start gap-2">
      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-secondaryGrey bg-white px-4 py-4">
        {[0, 1, 2].map((dot) => (
          <span
            key={dot}
            className="h-2 w-2 rounded-full bg-primaryColor/50 animate-ai-bounce"
            style={{ animationDelay: `${dot * 0.16}s` }}
          />
        ))}
      </div>
      <div className="flex items-center gap-2 pl-1">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primaryColor text-white">
          <SparkleIcon className="h-3.5 w-3.5" />
        </span>
        <span className="text-xs text-grey500">Thinking...</span>
      </div>
    </div>
  );
};

export default ThinkingIndicator;
