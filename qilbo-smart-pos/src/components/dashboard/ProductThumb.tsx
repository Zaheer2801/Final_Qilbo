import { useState } from "react";
import type { ReactNode } from "react";
import { Package } from "lucide-react";
import type { Product } from "../../types";
import { titleCase } from "../../lib/format";
import { CategoryPill } from "../ui";

/** Product image with a graceful fallback to the placeholder icon —
 * both when no imageUrl is on record, and when a stored URL 404s at
 * runtime (onError), so a stale/broken link never renders as a blank box.
 * `zoomOnHover` shows a large version alongside the thumb on hover —
 * used where the base thumb is too small to read on its own (e.g. the
 * detail panel's 64px header image). */
export function ProductThumb({
  product,
  className,
  iconSize = 20,
  zoomOnHover = false,
}: {
  product: Product;
  className: string;
  iconSize?: number;
  zoomOnHover?: boolean;
}) {
  const [errored, setErrored] = useState(false);
  const showImg = !!product.imageUrl && !errored;

  const thumb = (
    <div className={className}>
      {showImg ? (
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-contain"
          onError={() => setErrored(true)}
        />
      ) : (
        <Package size={iconSize} className="text-stone-300" />
      )}
    </div>
  );

  if (!zoomOnHover || !showImg) return thumb;

  return (
    <div className="relative group/zoom inline-block shrink-0">
      {thumb}
      <div className="pointer-events-none opacity-0 group-hover/zoom:opacity-100 transition-opacity duration-150 absolute z-50 left-full ml-3 top-0 w-64 h-64 rounded-lg border border-stone-200 bg-white shadow-xl overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
}

/** Hover popover: high-res image, name/brand, category/size, stock & price.
 * Render as a sibling inside a `relative group` wrapper — shows on
 * `group-hover`. Kept separate from ProductDetailPanel (the click-to-open
 * full detail modal), which also covers vendor/expiry/margin. */
export function ProductHoverPreview({
  product,
  align = "center",
}: {
  product: Product;
  align?: "center" | "left";
}) {
  const [errored, setErrored] = useState(false);
  const showImg = !!product.imageUrl && !errored;
  const alignCls = align === "left" ? "left-0" : "left-1/2 -translate-x-1/2";

  return (
    <div
      className={`pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 absolute z-40 ${alignCls} top-full mt-2 w-60 rounded-lg border border-stone-200 bg-white shadow-lg p-3`}
    >
      <div className="w-full h-32 rounded-md bg-stone-100 border border-stone-200 flex items-center justify-center overflow-hidden mb-2">
        {showImg ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-contain"
            onError={() => setErrored(true)}
          />
        ) : (
          <Package size={28} className="text-stone-300" />
        )}
      </div>
      <div className="text-sm font-semibold leading-tight truncate">
        {titleCase(product.name)}
      </div>
      {product.brand && (
        <div className="text-xs text-stone-500 truncate">{titleCase(product.brand)}</div>
      )}
      <div className="flex items-center gap-1.5 mt-1.5">
        <CategoryPill category={product.category} />
        {product.size && <span className="text-xs text-stone-500">{product.size}</span>}
      </div>
      <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-stone-100">
        <span className="text-stone-600">{product.qty} on hand</span>
        <span className="font-medium text-stone-800">
          ${product.sellingPrice.toFixed(2)}
        </span>
      </div>
    </div>
  );
}

/** Wraps any product-name text so hovering it shows the same quick-preview
 * popover the Inventory card grid uses — the goal is that a product is
 * always one hover away from its image/price/stock, not just from its own
 * card (Pricing table, Expiry list, Procurement list, wherever a name
 * shows up). */
export function HoverableProductName({
  product,
  align = "left",
  className,
  children,
}: {
  product: Product;
  align?: "center" | "left";
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={`relative inline-block group cursor-default ${className ?? ""}`}
    >
      {children}
      <ProductHoverPreview product={product} align={align} />
    </span>
  );
}
