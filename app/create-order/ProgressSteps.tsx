"use client";

interface ProgressStepsProps {
  steps: string[];
  currentStep: number;
  menuConfig?: {
    backgroundColour?: string;
  };
}

const ProgressSteps = ({ steps, currentStep, menuConfig }: ProgressStepsProps) => {
  // Dynamic color from menu config
  const primaryColor = menuConfig?.backgroundColour || "#5F35D2";
  const primaryColorStyle = { backgroundColor: primaryColor, borderColor: primaryColor };
  const textColorStyle = { color: primaryColor };
  const borderColorStyle = { borderColor: primaryColor };

  return (
    <div className="w-full bg-white border-b border-gray-200 py-4 px-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-center">
          {steps.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;

            return (
              <div key={step} className="flex items-center">
                {/* Step Circle with Label */}
                <div className="flex flex-col items-center">
                  <div
                    style={
                      isCompleted
                        ? primaryColorStyle
                        : isActive
                        ? borderColorStyle
                        : {}
                    }
                    className={`
                      flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all
                      ${
                        isCompleted || isActive
                          ? ""
                          : "bg-white border-gray-300"
                      }
                      ${!isCompleted && isActive ? "bg-white" : ""}
                    `}
                  >
                    {isCompleted ? (
                      <svg
                        className="w-5 h-5 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <span
                        style={isActive ? textColorStyle : { color: '#9CA3AF' }}
                        className={`text-sm font-semibold`}
                      >
                        {index + 1}
                      </span>
                    )}
                  </div>

                  {/* Step Label - Always visible */}
                  <span
                    style={isActive || isCompleted ? textColorStyle : { color: '#9CA3AF' }}
                    className={`mt-2 text-xs font-medium`}
                  >
                    {step}
                  </span>
                </div>

                {/* Connecting Line */}
                {index < steps.length - 1 && (
                  <div
                    style={isCompleted ? { backgroundColor: primaryColor } : { backgroundColor: '#D1D5DB' }}
                    className={`w-12 sm:w-16 h-0.5 mx-2 mb-6 transition-all`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProgressSteps;
