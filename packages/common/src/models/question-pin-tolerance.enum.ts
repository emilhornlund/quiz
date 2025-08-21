/**
 * Defines tolerance presets for Pin questions.
 *
 * Each level sets the maximum distance from the correct location
 * that still counts as correct. Within this distance, points are awarded
 * on a sliding scale: closer pins earn more points.
 *
 * Higher tolerance values allow a larger margin of error, while
 * lower values require more precise placement.
 */
export enum QuestionPinTolerance {
  /** Largest margin of error — all placements score, but closer pins earn more points. */
  Maximum = 'MAXIMUM',

  /** Wide margin of error — forgiving, but still excludes extreme outliers. */
  High = 'HIGH',

  /** Moderate margin of error — balanced strictness. */
  Medium = 'MEDIUM',

  /** Smallest margin of error — strictest, only near-exact placements score. */
  Low = 'LOW',
}
