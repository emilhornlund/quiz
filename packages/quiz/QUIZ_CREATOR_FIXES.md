# Quiz Creator Data Model & Validation Issues Fix Plan

This document outlines all identified issues in the quiz creation system's data model and validation, with specific implementation fixes for each problem.

## 🔴 Critical Issues

### - [X] 1. Fix Unsafe Type Casting in QuizCreatorPage.tsx

**Problem**: Title is force-cast to string without null checking.

**File**: `packages/quiz/src/pages/QuizCreatorPage/QuizCreatorPage.tsx:139-155`

**Current Code**:

```typescript
const requestData = {
  title: quizSettings.title as string, // Unsafe cast
  visibility: quizSettings.visibility ?? QuizVisibility.Public,
  // ...
}
```

**Fix**:

```typescript
const handleSaveQuiz = () => {
  if (!allQuizSettingsValid || !allQuestionsValid) {
    return
  }

  // Add validation check before creating request data
  if (!quizSettings.title?.trim()) {
    return // Title is required and should be validated
  }

  const requestData = {
    title: quizSettings.title.trim(),
    description: quizSettings.description?.trim(),
    visibility: quizSettings.visibility ?? QuizVisibility.Public,
    category: quizSettings.category ?? QuizCategory.Other,
    imageCoverURL: quizSettings.imageCoverURL,
    languageCode: quizSettings.languageCode ?? LanguageCode.English,
    mode: gameMode as GameMode,
    questions: questions.map(({ data }) => data) as
      | (
          | QuestionMultiChoiceDto
          | QuestionRangeDto
          | QuestionTrueFalseDto
          | QuestionTypeAnswerDto
        )[]
      | QuestionZeroToOneHundredRangeDto[],
  } as QuizRequestDto
  // ... rest of the function
}
```

### - [ ] 2. Fix Inconsistent Validation Initialization

**Problem**: Different fields start with different validation states.

**File**: `packages/quiz/src/pages/QuizCreatorPage/utils/QuizSettingsDataSource/quiz-settings-data-source.hook.tsx:21-33`

**Current Code**:

```typescript
const [model, setModel] = useState<QuizSettingsDataSourceValidationModel>({
  data: {
    category: QuizCategory.Other,
    visibility: QuizVisibility.Public,
    languageCode: LanguageCode.English,
  },
  validation: {
    title: false, // Starts as invalid
    category: true, // Starts as valid
    visibility: true, // Starts as valid
    languageCode: true, // Starts as valid
  },
})
```

**Fix**:

```typescript
const [model, setModel] = useState<QuizSettingsDataSourceValidationModel>({
  data: {
    category: QuizCategory.Other,
    visibility: QuizVisibility.Public,
    languageCode: LanguageCode.English,
  },
  validation: {
    title: false, // Title should be validated
    description: true, // Description is optional, start as valid
    imageCoverURL: true, // Image cover is optional, start as valid
    category: true, // Has default value, start as valid
    visibility: true, // Has default value, start as valid
    languageCode: true, // Has default value, start as valid
  },
})
```

## 🟡 Medium Issues

### - [ ] 3. Fix Question Type Switching Bug

**Problem**: When switching question types in ZeroToOneHundred mode, mode is incorrectly set to Classic.

**File**: `packages/quiz/src/pages/QuizCreatorPage/utils/QuestionDataSource/question-data-source.hook.tsx:356-370`

**Current Code**:

```typescript
} else if (currentQuestion.mode === GameMode.ZeroToOneHundred) {
  if (type === QuestionType.Range) {
    updatedQuestions[selectedIndex] = {
      mode: GameMode.Classic, // ❌ Wrong! Should stay ZeroToOneHundred
      data: {
        type,
        question: currentQuestion.data.question,
        media: currentQuestion.data.media,
        correct: 0,
        duration: currentQuestion.data.duration,
        info: currentQuestion.data.info,
      },
      validation: {},
    }
  }
}
```

**Fix**:

```typescript
} else if (currentQuestion.mode === GameMode.ZeroToOneHundred) {
  if (type === QuestionType.Range) {
    updatedQuestions[selectedIndex] = {
      mode: GameMode.ZeroToOneHundred, // ✅ Correct: Stay in ZeroToOneHundred mode
      data: {
        type,
        question: currentQuestion.data.question,
        media: currentQuestion.data.media,
        correct: 0,
        duration: currentQuestion.data.duration,
        info: currentQuestion.data.info,
      },
      validation: {},
    }
  }
}
```

### - [ ] 4. Add Image Cover URL Validation

**Problem**: No direct URL format validation for imageCoverURL field.

**File**: `packages/quiz/src/pages/QuizCreatorPage/components/QuizCreatorPageUI/components/QuizSettingsModal/QuizSettingsModal.tsx:191-196`

**Current Code**:

```typescript
onChange={(value) =>
  value &&
  value.type === MediaType.Image &&
  onValueChange('imageCoverURL', value.url)
}
onValid={(valid) => onValidChange('imageCoverURL', valid)}
```

**Fix**: Add URL validation utility and apply it:

1. First, create a URL validation utility:

```typescript
// Add to the top of the file
import { URL_REGEX } from '../../../../../../models'

// Helper function to validate URL
const isValidImageUrl = (url: string): boolean => {
  if (!url || url.trim() === '') return true // Empty is valid (optional field)
  return URL_REGEX.test(url)
}
```

2. Update the onChange handler:

```typescript
onChange={(value) => {
  if (value && value.type === MediaType.Image) {
    const isValid = isValidImageUrl(value.url)
    onValueChange('imageCoverURL', value.url)
    onValidChange('imageCoverURL', isValid)
  }
}}
```

### - [ ] 5. Fix Validation Reset Issues

**Problem**: When replacing questions, validation is completely reset instead of preserving valid fields.

**File**: `packages/quiz/src/pages/QuizCreatorPage/utils/QuestionDataSource/question-data-source.hook.tsx:278,292,322,338,352`

**Current Code**: All question type replacements reset validation to empty object:

```typescript
validation: {}, // Always reset to empty object
```

**Fix**: Preserve existing validation for common fields:

```typescript
const replaceQuestion = useCallback(
  (type: QuestionType) => {
    setModel((prevModel) => {
      const { selectedIndex, questions } = prevModel

      if (!isValidIndex(selectedIndex)) {
        throw new Error('Invalid question index')
      }

      const currentQuestion = questions[selectedIndex]
      const updatedQuestions = [...questions]

      // Preserve validation for common fields
      const preservedValidation = {
        question: currentQuestion.validation.question,
        points: currentQuestion.validation.points,
        duration: currentQuestion.validation.duration,
        info: currentQuestion.validation.info,
      }

      if (currentQuestion.mode === GameMode.Classic) {
        if (type === QuestionType.MultiChoice) {
          updatedQuestions[selectedIndex] = {
            mode: GameMode.Classic,
            data: {
              type,
              question: currentQuestion.data.question,
              options: [],
              points: currentQuestion.data.points,
              duration: currentQuestion.data.duration,
              info: currentQuestion.data.info,
            },
            validation: preservedValidation, // ✅ Preserve common field validation
          }
        }
        // ... Apply similar pattern to all other question types
      }

      return {
        ...prevModel,
        questions: updatedQuestions,
      }
    })
  },
  [isValidIndex],
)
```

## 🟢 Minor Issues

### - [ ] 6. Add Error Handling for API Calls

**Problem**: No error handling for failed API requests.

**File**: `packages/quiz/src/pages/QuizCreatorPage/QuizCreatorPage.tsx:159-167`

**Current Code**:

```typescript
if (quizId) {
  updateQuiz(quizId, requestData)
    .then(() => navigate('/profile/quizzes'))
    .finally(() => setIsSavingQuiz(false))
} else {
  createQuiz(requestData)
    .then(() => navigate('/profile/quizzes'))
    .finally(() => setIsSavingQuiz(false))
}
```

**Fix**:

```typescript
const [error, setError] = useState<string | null>(null)

const handleSaveQuiz = () => {
  if (!allQuizSettingsValid || !allQuestionsValid) {
    return
  }

  // ... existing validation code ...

  setError(null) // Clear previous errors
  setIsSavingQuiz(true)

  const saveOperation = quizId
    ? updateQuiz(quizId, requestData)
    : createQuiz(requestData)

  saveOperation
    .then(() => navigate('/profile/quizzes'))
    .catch((err) => {
      setError(err.message || 'Failed to save quiz. Please try again.')
      console.error('Quiz save error:', err)
    })
    .finally(() => setIsSavingQuiz(false))
}

// Add error display in the component JSX:
{error && (
  <div className={styles.errorMessage}>
    {error}
  </div>
)}
```

### - [ ] 7. Centralize Default Values

**Problem**: Default values are duplicated between constants and components.

**Files**: Multiple locations with hardcoded defaults

**Fix**: Create a defaults configuration file:

1. Create `packages/quiz/src/pages/QuizCreatorPage/utils/quiz-defaults.ts`:

```typescript
import {
  GameMode,
  QuizCategory,
  QuizVisibility,
  LanguageCode,
} from '@quiz/common'

export const QUIZ_DEFAULTS = {
  title: '',
  description: '',
  imageCoverURL: undefined,
  visibility: QuizVisibility.Public,
  category: QuizCategory.Other,
  languageCode: LanguageCode.English,
  mode: GameMode.Classic,
} as const

export const QUESTION_DEFAULTS = {
  Classic: {
    points: 1000,
    duration: 30,
    info: undefined,
  },
  ZeroToOneHundred: {
    duration: 30,
    info: undefined,
  },
} as const
```

2. Update `quiz-settings-data-source.hook.tsx`:

```typescript
import { QUIZ_DEFAULTS } from '../quiz-defaults'

const [model, setModel] = useState<QuizSettingsDataSourceValidationModel>({
  data: {
    ...QUIZ_DEFAULTS,
  },
  validation: {
    title: false,
    description: true,
    imageCoverURL: true,
    category: true,
    visibility: true,
    languageCode: true,
  },
})
```

3. Update `QuizCreatorPage.tsx`:

```typescript
import { QUIZ_DEFAULTS } from './utils/quiz-defaults'

const requestData = {
  title: quizSettings.title || QUIZ_DEFAULTS.title,
  visibility: quizSettings.visibility || QUIZ_DEFAULTS.visibility,
  category: quizSettings.category || QUIZ_DEFAULTS.category,
  languageCode: quizSettings.languageCode || QUIZ_DEFAULTS.languageCode,
  mode: gameMode || QUIZ_DEFAULTS.mode,
  // ... rest of fields
}
```

### - [ ] 8. Add Missing Validation State Types

**Problem**: Type system doesn't reflect actual validation tracking.

**File**: `packages/quiz/src/pages/QuizCreatorPage/utils/QuizSettingsDataSource/quiz-settings-data-source.types.ts:49-52`

**Current Code**:

```typescript
export type QuizSettingsDataSourceValidationModel = {
  data: Partial<QuizSettingsData>
  validation: { [key in keyof QuizSettingsData]?: boolean }
}
```

**Fix**:

```typescript
export type QuizSettingsDataSourceValidationModel = {
  data: Partial<QuizSettingsData>
  validation: {
    title?: boolean
    description?: boolean
    imageCoverURL?: boolean
    category?: boolean
    visibility?: boolean
    languageCode?: boolean
  }
}
```

## 📋 Testing Checklist

After implementing these fixes, ensure the following tests pass:

- [ ] Quiz creation with all fields valid
- [ ] Quiz creation with missing title (should fail validation)
- [ ] Quiz creation with invalid image URL (should fail validation)
- [ ] Quiz editing in both Classic and ZeroToOneHundred modes
- [ ] Question type switching in both game modes
- [ ] Error handling display when API calls fail
- [ ] Form validation state persistence during editing
- [ ] Default value application for optional fields

## 🚀 Implementation Order

1. **Start with Critical Issues** (fixes 1-2)
2. **Move to Medium Issues** (fixes 3-5)
3. **Complete Minor Issues** (fixes 6-8)
4. **Run full test suite** to ensure no regressions
5. **Manual testing** of the complete quiz creation flow

This comprehensive fix plan addresses all identified data model and validation issues while maintaining backward compatibility and improving the overall robustness of the quiz creation system.
