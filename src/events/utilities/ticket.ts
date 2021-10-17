/*
 * This file is part of the MaxiGames.js bot.
 * Copyright (C) 2021  the MaxiGames dev team
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { Client } from "discord.js";
import math from "mathjs";
import { MGEmbed } from "../../lib/flavoured";
import MGStatus from "../../lib/statuses";
import { MGFirebase } from "../../utils/firebase";
import { Interaction, ButtonInteraction } from "discord.js";

const ticketListener = {
	name: "interactionCreate",
	async execute(int: Interaction) {
		if (int.isButton()) {
			// console.log(`Button interaction created by ${int.user} in message by ${int.message.author} with the id ${int.message.id} in channel ${int.channel}`);
			// console.log(int.component.label)
		}
		// if (msg.guild === null || msg.author.bot) {
		//   return;
		// }

		// let guildData = MGFirebase.getData(`guild/${msg?.guild?.id}`);
		// if (guildData === undefined) {
		//   return;
		// }

		// if (!guildData["countingChannels"]) {
		//   return;
		// }
		// if (guildData["countingChannels"][msg.channel.id] === undefined) {
		//   return;
		// }
		// // parse string
		// let content = msg.content;
		// let number = parseInt(content);
		// if (isNaN(number)) {
		//   // do more checks
		//   let arr = content.split(/[^0-9, +,\-, *, \/]/g);
		//   if (arr[0] === "") return;
		//   number = parseInt(math.evaluate(arr[0]));
		//   if (isNaN(number)) return;
		// }

		// // Yay time to check if it's right :)
		// let curCount: number =
		//   guildData["countingChannels"][msg.channel.id]["count"];
		// let id = guildData["countingChannels"][msg.channel.id]["id"];

		// // same person?
		// if (id === msg.author.id) {
		//   guildData["countingChannels"][msg.channel.id] = { count: 0, id: 0 };
		//   await MGFirebase.setData(`guild/${msg?.guild?.id}`, guildData);
		//   await msg.react("❌");
		//   await msg.reply({
		//     embeds: [
		//       MGEmbed(MGStatus.Error)
		//         .setTitle(`${msg.author.username} ruined it!`)
		//         .setDescription(
		//           `${msg.author.username} counted twice! The counter has been reset to 0.`
		//         ),
		//     ],
		//   });
		//   return;
		// }

		// if (number - 1 === curCount) {
		//   // correct!
		//   await msg.react("✅");
		//   guildData["countingChannels"][msg.channel.id] = {
		//     count: number,
		//     id: msg.author.id,
		//   };

		//   //show on statistics
		//   guildData["statistics"]["totalCount"] += 1;
		//   if (guildData["statistics"]["highestCount"] < number) {
		//     guildData["statistics"]["highestCount"] = number;
		//   }
		//   await MGFirebase.setData(`guild/${msg?.guild?.id}`, guildData);

		//   //add to personal statistics
		//   let userData = MGFirebase.getData(`user/${msg.author.id}`);
		//   userData["count"]["totalCount"]++;
		//   if (userData["count"]["highestCount"] < number) {
		//     userData["count"]["highestCount"] = number;
		//   }
		//   await MGFirebase.setData(`user/${msg.author.id}`, userData);
		// } else {
		//   // wrong.
		//   await msg.react("❌");
		//   guildData["countingChannels"][msg.channel.id] = { count: 0, id: 0 };
		//   await MGFirebase.setData(`guild/${msg?.guild?.id}`, guildData);
		//   await msg.reply({
		//     embeds: [
		//       MGEmbed(MGStatus.Error)
		//         .setTitle(`${msg.author.username} ruined it!`)
		//         .setDescription(
		//           `${msg.author.username} counted ${number}, but the next count was ` +
		//             `${curCount + 1}. The counter has been reset to 0.`
		//         ),
		//     ],
		//   });
		// }
	},
};

export default ticketListener;
