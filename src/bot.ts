import { Client, Message, Intents } from "discord.js";

export class Bot {
  private client: Client;
  private readonly token: string = require(`../config.json`)["tokenIdBeta"];

  public listen(): Promise<string> {
    //wot
    console.log(this.token);
    let client = new Client({ intents: [Intents.FLAGS.GUILDS] });
    client.on("message", (message: Message) => {
      message.reply("Complete depression"); //complete depression
    });

    return client.login(this.token);
  }
}
