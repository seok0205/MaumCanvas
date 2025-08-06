import React, { useState } from 'react';

/**
 * 청소년 친화적 컬러 팔레트 데모 컴포넌트
 * 청소년을 대상으로 하는 정신건강 플랫폼을 위한
 * 따뜻하고 청소년 친화적인 색상 시스템의 완전한 구현을 보여줍니다.
 */
export const YouthColorPalette: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<string>('buttons');
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    feedback: '',
  });

  const colorPalette = [
    { name: 'Youth Orange', class: 'bg-youth-orange', hex: '#FFC107' },
    { name: 'Youth Gold', class: 'bg-youth-gold', hex: '#FFD700' },
    { name: 'Youth Yellow', class: 'bg-youth-yellow', hex: '#FFEB99' },
    { name: 'Youth Cream', class: 'bg-youth-cream', hex: '#FFEFD5' },
    {
      name: 'Youth Light Yellow',
      class: 'bg-youth-light-yellow',
      hex: '#FFFACD',
    },
    { name: 'Youth Green', class: 'bg-youth-green', hex: '#A3C9A8' },
    { name: 'Youth Light Pink', class: 'bg-youth-light-pink', hex: '#FFE4E1' },
    { name: 'Youth Light Blue', class: 'bg-youth-light-blue', hex: '#E6F3FF' },
  ];

  const tabs = [
    { id: 'buttons', label: '버튼' },
    { id: 'cards', label: '카드' },
    { id: 'forms', label: '폼' },
    { id: 'states', label: '상태' },
  ];

  const counselors = [
    { id: 1, name: '김미소 상담사', specialty: '청소년 심리', rating: 4.9 },
    { id: 2, name: '이희망 상담사', specialty: '학습 스트레스', rating: 4.8 },
    { id: 3, name: '박따뜻 상담사', specialty: '대인관계', rating: 4.9 },
  ];

  return (
    <div className='min-h-screen bg-gradient-youth-warm p-8'>
      <div className='max-w-6xl mx-auto'>
        {/* 헤더 */}
        <div className='bg-gradient-youth-header rounded-2xl p-8 mb-8 shadow-youth'>
          <h1 className='text-4xl font-bold text-gray-800 mb-4'>
            🎨 청소년 친화적 컬러 팔레트 시스템
          </h1>
          <p className='text-lg text-gray-700'>
            청소년 정신건강 플랫폼을 위해 특별히 설계된 따뜻하고 차분한 파스텔톤
          </p>
        </div>

        {/* 컬러 팔레트 표시 */}
        <div className='card-youth mb-8'>
          <h2 className='text-2xl font-bold mb-6 text-gray-800'>
            핵심 컬러 팔레트
          </h2>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            {colorPalette.map(color => (
              <div key={color.name} className='text-center'>
                <div
                  className={`${color.class} h-20 w-full rounded-xl mb-2 shadow-youth transition-youth hover:shadow-youth-hover hover:scale-105`}
                />
                <p className='font-medium text-gray-800'>{color.name}</p>
                <p className='text-sm text-gray-600'>{color.hex}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 네비게이션 탭 */}
        <div className='flex flex-wrap gap-2 mb-8'>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={
                selectedTab === tab.id ? 'tab-youth-active' : 'tab-youth'
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 탭 콘텐츠 */}
        <div className='space-y-8'>
          {/* 버튼 섹션 */}
          {selectedTab === 'buttons' && (
            <div className='card-youth'>
              <h3 className='text-xl font-bold mb-6 text-gray-800'>
                버튼 컴포넌트
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {/* 기본 버튼 */}
                <div>
                  <h4 className='font-semibold mb-3 text-gray-700'>
                    기본 액션
                  </h4>
                  <div className='space-y-3'>
                    <button className='btn-youth-primary w-full touch-target'>
                      예약하기
                    </button>
                    <button className='btn-youth-primary w-full touch-target'>
                      상담 시작하기
                    </button>
                    <button className='btn-youth-primary w-full touch-target'>
                      진단 받기
                    </button>
                  </div>
                </div>

                {/* 보조 버튼 */}
                <div>
                  <h4 className='font-semibold mb-3 text-gray-700'>
                    보조 액션
                  </h4>
                  <div className='space-y-3'>
                    <button className='btn-youth-secondary w-full touch-target'>
                      자세히 보기
                    </button>
                    <button className='btn-youth-secondary w-full touch-target'>
                      나중에 하기
                    </button>
                    <button className='btn-youth-secondary w-full touch-target'>
                      취소하기
                    </button>
                  </div>
                </div>

                {/* 성공 버튼 */}
                <div>
                  <h4 className='font-semibold mb-3 text-gray-700'>
                    성공 액션
                  </h4>
                  <div className='space-y-3'>
                    <button className='btn-youth-success w-full touch-target'>
                      완료하기
                    </button>
                    <button className='btn-youth-success w-full touch-target'>
                      확인하기
                    </button>
                    <button className='btn-youth-success w-full touch-target'>
                      저장하기
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 카드 섹션 */}
          {selectedTab === 'cards' && (
            <div className='card-youth'>
              <h3 className='text-xl font-bold mb-6 text-gray-800'>
                카드 컴포넌트
              </h3>

              {/* 상담사 카드 */}
              <div className='mb-8'>
                <h4 className='font-semibold mb-4 text-gray-700'>
                  상담사 카드
                </h4>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  {counselors.map(counselor => (
                    <div
                      key={counselor.id}
                      onClick={() => setSelectedCard(counselor.id)}
                      className={
                        selectedCard === counselor.id
                          ? 'card-youth-selected cursor-pointer'
                          : 'card-counselor cursor-pointer'
                      }
                    >
                      <div className='flex items-center space-x-4 mb-3'>
                        <div className='w-12 h-12 bg-youth-green rounded-full flex items-center justify-center'>
                          <span className='text-white font-bold'>
                            {counselor.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h5 className='font-semibold text-gray-800'>
                            {counselor.name}
                          </h5>
                          <p className='text-sm text-gray-600'>
                            {counselor.specialty}
                          </p>
                        </div>
                      </div>
                      <div className='flex items-center justify-between'>
                        <span className='badge-youth-success'>
                          ⭐ {counselor.rating}
                        </span>
                        <span className='text-sm text-youth-orange font-medium'>
                          예약 가능
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 진행률 카드 */}
              <div className='mb-8'>
                <h4 className='font-semibold mb-4 text-gray-700'>
                  진행 상황 카드
                </h4>
                <div className='card-youth max-w-md'>
                  <h5 className='font-semibold mb-3 text-gray-800'>
                    심리 검사 진행도
                  </h5>
                  <div className='progress-youth mb-3'>
                    <div
                      className='progress-youth-fill'
                      style={{ width: '65%' }}
                    />
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span className='text-gray-600'>13/20 완료</span>
                    <span className='text-youth-orange font-medium'>65%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 폼 섹션 */}
          {selectedTab === 'forms' && (
            <div className='card-youth'>
              <h3 className='text-xl font-bold mb-6 text-gray-800'>
                폼 컴포넌트
              </h3>

              <div className='max-w-md space-y-6'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    이름
                  </label>
                  <input
                    type='text'
                    value={formData.name}
                    onChange={e =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className='input-youth w-full focus-youth'
                    placeholder='이름을 입력해주세요'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    이메일
                  </label>
                  <input
                    type='email'
                    value={formData.email}
                    onChange={e =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className='input-youth w-full focus-youth'
                    placeholder='이메일을 입력해주세요'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    피드백
                  </label>
                  <textarea
                    value={formData.feedback}
                    onChange={e =>
                      setFormData({ ...formData, feedback: e.target.value })
                    }
                    className='input-youth w-full h-24 resize-none focus-youth'
                    placeholder='피드백을 남겨주세요'
                  />
                </div>

                <button className='btn-youth-primary w-full'>제출하기</button>
              </div>
            </div>
          )}

          {/* 상태 섹션 */}
          {selectedTab === 'states' && (
            <div className='card-youth'>
              <h3 className='text-xl font-bold mb-6 text-gray-800'>
                상태 기반 컴포넌트
              </h3>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                {/* 상태 배지 */}
                <div>
                  <h4 className='font-semibold mb-4 text-gray-700'>
                    상태 배지
                  </h4>
                  <div className='space-y-3'>
                    <div className='flex items-center space-x-3'>
                      <span className='badge-youth-success'>완료됨</span>
                      <span className='text-sm text-gray-600'>
                        상담 세션이 성공적으로 완료되었습니다
                      </span>
                    </div>
                    <div className='flex items-center space-x-3'>
                      <span className='badge-youth-warning'>주의 필요</span>
                      <span className='text-sm text-gray-600'>
                        추가 상담이 권장됩니다
                      </span>
                    </div>
                    <div className='flex items-center space-x-3'>
                      <span className='badge-youth-info'>정보</span>
                      <span className='text-sm text-gray-600'>
                        새로운 상담사가 배정되었습니다
                      </span>
                    </div>
                    <div className='flex items-center space-x-3'>
                      <span className='badge-youth-pending'>대기 중</span>
                      <span className='text-sm text-gray-600'>
                        상담사 확인을 기다리고 있습니다
                      </span>
                    </div>
                  </div>
                </div>

                {/* 상태 카드 */}
                <div>
                  <h4 className='font-semibold mb-4 text-gray-700'>
                    상태 카드
                  </h4>
                  <div className='space-y-3'>
                    <div className='state-success p-4 rounded-xl'>
                      <p className='font-medium'>✅ 진단 완료</p>
                      <p className='text-sm opacity-90'>
                        결과를 확인하실 수 있습니다
                      </p>
                    </div>
                    <div className='state-warning p-4 rounded-xl'>
                      <p className='font-medium'>⚠️ 주의사항</p>
                      <p className='text-sm opacity-90'>
                        약속 시간을 확인해주세요
                      </p>
                    </div>
                    <div className='state-info p-4 rounded-xl'>
                      <p className='font-medium'>💡 안내</p>
                      <p className='text-sm opacity-90'>
                        새로운 기능이 추가되었습니다
                      </p>
                    </div>
                    <div className='state-pending p-4 rounded-xl'>
                      <p className='font-medium'>⏳ 처리 중</p>
                      <p className='text-sm opacity-90'>잠시만 기다려주세요</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className='mt-12 text-center text-gray-600'>
          <p className='text-sm'>
            🌟 청소년 친화적 색상 시스템 - 청소년 정신건강 플랫폼을 위한 설계
          </p>
          <p className='text-xs mt-2'>
            따뜻한 파스텔톤 • 접근성 준수 • 터치 친화적 디자인
          </p>
        </div>
      </div>
    </div>
  );
};

export default YouthColorPalette;
