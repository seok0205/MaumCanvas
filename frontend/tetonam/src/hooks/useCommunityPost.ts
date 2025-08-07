import { communityService } from '@/services/communityService';
import { useQuery } from '@tanstack/react-query';

export const useCommunityPost = (id: number) => {
  return useQuery({
    queryKey: ['community', 'post', id],
    queryFn: () => communityService.getPostById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5분
    gcTime: 1000 * 60 * 10, // 10분
  });
};
