# UI Components 폴더 구조 가이드

## 📁 폴더별 분류

### forms/

폼 입력과 관련된 모든 컴포넌트

- `input.tsx` - 기본 입력 필드
- `textarea.tsx` - 텍스트 영역
- `select.tsx` - 선택 박스
- `checkbox.tsx` - 체크박스
- `radio-group.tsx` - 라디오 버튼 그룹
- `form.tsx` - 폼 컨테이너
- `input-otp.tsx` - OTP 입력
- `switch.tsx` - 토글 스위치
- `slider.tsx` - 슬라이더

### layout/

레이아웃과 구조 관련 컴포넌트

- `card.tsx` - 카드 컨테이너
- `aspect-ratio.tsx` - 종횡비 컨테이너
- `separator.tsx` - 구분선
- `resizable.tsx` - 크기 조절 가능한 컨테이너
- `scroll-area.tsx` - 스크롤 영역
- `skeleton.tsx` - 로딩 스켈레톤

### navigation/

네비게이션 관련 컴포넌트

- `breadcrumb.tsx` - 브레드크럼
- `navigation-menu.tsx` - 네비게이션 메뉴
- `pagination.tsx` - 페이지네이션
- `sidebar.tsx` - 사이드바
- `menubar.tsx` - 메뉴바

### feedback/

사용자에게 피드백을 제공하는 컴포넌트

- `alert.tsx` - 알림
- `alert-dialog.tsx` - 알림 다이얼로그
- `toast.tsx` - 토스트 메시지
- `toaster.tsx` - 토스트 컨테이너
- `sonner.tsx` - 토스트 라이브러리
- `progress.tsx` - 진행률 표시
- `badge.tsx` - 배지

### overlay/

오버레이 형태의 컴포넌트

- `dialog.tsx` - 다이얼로그
- `drawer.tsx` - 드로어
- `sheet.tsx` - 시트
- `popover.tsx` - 팝오버
- `tooltip.tsx` - 툴팁
- `hover-card.tsx` - 호버 카드
- `context-menu.tsx` - 컨텍스트 메뉴
- `dropdown-menu.tsx` - 드롭다운 메뉴

### data-display/

데이터를 표시하는 컴포넌트

- `table.tsx` - 테이블
- `calendar.tsx` - 캘린더
- `chart.tsx` - 차트
- `carousel.tsx` - 캐러셀
- `tabs.tsx` - 탭
- `accordion.tsx` - 아코디언
- `collapsible.tsx` - 접을 수 있는 컨테이너

### interactive/

사용자 상호작용 컴포넌트

- `button.tsx` - 버튼
- `toggle.tsx` - 토글
- `toggle-group.tsx` - 토글 그룹
- `command.tsx` - 명령어 팔레트

### primitives/

기본적인 UI 요소

- `avatar.tsx` - 아바타
- `label.tsx` - 라벨

## 📝 사용 가이드

### Import 경로

```typescript
// 기존
import { Button } from '@/components/ui/button';

// 새로운 구조
import { Button } from '@/components/ui/interactive/button';
import { Input } from '@/components/ui/forms/input';
import { Card } from '@/components/ui/layout/card';
```

### Cursor 메모리 활용

각 폴더의 컴포넌트들을 Cursor에 메모리로 등록하여 자동완성과 빠른 접근이 가능합니다:

```typescript
// forms 폴더의 모든 컴포넌트를 메모리에 등록
// - input.tsx, textarea.tsx, select.tsx, checkbox.tsx, radio-group.tsx, form.tsx, input-otp.tsx, switch.tsx, slider.tsx

// layout 폴더의 모든 컴포넌트를 메모리에 등록
// - card.tsx, aspect-ratio.tsx, separator.tsx, resizable.tsx, scroll-area.tsx, skeleton.tsx

// navigation 폴더의 모든 컴포넌트를 메모리에 등록
// - breadcrumb.tsx, navigation-menu.tsx, pagination.tsx, sidebar.tsx, menubar.tsx

// feedback 폴더의 모든 컴포넌트를 메모리에 등록
// - alert.tsx, alert-dialog.tsx, toast.tsx, toaster.tsx, sonner.tsx, progress.tsx, badge.tsx

// overlay 폴더의 모든 컴포넌트를 메모리에 등록
// - dialog.tsx, drawer.tsx, sheet.tsx, popover.tsx, tooltip.tsx, hover-card.tsx, context-menu.tsx, dropdown-menu.tsx

// data-display 폴더의 모든 컴포넌트를 메모리에 등록
// - table.tsx, calendar.tsx, chart.tsx, carousel.tsx, tabs.tsx, accordion.tsx, collapsible.tsx

// interactive 폴더의 모든 컴포넌트를 메모리에 등록
// - button.tsx, toggle.tsx, toggle-group.tsx, command.tsx

// primitives 폴더의 모든 컴포넌트를 메모리에 등록
// - avatar.tsx, label.tsx
```

## 🔄 마이그레이션 단계

1. **새 폴더 구조 생성**
2. **컴포넌트 이동**
3. **Import 경로 업데이트**
4. **Index 파일 생성**
5. **테스트 실행**

## ⚠️ 주의사항

- 기존 import 경로를 사용하는 모든 파일을 업데이트해야 합니다
- 테스트 파일도 함께 이동해야 합니다
- TypeScript 경로 매핑을 업데이트할 수 있습니다
