import { useParams } from 'react-router-dom';

import { AppSidebar } from '@/components/layout/AppSidebar';
import { CommonHeader } from '@/components/layout/CommonHeader';
import { ErrorModal } from '@/components/ui/feedback/error-modal';
import { RadioGroup, RadioGroupItem } from '@/components/ui/forms/radio-group';
import { Button } from '@/components/ui/interactive/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/layout/card';
import {
  MobileSidebarToggle,
  SidebarProvider,
} from '@/components/ui/navigation/sidebar';
import { Label } from '@/components/ui/primitives/label';
import { QUESTIONNAIRE_MESSAGES } from '@/constants/questionnaire';
import { useQuestionnaireForm } from '@/hooks/useQuestionnaireForm';
import { useAuthStore } from '@/stores/useAuthStore';
import {
  accessibilityProps,
  getProgressBarWidth,
  questionnaireStyles,
} from '@/styles/questionnaire';
import { Loader2 } from 'lucide-react';

// 진행률 컴포넌트 타입 정의
interface ProgressDisplayProps {
  answeredCount: number;
  totalCount: number;
  progressPercentage: number;
}

// 단일 책임 원칙을 준수하는 진행률 컴포넌트
const ProgressDisplay = ({
  answeredCount,
  totalCount,
  progressPercentage,
}: ProgressDisplayProps) => (
  <div className={questionnaireStyles.progress.container}>
    <div className='flex justify-between items-center mb-3'>
      <span className={questionnaireStyles.progress.text.label}>
        {QUESTIONNAIRE_MESSAGES.PROGRESS_LABEL}
      </span>
      <span className={questionnaireStyles.progress.text.count}>
        {answeredCount}/{totalCount}
      </span>
    </div>
    <div
      className={questionnaireStyles.progress.bar.container}
      {...accessibilityProps.progressBar}
      aria-valuenow={progressPercentage}
      aria-valuemax={100}
    >
      <div
        className={`${questionnaireStyles.progress.bar.fill} ${getProgressBarWidth(progressPercentage)}`}
        style={{ width: `${progressPercentage}%` }}
      />
    </div>
  </div>
);

// 질문 카드 컴포넌트 타입 정의
interface QuestionCardProps {
  question: {
    id: number;
    text: string;
    options: Array<{
      text: string;
      score: number;
    }>;
  };
  questionIndex: number;
  currentResponse:
    | {
        questionId: number;
        selectedScore: number;
      }
    | undefined;
  onOptionChange: (questionId: number, score: number) => void;
}

const QuestionCard = ({
  question,
  questionIndex,
  currentResponse,
  onOptionChange,
}: QuestionCardProps) => (
  <Card
    className={`${questionnaireStyles.card.base} ${
      currentResponse?.selectedScore !== -1
        ? questionnaireStyles.card.answered
        : questionnaireStyles.card.unanswered
    }`}
    {...accessibilityProps.questionCard}
    aria-labelledby={`question-title-${question.id}`}
  >
    <CardHeader className='pb-4'>
      <div className='flex items-start gap-4'>
        <div
          className={`${questionnaireStyles.questionNumber.base} ${
            currentResponse?.selectedScore !== -1
              ? questionnaireStyles.questionNumber.answered
              : questionnaireStyles.questionNumber.unanswered
          }`}
        >
          {questionIndex + 1}
        </div>
        <div className='flex-1'>
          <CardTitle
            id={`question-title-${question.id}`}
            className='text-lg font-semibold text-foreground leading-relaxed'
          >
            {question.text}
          </CardTitle>
        </div>
      </div>
    </CardHeader>
    <CardContent className='pt-0'>
      <RadioGroup
        onValueChange={(value: string) =>
          onOptionChange(question.id, parseInt(value))
        }
        value={currentResponse?.selectedScore.toString() || ''}
        className='grid gap-3'
        {...accessibilityProps.radioGroup}
        aria-labelledby={`question-title-${question.id}`}
      >
        {question.options.map((option, optionIndex: number) => (
          <div
            key={optionIndex}
            className={`${questionnaireStyles.option.base} ${
              currentResponse?.selectedScore === option.score
                ? questionnaireStyles.option.selected
                : questionnaireStyles.option.unselected
            }`}
          >
            <RadioGroupItem
              value={option.score.toString()}
              id={`option-${question.id}-${optionIndex}`}
              className='mt-0.5'
            />
            <Label
              htmlFor={`option-${question.id}-${optionIndex}`}
              className='flex-1 text-sm font-medium cursor-pointer leading-relaxed'
            >
              {option.text}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </CardContent>
  </Card>
);

// 메인 컴포넌트 (단일 책임: UI 조합만 담당)
export const QuestionnaireForm = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const { user } = useAuthStore();

  // 비즈니스 로직은 커스텀 훅으로 분리
  const {
    category,
    responses,
    isLoading,
    error,
    answeredQuestions,
    progressPercentage,
    isAllAnswered,
    handleOptionChange,
    handleSubmit,
    clearError,
  } = useQuestionnaireForm({ categoryId });

  // 계산된 값들
  const totalQuestions = category?.questions.length || 0;
  const canSubmit = isAllAnswered;

  // 로딩 상태와 에러 상태는 early return으로 처리
  if (isLoading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <div className='flex-1 flex flex-col'>
          <CommonHeader user={user || { name: null, roles: [] }} />
          <main className={questionnaireStyles.main}>
            <div className={questionnaireStyles.container}>
              <div className='flex items-center justify-center h-64'>
                <div className='flex items-center gap-3'>
                  <Loader2 className='h-6 w-6 animate-spin text-primary' />
                  <span className='text-lg font-medium text-foreground'>
                    {QUESTIONNAIRE_MESSAGES.LOADING}
                  </span>
                </div>
              </div>
            </div>
          </main>
        </div>

        {/* 모바일 사이드바 토글 버튼 - 왼쪽 하단 고정 */}
        <MobileSidebarToggle />
      </SidebarProvider>
    );
  }

  if (!category) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <div className='flex-1 flex flex-col'>
          <CommonHeader user={user || { name: null, roles: [] }} />
          <main className={questionnaireStyles.main}>
            <div className={questionnaireStyles.container}>
              <div className='text-center py-12'>
                <h2 className='text-xl font-semibold text-foreground mb-2'>
                  설문을 찾을 수 없습니다
                </h2>
                <p className='text-muted-foreground'>
                  요청하신 설문 카테고리를 찾을 수 없습니다. 다시 시도해 주세요.
                </p>
              </div>
            </div>
          </main>
        </div>

        {/* 모바일 사이드바 토글 버튼 - 왼쪽 하단 고정 */}
        <MobileSidebarToggle />
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <div className='flex-1 flex flex-col'>
        <CommonHeader user={user || { name: null, roles: [] }} />
        <main className={questionnaireStyles.main}>
          <div className={questionnaireStyles.container}>
            {/* 헤더 영역 */}
            <div className='mb-8'>
              <h1 className={questionnaireStyles.header.title}>
                {category.title}
              </h1>

              {/* 대질문 강조 영역 */}
              <div className='bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-4 mt-4'>
                <div className='flex items-start gap-3'>
                  <div className='flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center mt-0.5'>
                    <svg
                      className='w-3.5 h-3.5 text-white'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                      aria-hidden='true'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                      />
                    </svg>
                  </div>
                  <div className='flex-1'>
                    <h2 className='text-sm font-semibold text-blue-800 mb-1'>
                      설문 안내
                    </h2>
                    <p className='text-gray-900 text-base font-medium leading-relaxed'>
                      {category.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 진행률 표시 */}
            <ProgressDisplay
              answeredCount={answeredQuestions}
              totalCount={totalQuestions}
              progressPercentage={progressPercentage}
            />

            {/* 질문 리스트 */}
            <div className='space-y-6 mt-8'>
              {category.questions.map((question, index) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  questionIndex={index}
                  currentResponse={responses.find(
                    r => r.questionId === question.id
                  )}
                  onOptionChange={handleOptionChange}
                />
              ))}
            </div>

            {/* 제출 버튼 */}
            <div className='sticky bottom-0 bg-background pt-6 pb-8 mt-12'>
              <div className='flex justify-center'>
                <Button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  size='lg'
                  className={questionnaireStyles.submitButton}
                >
                  {QUESTIONNAIRE_MESSAGES.SUBMIT_BUTTON_TEXT}
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* 모바일 사이드바 토글 버튼 - 왼쪽 하단 고정 */}
      <MobileSidebarToggle />

      {/* 에러 모달 */}
      <ErrorModal
        isOpen={!!error}
        onClose={clearError}
        title={QUESTIONNAIRE_MESSAGES.VALIDATION_ERROR_TITLE}
        message={error || ''}
        type='error'
      />
    </SidebarProvider>
  );
};
