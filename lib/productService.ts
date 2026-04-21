import Database from "better-sqlite3";
import path from "path";

// products.sqlite lives at the root of the ecommerce-chatbot/ folder.
// process.cwd() is ecommerce-chatbot/ when Next.js runs.
const DB_PATH = path.join(process.cwd(), "products.sqlite");

// Singleton — reuse the same connection across hot-reloads in dev
let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH, { readonly: true });
  }
  return _db;
}

export interface ProductRow {
  product_id: string;
  handle: string;
  title: string;
  body_html?: string;
  vendor?: string;
  tags?: string;
  created_at?: string;
  updated_at?: string;
  url?: string;
  smart_collections?: string;
  img_src?: string;
  weight?: number;
  unit?: string;
  price: number;
  total_inventory_qty?: number;
  inventory?: number;
}

export function allProducts(limit = 5): ProductRow[] {
  const db = getDb();
  return db
    .prepare(
      `SELECT product_id, handle, title, smart_collections, img_src, weight, unit,
              price, total_inventory_qty AS inventory, updated_at
       FROM products
       ORDER BY updated_at DESC
       LIMIT ?`
    )
    .all(limit) as ProductRow[];
}

export function productsByCategory(cat: string, limit = 5): ProductRow[] {
  const db = getDb();
  const key = cat.toLowerCase().replace(/s$/, "");
  const rows = db
    .prepare(
      `SELECT product_id, handle, title, price, img_src,
              total_inventory_qty AS inventory, tags, smart_collections
       FROM products
       WHERE lower(smart_collections) LIKE ? OR lower(tags) LIKE ?
       LIMIT ?`
    )
    .all(`%${key}%`, `%${key}%`, limit) as ProductRow[];

  if (rows.length) return rows;

  // fallback: search title
  return db
    .prepare(
      `SELECT product_id, handle, title, price, img_src,
              total_inventory_qty AS inventory
       FROM products
       WHERE lower(title) LIKE ?
       LIMIT ?`
    )
    .all(`%${key}%`, limit) as ProductRow[];
}

export function productsByNameLike(q: string, limit = 5): ProductRow[] {
  const db = getDb();
  const normalized = q.toLowerCase().replace(/[-\s]/g, "");
  return db
    .prepare(
      `SELECT product_id, handle, title, price, img_src,
              total_inventory_qty AS inventory
       FROM products
       WHERE REPLACE(REPLACE(LOWER(title), '-', ''), ' ', '') LIKE ?
       LIMIT ?`
    )
    .all(`%${normalized}%`, limit) as ProductRow[];
}

export function productBySKU(sku: string): ProductRow | undefined {
  const db = getDb();
  return db
    .prepare(`SELECT * FROM products WHERE variant_sku = ? LIMIT 1`)
    .get(sku) as ProductRow | undefined;
}

export function FilteredProductListQuery(
  lookup?: string,
  lookupProductname?: string,
  lookupProductprice?: string,
  lookupProductpriceFrom?: string,
  lookupProductpriceTo?: string
): ProductRow[] {
  const db = getDb();
  const parts: string[] = ["SELECT product_id, handle, title, body_html, vendor, tags, created_at, updated_at, url, smart_collections, img_src, weight, unit, price, total_inventory_qty FROM products WHERE 1=1"];
  const params: (string | number)[] = [];

  const term = lookupProductname || lookup;
  if (term) {
    parts.push("AND (lower(tags) LIKE ? OR lower(title) LIKE ? OR lower(smart_collections) LIKE ?)");
    const t = `%${term.toLowerCase()}%`;
    params.push(t, t, t);
  }

  if (lookupProductpriceFrom && lookupProductpriceTo) {
    parts.push("AND price >= ? AND price <= ?");
    params.push(Number(lookupProductpriceFrom), Number(lookupProductpriceTo));
  } else if (lookupProductpriceFrom) {
    parts.push("AND price >= ?");
    params.push(Number(lookupProductpriceFrom));
  } else if (lookupProductpriceTo) {
    parts.push("AND price <= ?");
    params.push(Number(lookupProductpriceTo));
  } else if (lookupProductprice) {
    parts.push("AND price = ?");
    params.push(Number(lookupProductprice));
  }

  parts.push("ORDER BY price ASC LIMIT 5");

  return db.prepare(parts.join(" ")).all(...params) as ProductRow[];
}

export function FilteredProductListQueryFromSQL(sql_query: string): ProductRow[] {
  if (!/^\s*select\s+/i.test(sql_query)) {
    throw new Error("Only SELECT queries are allowed.");
  }
  const db = getDb();
  return db.prepare(sql_query).all() as ProductRow[];
}
