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
 * File: src/commands/cases/snakecase.ts
 * Description: snakecase command handler
 */

import { SlashCommandBuilder } from "@discordjs/builders";
import type MyCommand from "../../types/command";
import { MGEmbed } from "../../lib/flavoured";
import MGStatus from "../../lib/statuses";

let snakeCaseFunc = require("lodash/snakeCase") as (param: string) => string;

const snakeCase: MyCommand = {
  data: new SlashCommandBuilder()
    .setName("snakecase")
    .setDescription("Convert some text into snakecase")
    .addStringOption((option) =>
      option
        .setName("string")
        .setDescription("Text that you want to change")
        .setRequired(true)
    ),

  // I think you should know what this does.
  async execute(interaction) {
    const toConvert = interaction.options.getString("string");

    if (toConvert === null) return;

    let embed = MGEmbed(MGStatus.Success)
      .setTitle("Succesfully snakedcased!")
      .setDescription(`sanke_cased Result: ${snakeCaseFunc(toConvert)}`);

    await interaction.reply({ embeds: [embed] });
  },
};

export default snakeCase;
