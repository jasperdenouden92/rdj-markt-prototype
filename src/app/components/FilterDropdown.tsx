import { type ReactNode, useState, useRef, useEffect } from "react";

interface FilterDropdownProps {
  /** Display label */
  label: string;
  /** Optional leading icon (replaces chevron with icon-first layout) */
  leadingIcon?: ReactNode;
  /** Click handler */
  onClick?: () => void;
  /** Optional dropdown options for simple select behavior */
  options?: string[];
  /** Currently selected value (controls label when options are used) */
  value?: string;
  /** Called when an option is selected */
  onSelect?: (value: string) => void;
  /** Additional class names */
  className?: string;
}

export default function FilterDropdown({
  label,
  leadingIcon,
  onClick,
  options,
  value,
  onSelect,
  className = "",
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const displayLabel = value ?? label;

  const handleClick = () => {
    if (options && options.length > 0) {
      setIsOpen(!isOpen);
    }
    onClick?.();
  };

  const chevronSvg = (
    <div className="overflow-clip relative shrink-0 size-[20px]">
      <div className="absolute bottom-[37.5%] left-1/4 right-1/4 top-[37.5%]">
        <div className="absolute inset-[-16.67%_-8.33%]">
          <svg
            className="block size-full"
            fill="none"
            preserveAspectRatio="none"
            viewBox="0 0 11.6667 6.66667"
          >
            <path
              d="M1.33334 1.33334L5.83334 5.83334L10.3333 1.33334"
              stroke="#344054"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.66667"
            />
          </svg>
        </div>
      </div>
    </div>
  );

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        onClick={handleClick}
        className="bg-rdj-bg-primary relative rounded-[6px] shrink-0 cursor-pointer"
      >
        <div className="content-stretch flex gap-[4px] items-center justify-center overflow-clip px-[14px] py-[10px] relative rounded-[inherit]">
          {leadingIcon ? (
            <>
              <div className="overflow-clip relative shrink-0 size-[20px]">
                {leadingIcon}
              </div>
              <div className="content-stretch flex items-center justify-center px-[2px] relative shrink-0">
                <p className="font-sans font-bold leading-[20px] relative shrink-0 text-[#344054] text-[14px] text-left whitespace-nowrap">
                  {displayLabel}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="content-stretch flex items-center justify-center px-[2px] relative shrink-0">
                <p className="font-sans font-bold leading-[20px] relative shrink-0 text-[#344054] text-[14px] whitespace-nowrap">
                  {displayLabel}
                </p>
              </div>
              {chevronSvg}
            </>
          )}
        </div>
        <div
          aria-hidden="true"
          className="absolute border border-rdj-border-primary border-solid inset-0 pointer-events-none rounded-[6px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]"
        />
      </button>

      {/* Dropdown menu */}
      {isOpen && options && options.length > 0 && (
        <div className="absolute top-full left-0 mt-[4px] bg-rdj-bg-primary border border-rdj-border-secondary rounded-[8px] shadow-[0px_4px_6px_-2px_rgba(16,24,40,0.03),0px_12px_16px_-4px_rgba(16,24,40,0.08)] z-50 min-w-full overflow-hidden">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => {
                onSelect?.(option);
                setIsOpen(false);
              }}
              className={`w-full text-left px-[14px] py-[10px] font-sans font-normal text-[14px] leading-[20px] hover:bg-rdj-bg-secondary transition-colors cursor-pointer whitespace-nowrap ${
                option === value
                  ? "text-[#1567a4] bg-[#f0f7fc]"
                  : "text-[#344054]"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}