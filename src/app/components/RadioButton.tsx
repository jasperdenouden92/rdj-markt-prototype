import { type ReactNode } from "react";

interface RadioButtonProps {
  /** Whether the radio button is selected */
  checked?: boolean;
  /** Called when the radio button is clicked */
  onChange?: (checked: boolean) => void;
  /** Optional label text displayed next to the radio */
  label?: string;
  /** Optional icon node rendered between the radio and label */
  icon?: ReactNode;
  /** Additional class names for the outer wrapper */
  className?: string;
}

export default function RadioButton({
  checked = false,
  onChange,
  label,
  icon,
  className = "",
}: RadioButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(!checked);
  };

  const radioCircle = (
    <button
      type="button"
      onClick={handleClick}
      className="content-stretch flex items-center justify-center relative shrink-0 cursor-pointer"
    >
      <div
        className={`relative rounded-full shrink-0 size-[16px] ${
          checked ? "bg-rdj-fg-brand" : ""
        }`}
      >
        {/* Inner dot when checked */}
        {checked && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="size-[6px] rounded-full bg-white" />
          </div>
        )}
        {/* Border overlay */}
        <div
          aria-hidden="true"
          className={`absolute border border-solid inset-0 pointer-events-none rounded-full ${
            checked ? "border-rdj-fg-brand" : "border-rdj-border-secondary"
          }`}
        />
      </div>
    </button>
  );

  // If no label and no icon, return just the radio circle
  if (!label && !icon) {
    return <div className={className}>{radioCircle}</div>;
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
      {radioCircle}
      {icon && <div className="shrink-0">{icon}</div>}
      {label && (
        <p className="font-sans font-normal leading-[20px] text-rdj-text-primary text-[14px]">
          {label}
        </p>
      )}
    </label>
  );
}
