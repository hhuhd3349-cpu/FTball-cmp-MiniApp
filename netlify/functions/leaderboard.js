import { getStore } from "@netlify/blobs";

export default async (req) => {
  const store = getStore("leaderboard");
  const cors = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }

  if (req.method === "GET") {
    const list = (await store.get("entries", { type: "json" })) || [];
    return new Response(JSON.stringify(list), { headers: cors });
  }

  if (req.method === "POST") {
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: cors });
    }

    const { name, score, total } = body;
    if (!name || typeof score !== "number" || typeof total !== "number") {
      return new Response(JSON.stringify({ error: "Invalid payload" }), { status: 400, headers: cors });
    }

    const list = (await store.get("entries", { type: "json" })) || [];
    list.push({
      name: String(name).slice(0, 24),
      score,
      total,
      date: new Date().toISOString().slice(0, 10)
    });
    list.sort((a, b) => b.score - a.score);
    const trimmed = list.slice(0, 50);
    await store.setJSON("entries", trimmed);

    return new Response(JSON.stringify(trimmed), { headers: cors });
  }

  return new Response("Method not allowed", { status: 405, headers: cors });
};

export const config = { path: "/api/leaderboard" };
