import type { QuizResponseDto } from '@klurigo/common'
import { useQuery } from '@tanstack/react-query'
import { type FC, useCallback, useState } from 'react'

import { useKlurigoServiceClient } from '../../api'
import type { FilterOptions } from '../../components/QuizTableFilter'

import { DiscoverRailsPageUI } from './components'

/** Default number of quiz cards fetched per page during search. */
const DEFAULT_SEARCH_LIMIT = 20

/**
 * Returns true when the filter has at least one active criterion.
 */
const isFilterActive = (filter: FilterOptions): boolean =>
  !!(filter.search || filter.category || filter.languageCode || filter.mode)

/**
 * Container component for the discovery rails page.
 *
 * Fetches discovery rails data via React Query using the `['discover']` query
 * key and delegates rendering to DiscoverRailsPageUI. When a search filter is
 * active, fetches public quizzes instead and renders a grid results view.
 */
const DiscoverRailsPage: FC = () => {
  const { getDiscovery, getPublicQuizzes } = useKlurigoServiceClient()

  const [filter, setFilter] = useState<FilterOptions>({})
  const [searchOffset, setSearchOffset] = useState(0)
  const [allSearchResults, setAllSearchResults] = useState<QuizResponseDto[]>(
    [],
  )
  const [searchTotal, setSearchTotal] = useState(0)

  const filterActive = isFilterActive(filter)

  const { data: railsData, isLoading: isRailsLoading } = useQuery({
    queryKey: ['discover'],
    queryFn: () => getDiscovery(),
    enabled: !filterActive,
  })

  const { isLoading: isSearchLoading } = useQuery({
    queryKey: [
      'publicQuizzes',
      filter.search,
      filter.category,
      filter.languageCode,
      filter.mode,
      filter.sort,
      filter.order,
      DEFAULT_SEARCH_LIMIT,
      searchOffset,
    ],
    queryFn: async () => {
      const data = await getPublicQuizzes({
        search: filter.search,
        mode: filter.mode,
        category: filter.category,
        languageCode: filter.languageCode,
        sort: filter.sort,
        order: filter.order,
        limit: DEFAULT_SEARCH_LIMIT,
        offset: searchOffset,
      })
      setSearchTotal(data.total)
      setAllSearchResults((prev) =>
        searchOffset === 0 ? data.results : [...prev, ...data.results],
      )
      return data
    },
    enabled: filterActive,
    retry: false,
  })

  const handleFilterChange = useCallback((next: FilterOptions) => {
    setFilter(next)
    setSearchOffset(0)
    setAllSearchResults([])
    setSearchTotal(0)
  }, [])

  const handleClearFilter = useCallback(() => {
    setFilter({})
    setSearchOffset(0)
    setAllSearchResults([])
    setSearchTotal(0)
  }, [])

  const handleLoadMore = useCallback(() => {
    setSearchOffset((prev) => prev + DEFAULT_SEARCH_LIMIT)
  }, [])

  const hasMore =
    filterActive && searchOffset + allSearchResults.length < searchTotal

  return (
    <DiscoverRailsPageUI
      sections={railsData?.sections ?? []}
      isLoading={isRailsLoading}
      filter={filter}
      onFilterChange={handleFilterChange}
      onClearFilter={handleClearFilter}
      searchResults={allSearchResults}
      isSearchLoading={isSearchLoading && searchOffset === 0}
      hasMore={hasMore}
      onLoadMore={handleLoadMore}
    />
  )
}

export default DiscoverRailsPage
