import { SetMetadata } from '@nestjs/common'

import { SKIP_VALIDATION_KEY } from '../utils'

/**
 * Marks a class to be ignored by the ValidationPipe.
 */
export const SkipValidation = () => SetMetadata(SKIP_VALIDATION_KEY, true)
