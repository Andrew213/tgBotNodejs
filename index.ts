import { createClient } from "@deepgram/sdk";
import { config } from "dotenv";
config();
import TelegramBot from "node-telegram-bot-api";
import fs from "fs";
import { AssemblyAI } from "assemblyai";

// const token = process.env.ISABEL_BOT as string;
const token = process.env.TRANSLATE_BOT as string;

// const webAppUrl = "https://db63-46-172-31-151.ngrok-free.app";
const bot = new TelegramBot(token, { polling: true });

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLY as string,
});

bot.on("message", async (msg) => {
  console.log(msg);
  const chatId = msg.chat.id;
  const text = msg.text;
  if (text === "/start") {
    const from = msg.from?.first_name;
    await bot.sendMessage(
      chatId,
      `Привет, ${from}. Попроси меня перевести аудиоособщение в текст, ответив на него`
    );
  }

  if (msg.reply_to_message?.video_note) {
    const from = msg.reply_to_message.from?.first_name;

    const video = msg.reply_to_message.video_note;
    const file = await bot.getFile(video.file_id);
    const name = file.file_path?.split("/").at(-1)!;

    await bot.downloadFile(video.file_id, "");
    const deepgramApiKey = process.env.DEEPGRAM as string;
    const deepgram = createClient(deepgramApiKey);
    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      fs.readFileSync(name),
      {
        model: "nova-2",
        smart_format: true,
        language: "ru",
      }
    );
    if (error) {
      console.log(`err`, error);
    }
    const text = result?.results.channels[0].alternatives[0].transcript;
    if (result?.results.channels[0].alternatives[0].transcript) {
      await bot.sendMessage(chatId, `${from} пиздит: "${text}"`);
    }
    console.log(123);
  }

  if (msg.reply_to_message?.voice) {
    if (text?.match(/переведи/gi)) {
      const from = msg.reply_to_message.from?.first_name;
      const voice = msg.reply_to_message.voice;
      fs.readdir(".", (err, files) => {
        for (const f of files) {
          const ext = f.split(".").at(-1);
          if (ext === "oga") {
            fs.unlinkSync(f);
          }
        }
      });
      const file = await bot.getFile(voice.file_id);
      await bot.downloadFile(file.file_id, "");
      const name = file.file_path?.split("/").at(-1)!;
      // const transcript = await client.transcripts.transcribe({
      //   audio: fs.readFileSync(name),
      //   language_code: "ru",
      // });
      // console.log(transcript.text);

      const deepgramApiKey = process.env.DEEPGRAM as string;
      const deepgram = createClient(deepgramApiKey);
      const { result, error } =
        await deepgram.listen.prerecorded.transcribeFile(
          fs.readFileSync(name),
          {
            model: "nova-2",
            smart_format: true,
            language: "ru",
          }
        );
      const text = result?.results.channels[0].alternatives[0].transcript;
      if (result?.results.channels[0].alternatives[0].transcript) {
        await bot.sendMessage(chatId, `${from} пиздит: "${text}"`);
      }
      // console.dir(result, { depth: null });
      console.log(result?.results.channels[0].alternatives[0].transcript);
    }
  }
});

// bot.on("voice", async (msg) => {
//   if (msg.voice) {
//     fs.readdir(".", (err, files) => {
//       for (const f of files) {
//         const ext = f.split(".").at(-1);
//         if (ext === "oga") {
//           fs.unlinkSync(f);
//         }
//       }
//     });
//     const file = await bot.getFile(msg.voice.file_id);
//     await bot.downloadFile(file.file_id, "");
//     const name = file.file_path?.split("/").at(-1)!;
//     const read = fs.readFileSync(name!);

//     // fs.unlinkSync("*.oga");
//     const deepgramApiKey = process.env.DEEPGRAM as string;
//     const deepgram = createClient(deepgramApiKey);
//     console.log(`file`, fs.readFileSync(name));
//     const transcript = await client.transcripts.transcribe({
//       audio: fs.readFileSync(name),
//       language_code: "ru",
//     });
//     console.log(transcript.text);
//     // const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
//     //   fs.readFileSync(name),
//     //   {
//     //     model: "nova-2",
//     //     smart_format: true,
//     //     language: "ru",
//     //   }
//     // );
//     // if (error) {
//     //   console.log(`error `, error);
//     // }
//     // if (result) {
//     //   console.log(`result `, result, result.results.channels[0].alternatives);
//     // }
//     // deepgram.
//     // console.log(`file`, file);
//   }
// });
// bot.on("message", async (msg) => {
//   const chatId = msg.chat.id;
//   const text = msg.text;
//   // console.log(`msg `, msg);
//   // bot.deleteMessage(chatId, msg.message_id);
//   if (text === "/start") {
//     await bot.sendMessage(chatId, "asd", {
//       reply_markup: {
//         inline_keyboard: [[{ text: "Открыть", web_app: { url: webAppUrl } }]],
//       },
//     });
//   }
// });

// bot.on("message", async (msg) => {
//   const chatId = msg.chat.id;
//   const text = msg.text;
//   console.log(msg.location);
//   if (msg.location) {
//     const { latitude, longitude } = msg.location;
//     const apiKey = process.env.API_KEY; // Replace with your OpenWeatherMap API key
//     const APIUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`;
//     console.log(`APIUrl `, APIUrl);
//     try {
//       const response = await fetch(APIUrl);
//       console.log(`response `, response);
//       if (response.status === 200) {
//         const data = (await response.json()) as any;
//         const location = data.name;
//         const temp = data.main.temp;
//         const feelsLike = data.main.feels_like;
//         const weendSpeed = data.wind.speed;
//         const sunRise = new Date(data.sys.sunrise * 1000);
//         const sunSetise = new Date(data.sys.sunset * 1000);
//         await bot.sendMessage(
//           chatId,
//           `Погода в ${location}:
//         Температура воздуха: ${temp}
//         Ощущается как: ${feelsLike}
//         Скорость ветра: ${weendSpeed}м/c
//         Восход: ${sunRise.getHours().toString()}:${sunRise
//             .getMinutes()
//             .toString()
//             .padStart(2, "0")}
//         Закат: ${sunSetise.getHours().toString()}:${sunSetise
//             .getMinutes()
//             .toString()
//             .padStart(2, "0")}
//         `
//         );
//       }
//     } catch (err) {
//       console.log(`err `, err);
//     }
//   }
// });

// // npm install assemblyai

// import { AssemblyAI } from 'assemblyai'

// const client = new AssemblyAI({
//   apiKey: "12089b963583436999654cc7e88fdae6"
// })

// const audioUrl =
//   'https://storage.googleapis.com/aai-web-samples/5_common_sports_injuries.mp3'

// const config = {
//   audio_url: audioUrl
// }

// const run = async () => {
//   const transcript = await client.transcripts.transcribe({'f'})
//   console.log(transcript.text)
// }

// run()
