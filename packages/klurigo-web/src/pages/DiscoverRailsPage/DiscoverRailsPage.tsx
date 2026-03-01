import { useQuery } from '@tanstack/react-query'
import type { FC } from 'react'

import { useKlurigoServiceClient } from '../../api'

import { DiscoverRailsPageUI } from './components'

/**
 * Container component for the discovery rails page.
 *
 * Fetches discovery data via React Query using the `['discover']` query
 * key and delegates rendering to DiscoverRailsPageUI.
 */
const DiscoverRailsPage: FC = () => {
  const { getDiscovery } = useKlurigoServiceClient()

  const { data, isLoading } = useQuery({
    queryKey: ['discover'],
    queryFn: () => getDiscovery(),
  })

  return (
    <DiscoverRailsPageUI
      sections={data?.sections ?? []}
      isLoading={isLoading}
    />
  )
}

export default DiscoverRailsPage
