/**
 * Runtime settings that control how a game instance behaves.
 *
 * These settings are persisted on the game and affect runtime behavior only.
 * They do not modify the underlying quiz definition.
 */
export type GameSettingsDto = {
  /**
   * Whether to randomize the order of questions when the game starts.
   *
   * When enabled, questions are shuffled before the first round begins so participants
   * see the quiz in a different sequence. The shuffle is applied per game instance and
   * does not modify the underlying quiz definition.
   */
  randomizeQuestionOrder: boolean

  /**
   * Whether to randomize the order of answer options for each question.
   *
   * When enabled, the answer alternatives for each question are shuffled before being
   * presented to participants. This is applied per question per game instance and does
   * not modify the underlying quiz definition.
   */
  randomizeAnswerOrder: boolean
}
