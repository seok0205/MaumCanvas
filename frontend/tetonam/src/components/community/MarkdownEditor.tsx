import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/data-display/tabs';
import { Textarea } from '@/components/ui/forms/textarea';
import { cn } from '@/utils/cn';
import { useCallback, useEffect, useMemo, useState } from 'react';

// 경량 마크다운 파서 지연 로드 (초기 번들 영향 최소화)
let markedLib: typeof import('marked') | null = null;
let dompurifyLib: typeof import('dompurify') | null = null;

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  className?: string;
  height?: number; // px
}

const SAFE_DEFAULT_HTML = '<p class="text-slate-400">내용이 없습니다.</p>';

export const MarkdownEditor = ({
  value,
  onChange,
  placeholder,
  maxLength,
  className,
  height = 320,
}: MarkdownEditorProps) => {
  type TabValue = 'write' | 'preview';
  const [tab, setTab] = useState<TabValue>('write');
  const [html, setHtml] = useState('');
  const [isParserReady, setParserReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!markedLib) {
        const [m, d] = await Promise.all([
          import('marked'),
          import('dompurify'),
        ]);
        markedLib = m;
        dompurifyLib = d;
      }
      if (!cancelled) setParserReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const generatePreview = useCallback(async (markdown: string) => {
    if (!markedLib || !dompurifyLib) return;
    const raw = markedLib.marked.parse(markdown, { async: false });
    setHtml(dompurifyLib.default.sanitize(raw));
  }, []);

  useEffect(() => {
    if (tab === 'preview' && isParserReady) {
      generatePreview(value);
    }
  }, [tab, value, isParserReady, generatePreview]);

  const lengthInfo = useMemo(() => {
    if (typeof maxLength !== 'number') return null;
    return (
      <span className='text-xs text-muted-foreground'>
        {value.length}/{maxLength}
      </span>
    );
  }, [value.length, maxLength]);

  return (
    <div
      className={cn(
        'w-full rounded-lg border border-slate-200 bg-white/70 backdrop-blur-sm shadow-sm transition-colors',
        className
      )}
    >
      <Tabs
        value={tab}
        onValueChange={(v: string) => setTab(v as TabValue)}
        className='w-full'
      >
        <div className='flex items-center justify-between px-3 pt-2'>
          <TabsList className='bg-transparent h-9'>
            <TabsTrigger
              value='write'
              className='data-[state=active]:bg-white data-[state=active]:shadow'
            >
              작성
            </TabsTrigger>
            <TabsTrigger
              value='preview'
              className='data-[state=active]:bg-white data-[state=active]:shadow'
            >
              미리보기
            </TabsTrigger>
          </TabsList>
          {lengthInfo}
        </div>
        <TabsContent value='write' className='px-3 pb-3 pt-2 outline-none'>
          <Textarea
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className='min-h-[120px] resize-none focus-visible:ring-orange-400/30'
            style={{ height }}
            maxLength={maxLength}
          />
          <div className='mt-2 flex flex-wrap gap-2 text-xs text-slate-500'>
            <span>지원 문법: **굵게** _기울임_ `코드` ### 제목 - 목록</span>
          </div>
        </TabsContent>
        <TabsContent value='preview' className='px-5 pb-5 pt-4'>
          {!isParserReady && (
            <div className='text-sm text-slate-400 animate-pulse'>
              미리보기 준비 중...
            </div>
          )}
          {isParserReady && (
            <div
              className='prose prose-slate max-w-none text-sm animate-fade-in'
              dangerouslySetInnerHTML={{ __html: html || SAFE_DEFAULT_HTML }}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export { MarkdownEditor as CommunityMarkdownEditor };
