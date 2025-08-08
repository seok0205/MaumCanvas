import { cn } from '@/utils/cn';
import { useEffect, useRef, useState } from 'react';

interface OptimizedImageProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
  lazy?: boolean;
  aspectRatio?: string;
  quality?: number;
}

export function OptimizedImage({
  src,
  alt,
  className,
  fallback = '/images/placeholder.svg',
  lazy = true,
  aspectRatio,
  quality = 85,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [inView, setInView] = useState(!lazy);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!lazy) return;

    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [lazy]);

  const getOptimizedSrc = (originalSrc: string) => {
    // Check if it's already optimized or external
    if (originalSrc.includes('webp') || originalSrc.includes('http')) {
      return originalSrc;
    }

    // Convert to WebP if possible
    const extension = originalSrc.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png'].includes(extension || '')) {
      return originalSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    }

    return originalSrc;
  };

  const handleLoad = () => {
    setIsLoaded(true);
    setError(false);
  };

  const handleError = () => {
    setError(true);
    setIsLoaded(true);
  };

  return (
    <div
      ref={imgRef}
      className={cn(
        'relative overflow-hidden bg-gray-100',
        aspectRatio && `aspect-[${aspectRatio}]`,
        className
      )}
      style={{ aspectRatio }}
    >
      {inView && (
        <>
          <img
            src={error ? fallback : getOptimizedSrc(src)}
            alt={alt}
            onLoad={handleLoad}
            onError={handleError}
            className={cn(
              'w-full h-full object-cover transition-opacity duration-300',
              isLoaded ? 'opacity-100' : 'opacity-0'
            )}
            loading={lazy ? 'lazy' : 'eager'}
            decoding='async'
            {...props}
          />
          {!isLoaded && (
            <div className='absolute inset-0 bg-gray-200 animate-pulse' />
          )}
        </>
      )}
      {!inView && lazy && <div className='absolute inset-0 bg-gray-200' />}
    </div>
  );
}
