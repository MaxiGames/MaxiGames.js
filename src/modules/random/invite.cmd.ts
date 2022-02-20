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
import { MGCommand } from "../../types/command";

const invite: MGCommand = {
  data: new SlashCommandBuilder()
    .setName("invite")
    .setDescription("Invite MaxiGames to your server :D"),
  async execute(interaction) {
    const embed = MGEmbed()
      .setTitle("Invite Maxigames :D")
      .setDescription(
        "[Click here!](https://discord.com/api/oauth2/authorize?client_id=863419048041381920&permissions=399397481590&scope=bot%20applications.commands)"
      )
      .setColor("#57F287");
    await interaction.reply({ embeds: [embed] });
  },
};
export default invite;
