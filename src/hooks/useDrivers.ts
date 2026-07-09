import { useQuery } from '@tanstack/react-query'
import { api } from '../api'
import type { Driver, DashboardStats } from '../types'

interface DriversResponse {
  stats: DashboardStats;
  drivers: Driver[];
}

export function useMyDrivers(token: string) {
  return useQuery<DriversResponse>({
    queryKey: ['myDrivers', token],
    queryFn: async () => {
      if (!token) throw new Error('No token');
      const data = await api.get('/drivers/me');
      return {
        stats: data.stats,
        drivers: data.drivers || []
      };
    },
    enabled: !!token,
  })
}
