import { NextRequest, NextResponse } from "next/server";
import systemPrompt from "@/lib/systemPrompt";
import {
  allProducts,
  productsByNameLike,
  productBySKU,
  FilteredProductListQuery,
  FilteredProductListQueryFromSQL,
  ProductRow,
} from "@/lib/productService";

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

// ─── In-memory session store ─────────────────────────────────────────────────
const sessionStore = new Map<string, ChatMessage[]>();
const lastProductsStore = new Map<string, ProductRow[]>();

// ─── Raw OpenAI fetch ─────────────────────────────────────────────────────────
async function callOpenAI(messages: ChatMessage[], sid: string): Promise<string> {
  const apiKey = process.env.OPENAI_KEY;
  if (!apiKey) throw new Error("OPENAI_KEY is not set");

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4.1-nano",
      messages,
      user: sid,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`OpenAI ${res.status}: ${JSON.stringify(err)}`);
  }

  const data = await res.json();
  return data.choices[0].message.content.trim();
}

// ─── Chat helper ─────────────────────────────────────────────────────────────
async function chat(userText: string, history: ChatMessage[], sid: string) {
  if (history.length === 0 || history[0].role !== "system") {
    history.unshift({ role: "system", content: systemPrompt });
  }
  history.push({ role: "user", content: userText });

  const raw = await callOpenAI(history, sid);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jsonData: Record<string, any> = JSON.parse(raw);
  history.push({ role: "assistant", content: raw });

  return { jsonData, messages: history };
}

// ─── Route handler ────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  // 1. Validate body — accepts { message, sid? }
  let body: { message?: unknown; sid?: unknown } | null = null;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { status: "error", message: "Invalid JSON body" },
      { status: 400 }
    );
  }

  if (
    !body ||
    typeof body.message !== "string" ||
    body.message.trim().length === 0
  ) {
    return NextResponse.json(
      { status: "error", message: "`message` must be a non-empty string" },
      { status: 400 }
    );
  }

  const userText = body.message.trim();

  // 2. Session ID — from body (client-managed) or generate new
  const sid: string =
    typeof body.sid === "string" && body.sid.length > 0
      ? body.sid
      : crypto.randomUUID();

  const history = sessionStore.get(sid) ?? [];

  try {
    // 3. Call OpenAI with full history
    const { jsonData, messages: updatedMessages } = await chat(userText, history, sid);
    sessionStore.set(sid, updatedMessages);

    // 4. Resolve products from DB based on intent
    let results: ProductRow[] = [];
    const lastProducts = lastProductsStore.get(sid) ?? [];
    const intentName: string = jsonData["Intent Name"] ?? "";

    switch (intentName) {
      case "ProductListAndSearch-CFT":
        results = allProducts(5);
        lastProductsStore.set(sid, results);
        break;

      case "FilteredProductListQuery":
      case "SearchProductByName":
        results = jsonData.sql_query
          ? FilteredProductListQueryFromSQL(jsonData.sql_query)
          : intentName === "SearchProductByName"
          ? productsByNameLike(jsonData.lookup ?? "")
          : FilteredProductListQuery(
              jsonData.lookup,
              jsonData.lookupProductname,
              jsonData.lookupProductprice,
              jsonData.lookupProductpriceFrom,
              jsonData.lookupProductpriceTo
            );
        lastProductsStore.set(sid, results);
        break;

      case "ProductDetailByIndex": {
        const idx = parseInt(jsonData.lookup, 10) - 1;
        if (lastProducts.length > idx && idx >= 0) {
          results = [lastProducts[idx]];
        }
        break;
      }

      case "SpecificDetailsFromSKU":
      case "CompleteDetailsFromSKU": {
        const found = productBySKU(jsonData.lookup ?? "");
        results = found ? [found] : [];
        break;
      }

      case "Interaction":
        break;

      default:
        results = [];
    }

    // 5. Recommended products — hidden for now
    const recommended: ProductRow[] = [];

    // 6. Build response payload
    const suggestions =
      jsonData.suggestions ??
      (results.length
        ? `Want to see more ${jsonData.lookup ?? "products"} or related tools?`
        : "I couldn't find that exact item. Could you provide more detail?");

    const answer =
      jsonData.answer ??
      (results.length
        ? `Here are the ${jsonData.lookup ?? "products"} I found.`
        : `Sorry, I couldn't locate ${jsonData.lookup ?? "that item"} in our catalogue.`);

    const common = {
      intent: intentName,
      type: jsonData.type ?? "info",
      lookup: jsonData.lookup ?? "",
    };

    const infoIntents = [
      "CarbiInformation",
      "ExplainProduct",
      "GiveMoreInfo",
      "Interaction",
      "Fallback",
    ];

    let responseData;
    if (infoIntents.includes(intentName)) {
      responseData = {
        ...common,
        results: jsonData.results ?? "",
        suggestions,
      };
    } else {
      responseData = {
        ...common,
        answer,
        results,
        url: jsonData.url ?? "",
        recommended,
        suggestions,
      };
    }

    // 7. Return response with sid so client can reuse it
    return NextResponse.json({
      status: "success",
      sid,
      data: responseData,
    });

  } catch (err) {
    console.error("[/api/chat] error:", err);
    return NextResponse.json(
      {
        status: "error",
        message: "The assistant failed to respond. Please try again.",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 502 }
    );
  }
}
