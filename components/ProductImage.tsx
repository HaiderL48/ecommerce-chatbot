"use client";

import { useState } from "react";

const PLACEHOLDER =
  "https://cdn.shopify.com/s/files/1/0643/4648/8910/files/placeholder-image11.jpg";

interface ProductImageProps {
  src: string;
  alt: string;
}

export default function ProductImage({ src, alt }: ProductImageProps) {
  const [imgSrc, setImgSrc] = useState(src || PLACEHOLDER);

  return (
    <img
      src={imgSrc}
      alt={alt}
      onError={() => setImgSrc(PLACEHOLDER)}
      className="w-full h-full object-cover"
    />
  );
}
