import { MGEmbed } from "../../lib/flavoured";
import MGStatus from "../../lib/statuses";
import { MGFirebase } from "../../lib/firebase";
import { Client, Message, TextChannel } from "discord.js";
import { partial_res } from "../../lib/misc";
import { CountingProtection } from "../../types/firebase";

let protect: {
  [guildID: string]: { [channelID: string]: CountingProtection };
} = {};
let deletedMessages: string[] = [];

export function setProtect(
  guild: string,
  channel: string,
  protectConfig: CountingProtection
) {
  if (protect[guild] === undefined) {
    protect[guild] = { [channel]: protectConfig };
    return;
  }
  protect[guild][channel] = protectConfig;
}

const countingListener = [
  {
    name: "ready",
    once: true,
    async execute(client: Client) {
      for (let guildID in client.guilds.cache) {
        let data = await MGFirebase.getData(
          `guild/${guildID}/countingChannels`
        );
        for (let i in data) {
          setProtect(guildID, i, data[i]["protect"]);
        }
      }
    },
  },
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
                `${msg.author.username}, you are not allowed to count twice. This is to prevent one person from counting to a huge number by themselves.`
              ),
          ],
        });
        return;
      }

      if (number - 1 === curCount) {
        // correct!
        guildData["countingChannels"][msg.channel.id]["count"] = number;
        guildData["countingChannels"][msg.channel.id]["id"] = msg.author.id;
        let curChannel = msg.channel as TextChannel;
        await curChannel.setTopic(`Current Count: ${number}`);

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
        await msg.react("✅");
      } else {
        // wrong.
        guildData["countingChannels"][msg.channel.id]["count"] = 0;
        guildData["countingChannels"][msg.channel.id]["id"] = 0;
        let curChannel = msg.channel as TextChannel;
        await curChannel.setTopic("Current Count: 0");
        await msg.react("❌");
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
  //counting protection
  {
    name: "messageUpdate",
    async execute(oldMsg: Message, newMsg: Message) {
      let msg = oldMsg;
      try {
        if (msg.guild === null || msg.author.bot) {
          return;
        }
      } catch {
        return;
      } //this might throw an error if the message that was edited was sent before bot started
      try {
        if (protect[msg.guild.id][msg.channel.id].protection) {
          deletedMessages.push(newMsg.id);
          await newMsg.reply({
            embeds: [
              MGEmbed(MGStatus.Warn)
                .setTitle("A message was EDITED here.")
                .setDescription("The original message was: " + oldMsg.content),
            ],
          });
          try {
            await newMsg.delete();
          } catch {
            return;
          }
        }
      } catch {
        return;
      }
    },
  },
  {
    name: "messageDelete",
    async execute(deletedMessage: Message) {
      let msg = deletedMessage;
      try {
        if (msg.guild === null || msg.author.bot) {
          return;
        }
        if (deletedMessages.includes(`${deletedMessage.id}`)) {
          deletedMessages.splice(
            deletedMessages.indexOf(`${deletedMessage.id}`)
          );
          return;
        }
      } catch {
        return;
      } //this might throw an error if the message that was edited was sent before bot started
      try {
        if (protect[msg.guild.id][msg.channel.id].protection) {
          await deletedMessage.channel.send({
            embeds: [
              MGEmbed(MGStatus.Warn)
                .setTitle("A message was DELETED here.")
                .setDescription("The message was: " + deletedMessage.content),
            ],
          });
        }
      } catch {
        return;
      }
    },
  },
];

export default countingListener;
