/* Quiz Title */
export const QUIZ_TITLE_MIN_LENGTH = 3
export const QUIZ_TITLE_MAX_LENGTH = 95
export const QUIZ_TITLE_REGEX = /^[a-zA-Z0-9_\-!?@#$%&|,.*\\/ ]{3,95}$/

/* Quiz Description */
export const QUIZ_DESCRIPTION_MAX_LENGTH = 500
export const QUIZ_DESCRIPTION_REGEX = /^[\p{L}\p{N}\p{P}\p{Zs}]{1,500}$/u

export const GAME_NAME_REGEX = /^[a-zA-Z0-9_ ]{3,25}$/
export const GAME_PIN_REGEX = /^[1-9]\d{5}$/
export const PLAYER_NICKNAME_REGEX = /^[a-zA-Z0-9_]{2,20}$/
export const QUESTION_TYPE_ANSWER_REGEX = /^[a-zA-Z0-9_ ]{1,75}$/

/* URL */
export const URL_REGEX =
  /^(https?:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/
