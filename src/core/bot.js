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
              text: "ℹ️ More information about GitHub",
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

const updateStatistics = async (userId) => {
  const today = new Date().toISOString().split("T")[0];

  const stats = await StatsModel.findById(today);
  if (!stats) {
    await StatsModel.create({
      _id: today,
      totalRequests: 1,
      uniqueUsers: [userId],
    });
  } else {
    stats.totalRequests += 1;

    if (!stats.uniqueUsers.includes(userId)) {
      stats.uniqueUsers.push(userId);
    }

    await stats.save();
  }
};

const getLast30DaysStats = async () => {
  const today = new Date();
  const last30Days = new Date(today.setDate(today.getDate() - 30));

  const stats = await StatsModel.find({
    _id: { $gte: last30Days.toISOString().split("T")[0] },
  });

  const totalRequests = stats.reduce((sum, day) => sum + day.totalRequests, 0);

  return totalRequests;
};

const getTodayStats = async () => {
  const today = new Date().toISOString().split("T")[0];
  const stats = await StatsModel.findOne({ _id: today });

  if (!stats) return { totalRequests: 0, uniqueUsers: 0 };

  return {
    totalRequests: stats.totalRequests,
    uniqueUsers: stats.uniqueUsers.length,
  };
};

bot.on("text", async (ctx) => {
  if (ctx.msg.text == "/stats") {
    try {
      const users = await UserModel.countDocuments();
      const { totalRequests, uniqueUsers } = await getTodayStats();
      const last30DaysStats = await getLast30DaysStats();

      ctx.reply(
        `📊 Bot statistics\n\n👤 <b>All Users:</b> ${users}\n<b>Today's requests:</b> ${totalRequests}\n<b>Today's unique users:</b> ${uniqueUsers}\n<b>Last 30 day of requests:</b> ${last30DaysStats}`,
        {
          parse_mode: "HTML",
        }
      );
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
    await updateStatistics(ctx.from.id);
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
