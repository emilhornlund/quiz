/**
 * Enum representing the available visual reveal effects
 * for image-based question media.
 *
 * Defines how the image is revealed to participants during the question.
 */
export enum QuestionImageRevealEffectType {
  /**
   * Reveals the image gradually by reducing blur over time.
   */
  Blur = 'BLUR',

  /**
   * Reveals the image in a 3x3 grid pattern, one square at a time.
   */
  Square3x3 = 'SQUARE_3X3',

  /**
   * Reveals the image in a 5x5 grid pattern, one square at a time.
   */
  Square5x5 = 'SQUARE_5X5',

  /**
   * Reveals the image in an 8x8 grid pattern, one square at a time.
   */
  Square8x8 = 'SQUARE_8X8',
}
