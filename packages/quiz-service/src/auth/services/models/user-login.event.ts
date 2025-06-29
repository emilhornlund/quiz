/**
 * Payload for the UserLoginEvent, emitted whenever a user successfully logs in.
 *
 * @property userId  - The unique identifier of the user that just logged in.
 * @property date    - The exact date and time when the login occurred.
 */
export interface UserLoginEvent {
  userId: string
  date: Date
}
