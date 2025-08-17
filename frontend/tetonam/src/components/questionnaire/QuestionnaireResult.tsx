import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  Edit,
  Info,
  Loader2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { AppSidebar } from '@/components/layout/AppSidebar';
import { CommonHeader } from '@/components/layout/CommonHeader';
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
  const [isLoading, setIsLoading] = useState(true);
  const [savedToServer, setSavedToServer] = useState<boolean>(false);

  useEffect(() => {
    const loadResult = async () => {
      try {
        setIsLoading(true);

        const dataParam = searchParams.get('data');
        if (!dataParam || !categoryId) {
          setError('결과 데이터를 찾을 수 없습니다.');
          setIsLoading(false);
          return;
        }

        const submission = JSON.parse(decodeURIComponent(dataParam));
        const category = getQuestionnaireCategory(categoryId);

        // 서버 저장 상태 확인 (URL 파라미터에서)
        const serverSaved = searchParams.get('saved') === 'true';
        setSavedToServer(serverSaved);

        if (!category) {
          setError('카테고리를 찾을 수 없습니다.');
          setIsLoading(false);
          return;
        }

        const level = getQuestionnaireResultLevel(category, submission.score);

        if (!level) {
          setError('결과 수준을 계산할 수 없습니다.');
          setIsLoading(false);
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
        console.error('결과 로딩 실패:', err);
        setError('결과를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    loadResult();
  }, [categoryId, searchParams]);

  const getCategoryBackgroundClass = (category: string) => {
    switch (category) {
      case 'suicide-risk':
        return 'bg-blue-50';
      case 'anxiety':
        return 'bg-yellow-50';
      case 'depression':
        return 'bg-gray-50';
      case 'ptsd':
        return 'bg-blue-50';
      default:
        return 'bg-gradient-warm';
    }
  };

  // 공통 결과 표시 컴포넌트
  const renderResultDisplay = (colorTheme: 'blue' | 'yellow' | 'gray') => {
    const themeClasses = {
      blue: {
        bg: 'bg-blue-50',
        iconBg: 'bg-blue-200',
        textPrimary: 'text-blue-800',
        textSecondary: 'text-blue-700',
      },
      yellow: {
        bg: 'bg-yellow-50',
        iconBg: 'bg-yellow-200',
        textPrimary: 'text-yellow-800',
        textSecondary: 'text-yellow-700',
      },
      gray: {
        bg: 'bg-gray-50',
        iconBg: 'bg-gray-200',
        textPrimary: 'text-gray-800',
        textSecondary: 'text-gray-700',
      },
    };

    const theme = themeClasses[colorTheme];

    return (
      <div className={`${theme.bg} p-4 rounded-lg`}>
        <div className='flex items-center gap-4 mb-4'>
          <div className={`${theme.iconBg} rounded-full p-4`}>
            {getLevelIcon(result!.level.level)}
          </div>
          <div>
            <h3 className={`text-xl font-bold ${theme.textPrimary}`}>
              {result!.level.level}
            </h3>
            <p className={theme.textSecondary}>
              {typeof result!.score === 'number'
                ? `총점: ${result!.score}점`
                : `검사결과: ${result!.score}`}
            </p>
          </div>
        </div>
        <p className={`${theme.textPrimary} text-sm leading-relaxed mb-4`}>
          {result!.level.description}
        </p>
        {result!.level.recommendation && (
          <div className='bg-orange-50 border border-orange-200 p-3 rounded'>
            <p className='text-orange-800 text-sm'>
              <strong>권장사항:</strong> {result!.level.recommendation}
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderSuicideRiskResult = () => {
    const category = getQuestionnaireCategory(result!.category);
    return (
      <div className='max-w-4xl mx-auto bg-blue-50 p-6 rounded-lg'>
        {/* 자살위험성 질문지 */}
        <Card className='mb-6 border-blue-200 bg-white'>
          <CardHeader className='bg-blue-100 rounded-t-lg'>
            <div className='flex items-center gap-2 mb-2'>
              <Edit className='h-5 w-5 text-blue-600' />
              <CardTitle className='text-blue-800'>자살위험성 질문지</CardTitle>
            </div>
            <p className='text-blue-700 text-sm'>{category?.description}</p>
          </CardHeader>
          <CardContent className='p-6'>
            <div className='space-y-6'>
              {category?.questions.map((question, index) => {
                const response = result!.responses[index];
                if (!response) return null;

                return (
                  <div
                    key={question.id}
                    className='border-b border-gray-200 pb-4'
                  >
                    <div className='flex items-start gap-4 mb-3'>
                      <div className='bg-blue-100 text-blue-800 font-bold rounded-full w-8 h-8 flex items-center justify-center text-sm'>
                        {index + 1}
                      </div>
                      <div className='flex-1'>
                        <p className='text-gray-800 leading-relaxed mb-3'>
                          {question.text}
                        </p>
                        <div className='flex gap-4 flex-wrap'>
                          {question.options.map((opt, optIdx) => {
                            const checked =
                              response.selectedScore === opt.score;
                            return (
                              <label
                                key={optIdx}
                                className='flex items-center gap-2'
                              >
                                <input
                                  type='radio'
                                  checked={checked}
                                  readOnly
                                  className='w-4 h-4 text-blue-600'
                                />
                                <span
                                  className={
                                    checked
                                      ? 'font-semibold text-blue-700'
                                      : 'text-gray-600'
                                  }
                                >
                                  {opt.text}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 자살위험성 결과 */}
        <Card className='border-blue-200 bg-white'>
          <CardHeader className='bg-blue-100 rounded-t-lg'>
            <CardTitle className='text-blue-800'>자살위험성 검사결과</CardTitle>
          </CardHeader>
          <CardContent className='p-6'>
            <div className='grid gap-4'>{renderResultDisplay('blue')}</div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderAnxietyResult = () => {
    const category = getQuestionnaireCategory(result!.category);
    return (
      <div className='max-w-4xl mx-auto bg-yellow-50 p-6 rounded-lg'>
        {/* 불안증상 질문지 */}
        <Card className='mb-6 border-yellow-200 bg-white'>
          <CardHeader className='bg-yellow-100 rounded-t-lg'>
            <CardTitle className='text-yellow-800 flex items-center gap-2'>
              <Edit className='h-5 w-5' />
              불안증상 질문지
            </CardTitle>
            <p className='text-yellow-700 text-sm'>{category?.description}</p>
          </CardHeader>
          <CardContent className='p-0'>
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead>
                  <tr className='bg-gray-100'>
                    <th className='p-4 text-left text-gray-700 font-semibold border-b'>
                      지난 2주일 동안 당신은 다음의 문제들로 인해서 얼마나 자주
                      방해를 받았습니까?
                    </th>
                    <th className='p-3 text-center text-gray-700 font-semibold border-b min-w-20'>
                      전혀
                      <br />
                      방해받지
                      <br />
                      않았다
                    </th>
                    <th className='p-3 text-center text-gray-700 font-semibold border-b min-w-20'>
                      며칠동안
                      <br />
                      방해받았다
                    </th>
                    <th className='p-3 text-center text-gray-700 font-semibold border-b min-w-20'>
                      2주중 1주일
                      <br />
                      이상 방해받았다
                    </th>
                    <th className='p-3 text-center text-gray-700 font-semibold border-b min-w-20'>
                      거의매일
                      <br />
                      방해받았다
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {category?.questions.map((question, index) => {
                    const response = result!.responses[index];
                    if (!response) return null;
                    return (
                      <tr
                        key={question.id}
                        className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                      >
                        <td className='p-4 border-b border-gray-200'>
                          <div className='flex items-start gap-2'>
                            <span className='font-semibold text-gray-600 min-w-4'>
                              {index + 1}
                            </span>
                            <span className='text-gray-800'>
                              {question.text}
                            </span>
                          </div>
                        </td>
                        <td className='p-3 text-center border-b border-gray-200'>
                          <input
                            type='radio'
                            checked={response.selectedScore === 0}
                            readOnly
                            className='w-4 h-4'
                          />
                        </td>
                        <td className='p-3 text-center border-b border-gray-200'>
                          <input
                            type='radio'
                            checked={response.selectedScore === 1}
                            readOnly
                            className='w-4 h-4'
                          />
                        </td>
                        <td className='p-3 text-center border-b border-gray-200'>
                          <input
                            type='radio'
                            checked={response.selectedScore === 2}
                            readOnly
                            className='w-4 h-4'
                          />
                        </td>
                        <td className='p-3 text-center border-b border-gray-200'>
                          <input
                            type='radio'
                            checked={response.selectedScore === 3}
                            readOnly
                            className='w-4 h-4'
                          />
                        </td>
                      </tr>
                    );
                  })}
                  <tr className='bg-yellow-100 font-semibold'>
                    <td className='p-4 border-b border-gray-200 text-center'>
                      합계
                    </td>
                    <td className='p-3 text-center border-b border-gray-200 text-yellow-800'></td>
                    <td className='p-3 text-center border-b border-gray-200 text-yellow-800'></td>
                    <td className='p-3 text-center border-b border-gray-200 text-yellow-800'></td>
                    <td className='p-3 text-center border-b border-gray-200 text-yellow-800 font-bold'>
                      {typeof result!.score === 'number'
                        ? `${result!.score}점`
                        : result!.score}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* 불안증상 검사결과 */}
        <Card className='border-yellow-200 bg-white'>
          <CardHeader className='bg-yellow-100 rounded-t-lg'>
            <CardTitle className='text-yellow-800'>불안증상 검사결과</CardTitle>
          </CardHeader>
          <CardContent className='p-6'>
            <div className='grid gap-4'>{renderResultDisplay('yellow')}</div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderDepressionResult = () => {
    const category = getQuestionnaireCategory(result!.category);
    return (
      <div className='max-w-4xl mx-auto bg-gray-50 p-6 rounded-lg'>
        {/* 우울증상 정서관련 질문지 */}
        <Card className='mb-6 border-gray-200 bg-white'>
          <CardHeader className='bg-gray-100 rounded-t-lg'>
            <CardTitle className='text-gray-800 flex items-center gap-2'>
              <Edit className='h-5 w-5' />
              정서관련 질문지
            </CardTitle>
            <p className='text-gray-700 text-sm'>우울증상</p>
            <p className='text-gray-600 text-sm'>{category?.description}</p>
          </CardHeader>
          <CardContent className='p-0'>
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead>
                  <tr className='bg-gray-100'>
                    <th className='p-4 text-left text-gray-700 font-semibold border-b'>
                      지난 2주일 동안 당신은 다음의 문제들로 인해서 얼마나 자주
                      방해를 받았습니까?
                    </th>
                    <th className='p-3 text-center text-gray-700 font-semibold border-b min-w-20'>
                      전혀
                      <br />
                      방해받지
                      <br />
                      않았다
                    </th>
                    <th className='p-3 text-center text-gray-700 font-semibold border-b min-w-20'>
                      며칠동안
                      <br />
                      방해받았다
                    </th>
                    <th className='p-3 text-center text-gray-700 font-semibold border-b min-w-20'>
                      7일이상
                      <br />
                      방해받았다
                    </th>
                    <th className='p-3 text-center text-gray-700 font-semibold border-b min-w-20'>
                      거의매일
                      <br />
                      방해받았다
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {category?.questions.map((question, index) => {
                    const response = result!.responses[index];
                    if (!response) return null;
                    return (
                      <tr
                        key={question.id}
                        className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                      >
                        <td className='p-4 border-b border-gray-200'>
                          <div className='flex items-start gap-2'>
                            <span className='font-semibold text-gray-600 min-w-4'>
                              {index + 1}
                            </span>
                            <span className='text-gray-800'>
                              {question.text}
                            </span>
                          </div>
                        </td>
                        <td className='p-3 text-center border-b border-gray-200'>
                          <input
                            type='radio'
                            checked={response.selectedScore === 0}
                            readOnly
                            className='w-4 h-4'
                          />
                        </td>
                        <td className='p-3 text-center border-b border-gray-200'>
                          <input
                            type='radio'
                            checked={response.selectedScore === 1}
                            readOnly
                            className='w-4 h-4'
                          />
                        </td>
                        <td className='p-3 text-center border-b border-gray-200'>
                          <input
                            type='radio'
                            checked={response.selectedScore === 2}
                            readOnly
                            className='w-4 h-4'
                          />
                        </td>
                        <td className='p-3 text-center border-b border-gray-200'>
                          <input
                            type='radio'
                            checked={response.selectedScore === 3}
                            readOnly
                            className='w-4 h-4'
                          />
                        </td>
                      </tr>
                    );
                  })}
                  <tr className='bg-gray-200 font-semibold'>
                    <td className='p-4 border-b border-gray-200 text-center'>
                      합계
                    </td>
                    <td className='p-3 text-center border-b border-gray-200 text-gray-800'></td>
                    <td className='p-3 text-center border-b border-gray-200 text-gray-800'></td>
                    <td className='p-3 text-center border-b border-gray-200 text-gray-800'></td>
                    <td className='p-3 text-center border-b border-gray-200 text-gray-800 font-bold'>
                      {typeof result!.score === 'number'
                        ? `${result!.score}점`
                        : result!.score}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* 정서검사결과 */}
        <Card className='border-gray-200 bg-white'>
          <CardHeader className='bg-gray-100 rounded-t-lg'>
            <CardTitle className='text-gray-800'>정서검사결과</CardTitle>
            <p className='text-gray-600 text-sm'>우울증상</p>
          </CardHeader>
          <CardContent className='p-6'>
            <div className='grid gap-4'>{renderResultDisplay('gray')}</div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderPTSDResult = () => {
    const category = getQuestionnaireCategory(result!.category);
    return (
      <div className='max-w-4xl mx-auto bg-blue-50 p-6 rounded-lg'>
        {/* 외상 후 스트레스 증상 질문지 */}
        <Card className='mb-6 border-blue-200 bg-white'>
          <CardHeader className='bg-blue-100 rounded-t-lg'>
            <CardTitle className='text-blue-800 flex items-center gap-2'>
              <Edit className='h-5 w-5' />
              외상 후 스트레스 증상 질문지
            </CardTitle>
            <p className='text-blue-700 text-sm'>{category?.description}</p>
          </CardHeader>
          <CardContent className='p-6'>
            <div className='space-y-6'>
              {category?.questions.map((question, index) => {
                const response = result!.responses[index];
                if (!response) return null;
                const isAnswerYes = response.selectedScore === 1;
                return (
                  <div
                    key={question.id}
                    className='border-b border-gray-200 pb-4'
                  >
                    <div className='flex items-start gap-4 mb-3'>
                      <div className='bg-blue-100 text-blue-800 font-bold rounded-full w-8 h-8 flex items-center justify-center text-sm'>
                        {index + 1}
                      </div>
                      <div className='flex-1'>
                        <p className='text-gray-800 leading-relaxed mb-3'>
                          {question.text}
                        </p>
                        <div className='flex gap-4'>
                          <label className='flex items-center gap-2'>
                            <input
                              type='radio'
                              checked={!isAnswerYes}
                              readOnly
                              className='w-4 h-4 text-blue-600'
                            />
                            <span
                              className={
                                !isAnswerYes
                                  ? 'font-semibold text-blue-700'
                                  : 'text-gray-600'
                              }
                            >
                              아니오
                            </span>
                          </label>
                          <label className='flex items-center gap-2'>
                            <input
                              type='radio'
                              checked={isAnswerYes}
                              readOnly
                              className='w-4 h-4 text-blue-600'
                            />
                            <span
                              className={
                                isAnswerYes
                                  ? 'font-semibold text-blue-700'
                                  : 'text-gray-600'
                              }
                            >
                              예
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 외상 후 스트레스 증상 검사결과 */}
        <Card className='border-blue-200 bg-white'>
          <CardHeader className='bg-blue-100 rounded-t-lg'>
            <CardTitle className='text-blue-800'>
              외상 후 스트레스 증상 검사결과
            </CardTitle>
          </CardHeader>
          <CardContent className='p-6'>
            <div className='grid gap-4'>{renderResultDisplay('blue')}</div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case '정상':
      case '거의 없음':
      case '자살위험성 거의 없음':
        return <CheckCircle className='h-8 w-8 text-green-500' />;
      case '경미':
      case '보통':
      case '낮음':
      case '자살위험성 낮음':
        return <Info className='h-8 w-8 text-blue-500' />;
      case '중간':
      case '높음':
      case '자살위험성 높음':
        return <AlertTriangle className='h-8 w-8 text-orange-500' />;
      case '심각':
      case '매우 높음':
      case '심함':
        return <AlertTriangle className='h-8 w-8 text-red-500' />;
      default:
        return <Info className='h-8 w-8 text-gray-500' />;
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
            <CommonHeader
              user={{ roles: [] }}
              showUserInfo={false}
              showLogout={false}
              showBackButton={true}
              onBackClick={handleBackToDiagnosis}
            />

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

          {/* 모바일 사이드바 토글 버튼 - 왼쪽 하단 고정 */}
          <MobileSidebarToggle />
        </div>
      </SidebarProvider>
    );
  }

  if (isLoading) {
    return (
      <SidebarProvider>
        <div className='flex w-full min-h-screen bg-gradient-warm'>
          <AppSidebar />
          <div className='flex flex-1 flex-col'>
            <CommonHeader
              user={{ roles: [] }}
              showUserInfo={false}
              showLogout={false}
              showBackButton={true}
              onBackClick={handleBackToDiagnosis}
            />

            <main className='flex-1 overflow-auto p-6 max-w-4xl mx-auto'>
              <Card className='w-full'>
                <CardContent className='text-center py-12'>
                  <Loader2 className='h-16 w-16 text-primary mx-auto mb-4 animate-spin' />
                  <p className='text-muted-foreground'>결과를 불러오는 중...</p>
                </CardContent>
              </Card>
            </main>
          </div>

          {/* 모바일 사이드바 토글 버튼 - 왼쪽 하단 고정 */}
          <MobileSidebarToggle />
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
            <CommonHeader
              user={{ roles: [] }}
              showUserInfo={false}
              showLogout={false}
              showBackButton={true}
              onBackClick={handleBackToDiagnosis}
            />

            <main className='flex-1 overflow-auto p-6 max-w-4xl mx-auto'>
              <Card className='w-full'>
                <CardContent className='text-center py-12'>
                  <AlertTriangle className='h-16 w-16 text-orange-500 mx-auto mb-4' />
                  <h2 className='text-2xl font-bold text-foreground mb-2'>
                    결과를 찾을 수 없습니다
                  </h2>
                  <p className='text-muted-foreground mb-6'>
                    설문 결과 데이터를 불러올 수 없습니다.
                  </p>
                  <Button onClick={handleBackToDiagnosis}>
                    진단 목록으로 돌아가기
                  </Button>
                </CardContent>
              </Card>
            </main>
          </div>

          {/* 모바일 사이드바 토글 버튼 - 왼쪽 하단 고정 */}
          <MobileSidebarToggle />
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div
        className={`flex w-full min-h-screen ${getCategoryBackgroundClass(result.category)}`}
      >
        <AppSidebar />
        <div className='flex flex-1 flex-col'>
          <CommonHeader
            user={{ roles: [] }}
            showUserInfo={false}
            showLogout={false}
            showBackButton={true}
            onBackClick={handleBackToDiagnosis}
          />

          <main className='flex-1 overflow-auto p-6'>
            {/* 카테고리별 렌더링 */}
            {result.category === 'suicide-risk' && renderSuicideRiskResult()}
            {result.category === 'anxiety' && renderAnxietyResult()}
            {result.category === 'depression' && renderDepressionResult()}
            {result.category === 'ptsd' && renderPTSDResult()}

            {/* 공통 액션 버튼 */}
            <div className='max-w-4xl mx-auto mt-8'>
              <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                <Button
                  onClick={handleBackToDiagnosis}
                  variant='outline'
                  size='lg'
                  className='flex items-center gap-2'
                >
                  <ArrowLeft className='h-4 w-4' />
                  다른 진단 받기
                </Button>
                <Button
                  onClick={handleRetakeQuestionnaire}
                  size='lg'
                  className='px-8'
                >
                  다시 검사하기
                </Button>
              </div>

              {/* 제출 시간 */}
              <div className='text-center mt-8 text-sm text-muted-foreground'>
                <div>
                  검사 완료 시간: {result.submittedAt.toLocaleString('ko-KR')}
                </div>
                {savedToServer && (
                  <div className='mt-2 flex items-center justify-center text-green-600'>
                    <CheckCircle className='h-4 w-4 mr-1' />
                    <span>결과가 서버에 안전하게 저장되었습니다</span>
                  </div>
                )}
                {!savedToServer && (
                  <div className='mt-2 flex items-center justify-center text-orange-600'>
                    <AlertTriangle className='h-4 w-4 mr-1' />
                    <span>
                      서버 저장에 실패했지만 로컬 결과는 정상 표시됩니다
                    </span>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>

        {/* 모바일 사이드바 토글 버튼 - 왼쪽 하단 고정 */}
        <MobileSidebarToggle />
      </div>
    </SidebarProvider>
  );
};
