import { MGEmbed } from "../../lib/flavoured";
import MGStatus from "../../lib/statuses";
import { MGFirebase } from "../../lib/firebase";
import { Message } from "discord.js";
import { partialRes } from "../../lib/misc";

const countingListener = [
  {
    name: "messageCreate",
    async execute(umsg: Message) {
      const msg = await partialRes(umsg);
      if (msg === undefined) {
        return;
      }

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
        await msg.delete();
        await msg.channel.send({
          embeds: [
            MGEmbed(MGStatus.Warn)
              .setAuthor(msg.author.username, msg.author.displayAvatarURL())
              .setTitle(number.toString())
              .setDescription("You aren't allowed to count twice in a row!"),
          ],
        });
        return;
      }

      if (number - 1 === curCount) {
        // correct!
        guildData["countingChannels"][msg.channel.id]["count"] = number;
        guildData["countingChannels"][msg.channel.id]["id"] = msg.author.id;

        // add to personal statistics
        const userData = await MGFirebase.getData(`user/${msg.author.id}`);
        userData["count"]["totalCount"]++;
        if (userData["count"]["highestCount"] < number) {
          userData["count"]["highestCount"] = number;
        }

        await MGFirebase.setData(`user/${msg.author.id}`, userData);
        await msg.delete();

        // the previous one is no longer a highscore
        try {
          const pmsg = await partialRes(
            await msg.channel.messages.fetch(
              guildData["countingChannels"][msg.channel.id]["prevmsg"]
            )
          );
          if (pmsg?.embeds[0].description === "Highscore!") {
            pmsg.edit({ embeds: [pmsg.embeds[0].setDescription("")] });
          }
        } catch {
          // don't even log it, it is in no way an error
        }

        const smsg = await msg.channel.send({
          embeds: [
            MGEmbed(MGStatus.Success)
              .setAuthor(msg.author.username, msg.author.displayAvatarURL())
              .setTitle(number.toString())
              .setDescription(
                guildData["statistics"]["highestCount"] < number
                  ? "Highscore!"
                  : ""
              ),
          ],
        });
        guildData["countingChannels"][msg.channel.id]["prevmsg"] = smsg.id;

        // show on statistics, perhaps update
        guildData["statistics"]["totalCount"] += 1;
        if (guildData["statistics"]["highestCount"] < number) {
          guildData["statistics"]["highestCount"] = number;
        }
      } else {
        // wrong.
        guildData["countingChannels"][msg.channel.id]["count"] = 0;
        guildData["countingChannels"][msg.channel.id]["id"] = 0;
        await msg.delete();
        const smsg = await msg.channel.send({
          embeds: [
            MGEmbed(MGStatus.Error)
              .setAuthor(msg.author.username, msg.author.displayAvatarURL())
              .setTitle(number.toString())
              .setDescription(
                `...but the next number is ${curCount + 1}. ` +
                  "Counter reset to 0."
              ),
          ],
        });
        guildData["countingChannels"][msg.channel.id]["prevmsg"] = smsg.id;
      }

      await MGFirebase.setData(`guild/${msg?.guild?.id}`, guildData);
    },
  },
];

export default countingListener;
