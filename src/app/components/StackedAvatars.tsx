interface AvatarEntry {
  src: string;
  name: string;
}

interface StackedAvatarsProps {
  avatars: AvatarEntry[];
  max?: number;
  size?: number;
}

export default function StackedAvatars({ avatars, max = 3, size = 28 }: StackedAvatarsProps) {
  if (avatars.length === 0) return null;

  const visible = avatars.slice(0, max);
  const overflow = avatars.length - max;
  const showOverflow = overflow > 0;

  // If overflow, show max-1 avatars + overflow indicator
  const displayed = showOverflow ? visible.slice(0, max - 1) : visible;
  const overlapPx = Math.round(size * 0.3);

  return (
    <div className="flex items-center" style={{ paddingLeft: overlapPx }}>
      {displayed.map((avatar, i) => (
        <div
          key={i}
          className="rounded-full bg-[#f2f4f7] overflow-hidden border-2 border-white shrink-0"
          style={{
            width: size,
            height: size,
            marginLeft: -overlapPx,
            zIndex: displayed.length - i,
          }}
          title={avatar.name}
        >
          <img
            alt=""
            src={avatar.src}
            className="size-full object-cover rounded-full"
          />
        </div>
      ))}
      {showOverflow && (
        <div
          className="rounded-full bg-[#f2f4f7] border-2 border-white shrink-0 flex items-center justify-center"
          style={{
            width: size,
            height: size,
            marginLeft: -overlapPx,
            zIndex: 0,
          }}
        >
          <span className="font-sans font-bold text-rdj-text-secondary" style={{ fontSize: size * 0.36 }}>
            +{overflow + 1}
          </span>
        </div>
      )}
    </div>
  );
}
