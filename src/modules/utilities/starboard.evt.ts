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

import { MGFirebase } from "../../lib/firebase";
import { MGEmbed } from "../../lib/flavoured";
import MGStatus from "../../lib/statuses";
import { MessageReaction, TextChannel, User } from "discord.js";
import { partial_res } from "../../lib/misc";

const starboardwatch = [
  {
    name: "messageReactionAdd",
    async execute(reaction: MessageReaction, user: User) {
      const t = await partial_res(reaction);
      if (t === undefined) {
        return;
      }
      reaction = t;

      /* Prepare all the data */
      const guilddata = await MGFirebase.getData(
        `guild/${reaction.message.guildId}`
      );
      const sbmsg = (await MGFirebase.justGetData(
        `guild/${reaction.message.guildId}/starboardMsgs/${reaction.message.id}`
      )) || { stars: 0, rxnid: "" };

      if (
        guilddata === undefined ||
        reaction.emoji.name !== "⭐" ||
        guilddata["starboardChannel"] === 0
      ) {
        return;
      }

      sbmsg["stars"] += 1;

      if (reaction.count < guilddata["starboardChannel"]["thresh"]) {
        await MGFirebase.setData(
          `guild/${reaction.message.guildId}/starboardMsgs/${reaction.message.id}`,
          sbmsg
        );
        return;
      }

      let content = reaction.message.content ?? "";
      if (content.trim() !== "") {
        // replace every newline with a newline and a "> "
        content = "\n\n> " + content.replace(/\n/g, "\n> ");
      }

      const embed = MGEmbed(MGStatus.Info)
        .setTitle(`Starred ${reaction.count} times!`)
        .setDescription(
          `[Click to jump to message](${reaction.message.url})` + content
        )
        .setFooter("React with ⭐ to star this message")
        .setAuthor(
          reaction.message.author!.username,
          reaction.message.author!.avatarURL() ??
            reaction.message.author!.defaultAvatarURL
        );
      reaction.message.attachments.each((a) => embed.setImage(a.url));

      const sbchan = (await reaction.client.channels.fetch(
        guilddata["starboardChannel"].id
      )) as TextChannel;

      try {
        // update message if it has been sent before
        await (
          await sbchan.messages.fetch(sbmsg["rxnid"])
        ).edit({ embeds: [embed] });
      } catch {
        // if that failed, (re)send
        const rxnsg = await sbchan.send({ embeds: [embed] });
        sbmsg["rxnid"] = rxnsg.id;
      }

      await MGFirebase.setData(
        `guild/${reaction.message.guildId}/starboardMsgs/${reaction.message.id}`,
        sbmsg
      );

      return;
    },
  },

  {
    name: "messageReactionRemove",
    async execute(reaction: MessageReaction, user: User) {
      const t = await partial_res(reaction);
      if (t === undefined) {
        return;
      }
      reaction = t;

      /* Prepare all the data */
      const guilddata = await MGFirebase.getData(
        `guild/${reaction.message.guildId}`
      );
      const sbmsg = (await MGFirebase.justGetData(
        `guild/${reaction.message.guildId}/starboardMsgs/${reaction.message.id}`
      )) || { stars: 0, rxnid: "" };

      if (
        guilddata === undefined ||
        reaction.emoji.name !== "⭐" ||
        guilddata["starboardChannel"] === 0
      ) {
        return;
      }

      sbmsg["stars"] -= 1;

      let content = reaction.message.content ?? "";
      if (content.trim() !== "") {
        // replace every newline with a newline and a "> "
        content = "\n\n> " + content.replace(/\n/g, "\n> ");
      }
      const embed = MGEmbed(MGStatus.Info)
        .setTitle(`Starred ${reaction.count} times!`)
        .setDescription(
          `[Click to jump to message](${reaction.message.url})` + content
        )
        .setFooter("React with ⭐ to star this message")
        .setAuthor(
          reaction.message.author!.username,
          reaction.message.author!.avatarURL() ??
            reaction.message.author!.defaultAvatarURL
        );
      reaction.message.attachments.each((a) => embed.setImage(a.url));

      const sbchan = (await reaction.client.channels.fetch(
        guilddata["starboardChannel"].id
      )) as TextChannel;

      if (reaction.count < guilddata["starboardChannel"]["thresh"]) {
        try {
          await (await sbchan.messages.fetch(sbmsg["rxnid"])).delete();
        } catch {}
      } else {
        try {
          // update message if it has been sent before
          await (
            await sbchan.messages.fetch(sbmsg["rxnid"])
          ).edit({ embeds: [embed] });
        } catch {
          // if that failed, (re)send
          const rxnsg = await sbchan.send({ embeds: [embed] });
          sbmsg["rxnid"] = rxnsg.id;
        }
      }

      await MGFirebase.setData(
        `guild/${reaction.message.guildId}/starboardMsgs/${reaction.message.id}`,
        sbmsg
      );

      return;
    },
  },
];

export default starboardwatch;
