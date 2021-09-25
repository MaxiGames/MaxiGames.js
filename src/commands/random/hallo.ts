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
import MGCommand from "../../types/command";

const hallo: MGCommand = {
  data: new SlashCommandBuilder()
    .setName("hallo")
    .setDescription("Say hallo to someone :D")
    .addIntegerOption((option) =>
      option
        .setName("love")
        .setDescription("How much hallo can you give? :D")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("Name of the person you want to say hallo to!")
        .setRequired(false)
    ),
  async execute(interaction) {
    const love: number = interaction.options.getInteger("love") || 1;
    const name: string =
      interaction.options.getString("name") || interaction.user.username;
    if (love > 1800) {
      await interaction.reply({
        content: "Ono we only have 1800 love to give ;-;",
        ephemeral: true,
      });
    } else if (love < 1) {
      await interaction.reply({
        content: "No hate! >:(",
        ephemeral: true,
      });
    } else {
      await interaction.reply(`Hall${"o".repeat(love)} ${name}!!!`);
    }
  },
};

export default hallo;
