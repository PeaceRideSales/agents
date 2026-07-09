import { useQuery } from '@tanstack/react-query'
import { api } from '../api'

export function useLeaderboard() {
  return useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const data = await api.get('/agents/leaderboard')
      return data || []
    }
  })
}
