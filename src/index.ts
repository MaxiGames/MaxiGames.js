import { Client, Message } from "discord.js";
export class Bot {
  public listen(): Promise<string> {
    let client = new Client();
    client.on("message", (message: Message) => {});
    return client.login("token should be here");
  }
}
