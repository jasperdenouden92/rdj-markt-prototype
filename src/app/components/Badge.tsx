type BadgeVariant = "grey" | "brand" | "success" | "warning" | "error";
type BadgeType = "default" | "color";
type BadgeSize = "sm" | "lg";

interface BadgeProps {
  /** Label text */
  label: string;
  /** Color variant */
  variant?: BadgeVariant;
  /** Badge type: 'default' (white bg, grey border) or 'color' (tinted bg, colored border & text) */
  type?: BadgeType;
  /** Size: 'sm' (compact, default) or 'lg' (larger text & padding) */
  size?: BadgeSize;
  /** Show a colored dot before the label */
  dot?: boolean;
  /** Custom icon element rendered before the label (takes precedence over dot) */
  icon?: React.ReactNode;
  /** Additional class names */
  className?: string;
}

const variantStyles: Record<
  BadgeVariant,
  { text: string; dot: string; border: string }
> = {
  grey: {
    text: "text-rdj-text-primary",
    dot: "#667085",
    border: "border-[#eaecf0]",
  },
  brand: {
    text: "text-rdj-text-primary",
    dot: "#1567a4",
    border: "border-[#d1e5f4]",
  },
  success: {
    text: "text-rdj-text-primary",
    dot: "#17B26A",
    border: "border-[#d1fadf]",
  },
  warning: {
    text: "text-rdj-text-primary",
    dot: "#F79009",
    border: "border-[#fedf89]",
  },
  error: {
    text: "text-rdj-text-primary",
    dot: "#F04438",
    border: "border-[#fecdca]",
  },
};

const colorVariantStyles: Record<
  BadgeVariant,
  { bg: string; text: string; border: string; dot: string }
> = {
  grey: {
    bg: "bg-[#f2f4f7]",
    text: "text-[#344054]",
    border: "border-[#d0d5dd]",
    dot: "#667085",
  },
  brand: {
    bg: "bg-[#eff8ff]",
    text: "text-[#175cd3]",
    border: "border-[#b2ddff]",
    dot: "#1567a4",
  },
  success: {
    bg: "bg-[#ecfdf3]",
    text: "text-[#067647]",
    border: "border-[#abefc6]",
    dot: "#17B26A",
  },
  warning: {
    bg: "bg-[#fffaeb]",
    text: "text-[#b54708]",
    border: "border-[#fedf89]",
    dot: "#F79009",
  },
  error: {
    bg: "bg-[#fef3f2]",
    text: "text-[#b42318]",
    border: "border-[#fecdca]",
    dot: "#F04438",
  },
};

const sizeStyles: Record<
  BadgeSize,
  { padding: string; text: string; gap: string; dot: string; radius: string; icon: string }
> = {
  sm: {
    padding: "px-[8px] py-[2px]",
    text: "text-[12px] leading-[18px]",
    gap: "gap-[6px]",
    dot: "size-[6px]",
    radius: "rounded-[4px]",
    icon: "size-[12px]",
  },
  lg: {
    padding: "px-[10px] py-[4px]",
    text: "text-[14px] leading-[20px]",
    gap: "gap-[6px]",
    dot: "size-[8px]",
    radius: "rounded-[6px]",
    icon: "size-[14px]",
  },
};

export default function Badge({
  label,
  variant = "grey",
  type = "default",
  size = "sm",
  dot = false,
  icon,
  className = "",
}: BadgeProps) {
  const isColor = type === "color";
  const v = isColor ? colorVariantStyles[variant] : variantStyles[variant];
  const bgCls = isColor ? (v as typeof colorVariantStyles.grey).bg : "bg-white";
  const borderCls = isColor ? v.border : "border-rdj-border-secondary";
  const s = sizeStyles[size];

  return (
    <div
      className={`inline-flex items-center ${s.gap} ${bgCls} border ${borderCls} ${s.padding} ${s.radius} ${className}`}
    >
      {icon ? (
        <div className={`shrink-0 ${s.icon} [&>svg]:size-full`} style={{ color: v.dot }}>
          {icon}
        </div>
      ) : dot ? (
        <div className={`shrink-0 ${s.dot}`}>
          <svg className="block size-full" fill="none" viewBox="0 0 6 6">
            <circle cx="3" cy="3" fill={v.dot} r="3" />
          </svg>
        </div>
      ) : null}
      <p
        className={`font-['Hanken_Grotesk:Bold',sans-serif] font-bold ${s.text} whitespace-nowrap ${v.text}`}
      >
        {label}
      </p>
    </div>
  );
}

export type { BadgeVariant, BadgeType, BadgeSize, BadgeProps };