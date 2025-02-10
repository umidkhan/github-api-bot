const { Scenes } = require("telegraf");
const axios = require("axios");

const searchScene = new Scenes.BaseScene("search");
const GitHubApi = "https://api.github.com/users/";

searchScene.enter(async (ctx) => {

  try {
    await axios.get(GitHubApi + ctx.session.gitHubUser).then(async (res) => {
      const data = res.data;
      await ctx.replyWithPhoto(
        `${
          data.avatar_url === null
            ? "Profile picture not found 🤷"
            : data.avatar_url
        }`,
        {
          caption: `<b>Name</b>: ${
            data.name === null ? "Name not found 🤷" : data.name
          }\n<b>Username</b>: ${data.login}\n🆔 <b>ID</b>: <code>${
            data.id
          }</code>\n🌐 <b>URL</b>: ${data.html_url}\nℹ️ <b>Type</b>: ${
            data.type
          }\n👥 <b>Number of followers</b>: ${
            data.followers === 0 ? "No follower available 🤷" : data.followers
          }\n🔗 <b>Additional links</b>: ${
            data.blog === "" ? "Additioan links not found 🤷" : data.blog
          }\n📝 <b>Bio</b>: ${
            data.bio === null ? "Bio not set 🤷" : data.bio
          }\n💾 <b>Public repositories</b>: ${
            data.public_repos === 0
              ? "No repositories available"
              : data.public_repos
          }\n📍 <b>Location</b>: ${
            data.location === null ? "Not given 🤷" : data.location
          }\n🕰 <b>Time the account was created</b>: ${
            data.created_at
          }\n\n<i>Easily find GitHub users with </i><b>@github_username_bot</b>!`,
          parse_mode: "HTML",
        },
        {
          reply_to_message_id: ctx.msg.message_id,
        }
      );
    });
    return ctx.scene.leave();
  } catch (err) {
    console.log(err, "Error with getting data from GitHub API");
  }
});

searchScene.on("text", async (ctx) => {
  if (
    ctx.msg.text.startsWith("https://") ||
    ctx.msg.text.startsWith("http://")
  ) {
    return ctx.reply("Invalid format ❌");
  }
});

module.exports = searchScene;
