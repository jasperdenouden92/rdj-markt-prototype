import { type ReactNode } from "react";

type FeaturedIconVariant = "grey" | "brand";

interface FeaturedIconProps {
  /** The icon element (svg) to render */
  icon: ReactNode;
  /** Visual variant */
  variant?: FeaturedIconVariant;
  /** Size of the outer container */
  size?: number;
  /** Additional class names */
  className?: string;
}

const variantStyles: Record<
  FeaturedIconVariant,
  { bg: string; iconColor: string }
> = {
  grey: {
    bg: "bg-[#f2f4f7]",
    iconColor:
      "[&_svg_path]:stroke-rdj-text-secondary [&_svg_circle]:stroke-rdj-text-secondary [&_svg_rect]:stroke-rdj-text-secondary [&_svg_line]:stroke-rdj-text-secondary",
  },
  brand: {
    bg: "bg-rdj-bg-brand",
    iconColor:
      "[&_svg_path]:stroke-[#1567a4] [&_svg_circle]:stroke-[#1567a4] [&_svg_rect]:stroke-[#1567a4] [&_svg_line]:stroke-[#1567a4]",
  },
};

export default function FeaturedIcon({
  icon,
  variant = "grey",
  size = 32,
  className = "",
}: FeaturedIconProps) {
  const v = variantStyles[variant];
  const iconSize = Math.round(size * 0.5);

  return (
    <div
      className={`flex items-center justify-center rounded-full shrink-0 ${v.bg} ${className}`}
      style={{ width: size, height: size }}
    >
      <div
        className={`shrink-0 [&_svg]:block [&_svg]:size-full ${v.iconColor}`}
        style={{ width: iconSize, height: iconSize }}
      >
        {icon}
      </div>
    </div>
  );
}