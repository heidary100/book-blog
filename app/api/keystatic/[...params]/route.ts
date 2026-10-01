import { makeRouteHandler } from "@keystatic/next/route-handler";
import keystaticConfig from "../../../../keystatic.config";

// Local storage mode needs a writable filesystem — only serve the API in dev.
const enabled = process.env.NODE_ENV === "development";
const handlers = makeRouteHandler({ config: keystaticConfig });

async function guard(request: Request): Promise<Response | null> {
  if (!enabled) return new Response("Not Found", { status: 404 });
  return null;
}

export async function POST(request: Request): Promise<Response> {
  const blocked = await guard(request);
  return blocked ?? handlers.POST(request);
}

export async function GET(request: Request): Promise<Response> {
  const blocked = await guard(request);
  return blocked ?? handlers.GET(request);
}
