// The nine drawn icons, exported from Figma (03 · Idiom, nodes 9:2 to 11:18):
// 20 px grid, 1.5 px stroke, square ends, stroke in currentColor.
// An icon never stands alone; it follows a word, so it is always aria-hidden.

const PATHS = {
  "arrow-right": "M3 10H17M12 15L17 10L12 5",
  "arrow-up-right": "M6 14L14 6M14 13V6H7",
  "arrow-down": "M10 3V17M15 12L10 17L5 12",
  "plus": "M10 4V10M10 10V16M10 10H4M10 10H16",
  "minus": "M4 10H16",
  "check": "M4 10.5L8 14.5L16 6",
  "close": "M5 5L10 10M10 10L15 15M10 10L15 5M10 10L5 15",
  "alert": "M10 4V12M10 15V16",
  "chevron-down": "M5 8L10 13L15 8",
} as const;

export type IconName = keyof typeof PATHS;

type IconProps = {
  name: IconName;
  size?: number;
  className?: string;
};

export function Icon({ name, size = 20, className }: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="square"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
