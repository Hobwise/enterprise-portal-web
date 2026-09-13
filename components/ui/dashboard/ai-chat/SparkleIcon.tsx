interface SparkleIconProps {
  className?: string;
}

/**
 * The Hospira AI sparkle glyph, extracted from the provided
 * `Component 21.svg`. Reused for the floating button and the AI avatar.
 * Inherits color via `fill="currentColor"`.
 */
const SparkleIcon = ({ className }: SparkleIconProps) => {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M16 4C19.2341 10.2119 21.6322 12.4207 26.6667 14.6667C21.5519 16.8735 19.3042 19.3987 16 25.3333C12.6608 18.9776 10.276 16.7848 5.33333 14.6667C10.9375 11.9397 13.3091 9.63367 16 4Z"
        fill="currentColor"
      />
      <path
        d="M24 4C24.8085 5.55301 25.4081 6.10524 26.6667 6.66667C25.388 7.21842 24.8261 7.84966 24 9.33333C23.1652 7.74441 22.5681 7.19619 21.3333 6.66667C22.7344 5.98494 23.3273 5.41005 24 4Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default SparkleIcon;
