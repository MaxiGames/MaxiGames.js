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

import { MGFirebase } from "../../utils/firebase";
import { MGEmbed } from "../../lib/flavoured";
import MGStatus from "../../lib/statuses";
import { MessageReaction, TextChannel, User } from "discord.js";

const starboardwatch = {
	name: "messageReactionRemove",
	async execute(reaction: MessageReaction, user: User) {
		const guildData = await MGFirebase.getData(
			`guild/${reaction.message.guildId}`
		);
		if (guildData === undefined) {
			return;
		}

		/*
    if (reaction.partial) {
      try {
        await reaction.fetch();
      } catch (error) {
        console.error("Something went wrong when fetching the message:", error);
        return;
      }
    }
    */

		if (reaction.emoji.name !== "⭐") {
			return;
		}

		if (guildData["starboardChannel"] === 0) {
			return; // no starboard channel set
		}

		if (!guildData["starboardMsgs"]) {
			return;
		}
		if (guildData["starboardMsgs"][reaction.message.id] === undefined) {
			return;
		}

		guildData["starboardMsgs"][reaction.message.id]["stars"] -= 1;

		try {
			await MGFirebase.setData(
				`guild/${reaction.message.guild!.id}`,
				guildData
			);

			const sbchan = reaction.client.channels.cache.get(
				guildData["starboardChannel"].id
			) as TextChannel;

			const oldmsg = await sbchan.messages.fetch(
				guildData["starboardMsgs"][reaction.message.id]["rxnid"]
			);

			if (reaction.count < guildData["starboardChannel"].thresh) {
				oldmsg.delete();
			}

			if (reaction.message.content!.trim() !== "") {
				// if there's no message content don't show just a >; it's ugly
				// yes I know this code is even uglier, but quite frankly, I don't care.
				reaction.message.content =
					"\n\n> " + reaction.message.content!.replace(/\n/g, "\n> ");
			}

			const embed = MGEmbed(MGStatus.Info)
				.setTitle(`Starred ${reaction.count} times!`)
				.setDescription(
					`[Click to jump to message](${reaction.message.url})` +
						reaction.message.content
				)
				.setFooter("React with ⭐ to star this message")
				.setAuthor(
					reaction.message.author!.username,
					reaction.message.author!.avatarURL() ??
						reaction.message.author!.defaultAvatarURL
				);
			reaction.message.attachments.each((a) => embed.setImage(a.url));

			await oldmsg.edit({ embeds: [embed] });
		} catch {
			// oops I guess?
		}
	},
};

export default starboardwatch;
