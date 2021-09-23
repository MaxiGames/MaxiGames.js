import math from "mathjs";
import { client } from "..";
import { MGEmbed } from "../lib/flavoured";
import MGStatus from "../lib/statuses";
import { MGfirebase } from "../utils/firebase";

// !Register event listeners for counting
export default function CouuntListen() {
  client.on(`message`, async (msg) => {
    console.log("Working");
    if (msg.guild === null) {
      return;
    }

    let guildData = MGfirebase.getData(`guild/${msg?.guild?.id}/`);
    if (guildData["countingChannels"][msg.channel.id] !== undefined) {
      //parse string
      let content = msg.content;
      let number = parseInt(content);
      if (number === NaN) {
        //do more checks
        let arr = content.split(/[^0-9, +,\-, *, /]/g);
        number = parseInt(math.evaluate(arr[0]));
        if (number === NaN) return;
      }

      //Yay time to check if its right :)
      let curCount: number = guildData["countingChannels"][msg.channel.id];
      if (number - 1 === curCount) {
        //correct!
        await msg.react("✅");
        guildData["countingChannels"][msg.channel.id] = number;
        await MGfirebase.setData(`guild/${msg?.guild?.id}`, guildData);
      } else {
        //wrong :(
        await msg.react("❌");
        guildData["countingChannels"][msg.channel.id] = 0;
        await MGfirebase.setData(`guild/${msg?.guild?.id}`, guildData).then(
          async () => {
            await msg.reply({
              embeds: [
                MGEmbed(MGStatus.Error)
                  .setTitle(`${msg.author.username} ruined it!`)
                  .setDescription(
                    `${
                      msg.author.username
                    } counted ${number}, but the next count was ${
                      curCount + 1
                    }. The counter has been reset to 0.`
                  ),
              ],
            });
          }
        );
      }
    } else {
      return;
    }
  });
}
