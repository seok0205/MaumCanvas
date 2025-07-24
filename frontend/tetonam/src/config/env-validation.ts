interface EnvConfig {
  // 기본 설정
  NODE_ENV: "development" | "production" | "test";
  VITE_NODE_ENV: "development" | "production" | "test";

  // 프론트엔드 서버 설정
  VITE_APP_PORT: number;
  VITE_DEV_PORT?: number;

  // API 설정 (백엔드 Spring Boot 서버와 통신)
  VITE_API_URL: string;
  VITE_API_TIMEOUT: number;

  // 로깅 설정
  VITE_LOG_LEVEL: "debug" | "info" | "warn" | "error";
  VITE_ENABLE_LOGGING: boolean;

  // 보안 설정
  VITE_SECURE_COOKIES?: boolean;
  VITE_HTTPS_ONLY?: boolean;

  // 개발 도구 설정
  VITE_ENABLE_DEVTOOLS?: boolean;
  VITE_ENABLE_HOT_RELOAD?: boolean;
  VITE_ENABLE_SOURCE_MAPS?: boolean;

  // 디버그 설정
  DEBUG?: boolean;
  VITE_DEBUG_MODE?: boolean;

  // 빌드 설정
  VITE_BUILD_SOURCEMAP?: boolean;
  VITE_BUILD_MINIFY?: boolean;

  // 성능 설정
  VITE_CACHE_MAX_AGE?: number;
  VITE_GZIP_ENABLED?: boolean;

  // 애플리케이션 정보
  VITE_APP_NAME?: string;
  VITE_APP_VERSION?: string;
}

/**
 * 기본값 설정 (플레이스홀더)
 *
 * 주의: 이 값들은 개발용 플레이스홀더입니다.
 * 실제 운영환경에서는 .env.production 파일에서 적절한 값으로 오버라이드해야 합니다.
 * 민감한 정보나 실제 서버 정보는 포함하지 마세요.
 */
const DEFAULT_VALUES: Partial<EnvConfig> = {
  // 기본 환경
  NODE_ENV: "development",
  VITE_NODE_ENV: "development",

  // 기본 포트
  VITE_APP_PORT: 3000,
  VITE_DEV_PORT: 8080,

  // API 기본값 (플레이스홀더 - 실제 사용시 .env 파일에서 오버라이드 필수)
  VITE_API_URL: "http://localhost:3001",
  VITE_API_TIMEOUT: 10000,

  // 로깅 기본값
  VITE_LOG_LEVEL: "info",
  VITE_ENABLE_LOGGING: true,

  // 보안 기본값
  VITE_SECURE_COOKIES: false,
  VITE_HTTPS_ONLY: false,

  // 개발 도구 기본값
  VITE_ENABLE_DEVTOOLS: true,
  VITE_ENABLE_HOT_RELOAD: true,
  VITE_ENABLE_SOURCE_MAPS: true,

  // 디버그 기본값
  DEBUG: false,
  VITE_DEBUG_MODE: false,

  // 빌드 기본값
  VITE_BUILD_SOURCEMAP: true,
  VITE_BUILD_MINIFY: false,

  // 성능 기본값
  VITE_CACHE_MAX_AGE: 3600,
  VITE_GZIP_ENABLED: true,

  // 애플리케이션 기본값 (플레이스홀더)
  VITE_APP_NAME: "React App",
  VITE_APP_VERSION: "0.0.0",
};

/**
 * 필수 환경변수 목록 (프론트엔드 전용)
 */
const REQUIRED_ENV_VARS = ["VITE_API_URL"] as const;

/**
 * 환경변수 타입 변환 함수들
 */
const typeConverters = {
  string: (value: string | undefined, defaultValue?: string): string =>
    value || defaultValue || "",

  number: (value: string | undefined, defaultValue?: number): number => {
    const parsed = parseInt(value || "");
    return isNaN(parsed) ? defaultValue || 0 : parsed;
  },

  boolean: (value: string | undefined, defaultValue?: boolean): boolean => {
    if (!value) return defaultValue || false;
    return value.toLowerCase() === "true" || value === "1";
  },

  enum: <T extends string>(
    value: string | undefined,
    validValues: readonly T[],
    defaultValue?: T
  ): T => {
    if (!value) return defaultValue || validValues[0];
    return validValues.includes(value as T)
      ? (value as T)
      : defaultValue || validValues[0];
  },
};

/**
 * 환경변수 검증 및 설정
 */
export function validateAndSetupEnv(): EnvConfig {
  console.log("프론트엔드 환경변수 검증 시작...");

  // 필수 환경변수 검증
  const missingVars: string[] = [];
  REQUIRED_ENV_VARS.forEach((varName) => {
    if (!import.meta.env[varName] && !DEFAULT_VALUES[varName]) {
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    const errorMsg = `필수 환경변수가 설정되지 않았습니다: ${missingVars.join(
      ", "
    )}`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  // 환경변수 설정 및 타입 변환
  const config: EnvConfig = {
    // 기본 설정
    NODE_ENV: typeConverters.enum(
      import.meta.env.NODE_ENV,
      ["development", "production", "test"] as const,
      DEFAULT_VALUES.NODE_ENV
    ),
    VITE_NODE_ENV: typeConverters.enum(
      import.meta.env.VITE_NODE_ENV,
      ["development", "production", "test"] as const,
      DEFAULT_VALUES.VITE_NODE_ENV
    ),

    // 프론트엔드 서버 설정
    VITE_APP_PORT: typeConverters.number(
      import.meta.env.VITE_APP_PORT,
      DEFAULT_VALUES.VITE_APP_PORT
    ),
    VITE_DEV_PORT: typeConverters.number(
      import.meta.env.VITE_DEV_PORT,
      DEFAULT_VALUES.VITE_DEV_PORT
    ),

    // API 설정
    VITE_API_URL: typeConverters.string(
      import.meta.env.VITE_API_URL,
      DEFAULT_VALUES.VITE_API_URL
    ),
    VITE_API_TIMEOUT: typeConverters.number(
      import.meta.env.VITE_API_TIMEOUT,
      DEFAULT_VALUES.VITE_API_TIMEOUT
    ),

    // 로깅 설정
    VITE_LOG_LEVEL: typeConverters.enum(
      import.meta.env.VITE_LOG_LEVEL,
      ["debug", "info", "warn", "error"] as const,
      DEFAULT_VALUES.VITE_LOG_LEVEL
    ),
    VITE_ENABLE_LOGGING: typeConverters.boolean(
      import.meta.env.VITE_ENABLE_LOGGING,
      DEFAULT_VALUES.VITE_ENABLE_LOGGING
    ),

    // 보안 설정
    VITE_SECURE_COOKIES: typeConverters.boolean(
      import.meta.env.VITE_SECURE_COOKIES,
      DEFAULT_VALUES.VITE_SECURE_COOKIES
    ),
    VITE_HTTPS_ONLY: typeConverters.boolean(
      import.meta.env.VITE_HTTPS_ONLY,
      DEFAULT_VALUES.VITE_HTTPS_ONLY
    ),

    // 개발 도구 설정
    VITE_ENABLE_DEVTOOLS: typeConverters.boolean(
      import.meta.env.VITE_ENABLE_DEVTOOLS,
      DEFAULT_VALUES.VITE_ENABLE_DEVTOOLS
    ),
    VITE_ENABLE_HOT_RELOAD: typeConverters.boolean(
      import.meta.env.VITE_ENABLE_HOT_RELOAD,
      DEFAULT_VALUES.VITE_ENABLE_HOT_RELOAD
    ),
    VITE_ENABLE_SOURCE_MAPS: typeConverters.boolean(
      import.meta.env.VITE_ENABLE_SOURCE_MAPS,
      DEFAULT_VALUES.VITE_ENABLE_SOURCE_MAPS
    ),

    // 디버그 설정
    DEBUG: typeConverters.boolean(import.meta.env.DEBUG, DEFAULT_VALUES.DEBUG),
    VITE_DEBUG_MODE: typeConverters.boolean(
      import.meta.env.VITE_DEBUG_MODE,
      DEFAULT_VALUES.VITE_DEBUG_MODE
    ),

    // 빌드 설정
    VITE_BUILD_SOURCEMAP: typeConverters.boolean(
      import.meta.env.VITE_BUILD_SOURCEMAP,
      DEFAULT_VALUES.VITE_BUILD_SOURCEMAP
    ),
    VITE_BUILD_MINIFY: typeConverters.boolean(
      import.meta.env.VITE_BUILD_MINIFY,
      DEFAULT_VALUES.VITE_BUILD_MINIFY
    ),

    // 성능 설정
    VITE_CACHE_MAX_AGE: typeConverters.number(
      import.meta.env.VITE_CACHE_MAX_AGE,
      DEFAULT_VALUES.VITE_CACHE_MAX_AGE
    ),
    VITE_GZIP_ENABLED: typeConverters.boolean(
      import.meta.env.VITE_GZIP_ENABLED,
      DEFAULT_VALUES.VITE_GZIP_ENABLED
    ),

    // 애플리케이션 정보
    VITE_APP_NAME: typeConverters.string(
      import.meta.env.VITE_APP_NAME,
      DEFAULT_VALUES.VITE_APP_NAME
    ),
    VITE_APP_VERSION: typeConverters.string(
      import.meta.env.VITE_APP_VERSION,
      DEFAULT_VALUES.VITE_APP_VERSION
    ),
  };

  // 환경별 보안 설정 자동 조정
  if (config.NODE_ENV === "production") {
    config.VITE_SECURE_COOKIES = true;
    config.VITE_HTTPS_ONLY = true;
    config.VITE_ENABLE_DEVTOOLS = false;
    config.VITE_ENABLE_SOURCE_MAPS = false;
    config.VITE_LOG_LEVEL = "error";
    config.VITE_ENABLE_LOGGING = false;
    config.VITE_BUILD_SOURCEMAP = false;
    config.VITE_BUILD_MINIFY = true;
    config.DEBUG = false;
    config.VITE_DEBUG_MODE = false;
  }

  // 설정 검증 완료 로그
  console.log("프론트엔드 환경변수 검증 완료");
  console.log(`현재 환경: ${config.NODE_ENV}`);
  console.log(`API URL: ${config.VITE_API_URL}`);
  console.log(
    `디버그 모드: ${config.VITE_ENABLE_DEVTOOLS ? "활성화" : "비활성화"}`
  );

  return config;
}

/**
 * 민감정보 마스킹 함수
 */
export function maskSensitiveValue(value: string, maskChar = "*"): string {
  if (value.length <= 6) {
    return maskChar.repeat(value.length);
  }
  const start = value.substring(0, 2);
  const end = value.substring(value.length - 2);
  const middle = maskChar.repeat(value.length - 4);
  return `${start}${middle}${end}`;
}

/**
 * 환경변수 디버그 정보 (민감정보 마스킹됨)
 */
export function getEnvDebugInfo(
  config: EnvConfig
): Record<string, string | number | boolean | undefined> {
  return {
    NODE_ENV: config.NODE_ENV,
    VITE_NODE_ENV: config.VITE_NODE_ENV,
    VITE_APP_PORT: config.VITE_APP_PORT,
    VITE_API_URL: config.VITE_API_URL,
    VITE_LOG_LEVEL: config.VITE_LOG_LEVEL,
    VITE_ENABLE_DEVTOOLS: config.VITE_ENABLE_DEVTOOLS,
    VITE_ENABLE_LOGGING: config.VITE_ENABLE_LOGGING,
    VITE_BUILD_SOURCEMAP: config.VITE_BUILD_SOURCEMAP,
    VITE_APP_NAME: config.VITE_APP_NAME,
    VITE_APP_VERSION: config.VITE_APP_VERSION,
    // 모든 값이 공개되어도 안전한 정보들
  };
}

// 전역 설정 객체
export const appConfig = validateAndSetupEnv();
