import { notFound } from "next/navigation";
import Database from "better-sqlite3";
import path from "path";
import ProductImage from "@/components/ProductImage";
import ProductPageHeader from "@/components/ProductPageHeader";

function getProductByHandle(handle: string) {
  const db = new Database(path.join(process.cwd(), "products.sqlite"), {
    readonly: true,
  });
  return db
    .prepare(`SELECT * FROM products WHERE handle = ? LIMIT 1`)
    .get(handle) as Record<string, unknown> | undefined;
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const product = getProductByHandle(handle);

  if (!product) notFound();

  const price =
    typeof product.price === "number"
      ? (product.price as number).toFixed(2)
      : parseFloat(String(product.price) || "0").toFixed(2);

  const inventory =
    (product.inventory as number) ??
    (product.total_inventory_qty as number) ??
    0;

  const imgSrc = (product.img_src as string) || "https://cdn.shopify.com/s/files/1/0643/4648/8910/files/placeholder-image11.jpg";
  const tags = product.tags
    ? (product.tags as string).split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-[#f0f0f0]">
      {/* Header */}
      <ProductPageHeader />

      {/* Product */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image */}
          <div className="bg-[#1a1a1a] rounded-2xl overflow-hidden border border-[#2e2e2e] aspect-square flex items-center justify-center">
            <ProductImage
              src={imgSrc}
              alt={product.title as string}
            />
          </div>

          {/* Details */}
          <div className="flex flex-col gap-4">
            {/* Collection badge */}
            {product.smart_collections && (
              <span className="text-xs text-[#991a32] font-medium uppercase tracking-wider">
                {(product.smart_collections as string).split(",")[0].trim()}
              </span>
            )}

            <h1 className="text-2xl font-bold text-[#f0f0f0] leading-tight">
              {product.title as string}
            </h1>

            {/* Price & Stock */}
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-[#991a32]">
                ₹{price}
              </span>
              <span
                className={`text-sm px-3 py-1 rounded-full font-medium ${
                  inventory > 0
                    ? "bg-green-900/40 text-green-400"
                    : "bg-red-900/40 text-red-400"
                }`}
              >
                {inventory > 0 ? `${inventory} in stock` : "Out of stock"}
              </span>
            </div>

            {/* Vendor */}
            {product.vendor && (
              <div className="text-sm text-[#888888]">
                <span className="text-[#aaaaaa]">Vendor:</span>{" "}
                {product.vendor as string}
              </div>
            )}

            {/* SKU */}
            {product.variant_sku && (
              <div className="text-sm text-[#888888]">
                <span className="text-[#aaaaaa]">SKU:</span>{" "}
                {product.variant_sku as string}
              </div>
            )}

            {/* Weight */}
            {product.weight && (
              <div className="text-sm text-[#888888]">
                <span className="text-[#aaaaaa]">Weight:</span>{" "}
                {product.weight as string} {product.unit as string}
              </div>
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.slice(0, 8).map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-[#2e2e2e] text-[#aaaaaa] px-2 py-1 rounded-lg"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Contact CTA */}
            <div className="mt-4 p-4 bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl">
              <p className="text-sm text-[#888888] mb-3">
                Interested in this product? Get in touch with us.
              </p>
              <div className="flex flex-col gap-2 text-sm">
                <a
                  href="tel:+919879613386"
                  className="flex items-center gap-2 text-[#f0f0f0] hover:text-[#991a32] transition-colors"
                >
                  <span>📞</span> +91 98796 13386
                </a>
                <a
                  href="mailto:haidelimdi@gmail.com"
                  className="flex items-center gap-2 text-[#f0f0f0] hover:text-[#991a32] transition-colors"
                >
                  <span>✉️</span> haidelimdi@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {product.body_html && (
          <div className="mt-8 bg-[#1a1a1a] border border-[#2e2e2e] rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4 text-[#f0f0f0]">
              Product Description
            </h2>
            <div
              className="text-sm text-[#aaaaaa] leading-relaxed prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: product.body_html as string }}
            />
          </div>
        )}
      </main>
    </div>
  );
}
