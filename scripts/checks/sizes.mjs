// The screen sizes every check uses (docs/rebuild/SPEC.md, section 15).
// touch: phones, tablets and iPads, including iPads at laptop width.
const size = (width, height, touch) => ({ name: `${width}x${height}`, width, height, touch });

export const sizes = [
  // Phones.
  size(360, 800, true),
  size(375, 667, true),
  size(390, 844, true),
  size(430, 932, true),
  // Tablets, upright.
  size(744, 1133, true),
  size(768, 1024, true),
  size(820, 1180, true),
  size(834, 1194, true),
  // Tablets, landscape.
  size(1024, 768, true),
  size(1080, 810, true),
  size(1133, 744, true),
  size(1180, 820, true),
  size(1194, 834, true),
  size(1366, 1024, true),
  size(1376, 1032, true),
  // Laptops and desktops.
  size(1200, 800, false),
  size(1280, 800, false),
  size(1366, 768, false),
  size(1440, 900, false),
  size(1920, 1080, false),
];

export const routes = [
  "/",
  "/products/kubar-protocol",
  "/products/navdhan-sdk",
  "/how-it-works",
  "/about",
  "/contact",
  "/legal/privacy",
  "/legal/terms",
];
