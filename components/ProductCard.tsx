"use client";

import { useState } from "react";
import { Product } from "@/lib/types";

const PLACEHOLDER =
  "https://cdn.shopify.com/s/files/1/0643/4648/8910/files/placeholder-image11.jpg";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [imgSrc, setImgSrc] = useState(product.img_src || PLACEHOLDER);

  const inventory =
    product.inventory ?? product.total_inventory_qty ?? 0;

  const price =
    typeof product.price === "number"
      ? product.price.toFixed(2)
      : parseFloat(String(product.price) || "0").toFixed(2);

  const productUrl = `https://carbiforce.shop/products/${product.handle}`;

  return (
    <div className="flex-shrink-0 w-44 bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl overflow-hidden hover:border-[#991a32] hover:-translate-y-1 hover:shadow-lg hover:shadow-black/40 transition-all duration-200 group">
      {/* Image */}
      <div className="h-32 bg-[#242424] overflow-hidden">
        <img
          src={imgSrc}
          alt={product.title}
          onError={() => setImgSrc(PLACEHOLDER)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
        />
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col gap-2">
        <h4 className="text-xs font-medium text-[#f0f0f0] leading-tight line-clamp-2">
          {product.title}
        </h4>

        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-[#991a32]">
            ₹{price}
          </span>
          <span
            className={`text-xs px-1.5 py-0.5 rounded-full ${
              inventory > 0
                ? "bg-green-900/40 text-green-400"
                : "bg-red-900/40 text-red-400"
            }`}
          >
            {inventory > 0 ? `${inventory} in stock` : "Out of stock"}
          </span>
        </div>

        <a
          href={productUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 text-center text-xs bg-[#991a32] hover:bg-[#b01f3a] text-white rounded-lg py-1.5 transition-colors"
        >
          View Product
        </a>
      </div>
    </div>
  );
}
