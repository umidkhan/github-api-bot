const { Telegraf, Scenes, session } = require("telegraf");
const mongoose = require("mongoose");
const UserModel = require("../models/userModel");
const StatsModel = require("../models/statsModel");
const { searchScene } = require("./scenes");
const statsModel = require("../models/statsModel");
require("dotenv").config();

const bot = new Telegraf(process.env.BOT_TOKEN);

mongoose
  .connect(process.env.DB_URI)
  .then(() => console.log("Successfully connected to database"))
  .catch((err) => console.log("Error connecting to database", err));

const stage = new Scenes.Stage([searchScene]);
bot.use(session());
bot.use(stage.middleware());

bot.start(async (ctx) => {
  try {
    const isExist = await UserModel.findOne({ chatId: ctx.from.id });
    if (!isExist) {
      await UserModel.create({
        chatId: ctx.from.id,
        firstName: ctx.from.firstName,
        usnername: ctx.from.username,
      }).then(async () => {
        await ctx.telegram.sendMessage(
          -1002069272637,
          `Yangi foydalanuvchi ro'yxatdan o'tdi!\n👤 Ism: <a href="tg://user?id=${
            ctx.from.id
          }">${ctx.from.first_name}</a>\n🆔 Chat ID: <code>${
            ctx.from.id
          }</code>\n🔗 Username: ${
            ctx.from.username === undefined
              ? "Username not set"
              : "@" + ctx.from.username
          }`,
          { parse_mode: "HTML" }
        );
      });
    }
  } catch (err) {
    console.log(err, "Error with getting user data");
    ctx.reply("Something went wrong, please try again later");
  }

  ctx.reply(
    `<b>Welcome to the bot <a href="tg://user?id=${ctx.from.id}" >${ctx.from.first_name}</a></b>\n\nThis bot finds user data from GitHub platform\nTo do this, enter your GitHub username`,
    {
      parse_mode: "HTML",
      link_preview_options: {
        is_disabled: true,
      },
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "ℹ️ About GitHub platform",
              url: "https://docs.github.com/",
            },
          ],
        ],
      },
    }
  );
});

bot.command("/stats", async (ctx) => {
  try {
    const users = await UserModel.find({});
    ctx.reply(`<b>Users:</b> ${users.length}`);
  } catch (err) {
    console.log(err, "Error with getting user data");
    ctx.reply("Something went wrong, please try again later");
  }
});

bot.on("text", async (ctx) => {
  if (ctx.msg.text == "/stats") {
    try {
      const users = await UserModel.countDocuments();
      ctx.reply(`👤 <b>Users:</b> ${users}`, {
        parse_mode: "HTML",
      });
    } catch (err) {
      console.log(err, "Error with getting user data");
      ctx.reply("Something went wrong, please try again later");
    }
  } else if (
    ctx.msg.text.startsWith("/") ||
    ctx.msg.text.startsWith("https://") ||
    ctx.msg.text.startsWith("http://")
  ) {
    return ctx.reply("Invalid format ❌");
  } else {
    ctx.session.gitHubUser = ctx.msg.text;
    return ctx.scene.enter("search");
  }
});

bot.on("message", (ctx) => {
  ctx.reply("Please enter your GitHub username");
});

bot.launch(() => {
  console.log("Bot started");
  bot.telegram.sendMessage(5511267540, `Bot has started`);
});

module.exports = statsModel;
