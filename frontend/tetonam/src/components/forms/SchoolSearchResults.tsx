import type { School, SchoolSearchResultsProps } from '@/types/school';
import { highlightSearchTerm } from '@/utils/schoolUtils';
import React, { useCallback, useMemo } from 'react';

export const SchoolSearchResults = React.memo<SchoolSearchResultsProps>(
  ({ schools, onSelect, query, isLoading, className = '' }) => {
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

    if (isLoading) {
      return (
        <div
          className={`absolute z-50 w-full bg-white border rounded-md shadow-lg ${className}`}
        >
          <div className='p-4 text-center text-gray-500'>검색 중...</div>
        </div>
      );
    }

    if (schools.length === 0 && query.length >= 2) {
      return (
        <div
          className={`absolute z-50 w-full bg-white border rounded-md shadow-lg ${className}`}
        >
          <div className='p-4 text-center text-gray-500'>
            검색 결과가 없습니다.
          </div>
        </div>
      );
    }

    return (
      <div
        className={`absolute z-50 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto ${className}`}
        role='listbox'
        aria-label='학교 검색 결과'
      >
        {highlightedSchools.map((school, index) => (
          <button
            key={`${school.name}-${index}`}
            className='w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none'
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
