import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useProduct } from '@/hooks/useProduct';
import { useAddToCart } from '@/hooks/useAddToCart';
import {
  firstAvailableVariant,
  getStock,
  resolveVariant,
} from '@/data/variants';
import { ImageGallery } from '@/components/ImageGallery/ImageGallery';
import { Price } from '@/components/Price/Price';
import { ColorSwatches } from '@/components/VariantSelector/ColorSwatches';
import { SizeSelector } from '@/components/VariantSelector/SizeSelector';
import { QuantityPicker } from '@/components/QuantityPicker/QuantityPicker';
import { ErrorState } from '@/components/common/ErrorState';
import { Spinner } from '@/components/common/Spinner';
import { CheckIcon, ChevronLeftIcon } from '@/components/common/Icons';
import { ProductDetailSkeleton } from './ProductDetailSkeleton';
import styles from './ProductDetail.module.scss';

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const numericId = Number(id);
  const { product, loading, error, reload } = useProduct(numericId);

  const [searchParams, setSearchParams] = useSearchParams();
  const urlColor = searchParams.get('color');
  const urlSize = searchParams.get('size');
  const [quantity, setQuantity] = useState(1);

  const { status, error: addError, add } = useAddToCart();

  // Resolve the active variant: honour URL params when present (deep links),
  // otherwise default to the first *buyable* variant.
  const selection = useMemo(() => {
    if (!product) return null;
    if (urlColor || urlSize) return resolveVariant(product, urlColor, urlSize);
    return firstAvailableVariant(product) ?? resolveVariant(product, null, null);
  }, [product, urlColor, urlSize]);

  // Canonicalise the URL so it always reflects the resolved variant (makes the
  // page deep-linkable and shareable in its exact state).
  useEffect(() => {
    if (!product || !selection) return;
    if (selection.colorId !== urlColor || selection.sizeId !== urlSize) {
      setSearchParams(
        { color: selection.colorId, size: selection.sizeId },
        { replace: true },
      );
    }
  }, [product, selection, urlColor, urlSize, setSearchParams]);

  // Reset quantity when the product changes.
  useEffect(() => {
    setQuantity(1);
  }, [numericId]);

  if (loading) return <ProductDetailSkeleton />;

  if (error || !product || !selection) {
    return (
      <div className={styles.stateWrap}>
        <ErrorState
          title="Product not available"
          message={error ?? 'That product could not be found.'}
          onRetry={Number.isFinite(numericId) ? reload : undefined}
        />
        <Link to="/" className={styles.backLink}>
          ← Back to shop
        </Link>
      </div>
    );
  }

  const setColor = (colorId: string) =>
    setSearchParams(
      { color: colorId, size: selection.sizeId },
      { replace: true },
    );
  const setSize = (sizeId: string) =>
    setSearchParams(
      { color: selection.colorId, size: sizeId },
      { replace: true },
    );

  const currentStock = getStock(product, selection.colorId, selection.sizeId);
  const soldOut = currentStock === 'sold_out';
  const isAdding = status === 'loading';

  const handleAdd = () => {
    if (soldOut || isAdding) return;
    add(product, selection.colorId, selection.sizeId, quantity, {
      openDrawerOnSuccess: true,
    });
  };

  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link to="/" className={styles.crumbLink}>
          <ChevronLeftIcon width={16} height={16} />
          Shop
        </Link>
        <span className={styles.crumbSep}>/</span>
        <span className={styles.crumbCurrent}>{product.category}</span>
      </nav>

      <div className={styles.layout}>
        <div className={styles.galleryCol}>
          <ImageGallery src={product.image} alt={product.title} />
        </div>

        <div className={styles.infoCol}>
          <p className={styles.brand}>{product.brand}</p>
          <h1 className={styles.title}>{product.title}</h1>

          <div className={styles.priceRow}>
            <Price product={product} size="lg" showBadge />
            <span className={styles.rating} title={`Rated ${product.rating.rate} of 5`}>
              ★ {product.rating.rate.toFixed(1)}
              <span className={styles.ratingCount}>
                ({product.rating.count})
              </span>
            </span>
          </div>

          <div className={styles.variants}>
            <ColorSwatches
              product={product}
              selectedColorId={selection.colorId}
              onSelect={setColor}
            />
            <SizeSelector
              product={product}
              selectedColorId={selection.colorId}
              selectedSizeId={selection.sizeId}
              onSelect={setSize}
            />
          </div>

          <div className={styles.purchase}>
            <QuantityPicker
              value={quantity}
              onChange={setQuantity}
              label={`Quantity for ${product.title}`}
            />
            <button
              type="button"
              className={styles.addBtn}
              onClick={handleAdd}
              disabled={soldOut || isAdding}
              data-status={status}
            >
              {soldOut ? (
                'Sold out'
              ) : isAdding ? (
                <>
                  <Spinner size={18} label="Adding to cart" /> Adding…
                </>
              ) : status === 'success' ? (
                <>
                  <CheckIcon width={18} height={18} /> Added to cart
                </>
              ) : (
                'Add to cart'
              )}
            </button>
          </div>

          {status === 'error' && addError && (
            <p className={styles.addError} role="alert">
              {addError}
            </p>
          )}

          <div className={styles.description}>
            <h2 className={styles.descHeading}>Details</h2>
            <p>{product.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
