/**
 * Represents the user profile data returned by Google’s OAuth2 UserInfo API.
 */
export interface GoogleProfileDto {
  id: string
  email: string
  verified_email: boolean
  name: string
  given_name: string
  family_name: string
  picture: string
}
