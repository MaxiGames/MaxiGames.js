import { Client, Message, Intents } from "discord.js";

export class Bot {
  private client: Client;
  private readonly token: string = require(`../config.json`)["tokenIdBeta"];

  public listen(): Promise<string> {
    //wot
    console.log(this.token);
    this.client = new Client({ intents: [Intents.FLAGS.GUILDS] });
    // client.on("message", (message: Message) => {
    //   message.reply("Complete depression")
    //     .then(() => console.log(`Replied to message "${message.content}"`))
    //     .catch(console.error);
    // });
    this.client.on("message", (message: Message) => {
      console.log("Message received! Contents: ", message.content);
    });

    return this.client.login(this.token);
  }
}
