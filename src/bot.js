"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bot = void 0;
const discord_js_1 = require("discord.js");
class Bot {
  constructor() {
    this.token = require(`../config.json`)["tokenIdBeta"];
  }
  listen() {
    //wot
    console.log(this.token);
    this.client = new discord_js_1.Client({
      intents: [discord_js_1.Intents.FLAGS.GUILDS],
    });
    // client.on("message", (message: Message) => {
    //   message.reply("Complete depression")
    //     .then(() => console.log(`Replied to message "${message.content}"`))
    //     .catch(console.error);
    // });
    this.client.on("message", (message) => {
      console.log("Message received! Contents: ", message.content);
    });
    return this.client.login(this.token);
  }
}
exports.Bot = Bot;
//# sourceMappingURL=bot.js.map
