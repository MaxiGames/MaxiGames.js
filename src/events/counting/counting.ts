import { Client } from "discord.js";
import math from "mathjs";
import { MGEmbed } from "../../lib/flavoured";
import MGStatus from "../../lib/statuses";
import { MGfirebase } from "../../utils/firebase";
import { Message } from "discord.js";

const countingListener = {
  name: "messageCreate",
  async execute(msg: Message) {
    if (msg.guild === null || msg.author.bot) {
      return;
    }

    let guildData = MGfirebase.getData(`guild/${msg?.guild?.id}`);
    if (!guildData["countingChannels"]) {
      return;
    }
    if (guildData["countingChannels"][msg.channel.id] === undefined) {
      return;
    }
    // parse string
    let content = msg.content;
    let number = parseInt(content);
    if (isNaN(number)) {
      // do more checks
      let arr = content.split(/[^0-9, +,\-, *, \/]/g);
      if (arr[0] === "") return;
      number = parseInt(math.evaluate(arr[0]));
      if (isNaN(number)) return;
    }

    // Yay time to check if it's right :)
    let curCount: number =
      guildData["countingChannels"][msg.channel.id]["count"];
    let id = guildData["countingChannels"][msg.channel.id]["id"];

    // same person?
    if (id === msg.author.id) {
      guildData["countingChannels"][msg.channel.id] = { count: 0, id: 0 };
      await MGfirebase.setData(`guild/${msg?.guild?.id}`, guildData);
      await msg.react("❌");
      await msg.reply({
        embeds: [
          MGEmbed(MGStatus.Error)
            .setTitle(`${msg.author.username} ruined it!`)
            .setDescription(
              `${msg.author.username} counted twice! The counter has been reset to 0.`
            ),
        ],
      });
      return;
    }

    if (number - 1 === curCount) {
      // correct!
      await msg.react("✅");
      guildData["countingChannels"][msg.channel.id] = {
        count: number,
        id: msg.author.id,
      };
      await MGfirebase.setData(`guild/${msg?.guild?.id}`, guildData);
    } else {
      // wrong.
      await msg.react("❌");
      guildData["countingChannels"][msg.channel.id] = { count: 0, id: 0 };
      await MGfirebase.setData(`guild/${msg?.guild?.id}`, guildData);
      await msg.reply({
        embeds: [
          MGEmbed(MGStatus.Error)
            .setTitle(`${msg.author.username} ruined it!`)
            .setDescription(
              `${msg.author.username} counted ${number}, but the next count was ` +
                `${curCount + 1}. The counter has been reset to 0.`
            ),
        ],
      });
    }
  },
};

export default countingListener;
