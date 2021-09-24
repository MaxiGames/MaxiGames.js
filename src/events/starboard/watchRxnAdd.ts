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

import { MGfirebase } from "../../utils/firebase";
import { MGEmbed } from "../../lib/flavoured";
import MGStatus from "../../lib/statuses";
import { MessageReaction, User } from "discord.js";

const starboardwatch = {
  name: "messageReactionAdd",
  async execute(reaction: MessageReaction, user: User) {
    let guildData = MGfirebase.getData(`guild/${reaction.message.guildId}`);

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

    if (reaction.emoji.name !== "star") {
      return;
    }

    if (guildData["starboardChannel"] === 0) {
      return; // no starboard channel set
    }

    if (guildData["starboardMsgs"] === 0) {
      guildData["starboardMsgs"] = {};
      guildData["starboardMsgs"][reaction.message.id] = 0;
    }

    guildData["starboardMsgs"][reaction.message.id] += 1;

    try {
      await MGfirebase.setData(
        `guild/${reaction.message.guild!.id}`,
        guildData
      );
      if (reaction.count >= guildData["starboardChannel"].thresh) {
        await reaction.message.channel.send({
          embeds: [
            MGEmbed(MGStatus.Info)
              .setTitle(`Starred ${reaction.count} times!`)
              .setDescription(
                `[Click to jump to message](${reaction.message.url})` +
                  `
               \n\n${reaction.message.content}`
              )
              .setFooter("React with ⭐ to star this message")
              .setAuthor(
                reaction.message.author!.username,
                reaction.message.author!.avatar!
              ),
          ],
        });
      }
    } catch {
      // oops I guess?
    }
  },
};

export default starboardwatch;
