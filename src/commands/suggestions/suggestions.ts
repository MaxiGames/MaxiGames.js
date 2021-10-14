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
import { MGFirebase } from "../../utils/firebase";
import MGCommand from "../../types/command";
import { ThreadChannel } from "discord.js";
import { Suggestions } from "../../types/firebase";

const suggestions: MGCommand = {
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
    let suggestion = interaction.options.getString("suggestion")!;
    let data = MGFirebase.getData("admin/suggestions");

    //check if its a repeate suggestion
    for (let i in data) {
      if (data[i]["suggeston"] === suggestions) {
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

    //send it to MG server
    let channel = interaction.client.guilds.cache
      .get(`866939574419849216`)
      ?.channels.cache.get("866939574419849219") as ThreadChannel;
    await channel
      .send({
        embeds: [
          MGEmbed(MGStatus.Success)
            .setTitle(
              `Suggestion from ${interaction.user.username}#${interaction.user.discriminator}`
            )
            .setThumbnail(`${interaction.user.avatarURL()}`)
            .setDescription(suggestion),
        ],
      })
      .then(async (message) => {
        let suggestion1: Suggestions = {
          suggestion: suggestion,
          status: "in-progress",
          user: parseInt(interaction.user.id),
        };
        data[message.id] = suggestion1;
        await MGFirebase.setData(`admin/suggestions`, data);
        await interaction.reply({
          embeds: [
            MGEmbed(MGStatus.Success)
              .setTitle("Submitted suggestion!")
              .setDescription(
                "Your suggestion has been submitted in the MaxiGames Official server: https://discord.gg/hkkkTqhGAz. You will be promptly notified once it has been reviewed! Thanks :D"
              ),
          ],
        });
      });
  },
};

export default suggestions;
