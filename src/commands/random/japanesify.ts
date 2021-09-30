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

const Discord = require("discord.js");
const japanesify: MGCommand = {
  data: new SlashCommandBuilder()
    .setName("japanesify")
    .setDescription("Change your message to become japanesy!")
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("can only contain alphabet characters or spaces")
        .setRequired(true)
    ),
  async execute(interaction) {
    let msg: string = interaction.options.getString("message") || "Invalid :(";
    if (msg.length > 2000) {
      const Embed = new Discord.MessageEmbed()
        .setColor("#ff0000")
        .setTitle("Your message is too long! Try a shorter one.");
      await interaction.reply({
        embeds: [Embed],
        ephemeral: true,
      });
      return;
    }
    msg = msg.toLowerCase();
    let alphabet = "abcdefghijklmnopqrstuvwxyz ";
    for (let i = 0; i < msg.length; i++) {
      if (!alphabet.includes(msg[i])) {
        await interaction.reply({
          content: "Your string contains non-alphabetical characters!",
          ephemeral: true,
        });
        return;
      }
    }
    let message_1 = msg;
    let message_2 = msg.replace("ss", "s");
    let message_2_storage = message_2;
    while (message_1 != message_2) {
      message_2_storage = message_2;
      message_2 = message_2.replace("ss", "s");
      message_1 = message_2_storage;
    }

    message_2 = message_2
      .replace("sh", "s")
      .replace("s", "sh")
      .replace("nine", "9")
      .replace("one", "1")
      .replace("for", "4")
      .replace("rr", "ww");
    const Embed = new Discord.MessageEmbed()
      .setColor("#00ff00")
      .setTitle(`Your kawaii-ified message: `)
      .setDescription(`${message_2}`);
    await interaction.reply({
      embeds: [Embed],
    });
  },
};

export default japanesify;
