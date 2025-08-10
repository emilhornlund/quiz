/**
 * DTO for requesting a user migration.
 *
 * Represents the payload sent when linking a legacy anonymous player
 * to the currently authenticated user.
 */
export interface UserMigrationRequestDto {
  /**
   * A 43‑character base64url-encoded migration token that uniquely
   * identifies the legacy anonymous player to be migrated.
   */
  readonly migrationToken: string
}
