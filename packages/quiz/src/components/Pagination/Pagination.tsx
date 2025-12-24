import type { FC } from 'react'
import { useMemo } from 'react'

import { IconButtonArrowLeft, IconButtonArrowRight } from '../Button'

import styles from './Pagination.module.scss'

export interface PaginationProps {
  total: number
  limit: number
  offset: number
  onChange?: (limit: number, offset: number) => void
}

const Pagination: FC<PaginationProps> = ({
  total,
  limit,
  offset,
  onChange,
}) => {
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / limit)),
    [total, limit],
  )
  const currentPage = useMemo(
    () => Math.max(1, Math.floor(offset / limit) + 1),
    [offset, limit],
  )

  if (totalPages > 1) {
    return (
      <div className={styles.pagination}>
        <div className={styles.navigation}>
          <IconButtonArrowLeft
            id="prev-page-button"
            type="button"
            kind="primary"
            size="normal"
            disabled={currentPage === 1}
            onClick={() => onChange?.(limit, Math.max(0, offset - limit))}
          />
        </div>
        <div className={styles.page}>
          Page {currentPage} of {totalPages}
        </div>
        <div className={styles.navigation}>
          <IconButtonArrowRight
            id="next-page-button"
            type="button"
            kind="primary"
            size="normal"
            disabled={currentPage >= totalPages}
            onClick={() => onChange?.(limit, Math.min(total, offset + limit))}
          />
        </div>
      </div>
    )
  }

  return null
}

export default Pagination
