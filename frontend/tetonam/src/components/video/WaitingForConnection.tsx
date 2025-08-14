import { Loader2, Users, Wifi } from 'lucide-react';

interface WaitingForConnectionProps {
  isConnecting: boolean;
  isConnected: boolean;
  hasRemoteUsers: boolean;
  networkQuality?: number;
}

export const WaitingForConnection = ({
  isConnecting,
  isConnected,
  hasRemoteUsers,
  networkQuality,
}: WaitingForConnectionProps) => {
  // 연결되어 있고 상대방이 있으면 표시하지 않음
  if (isConnected && hasRemoteUsers) return null;

  const getNetworkQualityColor = (quality?: number) => {
    if (!quality) return 'text-gray-400';
    if (quality >= 4) return 'text-green-500';
    if (quality >= 2) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getNetworkQualityText = (quality?: number) => {
    if (!quality) return '연결 확인 중';
    if (quality >= 4) return '네트워크 상태 양호';
    if (quality >= 2) return '네트워크 상태 보통';
    return '네트워크 상태 불량';
  };

  return (
    <div className='absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm'>
      <div className='text-center space-y-8 max-w-md px-6'>
        {/* 메인 아이콘과 메시지 */}
        {isConnecting ? (
          <>
            <div className='relative'>
              <Loader2 className='w-16 h-16 text-blue-500 animate-spin mx-auto' />
              <div className='absolute inset-0 w-16 h-16 border-4 border-blue-500/20 rounded-full mx-auto animate-pulse'></div>
            </div>
            <div className='space-y-3'>
              <h3 className='text-white text-2xl font-bold'>연결 중입니다</h3>
              <p className='text-gray-300 text-base leading-relaxed'>
                화상 통화 서버에 연결하고 있습니다.
                <br />
                잠시만 기다려주세요...
              </p>
            </div>
          </>
        ) : (
          <>
            <div className='relative'>
              <div className='w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto'>
                <Users className='w-8 h-8 text-blue-500' />
              </div>
              <div className='absolute -top-1 -right-1 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center animate-pulse'>
                <span className='text-white text-xs font-bold'>!</span>
              </div>
            </div>
            <div className='space-y-3'>
              <h3 className='text-white text-2xl font-bold'>
                상대방을 기다리고 있습니다
              </h3>
              <p className='text-gray-300 text-base leading-relaxed'>
                상대방이 화상 통화에 참여할 때까지
                <br />
                기다려주세요
              </p>
            </div>
          </>
        )}

        {/* 네트워크 상태 표시 */}
        {isConnected && (
          <div className='flex items-center justify-center space-x-2 px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm'>
            <Wifi
              className={`w-4 h-4 ${getNetworkQualityColor(networkQuality)}`}
            />
            <span
              className={`text-sm font-medium ${getNetworkQualityColor(networkQuality)}`}
            >
              {getNetworkQualityText(networkQuality)}
            </span>
          </div>
        )}

        {/* 힌트 메시지 */}
        <div className='text-center'>
          <p className='text-gray-500 text-sm'>💡 화면을 새로고침하지 마세요</p>
        </div>
      </div>
    </div>
  );
};
