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
import type { MGCommand } from "../../types/command";

const current: MGCommand = {
  data: new SlashCommandBuilder()
    .setName("current")
    .setDescription("Get the current date and time"),

  async execute(interaction) {
    const now = new Date();
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const embed = MGEmbed(MGStatus.Info)
      .setTitle("Current Date and Time")
      .setDescription("Find the current date and time below")
      .addFields(
        { name: "Date", value: now.toDateString(), inline: true },
        { name: "Day", value: days[now.getDay()], inline: true },
        {
          name: "Time",
          value: `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`,
          inline: true,
        }
      );
    await interaction.reply({ embeds: [embed] });
  },
};

export default current;
