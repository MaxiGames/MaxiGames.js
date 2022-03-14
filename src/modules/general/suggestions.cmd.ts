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

import { SlashCommandBuilder } from "@discordjs/builders";
import { MGEmbed } from "../../lib/flavoured";
import MGStatus from "../../lib/statuses";
import { MGFirebase } from "../../lib/firebase";
import type { MGCommand } from "../../types/command";
import { MessageActionRow, MessageButton, ThreadChannel } from "discord.js";
import { Suggestions } from "../../types/firebase";
import withChecks from "../../lib/checks";
import cooldownCheck from "../../lib/checks/cooldown";

const suggestions: MGCommand = withChecks([cooldownCheck(10)], {
  data: new SlashCommandBuilder()
    .setName("suggestion")
    .setDescription("Suggest something for the bot!")
    .addStringOption((option) =>
      option
        .setName("suggestion")
        .setDescription("What suggestion do you want to give?")
        .setRequired(true)
    ),

  async execute(interaction) {
    const suggestion = interaction.options.getString("suggestion")!;
    const data = await MGFirebase.getData("admin/suggestions");

    //check if its a repeated suggestion
    for (const i in data) {
      if (data[i]["suggestion"] === suggestions) {
        await interaction.reply({
          embeds: [
            MGEmbed(MGStatus.Error)
              .setTitle("That suggestion already exists!")
              .setDescription(
                "Check the open suggestions at https://discord.gg/hkkkTqhGAz!"
              ),
          ],
        });
        return;
      }
    }

    // send it to the MG server
    const channel = interaction.client.guilds.cache
      .get(
        process.env.NODE_ENV === "production"
          ? "837522963389349909"
          : "866939574419849216"
      )
      ?.channels.cache.get(
        process.env.NODE_ENV === "production"
          ? "897738840054317078"
          : "873835031880163330"
      ) as ThreadChannel;
    const message = await channel.send({
      embeds: [
        MGEmbed(MGStatus.Success)
          .setTitle(
            `**Suggestion** from ${interaction.user.username}#${interaction.user.discriminator} (${interaction.user.id})`
          )
          .setThumbnail(
            `${
              interaction.user.avatarURL() ??
              "https://avatars.githubusercontent.com/u/88721933?s=200&v=4"
            }`
          )
          .setDescription(suggestion),
      ],
      components: [
        new MessageActionRow().addComponents([
          new MessageButton()
            .setCustomId("Accept-suggestions")
            .setLabel("Accept")
            .setStyle("SUCCESS"),
          new MessageButton()
            .setCustomId("Reject-suggestions")
            .setLabel("Reject")
            .setStyle("DANGER"),
        ]),
      ],
    });
    const suggestion1: Suggestions = {
      suggestion: suggestion,
      status: "in-progress",
      user: parseInt(interaction.user.id),
    };
    data[message.id] = suggestion1;
    await interaction.reply({
      embeds: [
        MGEmbed(MGStatus.Success)
          .setTitle("Submitted suggestion!")
          .setDescription(
            "Your suggestion has been submitted in the MaxiGames Official server: https://discord.gg/hkkkTqhGAz. You will be promptly notified once it has been reviewed! Thanks :D"
          ),
      ],
    });
    await MGFirebase.setData("admin/suggestions", data);
    await message.react("⬆️");
    await message.react("⬇️");
  },
});

export default suggestions;
