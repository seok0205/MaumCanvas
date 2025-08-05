// src/test/Sample.test.tsx
import { render, screen } from '@testing-library/react';
import React from 'react';

describe('프론트엔드 테스트', () => {
  it('Hello World', () => {
    render(<div>Hello World</div>);
    expect(screen.getByText(/hello world/i)).toBeInTheDocument();
  });
});