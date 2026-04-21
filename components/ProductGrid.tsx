import { Product } from "@/lib/types";
import ProductCard from "./ProductCard";

interface ProductGridProps {
  products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  if (!products.length) return null;

  return (
    <div className="product-scroll mt-3 pb-1">
      {products.map((product, i) => (
        <ProductCard key={product.product_id ?? i} product={product} />
      ))}
    </div>
  );
}
