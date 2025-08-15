import { communityService } from '@/services/communityService';
import { useAuthStore } from '@/stores/useAuthStore';
import { useQuery } from '@tanstack/react-query';

export const useCommunityPost = (id: number) => {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: ['community', 'post', id, user?.id], // 사용자 ID를 쿼리 키에 포함
    queryFn: () => communityService.getPostById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5분
    gcTime: 1000 * 60 * 10, // 10분
  });
};
