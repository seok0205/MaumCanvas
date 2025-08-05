import { useDebounce } from '@/hooks/useDebounce';
import { useSchoolSearch } from '@/hooks/useSchoolSearch';
import type { School, SchoolSearchInputProps } from '@/types/school';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SchoolSearchResults } from './SchoolSearchResults';

export const SchoolSearchInput = React.memo<SchoolSearchInputProps>(
  ({
    value,
    onChange,
    onSelect,
    placeholder = '학교명을 입력하세요',
    disabled = false,
    className = '',
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const resultsRef = useRef<HTMLDivElement>(null);

    const debouncedQuery = useDebounce(value, 300);
    const {
      data: schools = [],
      isLoading,
      error,
    } = useSchoolSearch(debouncedQuery);

    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        onChange(newValue);
        setIsOpen(true);
        setFocusedIndex(-1);
      },
      [onChange]
    );

    const handleSelect = useCallback(
      (school: School) => {
        onSelect(school);
        setIsOpen(false);
        setFocusedIndex(-1);
        inputRef.current?.blur();
      },
      [onSelect]
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (!isOpen || schools.length === 0) return;

        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            setFocusedIndex(prev =>
              prev < schools.length - 1 ? prev + 1 : prev
            );
            break;
          case 'ArrowUp':
            e.preventDefault();
            setFocusedIndex(prev => (prev > 0 ? prev - 1 : -1));
            break;
          case 'Enter':
            e.preventDefault();
            if (focusedIndex >= 0) {
              handleSelect(schools[focusedIndex]);
            }
            break;
          case 'Escape':
            setIsOpen(false);
            setFocusedIndex(-1);
            inputRef.current?.blur();
            break;
        }
      },
      [isOpen, schools, focusedIndex, handleSelect]
    );

    const handleFocus = useCallback(() => {
      if (value.length >= 2) {
        setIsOpen(true);
      }
    }, [value]);

    const handleBlur = useCallback(() => {
      // 약간의 지연을 두어 클릭 이벤트가 처리될 수 있도록 함
      setTimeout(() => {
        setIsOpen(false);
        setFocusedIndex(-1);
      }, 150);
    }, []);

    useEffect(() => {
      if (value.length >= 2) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    }, [value]);

    return (
      <div className={`relative ${className}`}>
        <input
          ref={inputRef}
          type='text'
          value={value}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed'
          role='combobox'
          aria-expanded={isOpen}
          aria-autocomplete='list'
          aria-activedescendant={
            focusedIndex >= 0 ? `school-${focusedIndex}` : undefined
          }
          aria-label='학교 검색'
        />

        {error && (
          <div className='mt-1 text-sm text-red-600'>{error.message}</div>
        )}

        {isOpen && (
          <SchoolSearchResults
            ref={resultsRef}
            schools={schools}
            onSelect={handleSelect}
            query={debouncedQuery}
            isLoading={isLoading}
            className='mt-1'
          />
        )}
      </div>
    );
  }
);

SchoolSearchInput.displayName = 'SchoolSearchInput';
