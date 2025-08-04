import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  Heart,
  Info,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { AppSidebar } from '@/components/layout/AppSidebar';
import { Button } from '@/components/ui/interactive/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/layout/card';
import {
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/navigation/sidebar';
import {
  getQuestionnaireCategory,
  getQuestionnaireResultLevel,
} from '@/constants/questionnaire';
import type { QuestionnaireResult as QuestionnaireResultType } from '@/types/questionnaire';

export const QuestionnaireResult = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [result, setResult] = useState<QuestionnaireResultType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const dataParam = searchParams.get('data');
      if (!dataParam || !categoryId) {
        setError('결과 데이터를 찾을 수 없습니다.');
        return;
      }

      const submission = JSON.parse(decodeURIComponent(dataParam));
      const category = getQuestionnaireCategory(categoryId);

      if (!category) {
        setError('카테고리를 찾을 수 없습니다.');
        return;
      }

      const level = getQuestionnaireResultLevel(category, submission.score);

      if (!level) {
        setError('결과 수준을 계산할 수 없습니다.');
        return;
      }

      const questionnaireResult: QuestionnaireResultType = {
        category: submission.category,
        score: submission.score,
        responses: submission.responses,
        level: level,
        submittedAt: new Date(),
      };

      setResult(questionnaireResult);
    } catch (err) {
      setError('결과 데이터를 처리하는 중 오류가 발생했습니다.');
    }
  }, [searchParams, categoryId]);

  const getLevelIcon = (level: string) => {
    switch (level) {
      case '정상':
      case '낮음':
        return <CheckCircle className='h-8 w-8 text-green-500' />;
      case '경미':
      case '보통':
        return <Info className='h-8 w-8 text-blue-500' />;
      case '중간':
      case '높음':
        return <AlertTriangle className='h-8 w-8 text-orange-500' />;
      case '심각':
      case '매우 높음':
      case '심함':
        return <AlertTriangle className='h-8 w-8 text-red-500' />;
      default:
        return <Info className='h-8 w-8 text-gray-500' />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case '정상':
      case '낮음':
        return 'text-green-600 bg-green-50 border-green-200';
      case '경미':
      case '보통':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case '중간':
      case '높음':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case '심각':
      case '매우 높음':
      case '심함':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const handleBackToDiagnosis = () => {
    navigate('/diagnosis');
  };

  const handleRetakeQuestionnaire = () => {
    navigate(`/questionnaire/${categoryId}`);
  };

  if (error) {
    return (
      <SidebarProvider>
        <div className='flex w-full min-h-screen bg-gradient-warm'>
          <AppSidebar />
          <div className='flex flex-1 flex-col'>
            <header className='border-b border-border/50 bg-card/80 shadow-card backdrop-blur-sm rounded-2xl mx-4 mt-4'>
              <div className='flex items-center justify-between px-4 py-4'>
                <div className='flex items-center space-x-4'>
                  <SidebarTrigger className='mr-2' />
                  <div className='flex items-center space-x-2'>
                    <Heart className='h-5 w-5 text-primary' />
                    <span className='font-bold text-lg text-foreground'>
                      마음 캔버스
                    </span>
                  </div>
                </div>
              </div>
            </header>

            <main className='flex-1 overflow-auto p-6 max-w-4xl mx-auto'>
              <Card className='w-full'>
                <CardContent className='text-center py-12'>
                  <AlertTriangle className='h-16 w-16 text-red-500 mx-auto mb-4' />
                  <h2 className='text-2xl font-bold text-foreground mb-2'>
                    오류가 발생했습니다
                  </h2>
                  <p className='text-muted-foreground mb-6'>{error}</p>
                  <Button onClick={handleBackToDiagnosis}>
                    진단 목록으로 돌아가기
                  </Button>
                </CardContent>
              </Card>
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  if (!result) {
    return (
      <SidebarProvider>
        <div className='flex w-full min-h-screen bg-gradient-warm'>
          <AppSidebar />
          <div className='flex flex-1 flex-col'>
            <header className='border-b border-border/50 bg-card/80 shadow-card backdrop-blur-sm rounded-2xl mx-4 mt-4'>
              <div className='flex items-center justify-between px-4 py-4'>
                <div className='flex items-center space-x-4'>
                  <SidebarTrigger className='mr-2' />
                  <div className='flex items-center space-x-2'>
                    <Heart className='h-5 w-5 text-primary' />
                    <span className='font-bold text-lg text-foreground'>
                      마음 캔버스
                    </span>
                  </div>
                </div>
              </div>
            </header>

            <main className='flex-1 overflow-auto p-6 max-w-4xl mx-auto'>
              <Card className='w-full'>
                <CardContent className='text-center py-12'>
                  <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4'></div>
                  <p className='text-muted-foreground'>결과를 불러오는 중...</p>
                </CardContent>
              </Card>
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className='flex w-full min-h-screen bg-gradient-warm'>
        <AppSidebar />
        <div className='flex flex-1 flex-col'>
          <header className='border-b border-border/50 bg-card/80 shadow-card backdrop-blur-sm rounded-2xl mx-4 mt-4'>
            <div className='flex items-center justify-between px-4 py-4'>
              <div className='flex items-center space-x-4'>
                <SidebarTrigger className='mr-2' />
                <div className='flex items-center space-x-2'>
                  <Heart className='h-5 w-5 text-primary' />
                  <span className='font-bold text-lg text-foreground'>
                    마음 캔버스
                  </span>
                </div>
              </div>
            </div>
          </header>

          <main className='flex-1 overflow-auto p-6 max-w-4xl mx-auto'>
            <Card className='w-full'>
              <CardHeader className='text-center'>
                <div className='flex justify-center mb-4'>
                  {getLevelIcon(result.level.level)}
                </div>
                <CardTitle className='text-3xl font-bold text-foreground mb-2'>
                  설문 결과
                </CardTitle>
                <CardDescription className='text-lg text-muted-foreground'>
                  {result.category === 'ptsd' && '외상 후 스트레스 증상'}
                  {result.category === 'depression' && '우울증상'}
                  {result.category === 'anxiety' && '불안증상'}
                  {result.category === 'suicide-risk' && '자살위험성'}
                </CardDescription>
              </CardHeader>

              <CardContent className='space-y-6'>
                {/* 점수 섹션 */}
                <div className='text-center'>
                  <div className='inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mb-4'>
                    <span className='text-3xl font-bold text-primary'>
                      {result.score}
                    </span>
                  </div>
                  <p className='text-sm text-muted-foreground'>총점</p>
                </div>

                {/* 수준 섹션 */}
                <div
                  className={`p-4 rounded-lg border ${getLevelColor(result.level.level)}`}
                >
                  <div className='flex items-center space-x-3 mb-2'>
                    {getLevelIcon(result.level.level)}
                    <h3 className='text-xl font-semibold'>
                      {result.level.level}
                    </h3>
                  </div>
                  <p className='text-sm leading-relaxed'>
                    {result.level.description}
                  </p>
                </div>

                {/* 권장사항 */}
                {result.level.recommendation && (
                  <div className='p-4 rounded-lg border border-orange-200 bg-orange-50'>
                    <h4 className='font-semibold text-orange-800 mb-2'>
                      권장사항
                    </h4>
                    <p className='text-sm text-orange-700 leading-relaxed'>
                      {result.level.recommendation}
                    </p>
                  </div>
                )}

                {/* 응답 요약 */}
                <div className='border rounded-lg p-4'>
                  <h4 className='font-semibold mb-3'>응답 요약</h4>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    {result.responses.map((response, index) => (
                      <div
                        key={index}
                        className='flex justify-between items-center p-2 bg-gray-50 rounded'
                      >
                        <span className='text-sm text-gray-600'>
                          질문 {index + 1}
                        </span>
                        <span className='text-sm font-medium'>
                          {response.selectedScore}점
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 제출 시간 */}
                <div className='text-center text-sm text-muted-foreground'>
                  제출 시간: {result.submittedAt.toLocaleString('ko-KR')}
                </div>
              </CardContent>

              <CardFooter className='flex justify-between'>
                <Button
                  onClick={handleBackToDiagnosis}
                  variant='outline'
                  className='flex items-center space-x-2'
                >
                  <ArrowLeft className='h-4 w-4' />
                  <span>진단 목록으로</span>
                </Button>
                <Button onClick={handleRetakeQuestionnaire}>
                  다시 검사하기
                </Button>
              </CardFooter>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
