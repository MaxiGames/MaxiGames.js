import { MGEmbed } from "../../lib/flavoured";
import MGStatus from "../../lib/statuses";
import { MGFirebase } from "../../lib/firebase";
import { Message, TextChannel } from "discord.js";
import { partial_res } from "../../lib/misc";

const countingListener = [
  {
    name: "messageCreate",
    async execute(msg: Message) {
      const t = await partial_res(msg);
      if (t === undefined) {
        return;
      }
      msg = t;

      if (msg.guild === null || msg.author.bot) {
        return;
      }

      // parse string
      const content = msg.content;
      let number = parseInt(content);
      if (isNaN(number)) {
        // do more checks
        const arr = content.split(/[^0-9, +,\-, *, /]/g);
        if (arr[0] === "") {
          return;
        }
        number = parseInt(arr[0]);
        if (isNaN(number)) {
          return;
        }
      }

      const guildData = await MGFirebase.getData(`guild/${msg?.guild?.id}`);
      if (guildData === undefined) {
        return;
      }

      if (!guildData["countingChannels"]) {
        return;
      }
      if (guildData["countingChannels"][msg.channel.id] === undefined) {
        return;
      }

      // Yay time to check if it's right :)
      const curCount: number =
        guildData["countingChannels"][msg.channel.id]["count"];
      const id = guildData["countingChannels"][msg.channel.id]["id"];

      // same person?
      if (id === msg.author.id) {
        await msg.react("⚠️");
        await msg.reply({
          embeds: [
            MGEmbed(MGStatus.Warn)
              .setTitle(`You cannot count twice!`)
              .setDescription(
                `${msg.author.username}, you are not allowed to count twice. This is to prevent 1 person from counting to a huge number by themself.`
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
        await (msg.channel as TextChannel).setTopic(`Current Count: ${number}`);

        // show on statistics
        guildData["statistics"]["totalCount"] += 1;
        if (guildData["statistics"]["highestCount"] < number) {
          guildData["statistics"]["highestCount"] = number;
          await MGFirebase.setData(`guild/${msg?.guild?.id}`, guildData);
          await msg.react("⚡");
        } else {
          await MGFirebase.setData(`guild/${msg?.guild?.id}`, guildData);
        }

        // add to personal statistics
        const userData = await MGFirebase.getData(`user/${msg.author.id}`);
        userData["count"]["totalCount"]++;
        if (userData["count"]["highestCount"] < number) {
          userData["count"]["highestCount"] = number;
        }
        await MGFirebase.setData(`user/${msg.author.id}`, userData);
      } else {
        // wrong.
        await msg.react("❌");
        guildData["countingChannels"][msg.channel.id] = {
          count: 0,
          id: 0,
        };
        await (msg.channel as TextChannel).setTopic("Current Count: 0");
        await MGFirebase.setData(`guild/${msg?.guild?.id}`, guildData);
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
  },
];

export default countingListener;
