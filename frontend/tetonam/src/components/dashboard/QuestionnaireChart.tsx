import type { QuestionnaireResult } from '@/types/api';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { memo, useMemo } from 'react';
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
      if (!results || results.length === 0) return [];

      return results
        .map(result => {
          try {
            const date = new Date(result.createdDate);
            if (isNaN(date.getTime())) {
              return null;
            }

            return {
              date: result.createdDate,
              score: result.score,
              formattedDate: format(date, 'M월 d일', { locale: ko }),
            };
          } catch {
            return null;
          }
        })
        .filter((item): item is ChartData => item !== null)
        .sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
    }, [results]);

    if (chartData.length === 0) {
      return (
        <div className='flex items-center justify-center h-64 text-muted-foreground'>
          <p>진단 결과가 없습니다</p>
        </div>
      );
    }

    const maxScore = Math.max(...chartData.map(d => d.score));
    const minScore = Math.min(...chartData.map(d => d.score));
    const scoreRange = maxScore - minScore;
    const padding = scoreRange * 0.1; // 10% 패딩

    return (
      <div className='w-full h-64'>
        <ResponsiveContainer width='100%' height='100%'>
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
              domain={[minScore - padding, maxScore + padding]}
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={value => `${value}점`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as ChartData;
                  return (
                    <div className='bg-white border border-gray-200 rounded-lg shadow-lg p-3'>
                      <p className='font-medium text-gray-900'>
                        {categoryName}
                      </p>
                      <p className='text-sm text-gray-600'>{label}</p>
                      <p className='text-lg font-semibold text-blue-600'>
                        {data.score}점
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
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
