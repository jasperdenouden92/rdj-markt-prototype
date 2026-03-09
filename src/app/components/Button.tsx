import { type ReactNode, type ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "tertiary" | "tertiary-gray" | "text";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  /** Visual variant */
  variant?: ButtonVariant;
  /** Size */
  size?: ButtonSize;
  /** Text label — omit for icon-only buttons */
  label?: string;
  /** Leading icon (before label) */
  leadingIcon?: ReactNode;
  /** Trailing icon (after label) */
  trailingIcon?: ReactNode;
  /** Icon-only mode: single icon, no label */
  icon?: ReactNode;
  /** Full width */
  fullWidth?: boolean;
}

const sizeConfig = {
  sm: { px: "px-[12px]", py: "py-[8px]", iconPx: "p-[8px]", gap: "gap-[4px]", iconSize: "size-[16px]" },
  md: { px: "px-[14px]", py: "py-[10px]", iconPx: "p-[10px]", gap: "gap-[4px]", iconSize: "size-[20px]" },
  lg: { px: "px-[18px]", py: "py-[10px]", iconPx: "p-[12px]", gap: "gap-[6px]", iconSize: "size-[20px]" },
};

export default function Button({
  variant = "primary",
  size = "md",
  label,
  leadingIcon,
  trailingIcon,
  icon,
  fullWidth = false,
  className = "",
  disabled,
  ...rest
}: ButtonProps) {
  const s = sizeConfig[size];
  const isIconOnly = !!icon && !label;

  // --- Variant styles ---
  const variantStyles: Record<ButtonVariant, { outer: string; text: string; iconColor: string; border: string | null }> = {
    primary: {
      outer: "bg-[#1567a4]",
      text: "text-white",
      iconColor: "[&_svg_path]:stroke-white [&_svg_circle]:stroke-white [&_svg_rect]:stroke-white [&_svg_line]:stroke-white",
      border:
        "absolute border border-[#1567a4] border-solid inset-0 pointer-events-none rounded-[6px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]",
    },
    secondary: {
      outer: "bg-white dark:bg-[#1d2939]",
      text: "text-[#344054] dark:text-[#f2f4f7]",
      iconColor: "[&_svg_path]:stroke-[#344054] dark:[&_svg_path]:stroke-[#f2f4f7] [&_svg_circle]:stroke-[#344054] dark:[&_svg_circle]:stroke-[#f2f4f7] [&_svg_rect]:stroke-[#344054] dark:[&_svg_rect]:stroke-[#f2f4f7] [&_svg_line]:stroke-[#344054] dark:[&_svg_line]:stroke-[#f2f4f7]",
      border:
        "absolute border border-[#d0d5dd] dark:border-[#475467] border-solid inset-0 pointer-events-none rounded-[6px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]",
    },
    tertiary: {
      outer: "",
      text: "text-[#344054]",
      iconColor: "[&_svg_path]:stroke-[#1567a4] [&_svg_circle]:stroke-[#1567a4] [&_svg_rect]:stroke-[#1567a4] [&_svg_line]:stroke-[#1567a4]",
      border: null,
    },
    "tertiary-gray": {
      outer: "",
      text: "text-rdj-text-secondary dark:text-[#98a2b3]",
      iconColor: "[&_svg_path]:stroke-rdj-text-secondary [&_svg_circle]:stroke-rdj-text-secondary [&_svg_rect]:stroke-rdj-text-secondary [&_svg_line]:stroke-rdj-text-secondary",
      border: null,
    },
    text: {
      outer: "",
      text: "text-rdj-text-brand",
      iconColor: "[&_svg_path]:stroke-[#1567a4] [&_svg_circle]:stroke-[#1567a4] [&_svg_rect]:stroke-[#1567a4] [&_svg_line]:stroke-[#1567a4]",
      border: null,
    },
  };

  const v = variantStyles[variant];

  // Padding: text variant has no padding, everything else uses size config
  const paddingCls =
    variant === "text"
      ? isIconOnly
        ? ""
        : s.gap // only gap between icon+label, no padding
      : isIconOnly
        ? s.iconPx
        : `${s.px} ${s.py}`;

  // Inner content classes
  const innerCls = [
    "content-stretch flex items-center justify-center overflow-clip relative rounded-[inherit]",
    isIconOnly ? "" : s.gap,
    paddingCls,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      disabled={disabled}
      className={[
        v.outer,
        variant === "primary" || variant === "secondary" ? "relative rounded-[6px] shrink-0" : "shrink-0",
        fullWidth ? "w-full" : "",
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:opacity-90",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      <div className={innerCls}>
        {/* Leading icon */}
        {leadingIcon && (
          <div className={`overflow-clip relative shrink-0 ${s.iconSize} [&_svg]:block [&_svg]:size-full ${v.iconColor}`}>
            {leadingIcon}
          </div>
        )}

        {/* Icon-only */}
        {isIconOnly && (
          <div className={`overflow-clip relative shrink-0 ${s.iconSize} [&_svg]:block [&_svg]:size-full ${v.iconColor}`}>
            {icon}
          </div>
        )}

        {/* Label */}
        {label && (
          <p
            className={`font-['Hanken_Grotesk:Bold',sans-serif] font-bold leading-[20px] relative shrink-0 text-[14px] whitespace-nowrap ${v.text}`}
          >
            {label}
          </p>
        )}

        {/* Trailing icon */}
        {trailingIcon && (
          <div className={`overflow-clip relative shrink-0 ${s.iconSize} [&_svg]:block [&_svg]:size-full ${v.iconColor}`}>
            {trailingIcon}
          </div>
        )}
      </div>

      {/* Border overlay (primary & secondary only) */}
      {v.border && <div aria-hidden="true" className={v.border} />}
    </button>
  );
}