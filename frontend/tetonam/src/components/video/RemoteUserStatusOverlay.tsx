import { MicOff, User, VideoOff } from 'lucide-react';

interface RemoteUserStatusOverlayProps {
  hasVideo: boolean;
  hasAudio: boolean;
  userName?: string;
  isVisible: boolean;
}

export const RemoteUserStatusOverlay = ({
  hasVideo,
  hasAudio,
  userName,
  isVisible,
}: RemoteUserStatusOverlayProps) => {
  if (hasVideo || !isVisible) return null;

  return (
    <div className='absolute inset-0 flex flex-col items-center justify-center bg-gray-900'>
      <div className='flex flex-col items-center space-y-6'>
        {/* 사용자 아바타 */}
        <div className='relative'>
          <div className='w-32 h-32 bg-gray-700 rounded-full flex items-center justify-center border-4 border-gray-600'>
            <User className='w-16 h-16 text-gray-400' />
          </div>

          {/* 비디오 끄기 아이콘 */}
          <div className='absolute -bottom-2 -right-2 w-12 h-12 bg-red-600 rounded-full flex items-center justify-center border-2 border-gray-900'>
            <VideoOff className='w-6 h-6 text-white' />
          </div>
        </div>

        {/* 사용자 정보 */}
        <div className='text-center space-y-2'>
          <p className='text-white text-xl font-semibold'>
            {userName || '상대방'}
          </p>
          <p className='text-gray-400 text-sm'>카메라가 꺼져있습니다</p>
        </div>

        {/* 음소거 상태 표시 */}
        {!hasAudio && (
          <div className='flex items-center space-x-2 px-4 py-2 bg-red-600/90 rounded-full backdrop-blur-sm'>
            <MicOff className='w-5 h-5 text-white' />
            <span className='text-white text-sm font-medium'>음소거</span>
          </div>
        )}
      </div>
    </div>
  );
};
