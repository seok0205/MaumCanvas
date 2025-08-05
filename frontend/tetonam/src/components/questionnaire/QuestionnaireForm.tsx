import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { AppSidebar } from '@/components/layout/AppSidebar';
import { CommonHeader } from '@/components/layout/CommonHeader';
import { RadioGroup, RadioGroupItem } from '@/components/ui/forms/radio-group';
import { Button } from '@/components/ui/interactive/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/layout/card';
import { SidebarProvider } from '@/components/ui/navigation/sidebar';
import { Label } from '@/components/ui/primitives/label';
import {
  getQuestionnaireCategory,
  QUESTIONNAIRE_CATEGORIES,
} from '@/constants/questionnaire';
import {
  QuestionnaireResponse,
  QuestionnaireSubmission,
} from '@/types/questionnaire';

export const QuestionnaireForm = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const [category, setCategory] = useState<
    (typeof QUESTIONNAIRE_CATEGORIES)[0] | undefined
  >(undefined);
  const [responses, setResponses] = useState<QuestionnaireResponse[]>([]);

  useEffect(() => {
    if (categoryId) {
      const foundCategory = getQuestionnaireCategory(categoryId);
      if (foundCategory) {
        setCategory(foundCategory);
        setResponses(
          foundCategory.questions.map(q => ({
            questionId: q.id,
            selectedScore: -1,
          }))
        );
      } else {
        navigate('/diagnosis');
      }
    }
  }, [categoryId, navigate]);

  const handleOptionChange = useCallback(
    (questionId: number, score: number) => {
      setResponses(prevResponses =>
        prevResponses.map(res =>
          res.questionId === questionId ? { ...res, selectedScore: score } : res
        )
      );
    },
    []
  );

  const handleSubmit = useCallback(() => {
    // 모든 질문에 대한 답변이 완료되었는지 확인
    const unansweredQuestions = responses.filter(
      res => res.selectedScore === -1
    );
    if (unansweredQuestions.length > 0) {
      alert('모든 질문에 답변해주세요.');
      return;
    }

    const totalScore = responses.reduce(
      (sum, res) => sum + res.selectedScore,
      0
    );

    const submission: QuestionnaireSubmission = {
      category: category!.id,
      score: totalScore,
      responses: responses,
    };

    // 결과 데이터를 URL 파라미터로 전달
    const resultData = encodeURIComponent(JSON.stringify(submission));
    navigate(`/questionnaire/${categoryId}/result?data=${resultData}`);
  }, [category, responses, navigate, categoryId]);

  const handleBack = useCallback(() => {
    navigate('/diagnosis');
  }, [navigate]);

  if (!category) {
    return <div>로딩 중...</div>;
  }

  // 전체 진행률 계산
  const answeredQuestions = responses.filter(
    res => res.selectedScore !== -1
  ).length;
  const progressPercentage =
    (answeredQuestions / category.questions.length) * 100;
  const isAllAnswered = answeredQuestions === category.questions.length;

  return (
    <SidebarProvider>
      <div className='flex w-full min-h-screen bg-gradient-warm'>
        <AppSidebar />
        <div className='flex flex-1 flex-col'>
          <CommonHeader
            user={{ name: null, roles: [] }}
            showUserInfo={false}
            showLogout={false}
            showBackButton={true}
            onBackClick={handleBack}
          />

          <main className='flex-1 overflow-auto p-6'>
            <div className='max-w-4xl mx-auto'>
              {/* 헤더 섹션 */}
              <div className='mb-8'>
                <h1 className='text-3xl font-bold text-foreground mb-4'>
                  {category.title}
                </h1>
                <p className='text-muted-foreground text-lg mb-6'>
                  {category.description}
                </p>

                {/* 진행률 표시 */}
                <div className='bg-card rounded-lg p-4 border border-border/50'>
                  <div className='flex justify-between items-center mb-2'>
                    <span className='text-sm font-medium text-muted-foreground'>
                      진행률
                    </span>
                    <span className='text-sm font-medium text-foreground'>
                      {answeredQuestions} / {category.questions.length}
                    </span>
                  </div>
                  <div className='w-full bg-muted rounded-full h-2 overflow-hidden'>
                    <div
                      className='h-full bg-primary transition-all duration-300 ease-in-out'
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* 질문들 */}
              <div className='space-y-6'>
                {category.questions.map((question, questionIndex) => {
                  const currentResponse = responses.find(
                    res => res.questionId === question.id
                  );

                  return (
                    <Card
                      key={question.id}
                      className={`transition-all duration-200 ${
                        currentResponse?.selectedScore !== -1
                          ? 'border-primary/50 bg-primary/5'
                          : 'border-border/50'
                      }`}
                    >
                      <CardHeader className='pb-4'>
                        <div className='flex items-start gap-4'>
                          <div
                            className={`
                            flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                            ${
                              currentResponse?.selectedScore !== -1
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground'
                            }
                          `}
                          >
                            {questionIndex + 1}
                          </div>
                          <div className='flex-1'>
                            <CardTitle className='text-lg font-semibold text-foreground leading-relaxed'>
                              {question.text}
                            </CardTitle>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className='pt-0'>
                        <RadioGroup
                          onValueChange={(value: string) =>
                            handleOptionChange(question.id, parseInt(value))
                          }
                          value={
                            currentResponse?.selectedScore.toString() || ''
                          }
                          className='grid gap-3'
                        >
                          {question.options.map((option, optionIndex) => (
                            <div
                              key={optionIndex}
                              className={`
                                flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer hover:bg-muted/50
                                ${
                                  currentResponse?.selectedScore ===
                                  option.score
                                    ? 'border-primary bg-primary/10'
                                    : 'border-border'
                                }
                              `}
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
                })}
              </div>

              {/* 제출 버튼 */}
              <div className='mt-8 flex justify-center'>
                <Button
                  onClick={handleSubmit}
                  disabled={!isAllAnswered}
                  size='lg'
                  className='px-12 py-3 text-lg font-semibold'
                >
                  {isAllAnswered
                    ? '결과 확인하기'
                    : `${category.questions.length - answeredQuestions}개 질문 남음`}
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
