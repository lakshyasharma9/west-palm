/**
 * OptimizedImage Component - Production Ready with Smart Loading
 * 
 * Smart image component that:
 * - Uses Next.js optimization for local/public images (WebP/AVIF conversion)
 * - Bypasses optimization for S3 images (prevents timeout/500 errors)
 * - Automatically detects image source and applies appropriate strategy
 * - Smart lazy loading with priority support
 * - Supports ref forwarding for GSAP animations
 */

import Image, { ImageProps } from 'next/image';
import { forwardRef } from 'react';

export interface OptimizedImageProps extends Omit<ImageProps, 'src'> {
  src: string;
  priority?: boolean;
  loading?: 'lazy' | 'eager';
}

const OptimizedImage = forwardRef<HTMLImageElement, OptimizedImageProps>(
  function OptimizedImage({ src, priority = false, loading, ...props }, ref) {
    // Check if image is from S3 (remote)
    const isS3Image =
      src.includes('s3.amazonaws.com') ||
      src.includes('s3.eu-north-1.amazonaws.com') ||
      src.startsWith('projects/') ||
      src.startsWith('attachments/');

    // Smart loading strategy
    const imageLoading = priority ? undefined : (loading || 'lazy');

    return (
      <Image
        ref={ref}
        src={src}
        unoptimized={isS3Image}
        priority={priority}
        loading={imageLoading}
        {...props}
      />
    );
  }
);

export default OptimizedImage;
