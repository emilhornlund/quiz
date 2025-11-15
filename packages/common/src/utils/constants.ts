import { QuestionPinTolerance } from '../models'

export const HEARTBEAT_INTERVAL = 30000

// Common emoji blocks + components + ZWJ/VS16/keycap:
// 2600–27BF, 1F300–1F5FF, 1F600–1F64F, 1F680–1F6FF, 1F900–1F9FF, 1FA70–1FAFF,
// 1F1E6–1F1FF (regional indicators), FE0F (VS16), 200D (ZWJ), 20E3 (keycap)
const EMOJI_RANGE =
  '\\u{1F300}-\\u{1F5FF}' + // Misc Symbols & Pictographs
  '\\u{1F900}-\\u{1F9FF}' + // Supplemental Symbols & Pictographs
  '\\u{1F600}-\\u{1F64F}' + // Emoticons
  '\\u{1F680}-\\u{1F6FF}' + // Transport & Map
  '\\u{2600}-\\u{26FF}' + // Misc Symbols
  '\\u{2700}-\\u{27BF}' + // Dingbats
  '\\u{1F1E6}-\\u{1F1FF}' + // Regional Indicators
  '\\u{1F191}-\\u{1F251}' + // Enclosed Characters
  '\\u{1F004}\\u{1F0CF}' + // Mahjong / Joker tiles
  '\\u{1F170}-\\u{1F171}\\u{1F17E}-\\u{1F17F}\\u{1F18E}' + // Enclosed letters
  '\\u{3030}\\u{2B50}\\u{2B55}' + // Common standalone emoji
  '\\u{2934}-\\u{2935}\\u{2B05}-\\u{2B07}\\u{2B1B}-\\u{2B1C}' + // Arrows
  '\\u{3297}\\u{3299}\\u{303D}\\u{00A9}\\u{00AE}\\u{2122}' + // Symbols
  '\\u{23F3}\\u{24C2}\\u{23E9}-\\u{23EF}\\u{25B6}\\u{23F8}-\\u{23FA}' // Misc UI icons

/* Quiz Title */
export const QUIZ_TITLE_MIN_LENGTH = 3
export const QUIZ_TITLE_MAX_LENGTH = 95
export const QUIZ_TITLE_REGEX = new RegExp(
  `^[\\p{L}\\p{N}\\p{P}\\p{Zs}${EMOJI_RANGE}]{3,95}$`,
  'u',
)

/* Quiz Description */
export const QUIZ_DESCRIPTION_MAX_LENGTH = 500
export const QUIZ_DESCRIPTION_REGEX = new RegExp(
  `^[\\p{L}\\p{N}\\p{P}\\p{Zs}${EMOJI_RANGE}\\n\\r]{1,500}$`,
  'u',
)

export const GAME_PIN_REGEX = /^[1-9]\d{5}$/
export const GAME_PIN_LENGTH = 6

export const GAME_MIN_PLAYERS = 0
export const GAME_MAX_PLAYERS = 20

/* Player Nickname */
export const PLAYER_NICKNAME_MIN_LENGTH = 2
export const PLAYER_NICKNAME_MAX_LENGTH = 20
export const PLAYER_NICKNAME_REGEX = new RegExp(
  `^[\\p{L}\\p{N}_${EMOJI_RANGE}]{2,20}$`,
  'u',
)

/* URL */
export const URL_REGEX =
  /^(https?:\/\/)(localhost|(\d{1,3}\.){3}\d{1,3}|([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})(:\d+)?(\/[^\s]*)?$/
// /^(https?:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/

/* Quiz Question General */
export const QUIZ_QUESTION_MIN = 1
export const QUIZ_QUESTION_MAX = 50

/* Quiz Question Text */
export const QUIZ_QUESTION_TEXT_MIN_LENGTH = 3
export const QUIZ_QUESTION_TEXT_MAX_LENGTH = 120
export const QUIZ_QUESTION_TEXT_REGEX = new RegExp(
  `^[\\p{L}\\p{N}\\p{P}\\p{Zs}${EMOJI_RANGE}]{3,120}$`,
  'u',
)

/* Quiz Question Info — optional explanatory text shown with results/review */
export const QUIZ_QUESTION_INFO_MIN_LENGTH = 1
export const QUIZ_QUESTION_INFO_MAX_LENGTH = 256
export const QUIZ_QUESTION_INFO_REGEX = new RegExp(
  `^[\\p{L}\\p{N}\\p{P}\\p{Zs}${EMOJI_RANGE}]{1,256}$`,
  'u',
)

/* Quiz Question Multi Choice Options */
export const QUIZ_MULTI_CHOICE_OPTIONS_MIN = 2
export const QUIZ_MULTI_CHOICE_OPTIONS_MAX = 6
export const QUIZ_MULTI_CHOICE_OPTION_VALUE_MIN_LENGTH = 1
export const QUIZ_MULTI_CHOICE_OPTION_VALUE_MAX_LENGTH = 75
export const QUIZ_MULTI_CHOICE_OPTION_VALUE_REGEX = new RegExp(
  `^[\\p{L}\\p{N}\\p{P}\\p{Zs}${EMOJI_RANGE}]{1,75}$`,
  'u',
)

/* Quiz Question Type Answer Options */
export const QUIZ_TYPE_ANSWER_OPTIONS_MIN = 1
export const QUIZ_TYPE_ANSWER_OPTIONS_MAX = 4
export const QUIZ_TYPE_ANSWER_OPTIONS_VALUE_MIN_LENGTH = 1
export const QUIZ_TYPE_ANSWER_OPTIONS_VALUE_MAX_LENGTH = 20
export const QUIZ_TYPE_ANSWER_OPTIONS_VALUE_REGEX =
  /^[\p{L}\p{N}\p{P}\p{Zs}]{1,20}$/u

/* Quiz Question Pin Tolerance Radius's */
export const QUESTION_PIN_TOLERANCE_RADIUS: Record<
  QuestionPinTolerance,
  number
> = {
  MAXIMUM: 1,
  HIGH: 0.2,
  MEDIUM: 0.12,
  LOW: 0.06,
}

/* Quiz Question Puzzle Values */
export const QUIZ_PUZZLE_VALUES_MIN = 3
export const QUIZ_PUZZLE_VALUES_MAX = 6
export const QUIZ_PUZZLE_VALUE_MIN_LENGTH = 1
export const QUIZ_PUZZLE_VALUE_MAX_LENGTH = 75
export const QUIZ_PUZZLE_VALUE_REGEX = new RegExp(
  `^[\\p{L}\\p{N}\\p{P}\\p{Zs}${EMOJI_RANGE}]{1,75}$`,
  'u',
)

export const QUIZ_ZERO_POINTS = 0
export const QUIZ_STANDARD_POINTS = 1000
export const QUIZ_DOUBLE_POINTS = 2000
export const QUIZ_MIN_POINTS = QUIZ_ZERO_POINTS
export const QUIZ_MAX_POINTS = QUIZ_DOUBLE_POINTS

/* Player Link Code */
export const PLAYER_LINK_CODE_REGEX = /^[A-Z0-9]{4}-[A-Z0-9]{4}$/

/* Quiz Pagination */
export const DEFAULT_QUIZ_PAGINATION_LIMIT = 5

/* Media Search Term */
export const MEDIA_SEARCH_TERM_MIN_LENGTH = 2
export const MEDIA_SEARCH_TERM_MAX_LENGTH = 20
export const MEDIA_SEARCH_TERM_REGEX = /^[a-zA-Z0-9_ ]{2,20}$/

/* Image Upload */
export const UPLOAD_IMAGE_MIN_FILE_SIZE = 1 // 1 byte
export const UPLOAD_IMAGE_MAX_FILE_SIZE = 20 * 1024 * 1024 // 20mb
export const UPLOAD_IMAGE_MIMETYPE_REGEX = /^image\/(gif|jpeg|png|tiff|webp)$/

/* Password */
export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 128
export const PASSWORD_REGEX =
  /^(?=(?:.*[a-z]){2,})(?=(?:.*[A-Z]){2,})(?=(?:.*\d){2,})(?=(?:.*[^A-Za-z0-9]){2,}).{8,128}$/

/* Email */
export const EMAIL_MIN_LENGTH = 6
export const EMAIL_MAX_LENGTH = 128
export const EMAIL_REGEX =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

// Given (first) name: 1–64 characters, no leading/trailing separators
export const GIVEN_NAME_MIN_LENGTH = 1
export const GIVEN_NAME_MAX_LENGTH = 64
export const GIVEN_NAME_REGEX =
  /^(?=.{1,64}$)[\p{L}\p{M}]+(?:[ '-][\p{L}\p{M}]+)*$/u

// Family (last) name: 1–64 characters, no leading/trailing separators
export const FAMILY_NAME_MIN_LENGTH = 1
export const FAMILY_NAME_MAX_LENGTH = 64
export const FAMILY_NAME_REGEX =
  /^(?=.{1,64}$)[\p{L}\p{M}]+(?:[ '-][\p{L}\p{M}]+)*$/u

// Google OAuth
export const GOOGLE_OAUTH_CODE_REGEX = /^[0-9A-Za-z\-_/+=]{10,512}$/
export const GOOGLE_OAUTH_CODE_VERIFIER_REGEX = /^[A-Za-z0-9\-._~]{43,128}$/

// Migration token
/** Fixed length of a SHA‑256 base64url-encoded token without padding. */
export const MIGRATION_TOKEN_LENGTH = 43
/** Regex for a 43‑character base64url (A‑Z, a‑z, 0‑9, _ , -) migration token. */
export const MIGRATION_TOKEN_REGEX = /^[A-Za-z0-9_-]{43}$/
