import { ComponentType, lazy } from 'react';

/**
 * Named export를 lazy loading하기 위한 타입 안전한 유틸리티 함수
 *
 * @template T - React 컴포넌트 타입
 * @param factory - 컴포넌트를 import하는 함수
 * @param name - export할 컴포넌트의 이름 (키)
 * @returns React.LazyExoticComponent<T>
 *
 * @example
 * ```typescript
 * const Index = lazyNamedExport(() => import('@/pages/Index'), 'Index');
 * const Login = lazyNamedExport(() => import('@/pages/Login'), 'Login');
 * ```
 */
export function lazyNamedExport<T extends ComponentType<any>>(
  factory: () => Promise<Record<string, T>>,
  name: string
): React.LazyExoticComponent<T> {
  return lazy(() =>
    factory().then(module => {
      const component = module[name];
      if (!component) {
        throw new Error(
          `컴포넌트 "${name}"을(를) 모듈에서 찾을 수 없습니다. 사용 가능한 exports: ${Object.keys(module).join(', ')}`
        );
      }
      return { default: component };
    })
  );
}

/**
 * 타입 안전성을 위한 대안 함수 (keyof 사용)
 * 더 엄격한 타입 체크를 원할 때 사용
 */
export function lazyNamedExportStrict<
  TModule extends Record<string, ComponentType<any>>,
  TName extends keyof TModule,
>(
  factory: () => Promise<TModule>,
  name: TName
): React.LazyExoticComponent<TModule[TName]> {
  return lazy(() => factory().then(module => ({ default: module[name] })));
}
