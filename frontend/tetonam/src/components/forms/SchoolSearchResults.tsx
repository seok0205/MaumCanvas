import type { School, SchoolSearchResultsProps } from '@/types/school';
import { highlightSearchTerm } from '@/utils/schoolUtils';
import React, { useCallback, useMemo } from 'react';

export const SchoolSearchResults = React.memo<SchoolSearchResultsProps>(
  ({ schools, onSelect, query, isLoading, error, className = '' }) => {
    const handleSelect = useCallback(
      (school: School) => {
        onSelect(school);
      },
      [onSelect]
    );

    const highlightedSchools = useMemo(
      () =>
        schools.map(school => ({
          ...school,
          highlightedName: highlightSearchTerm(school.name, query),
        })),
      [schools, query]
    );

    // 에러 상태 처리
    if (error) {
      return (
        <div
          className={`absolute z-50 w-full bg-white border border-red-200 rounded-md shadow-lg ${className}`}
        >
          <div className='p-4 text-center'>
            <div className='text-red-600 text-sm font-medium mb-1'>
              검색 중 오류가 발생했습니다
            </div>
            <div className='text-red-500 text-xs'>
              잠시 후 다시 시도해주세요
            </div>
          </div>
        </div>
      );
    }

    // 로딩 상태 처리
    if (isLoading) {
      return (
        <div
          className={`absolute z-50 w-full bg-white border rounded-md shadow-lg ${className}`}
        >
          <div className='p-4 text-center'>
            <div className='text-gray-600 text-sm font-medium mb-1'>
              검색 중...
            </div>
            <div className='text-gray-500 text-xs'>
              학교를 찾고 있습니다
            </div>
          </div>
        </div>
      );
    }

    // 빈 결과 처리
    if (schools.length === 0 && query.length >= 2) {
      return (
        <div
          className={`absolute z-50 w-full bg-white border rounded-md shadow-lg ${className}`}
        >
          <div className='p-4 text-center'>
            <div className='text-gray-600 text-sm font-medium mb-1'>
              검색 결과가 없습니다
            </div>
            <div className='text-gray-500 text-xs'>
              다른 검색어를 입력해보세요
            </div>
          </div>
        </div>
      );
    }

    // 결과가 있는 경우
    return (
      <div
        className={`absolute z-50 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto ${className}`}
        role='listbox'
        aria-label='학교 검색 결과'
      >
        {highlightedSchools.map((school, index) => (
          <button
            key={`${school.name}-${index}`}
            className='w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors duration-150'
            onClick={() => handleSelect(school)}
            role='option'
            aria-selected='false'
          >
            <span
              dangerouslySetInnerHTML={{ __html: school.highlightedName }}
              className='text-gray-900'
            />
          </button>
        ))}
      </div>
    );
  }
);

SchoolSearchResults.displayName = 'SchoolSearchResults';
