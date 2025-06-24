/**
 * Enumeration of granted authorities (permissions or scopes)
 * that can be assigned to a JWT to control access to protected resources.
 */
export enum Authority {
  /**
   * Permission to host and manage quiz games, including creating new games,
   * joining existing ones, and tracking game progress.
   */
  Game = 'GAME',

  /**
   * Permission to perform media-related operations, including
   * searching for media, uploading new media assets, and deleting existing media.
   */
  Media = 'MEDIA',

  /**
   * Permission to search, create, edit, and delete quizzes.
   */
  Quiz = 'QUIZ',

  /**
   * Permission to allow using a valid refresh token to obtain a new access token.
   */
  RefreshAuth = 'REFRESH_AUTH',
}
