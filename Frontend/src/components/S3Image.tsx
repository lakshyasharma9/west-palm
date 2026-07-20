import Image from 'next/image';
import { CSSProperties } from 'react';

interface S3ImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: CSSProperties;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
  fill?: boolean;
  width?: number;
  height?: number;
  onLoad?: () => void;
  onError?: () => void;
}

export default function S3Image({ 
  src, 
  alt, 
  className,
  style,
  loading = 'lazy',
  priority = false,
  fill,
  width,
  height,
  onLoad,
  onError
}: S3ImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      style={style}
      loading={priority ? undefined : loading}
      priority={priority}
      fill={fill}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      onLoad={onLoad}
      onError={onError}
    />
  );
}
