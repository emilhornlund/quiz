# Leaderboard & Podium Enhancements Implementation Plan

## Overview

This document outlines the implementation of Task 8: Leaderboard & Podium Enhancements from the GAMEPLAY_IMPROVEMENT_PLAN.md. The goal is to add dramatic reveal animations, celebration effects, and enhanced visual feedback to the leaderboard and podium components.

## Current State Analysis

### Existing Components

- **Podium Component**: Has basic staggered entrance animations (`fadeInDown`, `riseUp`) with proper responsive design
- **Leaderboard Component**: Has basic `slideInFromBottom` animation with staggered delays and color-coded rows
- **Confetti Component**: Already implemented with celebration patterns we can follow
- **PlayerResultState**: Already has celebration logic with Badge and Confetti integration

### Files to Modify

- `packages/quiz/src/components/Podium/Podium.tsx`
- `packages/quiz/src/components/Podium/Podium.module.scss`
- `packages/quiz/src/components/Leaderboard/Leaderboard.tsx`
- `packages/quiz/src/components/Leaderboard/Leaderboard.module.scss`
- `packages/common/src/models/game-event.ts` (add rank change prop)
- `packages/quiz/src/states/PlayerPodiumState/PlayerPodiumState.tsx`

## Implementation Tasks

**Important Note**: All remaining tasks must include Storybook updates to showcase new functionality:

- Update relevant `.stories.tsx` files to demonstrate new features
- Add new stories for enhanced animations and celebrations
- Ensure stories include new props (like `previousPosition`) where applicable

### Task 1: Add Rank Change Support to SSE Event ✅

- [x] Add `previousPosition?: number` to `GameLeaderboardHostEvent` in packages/common/src/models/game-event.ts
- [x] Build common package to make changes available
- [x] Add unit tests for updated event type
- [x] Document new optional prop for future backend implementation

**Implementation Details:**

- Added optional `previousPosition?: number` to leaderboard entries in `GameLeaderboardHostEvent`
- Created comprehensive unit tests covering scenarios with and without previous positions
- Built common package successfully with TypeScript compilation
- All linting rules satisfied with proper import ordering
- Frontend is now ready for backend implementation of rank change tracking

### Task 2: Enhance Leaderboard Animations with Unit Tests ✅

- [x] Update Leaderboard.module.scss with enhanced reveal animations
- [x] Add dramatic reveal keyframes with scale and bounce effects
- [x] Implement count-up animation for scores using CSS
- [x] Add position-specific reveal delays
- [x] Update Leaderboard.tsx to support rank change indicators
- [x] Add comprehensive unit tests for all new animation classes
- [x] Add tests for rank change detection logic
- [x] Update Leaderboard.stories.tsx with rank change examples
- [x] Update HostLeaderboardState.stories.tsx with previousPosition prop

**Implementation Details:**

- Enhanced `slideInFromBottom` to `dramaticReveal` with scale and bounce effects
- Added `countUp`, `rankChange`, and `positionScale` keyframe animations
- Created `RankChange` component with up/down arrows and change amounts
- Added `previousPosition?: number` to LeaderboardProps interface
- Enhanced top positions (1-3) with special animations and styling
- Added 19 comprehensive unit tests covering all scenarios
- Updated Storybook stories to showcase rank changes with various scenarios
- All linting rules satisfied and tests passing
- Backward compatible - works with and without `previousPosition` data

### Task 1: Add Rank Change Support to SSE Event ✅

- [x] Add `previousPosition?: number` to `GameLeaderboardHostEvent` in packages/common/src/models/game-event.ts
- [x] Build common package to make changes available
- [x] Add unit tests for the updated event type
- [x] Document the new optional prop for future backend implementation

**Implementation Details:**

- Added optional `previousPosition?: number` to leaderboard entries in `GameLeaderboardHostEvent`
- Created comprehensive unit tests covering scenarios with and without previous positions
- Built common package successfully with TypeScript compilation
- All linting rules satisfied with proper import ordering
- Frontend is now ready for backend implementation of rank change tracking

### Task 2: Enhance Leaderboard Animations with Unit Tests ✅

- [x] Update Leaderboard.module.scss with enhanced reveal animations
- [x] Add dramatic reveal keyframes with scale and bounce effects
- [x] Implement count-up animation for scores using CSS
- [x] Add position-specific reveal delays
- [x] Update Leaderboard.tsx to support rank change indicators
- [x] Add comprehensive unit tests for all new animation classes
- [x] Add tests for rank change detection logic

**Implementation Details:**

- Enhanced `slideInFromBottom` to `dramaticReveal` with scale and bounce effects
- Added `countUp`, `rankChange`, and `positionScale` keyframe animations
- Created `RankChange` component with up/down arrows and change amounts
- Added `previousPosition?: number` to LeaderboardProps interface
- Enhanced top positions (1-3) with special animations and styling
- Added 19 comprehensive unit tests covering all scenarios
- All linting rules satisfied and tests passing
- Backward compatible - works with and without `previousPosition` data

### Task 3: Enhance Podium with Celebration Effects and Unit Tests

- [ ] Update Podium.module.scss with enhanced animations
- [ ] Add trophy effects using CSS pseudo-elements (no new component needed)
- [ ] Add sparkle effects using existing animation patterns
- [ ] Implement crown effect for 1st place using CSS
- [ ] Update Podium.tsx to integrate Confetti component for 1st place
- [ ] Add celebration sequence timing
- [ ] Add comprehensive unit tests for celebration triggers
- [ ] Add tests for animation sequences
- [ ] Update Podium.stories.tsx to showcase new celebration effects
- [ ] Update HostPodiumState.stories.tsx to include celebration examples

### Task 4: Mirror PlayerResultState Celebrations in PlayerPodiumState

- [ ] Add celebration logic to PlayerPodiumState (mirroring PlayerResultState)
- [ ] Import and integrate Confetti component for podium positions
- [ ] Add Badge celebration animations for top positions
- [ ] Add unit tests for celebration triggers in PlayerPodiumState
- [ ] Test celebration levels for different podium positions
- [ ] Update PlayerPodiumState.stories.tsx to showcase celebration effects
- [ ] Update PlayerPodiumState.test.tsx to include celebration tests

### Task 5: Update State Components with Unit Tests

- [ ] Add celebration triggers to `HostPodiumState`
- [ ] Add rank change animations to `HostLeaderboardState`
- [ ] Ensure proper cleanup and performance
- [ ] Add integration tests for state component updates
- [ ] Test SSE timing preservation during animations
- [ ] Update HostPodiumState.stories.tsx to showcase celebration triggers
- [ ] Update HostLeaderboardState.stories.tsx to showcase rank changes

## Technical Implementation Details

### Animation Sequences

#### Leaderboard Reveal Sequence:

1. Background rows slide in with stagger (0.3s intervals)
2. Position numbers scale in with bounce effect (0.2s after rows)
3. Player names fade in smoothly (0.1s after positions)
4. Scores count up with animation (0.1s after names)
5. Rank change indicators animate in (0.2s after scores)
6. Achievement badges pop in (0.2s after rank changes)

#### Podium Celebration Sequence:

1. Existing entrance animations play as normal
2. After 1s delay: sparkle effects trigger for winners
3. Trophy effects appear using CSS pseudo-elements (1.2s)
4. Crown effect appears on 1st place (1.5s)
5. Confetti burst for 1st place winner (2s)

#### PlayerPodiumState Celebration Sequence:

1. Badge appears with celebration animation based on position
2. Confetti triggers for top positions (mirroring PlayerResultState logic)
3. Position-specific celebration levels (epic for 1st, major for 2nd, normal for 3rd)

### CSS Animation Enhancements

#### New Keyframes to Add:

```scss
// Enhanced dramatic reveal
@keyframes dramaticReveal {
  0% {
    opacity: 0;
    transform: translateY(50px) scale(0.8);
  }
  60% {
    opacity: 1;
    transform: translateY(-10px) scale(1.05);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

// Trophy effect using pseudo-elements
@keyframes trophyShine {
  0%,
  100% {
    opacity: 0;
    transform: scale(0) rotate(0deg);
  }
  50% {
    opacity: 1;
    transform: scale(1) rotate(180deg);
  }
}

// Sparkle particle effect
@keyframes sparkle {
  0%,
  100% {
    opacity: 0;
    transform: scale(0) rotate(0deg);
  }
  50% {
    opacity: 1;
    transform: scale(1) rotate(180deg);
  }
}

// Count-up animation for scores
@keyframes countUp {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

// Rank change indicator animation
@keyframes rankChange {
  0% {
    opacity: 0;
    transform: translateX(-20px) scale(0.8);
  }
  60% {
    opacity: 1;
    transform: translateX(5px) scale(1.1);
  }
  100% {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}
```

### Component Architecture

#### Enhanced Leaderboard Features:

- Rank change detection using `previousPosition` prop
- Rank change indicators (up/down arrows) using CSS
- Achievement badge integration
- Smooth position transitions
- Personal best highlighting

#### Enhanced Podium Features:

- Trophy effects using CSS pseudo-elements (no new component)
- Sparkle effects using existing animation patterns
- Crown effect for 1st place using CSS
- Confetti integration for 1st place
- Position-specific celebration intensities

#### Enhanced PlayerPodiumState Features:

- Celebration logic mirroring PlayerResultState
- Badge celebration animations for podium positions
- Confetti integration for top positions
- Position-based celebration levels

### Performance Considerations

- Use GPU-accelerated transforms (`translate3d`, `scale`)
- Implement proper cleanup in useEffect hooks
- Limit particle counts following Confetti component patterns
- Use CSS animations over JavaScript where possible
- Test on lower-end devices
- Maintain 60fps animation performance

### Accessibility

- Respect `prefers-reduced-motion` settings
- Provide ARIA labels for animated elements
- Ensure keyboard navigation works with enhanced components
- Test with screen readers

### Integration Points

#### State Components to Update:

- `HostPodiumState` - Add celebration triggers
- `PlayerPodiumState` - Add celebration effects mirroring PlayerResultState
- `HostLeaderboardState` - Add rank change animations

#### SSE Event Enhancement:

- `GameLeaderboardHostEvent` - Add optional `previousPosition` prop for rank changes

#### Existing Patterns to Follow:

- Confetti component pattern for celebrations
- CSS custom properties for animation delays
- SSE event timing preservation
- Existing responsive design patterns
- PlayerResultState celebration logic for PlayerPodiumState

## Success Metrics

### User Experience:

- Enhanced engagement through dramatic reveals
- Improved satisfaction with celebratory effects
- Better visual hierarchy for rankings
- Consistent celebration experience across host and player views

### Technical:

- Smooth 60fps animations on target devices
- Zero interference with SSE event timing
- Accessibility compliance (WCAG 2.1)
- No performance regressions
- Clean separation of concerns (frontend ready for backend changes)

### Code Quality:

- All linting rules satisfied
- 100% test coverage for new functionality
- Clean compilation with TypeScript
- Follows existing code patterns
- Incremental testing with each task

## Testing Strategy

### Automated Testing (Per Task):

- **Task 1**: Unit tests for updated SSE event type
- **Task 2**: Unit tests for leaderboard animations and rank change logic
- **Task 3**: Unit tests for podium celebration triggers and sequences
- **Task 4**: Unit tests for PlayerPodiumState celebration logic
- **Task 5**: Integration tests for state component updates

### Manual Testing:

- Visual testing of all animation sequences
- Cross-device testing (mobile, tablet, desktop)
- Browser compatibility testing
- SSE timing validation during animations
- Accessibility testing with screen readers

## Timeline Estimate

- **Task 1**: 1 hour (SSE event update + tests + build)
- **Task 2**: 2.5 hours (Leaderboard enhancements + comprehensive tests)
- **Task 3**: 2.5 hours (Podium enhancements + comprehensive tests)
- **Task 4**: 2 hours (PlayerPodiumState celebrations + tests)
- **Task 5**: 1.5 hours (State component integration + tests)

**Total Estimated Time**: ~9.5 hours

## Dependencies

- Existing Confetti component (for celebration patterns)
- Existing animation utilities in animations.scss and transitions.scss
- Existing color system in colors.scss
- Existing responsive design patterns
- PlayerResultState celebration logic (for mirroring)

## Risks and Mitigations

### Risk 1: Animation Performance Issues

- **Mitigation**: Use GPU-accelerated transforms, follow Confetti component patterns, test on lower-end devices

### Risk 2: SSE Event Timing Interference

- **Mitigation**: Ensure animations don't block event handling, use non-blocking CSS animations

### Risk 3: Accessibility Concerns

- **Mitigation**: Respect `prefers-reduced-motion`, provide ARIA labels, test with screen readers

### Risk 4: Backend Dependency

- **Mitigation**: Make `previousPosition` optional, frontend ready for backend implementation

### Risk 5: Browser Compatibility

- **Mitigation**: Use widely supported CSS properties, provide fallbacks where needed

---

_This plan will be updated as implementation progresses and any challenges are encountered._
