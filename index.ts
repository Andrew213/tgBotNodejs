import { config } from "dotenv";
config();
import TelegramBot from "node-telegram-bot-api";

const token = process.env.ISABEL_BOT as string;
// const token = process.env.TRANSLATE_BOT as string;

const webAppUrl = "https://corpus-speeds-derby-turned.trycloudflare.com";
const bot = new TelegramBot(token, { polling: true });

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  if (text === "/start") {
    await bot.sendMessage(chatId, "Открыть web app", {
      reply_markup: {
        inline_keyboard: [[{ text: "Открыть", web_app: { url: webAppUrl } }]],
      },
    });
  }
});
