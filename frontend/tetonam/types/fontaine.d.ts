declare module 'fontaine' {
  export interface FontaineOptions {
    fallbacks?: string[] | Record<string, string[]>;
    resolvePath?: (id: string) => URL | string;
    sourcemap?: boolean;
    overrideName?: (originalName: string) => string;
    skipFontFaceGeneration?: (fallbackName: string) => boolean;
  }
  export const FontaineTransform: {
    vite: (options?: FontaineOptions) => any;
    webpack: (options?: FontaineOptions) => any;
  };
}
