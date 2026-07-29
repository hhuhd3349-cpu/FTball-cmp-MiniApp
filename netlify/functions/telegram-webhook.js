export default async (req) => {
  if (req.method !== "POST") {
    return new Response("OK", { status: 200 });
  }

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const APP_URL = process.env.APP_URL; // e.g. https://your-site.netlify.app

  if (!BOT_TOKEN || !APP_URL) {
    console.error("Missing TELEGRAM_BOT_TOKEN or APP_URL env vars");
    return new Response("Server not configured", { status: 500 });
  }

  let update;
  try {
    update = await req.json();
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  const message = update.message;
  if (!message || !message.text) {
    return new Response("OK", { status: 200 });
  }

  const chatId = message.chat.id;
  const text = message.text.trim();

  if (text === "/start") {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: "⚽ Welcome to Premier Football Companion — your ultimate match-day companion!\n\nExplore tactical playbooks, classic fan chants, and test your knowledge with trivia. Tap the button below to join the club.",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🏆 Open Premier Football Companion",
                web_app: { url: APP_URL }
              }
            ]
          ]
        }
      })
    });
  } else {
    // Fallback for any other message
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: "Type /start to join the club ⚽"
      })
    });
  }

  return new Response("OK", { status: 200 });
};

export const config = { path: "/api/telegram-webhook" };
