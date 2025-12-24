/**
 * Runtime map of device size breakpoints.
 *
 * These string literals are used at runtime for responsive logic,
 * media-query mapping, and layout decisions.
 */
export const DeviceType = {
  Mobile: 'MOBILE',
  Tablet: 'TABLET',
  Desktop: 'DESKTOP',
} as const

/**
 * Device size breakpoint.
 *
 * Possible values:
 * - `Mobile` – viewport width < 768px
 * - `Tablet` – viewport width between 768px and 1023px
 * - `Desktop` – viewport width ≥ 1024px
 */
export type DeviceType = (typeof DeviceType)[keyof typeof DeviceType]
