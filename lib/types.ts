export interface Product {
  product_id: string | number;
  handle: string;
  title: string;
  img_src: string;
  price: number | string;
  inventory?: number;
  total_inventory_qty?: number;
  tags?: string;
  smart_collections?: string;
  url?: string;
}

export interface BotResponseData {
  intent: string;
  type: "product" | "info" | "interact";
  answer?: string;
  results: Product[] | string;
  recommended?: Product[];
  suggestions?: string;
  url?: string;
  lookup?: string;
}

export interface BotResponse {
  status: "success" | "error";
  data: BotResponseData;
  message?: string;
}

export type MessageRole = "user" | "bot";

export interface Message {
  id: string;
  role: MessageRole;
  text: string;
  type?: "product" | "info" | "interact";
  products?: Product[];
  recommended?: Product[];
  suggestions?: string;
  isError?: boolean;
}
