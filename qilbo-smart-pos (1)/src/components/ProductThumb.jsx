import React from "react";
import { Image } from "@/components/ui/image";
import { getCategoryType, categoryColor } from "@/lib/categories";

export default function ProductThumb({ product, size = "w-10 h-10", rounded = "rounded-lg", className = "" }) {
  if (!product) return <div className={`${size} ${rounded} bg-slate-100 ${className}`} />;
  if (product.image_url) {
    return <Image src={product.image_url} alt={product.name} className={`${size} ${rounded} ${className}`} fittingType="fill" />;
  }
  const c = categoryColor(product.category_type);
  const ct = getCategoryType(product.category_type);
  const Icon = ct.icon;
  return (
    <div className={`${size} ${rounded} ${c.soft} ${c.text} flex items-center justify-center ${className}`}>
      <Icon className="w-1/2 h-1/2 opacity-70" />
    </div>
  );
}