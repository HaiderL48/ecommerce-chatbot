import { Product } from "@/lib/types";
import ProductGrid from "./ProductGrid";

interface RecommendedSectionProps {
  products: Product[];
}

export default function RecommendedSection({ products }: RecommendedSectionProps) {
  const capped = products.slice(0, 4);
  if (!capped.length) return null;

  return (
    <div className="mt-4 pt-3 border-t border-[#2e2e2e]">
      <p className="text-xs text-[#888888] font-medium mb-1 uppercase tracking-wide">
        You may also like
      </p>
      <ProductGrid products={capped} />
    </div>
  );
}
