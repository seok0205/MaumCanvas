import { Heart } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { AppSidebar } from '@/components/layout/AppSidebar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/forms/radio-group';
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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

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
    if (!category || responses[currentQuestionIndex]?.selectedScore === -1) {
      alert('답변을 선택해주세요.');
      return;
    }

    const totalScore = responses.reduce(
      (sum, res) => sum + res.selectedScore,
      0
    );

    const submission: QuestionnaireSubmission = {
      category: category.id,
      score: totalScore,
      responses: responses,
    };

    // 결과 데이터를 URL 파라미터로 전달
    const resultData = encodeURIComponent(JSON.stringify(submission));
    navigate(`/questionnaire/${categoryId}/result?data=${resultData}`);
  }, [currentQuestionIndex, category, responses, navigate, categoryId]);

  const handleNext = useCallback(() => {
    if (!category || responses[currentQuestionIndex]?.selectedScore === -1) {
      alert('답변을 선택해주세요.');
      return;
    }
    if (currentQuestionIndex < category.questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    } else {
      handleSubmit();
    }
  }, [currentQuestionIndex, category, responses, handleSubmit]);

  const handlePrevious = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prevIndex => prevIndex - 1);
    }
  }, [currentQuestionIndex]);

  if (!category) {
    return <div>로딩 중...</div>;
  }

  const currentQuestion = category.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === category.questions.length - 1;
  const isOptionSelected =
    responses[currentQuestionIndex]?.selectedScore !== -1;

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

          <main className='flex-1 overflow-auto p-6 max-w-3xl mx-auto'>
            <Card className='w-full'>
              <CardHeader>
                <CardTitle className='text-2xl font-bold text-foreground'>
                  {category.title}
                </CardTitle>
                <CardDescription className='text-muted-foreground'>
                  {category.description}
                </CardDescription>
                <div className='text-sm text-muted-foreground mt-2'>
                  {currentQuestionIndex + 1} / {category.questions.length}
                </div>
              </CardHeader>
              <CardContent>
                <h3 className='text-lg font-semibold mb-4'>
                  {currentQuestion?.text}
                </h3>
                <RadioGroup
                  onValueChange={(value: string) =>
                    handleOptionChange(
                      currentQuestion?.id || 0,
                      parseInt(value)
                    )
                  }
                  value={
                    responses[currentQuestionIndex]?.selectedScore.toString() ||
                    ''
                  }
                >
                  {currentQuestion?.options.map((option, index) => (
                    <div
                      key={index}
                      className='flex items-center space-x-2 mb-2'
                    >
                      <RadioGroupItem
                        value={option.score.toString()}
                        id={`option-${currentQuestion?.id}-${index}`}
                      />
                      <Label htmlFor={`option-${currentQuestion?.id}-${index}`}>
                        {option.text}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
              <CardFooter className='flex justify-between'>
                <Button
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                  variant='outline'
                >
                  이전
                </Button>
                <Button onClick={handleNext} disabled={!isOptionSelected}>
                  {isLastQuestion ? '제출' : '다음'}
                </Button>
              </CardFooter>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
