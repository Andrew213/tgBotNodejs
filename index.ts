import TelegramBot from "node-telegram-bot-api";
import express from "express";
import cors from "cors";
const token = "7615919255:AAEmPdiHWDHU7oJAb6sZQ0xib3C-ji9cNLg";

const app = express();

app.use(express.json());
app.use(cors());

const bot = new TelegramBot(token, { polling: true });

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  console.log(msg.location);
  if (msg.location) {
    const { latitude, longitude } = msg.location;
    const apiKey = "bbbcfeca62893678f22cd3be3365d5fb"; // Replace with your OpenWeatherMap API key
    const APIUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`;
    console.log(`APIUrl `, APIUrl);
    try {
      const response = await fetch(APIUrl);
      console.log(`response `, response);
      if (response.status === 200) {
        const data = (await response.json()) as any;
        const location = data.name;
        const temp = data.main.temp;
        const feelsLike = data.main.feels_like;
        const weendSpeed = data.wind.speed;
        const sunRise = new Date(data.sys.sunrise * 1000);
        const sunSetise = new Date(data.sys.sunset * 1000);
        await bot.sendMessage(
          chatId,
          `Погода в ${location}: 
        Температура воздуха: ${temp}
        Ощущается как: ${feelsLike}
        Скорость ветра: ${weendSpeed}м/c
        Восход: ${sunRise.getHours().toString()}:${sunRise
            .getMinutes()
            .toString()
            .padStart(2, "0")}
        Закат: ${sunSetise.getHours().toString()}:${sunSetise
            .getMinutes()
            .toString()
            .padStart(2, "0")}
        `
        );
      }
    } catch (err) {
      console.log(`err `, err);
    }
  }
});
