import type { QuestionnaireResult } from '@/types/api';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { memo, useMemo, useCallback } from 'react';
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface QuestionnaireChartProps {
  results: QuestionnaireResult[];
  categoryName: string;
}

interface ChartData {
  date: string;
  score: number;
  formattedDate: string;
}

export const QuestionnaireChart = memo(
  ({ results, categoryName }: QuestionnaireChartProps) => {
    const chartData: ChartData[] = useMemo(() => {
      if (!results || results.length === 0) {
        return [];
      }

      // 1단계: 모든 결과를 유효한 ChartData로 변환
      const processedData = results
        .map(result => {
          try {
            const date = new Date(result.createdDate);
            if (isNaN(date.getTime())) {
              return null;
            }

            const chartItem = {
              date: result.createdDate,
              score: result.score,
              formattedDate: format(date, 'M월 d일', { locale: ko }),
            };
            return chartItem;
          } catch (error) {
            console.error('📊 Error processing result:', error, result);
            return null;
          }
        })
        .filter((item): item is ChartData => item !== null);

      // 2단계: 날짜별로 그룹화 (같은 날의 여러 결과를 묶음)
      const groupedByDate = processedData.reduce((acc, item) => {
        const dateKey = format(new Date(item.date), 'yyyy-MM-dd');
        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        acc[dateKey].push(item);
        return acc;
      }, {} as Record<string, ChartData[]>);

      // 3단계: 각 날짜별로 가장 최신(마지막) 결과만 선택
      const latestDataByDate = Object.values(groupedByDate)
        .map(dayItems => 
          dayItems.sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          )[0] // 가장 늦은 시간의 결과
        )
        .filter((item): item is ChartData => item !== undefined) // undefined 제거
        .sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        ); // 최종 날짜 순 정렬
      
      return latestDataByDate;
    }, [results]);

    // 성능 최적화: 차트 도메인 계산을 메모이제이션
    const chartConfig = useMemo(() => {
      if (chartData.length === 0) {
        // 데이터가 없는 경우 기본 설정
        return {
          domain: [0, 5],
          ticks: [0, 1, 2, 3, 4, 5],
          maxScore: 5,
        };
      }

      // 실제 데이터의 최대값을 구하고 정수로 올림
      const dataMaxScore = Math.max(...chartData.map(d => d.score));
      const maxScore = Math.max(Math.ceil(dataMaxScore), 5); // 최소 5점으로 설정
      
      // 0부터 maxScore까지 정수 단위 눈금 생성
      const ticks = Array.from({ length: maxScore + 1 }, (_, i) => i);

      return {
        domain: [0, maxScore],
        ticks,
        maxScore,
      };
    }, [chartData]);

    // 성능 최적화: 커스텀 툴팁 컴포넌트를 메모이제이션
    const customTooltip = useMemo(
      () =>
        ({ active, payload, label }: any) => {
          if (active && payload && payload.length) {
            const data = payload[0].payload as ChartData;
            return (
              <div className='bg-white border border-gray-200 rounded-lg shadow-lg p-3'>
                <p className='font-medium text-gray-900'>{categoryName}</p>
                <p className='text-sm text-gray-600'>{label}</p>
                <p className='text-lg font-semibold text-blue-600'>
                  {data.score}점
                </p>
              </div>
            );
          }
          return null;
        },
      [categoryName]
    );

    if (chartData.length === 0) {
      return (
        <div className='flex items-center justify-center h-64 text-muted-foreground'>
          <p>진단 결과가 없습니다</p>
        </div>
      );
    }

    return (
      <div className='w-full h-64'>
        {/* 성능 최적화: SSR을 위한 initialDimension 설정 */}
        <ResponsiveContainer 
          width='100%' 
          height='100%'
          initialDimension={{ width: 520, height: 256 }}
        >
          <LineChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 20,
            }}
          >
            <XAxis
              dataKey='formattedDate'
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              interval='preserveStartEnd'
            />
            <YAxis
              domain={chartConfig.domain}
              ticks={chartConfig.ticks}
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              tickFormatter={value => `${value}점`}
            />
            <Tooltip content={customTooltip} />
            <Line
              type='monotone'
              dataKey='score'
              stroke='#3b82f6'
              strokeWidth={3}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
              animationDuration={1000}
              animationBegin={0}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }
);

QuestionnaireChart.displayName = 'QuestionnaireChart';
