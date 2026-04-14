interface CheckboxProps {
  /** Whether the checkbox is checked */
  checked?: boolean;
  /** Whether the checkbox is in indeterminate state (overrides checked visually) */
  indeterminate?: boolean;
  /** Called when the checkbox state changes */
  onChange?: (checked: boolean) => void;
  /** Optional label text displayed next to the checkbox */
  label?: string;
  /** Additional class names for the outer wrapper */
  className?: string;
}

export default function Checkbox({
  checked = false,
  indeterminate = false,
  onChange,
  label,
  className = "",
}: CheckboxProps) {
  const isActive = checked || indeterminate;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(!checked);
  };

  const checkboxBox = (
    <button
      type="button"
      onClick={handleClick}
      className="content-stretch flex items-center justify-center pt-[2px] relative shrink-0 cursor-pointer"
    >
      <div
        className={`relative rounded-[4px] shrink-0 size-[16px] ${
          isActive ? "bg-rdj-fg-brand" : ""
        }`}
      >
        {indeterminate && (
          <div className="absolute inset-[12.5%] overflow-clip">
            <div className="absolute top-1/2 left-[16.67%] right-[16.67%] -translate-y-1/2">
              <svg
                className="block w-full h-[2px]"
                fill="none"
                viewBox="0 0 8 2"
              >
                <path
                  d="M0.5 1H7.5"
                  stroke="white"
                  strokeLinecap="round"
                  strokeWidth="1.6666"
                />
              </svg>
            </div>
          </div>
        )}
        {checked && !indeterminate && (
          <div className="absolute inset-[12.5%] overflow-clip">
            <div className="absolute bottom-[29.17%] left-[16.67%] right-[16.67%] top-1/4">
              <div className="absolute inset-[-15.15%_-10.42%]">
                <svg
                  className="block size-full"
                  fill="none"
                  preserveAspectRatio="none"
                  viewBox="0 0 9.6666 7.1666"
                >
                  <path
                    d="M8.33327 1L3.49994 5.83333L1.33327 3.66667"
                    stroke="white"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.6666"
                  />
                </svg>
              </div>
            </div>
          </div>
        )}
        <div
          aria-hidden="true"
          className={`absolute border border-solid inset-0 pointer-events-none rounded-[4px] ${
            isActive ? "border-rdj-fg-brand" : "border-[#98a2b3]"
          }`}
        />
      </div>
    </button>
  );

  // If no label, return just the checkbox box
  if (!label) {
    return <div className={className}>{checkboxBox}</div>;
  }

  return (
    <label
      className={`flex items-center gap-[8px] cursor-pointer ${className}`}
      onClick={(e) => {
        // Prevent double-fire from the button inside
        if ((e.target as HTMLElement).closest("button")) return;
        e.preventDefault();
        onChange?.(!checked);
      }}
    >
      {checkboxBox}
      <p className="font-sans font-normal leading-[20px] text-rdj-text-primary text-[14px]">
        {label}
      </p>
    </label>
  );
}
