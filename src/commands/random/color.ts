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
import { ColorResolvable, MessageEmbed } from "discord.js";

const color: MGCommand = {
  data: new SlashCommandBuilder()
    .setName("randcolor")
    .setDescription("Get a random color"),
  async execute(interaction) {
    const arr = [
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "a",
      "b",
      "c",
      "d",
      "e",
      "f",
    ];
    let color = "#";
    for (let i = 0; i < 6; i++) {
      const randomChar = arr[Math.floor(Math.random() * arr.length)];
      //append this hex character to our color code
      color += randomChar;
    }
    const colorEmbed = new MessageEmbed()
      .setColor(color as ColorResolvable)
      .setTitle(`Your random color was: ${color}`);
    await interaction.reply({
      embeds: [colorEmbed],
    });
    // if (love > 1800) {
    //   await interaction.reply({
    //     content: "Ono we only have 1800 love to give ;-;",
    //     ephemeral: true,
    //   });
    // } else if (love < 1) {
    //   await interaction.reply({
    //     content: "No hate! >:(",
    //     ephemeral: true,
    //   });
    // } else {
    //   await interaction.reply(`Hall${"o".repeat(love)} ${name}!!!`);
    // }
  },
};

export default color;
