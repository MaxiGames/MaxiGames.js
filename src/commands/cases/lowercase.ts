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

/*
 * File: src/commands/cases/lowercase.ts
 * Description: Handles command to convert text to lowercase
 */

import { SlashCommandBuilder } from "@discordjs/builders";
import type MyCommand from "../../types/command";
import { MGEmbed } from "../../lib/flavoured";
import MGStatus from "../../lib/statuses";

let lowerCaseFunc = require("lodash/lowerCase") as (param: string) => string;

// Export data
const lowercase: MyCommand = {
  data: new SlashCommandBuilder()
    .setName("lowercase")
    .setDescription("Convert some text into lowercase")
    .addStringOption((option) =>
      option
        .setName("string")
        .setDescription("Text that you want to change")
        .setRequired(true)
    ),

  // execution data
  async execute(interaction) {
    const toConvert = interaction.options.getString("string");

    if (toConvert === null) return; // >:(

    let embed = MGEmbed(MGStatus.Success)
      .setTitle("Succesfully lowercased!")
      .setDescription(`lowercased Result: ${lowerCaseFunc(toConvert)}`);

    await interaction.reply({ embeds: [embed] });
  },
};

export default lowercase;
