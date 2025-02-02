/* Quiz Title */
export const QUIZ_TITLE_MIN_LENGTH = 3
export const QUIZ_TITLE_MAX_LENGTH = 95
export const QUIZ_TITLE_REGEX = /^[\p{L}\p{N}\p{P}\p{Zs}]{3,95}$/u

/* Quiz Description */
export const QUIZ_DESCRIPTION_MAX_LENGTH = 500
export const QUIZ_DESCRIPTION_REGEX = /^[\p{L}\p{N}\p{P}\p{Zs}]{1,500}$/u

export const GAME_NAME_REGEX = /^[a-zA-Z0-9_ ]{3,25}$/
export const GAME_PIN_REGEX = /^[1-9]\d{5}$/
export const GAME_PIN_LENGTH = 6

/* Player Nickname */
export const PLAYER_NICKNAME_MIN_LENGTH = 2
export const PLAYER_NICKNAME_MAX_LENGTH = 20
export const PLAYER_NICKNAME_REGEX = /^[a-zA-Z0-9_]{2,20}$/

/* URL */
export const URL_REGEX =
  /^(https?:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/

/* Quiz Question General */
export const QUIZ_QUESTION_MIN = 1
export const QUIZ_QUESTION_MAX = 50

/* Quiz Question Text */
export const QUIZ_QUESTION_TEXT_MIN_LENGTH = 3
export const QUIZ_QUESTION_TEXT_MAX_LENGTH = 120
export const QUIZ_QUESTION_TEXT_REGEX = /^[\p{L}\p{N}\p{P}\p{Zs}]{3,120}$/u

/* Quiz Question Multi Choice Options */
export const QUIZ_MULTI_CHOICE_OPTIONS_MIN = 2
export const QUIZ_MULTI_CHOICE_OPTIONS_MAX = 6
export const QUIZ_MULTI_CHOICE_OPTION_VALUE_MIN_LENGTH = 1
export const QUIZ_MULTI_CHOICE_OPTION_VALUE_MAX_LENGTH = 75
export const QUIZ_MULTI_CHOICE_OPTION_VALUE_REGEX =
  /^[\p{L}\p{N}\p{P}\p{Zs}]{1,75}$/u

/* Quiz Question Type Answer Options */
export const QUIZ_TYPE_ANSWER_OPTIONS_MIN = 1
export const QUIZ_TYPE_ANSWER_OPTIONS_MAX = 4
export const QUIZ_TYPE_ANSWER_OPTIONS_VALUE_MIN = 1
export const QUIZ_TYPE_ANSWER_OPTIONS_VALUE_MAX = 20
export const QUIZ_TYPE_ANSWER_OPTIONS_VALUE_REGEX = /^[\p{L}\p{N}\p{P}]{1,75}$/u

/* Player Link Code */
export const PLAYER_LINK_CODE_REGEX = /^[A-Z0-9]{4}-[A-Z0-9]{4}$/

/* Quiz Pagination */
export const DEFAULT_QUIZ_PAGINATION_LIMIT = 5
