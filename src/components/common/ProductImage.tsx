import { useEffect, useState, type ImgHTMLAttributes } from 'react';
import { optimizedImageUrl } from '@/utils/image';

interface ProductImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  /** Target render width in px (pre-DPR); the proxy resizes to this. */
  size: number;
}

/**
 * An <img> that loads a resized webp via the image proxy and falls back to
 * the original API URL if the proxy errors.
 */
export function ProductImage({ src, size, ...rest }: ProductImageProps) {
  const [failed, setFailed] = useState(false);

  // A new product image resets the fallback state.
  useEffect(() => setFailed(false), [src]);

  return (
    <img
      {...rest}
      src={failed ? src : optimizedImageUrl(src, size)}
      onError={() => setFailed(true)}
    />
  );
}
