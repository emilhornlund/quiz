# COVERAGE_IMPROVEMENT_PLAN.md

## Purpose

This document contains:

1. The current code coverage report (as the single source of truth for uncovered lines), and
2. The planning output that should be produced by an AI agent.

## Coverage report

------------------------------------------------------------------------------|---------|----------|---------|---------|---------------------------------------------------------------
File | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s  
------------------------------------------------------------------------------|---------|----------|---------|---------|---------------------------------------------------------------
All files | 94.03 | 82.4 | 92.33 | 93.75 |  
app | 100 | 100 | 100 | 100 |  
index.ts | 100 | 100 | 100 | 100 |  
app/cache | 100 | 100 | 100 | 100 |  
index.ts | 100 | 100 | 100 | 100 |  
app/cache/decorators | 95 | 80 | 100 | 100 |  
cacheable.decorator.ts | 94.73 | 80 | 100 | 100 | 26,52  
index.ts | 100 | 100 | 100 | 100 |  
app/config | 0 | 100 | 100 | 0 |  
index.ts | 0 | 100 | 100 | 0 | 1  
app/controllers | 87.5 | 100 | 0 | 83.33 |  
app.controller.ts | 85.71 | 100 | 0 | 80 | 10  
index.ts | 100 | 100 | 100 | 100 |  
app/decorators | 100 | 100 | 100 | 100 |  
index.ts | 100 | 100 | 100 | 100 |  
skip-validation.decorator.ts | 100 | 100 | 100 | 100 |  
app/exceptions | 100 | 100 | 100 | 100 |  
index.ts | 100 | 100 | 100 | 100 |  
validation.exception.ts | 100 | 100 | 100 | 100 |  
app/filters | 100 | 100 | 100 | 100 |  
all-exceptions.filter.ts | 100 | 100 | 100 | 100 |  
app/pipes | 100 | 100 | 100 | 100 |  
index.ts | 100 | 100 | 100 | 100 |  
validation.pipe.ts | 100 | 100 | 100 | 100 |  
app/shared/auth | 100 | 100 | 100 | 100 |  
decorator-constants.ts | 100 | 100 | 100 | 100 |  
index.ts | 100 | 100 | 100 | 100 |  
app/shared/repository | 100 | 100 | 84.61 | 100 |  
base.repository.ts | 100 | 100 | 100 | 100 |  
index.ts | 100 | 100 | 33.33 | 100 |  
utils.ts | 100 | 100 | 100 | 100 |  
app/shared/token | 100 | 100 | 100 | 100 |  
index.ts | 100 | 100 | 100 | 100 |  
token.constants.ts | 100 | 100 | 100 | 100 |  
app/shared/user | 90.9 | 80 | 75 | 90 |  
index.ts | 100 | 100 | 100 | 100 |  
type-guards.ts | 88.88 | 80 | 75 | 87.5 | 57  
app/utils | 100 | 100 | 100 | 100 |  
bootstrap.ts | 100 | 100 | 100 | 100 |  
index.ts | 100 | 100 | 100 | 100 |  
validation.constants.ts | 100 | 100 | 100 | 100 |  
validation.utils.ts | 100 | 100 | 100 | 100 |  
modules/authentication | 100 | 100 | 100 | 100 |  
index.ts | 100 | 100 | 100 | 100 |  
modules/authentication/controllers | 100 | 100 | 100 | 100 |  
auth.controller.ts | 100 | 100 | 100 | 100 |  
index.ts | 100 | 100 | 100 | 100 |  
modules/authentication/controllers/decorators | 95 | 75 | 100 | 95 |  
index.ts | 100 | 100 | 100 | 100 |  
ip-address.decorator.ts | 88.88 | 50 | 100 | 88.88 | 16  
user-agent.decorator.ts | 100 | 100 | 100 | 100 |  
modules/authentication/controllers/decorators/auth | 92.3 | 50 | 100 | 91.42 |  
index.ts | 100 | 100 | 100 | 100 |  
jwt-payload.decorator.ts | 83.33 | 50 | 100 | 83.33 | 27  
principal-id.decorator.ts | 83.33 | 50 | 100 | 83.33 | 38  
principal.decorator.ts | 83.33 | 50 | 100 | 83.33 | 41  
public.decorator.ts | 100 | 100 | 100 | 100 |  
required-authorities.decorator.ts | 100 | 100 | 100 | 100 |  
required-scopes.decorator.ts | 100 | 100 | 100 | 100 |  
modules/authentication/controllers/models | 100 | 100 | 100 | 100 |  
auth-google-exchange.request.ts | 100 | 100 | 100 | 100 |  
auth-login.request.ts | 100 | 100 | 100 | 100 |  
auth-password-change.request.ts | 100 | 100 | 100 | 100 |  
auth-refresh.request.ts | 100 | 100 | 100 | 100 |  
auth-revoke.request.ts | 100 | 100 | 100 | 100 |  
auth.response.ts | 100 | 100 | 100 | 100 |  
index.ts | 100 | 100 | 100 | 100 |  
modules/authentication/guards | 96.36 | 92.85 | 100 | 96.15 |  
auth.guard.ts | 96.29 | 92.85 | 100 | 96.07 | 133,160  
index.ts | 100 | 100 | 100 | 100 |  
modules/authentication/services | 97.59 | 83.33 | 100 | 97.46 |  
auth.service.ts | 96.15 | 83.33 | 100 | 96 | 153-156  
google-auth.service.ts | 100 | 100 | 100 | 100 |  
index.ts | 100 | 100 | 100 | 100 |  
modules/authentication/services/models | 0 | 100 | 100 | 0 |  
index.ts | 0 | 100 | 100 | 0 | 1-3  
modules/authentication/services/utils | 100 | 100 | 100 | 100 |  
event.constants.ts | 100 | 100 | 100 | 100 |  
index.ts | 100 | 100 | 100 | 100 |  
modules/email | 100 | 100 | 100 | 100 |  
index.ts | 100 | 100 | 100 | 100 |  
modules/email/services | 100 | 100 | 100 | 100 |  
email.service.ts | 100 | 100 | 100 | 100 |  
index.ts | 100 | 100 | 100 | 100 |  
modules/game | 100 | 100 | 100 | 100 |  
index.ts | 100 | 100 | 100 | 100 |  
modules/game-authentication | 100 | 100 | 100 | 100 |  
index.ts | 100 | 100 | 100 | 100 |  
modules/game-authentication/controllers | 96.15 | 70 | 100 | 95.83 |  
game-authentication.controller.ts | 96 | 70 | 100 | 95.65 | 128  
index.ts | 100 | 100 | 100 | 100 |  
modules/game-authentication/controllers/models/requests | 100 | 100 | 100 | 100 |  
auth-game.request.ts | 100 | 100 | 100 | 100 |  
index.ts | 100 | 100 | 100 | 100 |  
modules/game-authentication/services | 96.42 | 87.5 | 100 | 96.15 |  
game-authentication.service.ts | 96.29 | 87.5 | 100 | 96 | 78  
index.ts | 100 | 100 | 100 | 100 |  
modules/game-core | 100 | 100 | 100 | 100 |  
index.ts | 100 | 100 | 100 | 100 |  
modules/game-core/exceptions | 95.45 | 100 | 83.33 | 95.45 |  
active-game-not-found.exception.ts | 100 | 100 | 100 | 100 |  
game-not-found.exception.ts | 66.66 | 100 | 0 | 66.66 | 13  
illegal-task-type.exception.ts | 100 | 100 | 100 | 100 |  
index.ts | 100 | 100 | 100 | 100 |  
player-not-found.exception.ts | 100 | 100 | 100 | 100 |  
unsupported-game-mode.exception.ts | 100 | 100 | 100 | 100 |  
modules/game-core/orchestration | 100 | 100 | 100 | 100 |  
question-answer-type-guards.ts | 100 | 100 | 100 | 100 |  
task-type-guards.ts | 100 | 100 | 100 | 100 |  
modules/game-core/orchestration/task | 66.66 | 100 | 44.44 | 58.33 |  
game-task-orchestrator.ts | 61.53 | 100 | 37.5 | 54.54 | 45-63,101-135  
index.ts | 100 | 100 | 100 | 100 |  
modules/game-core/orchestration/task/utils | 99.28 | 96.42 | 100 | 99.27 |  
index.ts | 100 | 100 | 100 | 100 |  
task-leaderboard.utils.ts | 100 | 100 | 100 | 100 |  
task-lobby.utils.ts | 100 | 100 | 100 | 100 |  
task-podium.utils.ts | 100 | 100 | 100 | 100 |  
task-question-result.utils.ts | 98.33 | 95.83 | 100 | 98.3 | 196  
task-question.utils.ts | 100 | 91.66 | 100 | 100 | 68  
task-quit.utils.ts | 100 | 100 | 100 | 100 |  
task-sorting.utils.ts | 100 | 100 | 100 | 100 |  
modules/game-core/orchestration/task/utils/scoring | 97.19 | 95.83 | 100 | 97.19 |  
index.ts | 100 | 100 | 100 | 100 |  
scoring-engine.ts | 97.16 | 95.83 | 100 | 97.16 | 219,346,431  
modules/game-core/orchestration/task/utils/scoring/classic | 99.08 | 93.67 | 100 | 99.07 |  
classic-multichoice-strategy.ts | 100 | 100 | 100 | 100 |  
classic-pin-strategy.ts | 100 | 100 | 100 | 100 |  
classic-puzzle-strategy.ts | 96 | 88.23 | 100 | 95.83 | 79  
classic-range-strategy.ts | 100 | 83.33 | 100 | 100 | 124-126  
classic-true-false-strategy.ts | 100 | 100 | 100 | 100 |  
classic-type-answer-strategy.ts | 100 | 100 | 100 | 100 |  
modules/game-core/orchestration/task/utils/scoring/core | 92.85 | 94.44 | 100 | 92.85 |  
base-scoring-strategy.ts | 92.3 | 92.85 | 100 | 92.3 | 72  
classic-base-scoring-strategy.ts | 100 | 100 | 100 | 100 |  
scoring-mapped-types.ts | 0 | 100 | 100 | 0 | 1  
zero-to-one-hundred-base-scoring-strategy.ts | 100 | 100 | 100 | 100 |  
modules/game-core/orchestration/task/utils/scoring/zero-to-one-hundred | 100 | 100 | 100 | 100 |  
zero-to-one-hundred-range-strategy.ts | 100 | 100 | 100 | 100 |  
modules/game-core/repositories | 98.21 | 61.11 | 100 | 98.14 |  
game.repository.ts | 98.18 | 61.11 | 100 | 98.11 | 83  
index.ts | 100 | 100 | 100 | 100 |  
modules/game-core/repositories/models/schemas | 99.64 | 100 | 66.66 | 99.52 |  
game.schema.ts | 100 | 100 | 100 | 100 |  
index.ts | 100 | 100 | 100 | 100 |  
participant.schema.ts | 100 | 100 | 100 | 100 |  
task.schema.ts | 99.51 | 100 | 66.66 | 99.32 | 45  
modules/game-core/utils | 100 | 100 | 100 | 100 |  
game-participant.utils.ts | 100 | 100 | 100 | 100 |  
game-redis.utils.ts | 100 | 100 | 100 | 100 |  
game.converter.ts | 100 | 100 | 100 | 100 |  
index.ts | 100 | 100 | 100 | 100 |  
modules/game-event/orchestration/event | 70.64 | 72.36 | 90.9 | 69.81 |  
game-event-orchestrator.ts | 70.09 | 72.36 | 90 | 69.52 | 220-229,250-281,314-327  
index.ts | 100 | 100 | 100 | 100 |  
modules/game-event/orchestration/event/utils | 100 | 95.54 | 100 | 100 |  
distribution.utils.ts | 100 | 91.78 | 100 | 100 | 97,159,215,272,338,403  
game-leaderboard-event.utils.ts | 100 | 100 | 100 | 100 |  
game-loading-event.utils.ts | 100 | 100 | 100 | 100 |  
game-lobby-event.utils.ts | 100 | 100 | 100 | 100 |  
game-podium-event.utils.ts | 100 | 100 | 100 | 100 |  
game-question-event.utils.ts | 100 | 100 | 100 | 100 |  
game-quit-event.utils.ts | 100 | 100 | 100 | 100 |  
game-result-event.utils.ts | 100 | 96.87 | 100 | 100 | 80  
leaderboard.utils.ts | 100 | 100 | 100 | 100 |  
pagination-event.utils.ts | 100 | 100 | 100 | 100 |  
question-result.utils.ts | 100 | 100 | 100 | 100 |  
validation.utils.ts | 100 | 100 | 100 | 100 |  
modules/game-event/services | 96.55 | 80.95 | 100 | 96.34 |  
game-event.publisher.ts | 96.66 | 87.5 | 100 | 96.29 | 127  
game-event.subscriber.ts | 96.36 | 76.92 | 100 | 96.22 | 72-73  
index.ts | 100 | 100 | 100 | 100 |  
modules/game-event/services/models/event | 0 | 100 | 100 | 0 |  
index.ts | 0 | 100 | 100 | 0 | 1  
modules/game-result/controllers | 100 | 100 | 100 | 100 |  
game-result.controller.ts | 100 | 100 | 100 | 100 |  
index.ts | 100 | 100 | 100 | 100 |  
modules/game-result/controllers/decorators/api | 100 | 100 | 100 | 100 |  
api-game-result-created-property.decorator.ts | 100 | 100 | 100 | 100 |  
api-game-result-duration-property.decorator.ts | 100 | 100 | 100 | 100 |  
api-game-result-number-of-players-property.decorator.ts | 100 | 100 | 100 | 100 |  
api-game-result-number-of-questions-property.decorator.ts | 100 | 100 | 100 | 100 |  
api-game-result-player-metric-average-response-time-property.decorator.ts | 100 | 100 | 100 | 100 |  
api-game-result-player-metric-longest-correct-streak-property.decorator.ts | 100 | 100 | 100 | 100 |  
api-game-result-player-metric-rank-property.decorator.ts | 100 | 100 | 100 | 100 |  
api-game-result-player-metric-score-property.decorator.ts | 100 | 100 | 100 | 100 |  
api-game-result-player-metric-unanswered-property.decorator.ts | 100 | 100 | 100 | 100 |  
api-game-result-question-metric-average-response-time-property.decorator.ts | 100 | 100 | 100 | 100 |  
api-game-result-question-metric-unanswered-property.decorator.ts | 100 | 100 | 100 | 100 |  
index.ts | 100 | 100 | 100 | 100 |  
modules/game-result/controllers/models/responses | 92.79 | 100 | 0 | 92.79 |  
game-result-classic-mode-player-metric.response.ts | 93.33 | 100 | 0 | 93.33 | 29  
game-result-classic-mode-question-metric.response.ts | 100 | 100 | 100 | 100 |  
game-result-classic-mode.response.ts | 87.5 | 100 | 0 | 87.5 | 62,90,106  
game-result-participant.response.ts | 100 | 100 | 100 | 100 |  
game-result-zero-to-one-hundred-mode-player-metric-response.ts | 92.85 | 100 | 0 | 92.85 | 29  
game-result-zero-to-one-hundred-mode-question-metric.response.ts | 100 | 100 | 100 | 100 |  
game-result-zero-to-one-hundred-mode.response.ts | 87.5 | 100 | 0 | 87.5 | 62,90,106  
index.ts | 100 | 100 | 100 | 100 |  
modules/game-result/exceptions | 100 | 100 | 100 | 100 |  
game-results-not-found.exception.ts | 100 | 100 | 100 | 100 |  
index.ts | 100 | 100 | 100 | 100 |  
modules/game-result/repositories | 84.61 | 100 | 66.66 | 81.81 |  
game-result.repository.ts | 83.33 | 100 | 66.66 | 80 | 50-53  
index.ts | 100 | 100 | 100 | 100 |  
modules/game-result/repositories/models/schemas | 100 | 100 | 100 | 100 |  
game-result.schema.ts | 100 | 100 | 100 | 100 |  
index.ts | 100 | 100 | 100 | 100 |  
modules/game-result/services | 95.12 | 100 | 93.33 | 94.87 |  
game-result.service.ts | 95 | 100 | 93.33 | 94.73 | 130-131  
index.ts | 100 | 100 | 100 | 100 |  
modules/game-result/services/utils | 97.87 | 86.76 | 100 | 97.72 |  
game-result.converter.ts | 97.87 | 86.76 | 100 | 97.72 | 31  
modules/game/controllers | 100 | 100 | 100 | 100 |  
game.controller.ts | 100 | 100 | 100 | 100 |  
index.ts | 100 | 100 | 100 | 100 |  
profile-game.controller.ts | 100 | 100 | 100 | 100 |  
quiz-game.controller.ts | 100 | 100 | 100 | 100 |  
modules/game/controllers/decorators/api | 100 | 100 | 100 | 100 |  
api-game-created-property.decorator.ts | 100 | 100 | 100 | 100 |  
api-game-id-param.decorator.ts | 100 | 100 | 100 | 100 |  
api-game-id-property.decorator.ts | 100 | 100 | 100 | 100 |  
api-game-name-property.decorator.ts | 100 | 100 | 100 | 100 |  
api-game-participant-id.property.decorator.ts | 100 | 100 | 100 | 100 |  
api-game-participant-rank.property.decorator.ts | 100 | 100 | 100 | 100 |  
api-game-participant-score.property.decorator.ts | 100 | 100 | 100 | 100 |  
api-game-participant-type.property.decorator.ts | 100 | 100 | 100 | 100 |  
api-game-question-multi-choice-answer-option-index.decorator.ts | 100 | 100 | 100 | 100 |  
api-game-question-range-answer-value.decorator.ts | 100 | 100 | 100 | 100 |  
api-game-question-true-false-answer-value.decorator.ts | 100 | 100 | 100 | 100 |  
api-game-question-type-answer-value.decorator.ts | 100 | 100 | 100 | 100 |  
api-game-question-type-property.decorator.ts | 100 | 100 | 100 | 100 |  
api-game-status.property.decorator.ts | 100 | 100 | 100 | 100 |  
api-player-id-param.decorator.ts | 100 | 100 | 100 | 100 |  
api-player-nickname-property.decorator.ts | 100 | 100 | 100 | 100 |  
index.ts | 100 | 100 | 100 | 100 |  
modules/game/controllers/decorators/auth | 100 | 100 | 100 | 100 |  
authorized-game.decorator.ts | 100 | 100 | 100 | 100 |  
index.ts | 100 | 100 | 100 | 100 |  
modules/game/controllers/decorators/params | 100 | 100 | 100 | 100 |  
index.ts | 100 | 100 | 100 | 100 |  
route-game-id-param.decorator.ts | 100 | 100 | 100 | 100 |  
route-player-id-param.decorator.ts | 100 | 100 | 100 | 100 |  
modules/game/controllers/models | 100 | 100 | 100 | 100 |  
game-history-page-filter.decorator.ts | 100 | 100 | 100 | 100 |  
index.ts | 100 | 100 | 100 | 100 |  
modules/game/controllers/models/requests | 100 | 100 | 100 | 100 |  
index.ts | 100 | 100 | 100 | 100 |  
join-game.request.ts | 100 | 100 | 100 | 100 |  
multi-choice-question-correct-answer.request.ts | 100 | 100 | 100 | 100 |  
pin-question-correct-answer-request.ts | 100 | 100 | 100 | 100 |  
puzzle-question-correct-answer-request.ts | 100 | 100 | 100 | 100 |  
range-question-correct-answer.request.ts | 100 | 100 | 100 | 100 |  
submit-multi-choice-question-answer.request.ts | 100 | 100 | 100 | 100 |  
submit-pin-question-answer.request.ts | 100 | 100 | 100 | 100 |  
submit-puzzle-question-answer.request.ts | 100 | 100 | 100 | 100 |  
submit-range-question-answer.request.ts | 100 | 100 | 100 | 100 |  
submit-true-false-question-answer.request.ts | 100 | 100 | 100 | 100 |  
submit-type-answer-question-answer.request.ts | 100 | 100 | 100 | 100 |  
true-false-question-correct-answer.request.ts | 100 | 100 | 100 | 100 |  
type-answer-question-correct-answer-request.ts | 100 | 100 | 100 | 100 |  
modules/game/controllers/models/response | 100 | 100 | 100 | 100 |  
create-game.response.ts | 100 | 100 | 100 | 100 |  
game-history-host.response.ts | 100 | 100 | 100 | 100 |  
game-history-player.response.ts | 100 | 100 | 100 | 100 |  
index.ts | 100 | 100 | 100 | 100 |  
paginated-game-history.response.ts | 100 | 100 | 100 | 100 |  
modules/game/exceptions | 100 | 100 | 100 | 100 |  
index.ts | 100 | 100 | 100 | 100 |  
nickname-not-unique.exception.ts | 100 | 100 | 100 | 100 |  
player-not-unique.exception.ts | 100 | 100 | 100 | 100 |  
modules/game/guards | 70.96 | 47.05 | 60 | 68.96 |  
game-auth.guard.ts | 70 | 47.05 | 60 | 67.85 | 65,74-81,131-141  
index.ts | 100 | 100 | 100 | 100 |  
modules/game/handlers | 100 | 100 | 100 | 100 |  
game.listener.ts | 100 | 100 | 100 | 100 |  
index.ts | 100 | 100 | 100 | 100 |  
modules/game/pipes | 71.42 | 40 | 100 | 68.42 |  
index.ts | 100 | 100 | 100 | 100 |  
parse-correct-answer-request.pipe.ts | 76.92 | 57.14 | 100 | 75 | 70-75,79  
parse-game-pin.pipe.ts | 100 | 100 | 100 | 100 |  
parse-submit-question-answer-request.pipe.ts | 53.84 | 14.28 | 100 | 50 | 49-60,64  
modules/game/services | 74.63 | 64.97 | 84.78 | 74.11 |  
game-expiry-scheduler.service.ts | 100 | 100 | 100 | 100 |  
game-task-transition-scheduler.ts | 70.09 | 56.09 | 90 | 69.52 | 70-80,139,190,201-204,249-305  
game-task-transition.service.ts | 51 | 48.43 | 45.45 | 50.5 | 66,69,73-74,78-79,103-237,252,282,303-327,343,351  
game.service.ts | 94.26 | 84.72 | 100 | 94.16 | 327-328,344-345,359-360,368  
index.ts | 100 | 100 | 100 | 100 |  
modules/game/services/utils | 100 | 100 | 100 | 100 |  
game.utils.ts | 100 | 100 | 100 | 100 |  
index.ts | 100 | 100 | 100 | 100 |  
modules/health | 100 | 100 | 100 | 100 |  
index.ts | 100 | 100 | 100 | 100 |  
modules/health/controllers | 81.25 | 100 | 25 | 78.57 |  
health.controller.ts | 80 | 100 | 25 | 76.92 | 26-31  
index.ts | 100 | 100 | 100 | 100 |  
modules/health/indicators | 71.42 | 100 | 50 | 66.66 |  
index.ts | 100 | 100 | 100 | 100 |  
redis-health.indicator.ts | 69.23 | 100 | 50 | 63.63 | 17-21  
modules/media | 100 | 100 | 100 | 100 |  
index.ts | 100 | 100 | 100 | 100 |  
modules/media/controllers | 100 | 100 | 100 | 100 |  
index.ts | 100 | 100 | 100 | 100 |  
media.controller.ts | 100 | 100 | 100 | 100 |  
modules/media/controllers/decorators/api | 100 | 100 | 100 | 100 |  
api-uploaded-photo-id-param.decorator.ts | 100 | 100 | 100 | 100 |  
index.ts | 100 | 100 | 100 | 100 |  
modules/media/controllers/decorators/route | 100 | 100 | 100 | 100 |  
index.ts | 100 | 100 | 100 | 100 |  
route-uploaded-photo-id-param.decroator.ts | 100 | 100 | 100 | 100 |  
modules/media/controllers/models | 100 | 100 | 100 | 100 |  
index.ts | 100 | 100 | 100 | 100 |  
media-photo-search-page-filter.decorator.ts | 100 | 100 | 100 | 100 |  
media-upload-photo.response.ts | 100 | 100 | 100 | 100 |  
paginated-media-photo-search.response.ts | 100 | 100 | 100 | 100 |  
modules/media/exceptions | 100 | 100 | 100 | 100 |  
index.ts | 100 | 100 | 100 | 100 |  
uploaded-photo-not-found.exception.ts | 100 | 100 | 100 | 100 |  
modules/media/pipes | 92.45 | 62.5 | 100 | 92.15 |  
index.ts | 100 | 100 | 100 | 100 |  
parse-image-file.pipe.ts | 92.3 | 62.5 | 100 | 92 | 67,71,127-128  
modules/media/services | 82.22 | 25 | 57.14 | 80.48 |  
index.ts | 100 | 100 | 100 | 100 |  
media.service.ts | 100 | 40 | 100 | 100 | 34-50  
pexels-media-search.service.ts | 46.66 | 0 | 0 | 38.46 | 24-61  
modules/media/services/models | 0 | 100 | 100 | 0 |  
index.ts | 0 | 100 | 100 | 0 | 1  
modules/quiz | 100 | 100 | 100 | 100 |  
index.ts | 100 | 100 | 100 | 100 |  
modules/quiz/controllers | 100 | 100 | 100 | 100 |  
index.ts | 100 | 100 | 100 | 100 |  
profile-quiz.controller.ts | 100 | 100 | 100 | 100 |  
quiz.controller.ts | 100 | 100 | 100 | 100 |  
modules/quiz/controllers/decorators/api | 96.01 | 90 | 92.68 | 96.34 |  
api-game-mode-property.decorator.ts | 100 | 100 | 100 | 100 |  
api-question-duration-property.decorator.ts | 100 | 100 | 100 | 100 |  
api-question-info-property.decorator.ts | 100 | 100 | 100 | 100 |  
api-question-media-property.decorator.ts | 88.23 | 75 | 100 | 93.75 | 41  
api-question-media-type-property.decorator.ts | 100 | 100 | 100 | 100 |  
api-question-media-url-property.decorator.ts | 100 | 100 | 100 | 100 |  
api-question-option-correct-property.decorator.ts | 100 | 100 | 100 | 100 |  
api-question-option-value-property.decorator.ts | 100 | 100 | 100 | 100 |  
api-question-options-property.decorator.ts | 87.5 | 100 | 50 | 87.5 | 35  
api-question-pin-image-url-property.decorator.ts | 100 | 100 | 100 | 100 |  
api-question-pin-position-x-property.decorator.ts | 100 | 100 | 100 | 100 |  
api-question-pin-position-y-property.decorator.ts | 100 | 100 | 100 | 100 |  
api-question-pin-tolerance-property.decorator.ts | 100 | 100 | 100 | 100 |  
api-question-points-property.decorator.ts | 100 | 100 | 100 | 100 |  
api-question-property.decorator.ts | 100 | 100 | 100 | 100 |  
api-question-puzzle-values-property.decorator.ts | 100 | 100 | 100 | 100 |  
api-question-range-answer-margin-property.decorator.ts | 100 | 100 | 100 | 100 |  
api-question-range-max-property.decorator.ts | 100 | 100 | 100 | 100 |  
api-question-range-min-property.decorator.ts | 100 | 100 | 100 | 100 |  
api-question-true-false-correct-property.decorator.ts | 100 | 100 | 100 | 100 |  
api-question-type-answer-options-property.decorator.ts | 100 | 100 | 100 | 100 |  
api-question-type-property.decorator.ts | 100 | 100 | 100 | 100 |  
api-quiz-category-property.decorator.ts | 100 | 100 | 100 | 100 |  
api-quiz-created-property.decorator.ts | 100 | 100 | 100 | 100 |  
api-quiz-description-property.decorator.ts | 100 | 100 | 100 | 100 |  
api-quiz-id-param.decorator.ts | 100 | 100 | 100 | 100 |  
api-quiz-id-property.decorator.ts | 100 | 100 | 100 | 100 |  
api-quiz-image-cover-property.decorator.ts | 100 | 100 | 100 | 100 |  
api-quiz-language-code-property.decorator.ts | 100 | 100 | 100 | 100 |  
api-quiz-title-property.decorator.ts | 100 | 100 | 100 | 100 |  
api-quiz-updated-property.decorator.ts | 100 | 100 | 100 | 100 |  
api-quiz-visibility-property.decorator.ts | 100 | 100 | 100 | 100 |  
in-range-validator.decorator.ts | 69.23 | 100 | 50 | 63.63 | 44-47  
index.ts | 100 | 100 | 100 | 100 |  
min-max-validator.dectorator.ts | 72.72 | 100 | 50 | 66.66 | 41-43  
modules/quiz/controllers/decorators/auth | 100 | 100 | 100 | 100 |  
authorized-quiz.decorator.ts | 100 | 100 | 100 | 100 |  
index.ts | 100 | 100 | 100 | 100 |  
modules/quiz/controllers/decorators/params | 100 | 100 | 100 | 100 |  
index.ts | 100 | 100 | 100 | 100 |  
route-quiz-id-param.decroator.ts | 100 | 100 | 100 | 100 |  
modules/quiz/controllers/models | 98.49 | 77.77 | 92.59 | 98.4 |  
index.ts | 100 | 100 | 100 | 100 |  
paginated-quiz.response.ts | 100 | 100 | 100 | 100 |  
public-quiz-page.filter.ts | 100 | 100 | 100 | 100 |  
question-media.ts | 100 | 100 | 100 | 100 |  
question-multi-choice-option.ts | 100 | 100 | 100 | 100 |  
question-multi-choice.ts | 100 | 100 | 100 | 100 |  
question-pin.ts | 100 | 100 | 100 | 100 |  
question-puzzle.ts | 100 | 100 | 100 | 100 |  
question-range.ts | 100 | 100 | 100 | 100 |  
question-true-false.ts | 100 | 100 | 100 | 100 |  
question-type-answer.ts | 100 | 100 | 100 | 100 |  
question-zero-to-one-hundred-range.ts | 100 | 100 | 100 | 100 |  
quiz-author.response.ts | 100 | 100 | 100 | 100 |  
quiz-classic.request.ts | 96.87 | 85.71 | 100 | 96.66 | 54  
quiz-page-query.filter.ts | 87.5 | 100 | 0 | 87.5 | 140,158  
quiz-zero-to-one-hundred.request.ts | 95.45 | 50 | 100 | 95 | 39  
quiz.response.ts | 100 | 100 | 100 | 100 |  
modules/quiz/controllers/utils | 100 | 100 | 100 | 100 |  
question-examples.utils.ts | 100 | 100 | 100 | 100 |  
modules/quiz/exceptions | 87.5 | 100 | 50 | 87.5 |  
index.ts | 100 | 100 | 100 | 100 |  
question-not-found.exception.ts | 66.66 | 100 | 0 | 66.66 | 13  
quiz-not-found.exception.ts | 100 | 100 | 100 | 100 |  
modules/quiz/guards | 100 | 92.3 | 100 | 100 |  
index.ts | 100 | 100 | 100 | 100 |  
quiz-auth.guard.ts | 100 | 92.3 | 100 | 100 | 66  
modules/quiz/pipes | 89.47 | 66.66 | 100 | 88.23 |  
index.ts | 100 | 100 | 100 | 100 |  
parse-quiz-request.pipe.ts | 88.88 | 66.66 | 100 | 87.5 | 34,38  
modules/quiz/repositories | 92.59 | 50 | 100 | 92 |  
index.ts | 100 | 100 | 100 | 100 |  
quiz.repository.ts | 92.3 | 50 | 100 | 91.66 | 118,135  
modules/quiz/repositories/models/schemas | 96.8 | 0 | 0 | 97.26 |  
index.ts | 100 | 100 | 100 | 100 |  
question.schema.ts | 95.38 | 0 | 0 | 95.65 | 44-46  
quiz.schema.ts | 100 | 100 | 100 | 100 |  
modules/quiz/services | 100 | 80 | 100 | 100 |  
index.ts | 100 | 100 | 100 | 100 |  
quiz.service.ts | 100 | 80 | 100 | 100 | 55,202-205,212-213,423,525  
modules/quiz/services/utils | 100 | 100 | 100 | 100 |  
index.ts | 100 | 100 | 100 | 100 |  
question.utils.ts | 100 | 100 | 100 | 100 |  
modules/token | 100 | 100 | 100 | 100 |  
index.ts | 100 | 100 | 100 | 100 |  
modules/token/exceptions | 100 | 100 | 100 | 100 |  
index.ts | 100 | 100 | 100 | 100 |  
token-not-found.exception.ts | 100 | 100 | 100 | 100 |  
modules/token/repositories | 100 | 100 | 100 | 100 |  
index.ts | 100 | 100 | 100 | 100 |  
token.repository.ts | 100 | 100 | 100 | 100 |  
modules/token/repositories/models/schemas | 100 | 100 | 100 | 100 |  
index.ts | 100 | 100 | 100 | 100 |  
token.schema.ts | 100 | 100 | 100 | 100 |  
modules/token/services | 95.12 | 83.33 | 100 | 94.87 |  
index.ts | 100 | 100 | 100 | 100 |  
token.service.ts | 95 | 83.33 | 100 | 94.73 | 240-241  
modules/token/services/utils | 100 | 100 | 100 | 100 |  
token.utils.ts | 100 | 100 | 100 | 100 |  
modules/user | 100 | 100 | 100 | 100 |  
index.ts | 100 | 100 | 100 | 100 |  
modules/user/controllers | 98.07 | 75 | 100 | 97.82 |  
index.ts | 100 | 100 | 100 | 100 |  
user-auth.controller.ts | 95.23 | 75 | 100 | 94.73 | 81  
user-profile.controller.ts | 100 | 100 | 100 | 100 |  
user.controller.ts | 100 | 100 | 100 | 100 |  
modules/user/controllers/models | 100 | 100 | 100 | 100 |  
auth-password-forgot.request.ts | 100 | 100 | 100 | 100 |  
auth-password-reset.request.ts | 100 | 100 | 100 | 100 |  
create-user.request.ts | 100 | 100 | 100 | 100 |  
create-user.response.ts | 100 | 100 | 100 | 100 |  
index.ts | 100 | 100 | 100 | 100 |  
update-google-user-profile.request.ts | 100 | 100 | 100 | 100 |  
update-local-user-profile.request.ts | 100 | 100 | 100 | 100 |  
user-profile.response.ts | 100 | 100 | 100 | 100 |  
modules/user/exceptions | 91.66 | 100 | 66.66 | 91.66 |  
bad-credentials.exception.ts | 100 | 100 | 100 | 100 |  
email-not-unique.exception.ts | 100 | 100 | 100 | 100 |  
index.ts | 100 | 100 | 100 | 100 |  
user-not-found.exception.ts | 66.66 | 100 | 0 | 66.66 | 10  
modules/user/pipes | 94.73 | 83.33 | 100 | 94.11 |  
index.ts | 100 | 100 | 100 | 100 |  
parse-update-user-profile-request.pipe.ts | 94.44 | 83.33 | 100 | 93.75 | 34  
modules/user/repositories | 87.23 | 66.66 | 100 | 86.66 |  
index.ts | 100 | 100 | 100 | 100 |  
user.repository.ts | 86.66 | 66.66 | 100 | 86.04 | 51,144,151-159,164,194  
modules/user/repositories/models | 100 | 100 | 100 | 100 |  
index.ts | 100 | 100 | 100 | 100 |  
modules/user/repositories/models/schemas | 100 | 100 | 100 | 100 |  
index.ts | 100 | 100 | 100 | 100 |  
user.schema.ts | 100 | 100 | 100 | 100 |  
modules/user/services | 88.07 | 82.35 | 100 | 87.75 |  
index.ts | 100 | 100 | 100 | 100 |  
user-event.handler.ts | 86.66 | 100 | 100 | 84.61 | 41-42  
user.service.ts | 88.05 | 82.35 | 100 | 87.87 | 81-85,132-133,286-287,337-338,374-375,427-428,455-456,477,493
modules/user/services/utils | 0 | 100 | 0 | 0 |  
index.ts | 0 | 100 | 100 | 0 | 1  
user.utils.ts | 0 | 100 | 0 | 0 | 1-4  
------------------------------------------------------------------------------|---------|----------|---------|---------|--------------------------------------------------------------

## Incremental Implementation Plan

### Phase 1: Zero-Coverage Files (Quick Wins)

#### Step 1.1: Configuration and Models

- [x] **app/config/index.ts** (0% lines) - Test configuration loading and exports
- [x] **modules/authentication/services/models/index.ts** (0% lines) - Test auth service model exports
- [x] **modules/game-event/services/models/event/index.ts** (0% lines) - Test event model exports
- [x] **modules/media/services/models/index.ts** (0% lines) - Test media service model exports
- [x] **modules/user/services/utils/index.ts** (0% lines) - Test utility exports

#### Step 1.2: Utility Functions

- [x] **modules/user/services/utils/user.utils.ts** (0% lines) - Test user utility functions
  - [x] Test data transformation functions
  - [x] Test edge cases (null/undefined inputs)
  - [x] Test error handling scenarios

### Phase 2: Critical Business Logic

#### Step 2.1: Game Task Orchestrator

- [x] **modules/game-core/orchestration/task/game-task-orchestrator.ts** (61.53% stmts, 54.54% lines)
  - [x] Test `buildQuestionTask()` with valid/invalid game documents
  - [x] Test `buildQuestionResultTask()` with various game states
  - [x] Test `rebuildQuestionResultTask()` edge cases
  - [x] Test `updateParticipantsAndBuildLeaderboard()` scoring logic
  - [x] Test `buildLeaderboardTask()` and `buildPodiumTask()` with different inputs
  - [x] Test error scenarios: illegal task types, missing data

#### Step 2.2: Game Task Transition Service

- [ ] **modules/game/services/game-task-transition.service.ts** (51% stmts, 50.5% lines)
  - [ ] Test transition callbacks for each task type
  - [ ] Test Redis integration for answer synchronization
  - [ ] Test error handling for Redis failures
  - [ ] Test task timing and delay calculations
  - [ ] Test game result creation and persistence

#### Step 2.3: External API Integration

- [ ] **modules/media/services/pexels-media-search.service.ts** (46.66% stmts, 38.46% lines)
  - [ ] Test successful photo search with various parameters
  - [ ] Test API error handling (401, 429, 500 responses)
  - [ ] Test pagination edge cases
  - [ ] Test empty search results
  - [ ] Test network timeout scenarios

### Phase 3: Security and Validation

#### Step 3.1: Authentication Guards

- [ ] **modules/game/guards/game-auth.guard.ts** (70% stmts, 67.85% lines)
  - [ ] Test valid game participant authorization
  - [ ] Test invalid participant scenarios
  - [ ] Test missing game document cases
  - [ ] Test player vs host permission checks

#### Step 3.2: Input Validation Pipes

- [ ] **modules/game/pipes/parse-submit-question-answer-request.pipe.ts** (53.84% stmts, 50% lines)
  - [ ] Test valid answer submissions for all question types
  - [ ] Test invalid answer formats
  - [ ] Test missing required fields
  - [ ] Test type conversion edge cases

### Phase 4: Infrastructure and Health

#### Step 4.1: Health Monitoring

- [ ] **modules/health/controllers/health.controller.ts** (80% stmts, 76.92% lines)
  - [ ] Test health endpoint responses
  - [ ] Test overall system health aggregation
- [ ] **modules/health/indicators/redis-health.indicator.ts** (69.23% stmts, 63.63% lines)
  - [ ] Test Redis connection status checks
  - [ ] Test Redis error scenarios

### Phase 5: Medium Priority Improvements

#### Step 5.1: Game Event Orchestration

- [ ] **modules/game-event/orchestration/event/game-event-orchestrator.ts** (70.09% stmts, 69.52% lines)
  - [ ] Test event orchestration logic (lines 220-229, 250-281, 314-327)
  - [ ] Test event distribution and validation

#### Step 5.2: Game Task Scheduling

- [ ] **modules/game/services/game-task-transition-scheduler.ts** (70.09% stmts, 69.52% lines)
  - [ ] Test scheduling logic (lines 70-80, 139, 190, 201-204, 249-305)
  - [ ] Test task timing and coordination

#### Step 5.3: Authentication Service Edge Cases

- [ ] **modules/authentication/services/auth.service.ts** (96.15% stmts, 96% lines)
  - [ ] Test password change edge cases (lines 153-156)
  - [ ] Test token refresh scenarios

#### Step 5.4: Game Service Edge Cases

- [ ] **modules/game/services/game.service.ts** (94.26% stmts, 94.16% lines)
  - [ ] Test game creation edge cases (lines 327-328, 344-345, 359-360, 368)

### Phase 6: Final Polish and Edge Cases

#### Step 6.1: Decorators and Guards

- [ ] **modules/authentication/controllers/decorators/ip-address.decorator.ts** (88.88% stmts, 88.88% lines)
  - [ ] Test IP address extraction edge cases (line 16)
- [ ] **modules/authentication/controllers/decorators/auth/jwt-payload.decorator.ts** (83.33% stmts, 83.33% lines)
  - [ ] Test JWT payload extraction (line 27)
- [ ] **modules/authentication/controllers/decorators/auth/principal-id.decorator.ts** (83.33% stmts, 83.33% lines)
  - [ ] Test principal ID extraction (line 38)
- [ ] **modules/authentication/controllers/decorators/auth/principal.decorator.ts** (83.33% stmts, 83.33% lines)
  - [ ] Test principal extraction (line 41)

#### Step 6.2: Repository and Database Layer

- [ ] **modules/game-core/repositories/game.repository.ts** (98.18% stmts, 98.11% lines)
  - [ ] Test repository edge cases (line 83)
- [ ] **modules/game-result/repositories/game-result.repository.ts** (83.33% stmts, 80% lines)
  - [ ] Test result repository edge cases (lines 50-53)
- [ ] **modules/quiz/repositories/quiz.repository.ts** (92.3% stmts, 91.66% lines)
  - [ ] Test quiz repository edge cases (lines 118, 135)

#### Step 6.3: Response Models and DTOs

- [ ] **modules/game-result/controllers/models/responses/game-result-classic-mode.response.ts** (87.5% stmts, 87.5% lines)
  - [ ] Test response model edge cases (lines 62, 90, 106)
- [ ] **modules/quiz/controllers/models/quiz-page-query.filter.ts** (87.5% stmts, 87.5% lines)
  - [ ] Test pagination filter edge cases (lines 140, 158)

## Coverage Hygiene Guidelines

### Coverage Thresholds

- **New files**: Minimum 90% statement coverage before merge
- **Critical business logic**: Minimum 95% statement coverage
- **Utility functions**: 100% coverage required
- **External integrations**: Minimum 90% coverage with error scenarios

### Testing Best Practices

- Mock external boundaries only: Database, Redis, HTTP clients, file I/O
- Prefer integration tests for service interactions
- Test error scenarios and edge cases, not just happy paths
- Use descriptive test names that explain the behavior being tested
- Avoid testing implementation details - focus on behavior and contracts

### Coverage Regression Prevention

- Add coverage gates in CI/CD pipelines
- Use pre-commit hooks for coverage checks
- Monitor coverage trends and set up alerts
- Update testing guidelines in AGENTS.md

### Suspicious Coverage Anomalies to Address

- **Index.ts files with 0% coverage**: Add simple export verification tests
- **Exception classes with partial coverage**: Test both instantiation and error messages
- **Schema files with low branch coverage**: Test validation decorators and constraints
