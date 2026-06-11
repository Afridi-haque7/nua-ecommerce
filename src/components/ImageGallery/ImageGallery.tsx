import { useEffect, useState, type CSSProperties } from 'react';
import { ProductImage } from '@/components/common/ProductImage';
import styles from './ImageGallery.module.scss';

interface ImageGalleryProps {
  src: string;
  alt: string;
}

/**
 * The Fake Store API ships a single image per product, so a real multi-asset
 * gallery isn't possible. Rather than fake it with duplicate thumbnails, we
 * derive a few framed "views" (full shot + detail crops) of the same asset.
 * Clicking a thumbnail swaps the main view — the interaction the spec asks for,
 * built honestly on the one image we have.
 */
const VIEWS: { id: string; label: string; style: CSSProperties }[] = [
  { id: 'full', label: 'Full', style: { transform: 'scale(1)' } },
  {
    id: 'detail',
    label: 'Detail',
    style: { transform: 'scale(1.6)', transformOrigin: '50% 38%' },
  },
  {
    id: 'top',
    label: 'Top',
    style: { transform: 'scale(1.4)', transformOrigin: '50% 12%' },
  },
  {
    id: 'corner',
    label: 'Corner',
    style: { transform: 'scale(1.5)', transformOrigin: '82% 82%' },
  },
];

export function ImageGallery({ src, alt }: ImageGalleryProps) {
  const [activeId, setActiveId] = useState(VIEWS[0].id);

  // Reset to the full view whenever the product image changes.
  useEffect(() => {
    setActiveId(VIEWS[0].id);
  }, [src]);

  const active = VIEWS.find((v) => v.id === activeId) ?? VIEWS[0];

  return (
    <div className={styles.gallery}>
      <div className={styles.main}>
        <ProductImage
          key={activeId}
          src={src}
          size={800}
          alt={alt}
          style={active.style}
          className={styles.mainImg}
          decoding="async"
          // The hero image is the LCP element — fetch it at high priority.
          // Lowercase passes through React 18 as a real DOM attribute.
          fetchpriority="high"
        />
      </div>

      <ul className={styles.thumbs} aria-label="Product views">
        {VIEWS.map((view) => (
          <li key={view.id}>
            <button
              type="button"
              className={styles.thumb}
              data-active={view.id === activeId}
              onClick={() => setActiveId(view.id)}
              aria-label={`${view.label} view`}
              aria-pressed={view.id === activeId}
            >
              <ProductImage
                src={src}
                size={160}
                alt=""
                style={view.style}
                aria-hidden="true"
              />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
