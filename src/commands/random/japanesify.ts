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
    let message_2 = msg;
    for (let i = 0; i < 26; i++) {
      let message_1 = message_2;
      message_2 = message_2.replace(alphabet[i] + alphabet[i], alphabet[i]);
      let message_2_storage = message_2;
      while (message_1 != message_2) {
        message_2_storage = message_2;
        message_2 = message_2.replace(alphabet[i] + alphabet[i], alphabet[i]);
        message_1 = message_2_storage;
      }
    }

    let pchar = message_2[-1];
    // ok im tired someone else replace this :D
    if (
      !message_2.endsWith("a") &&
      !message_2.endsWith("o") &&
      !message_2.endsWith("e") &&
      !message_2.endsWith("i") &&
      !message_2.endsWith("u")
    ) {
      // bu
      // da
      // fu
      // go
      // ha
      // ji/ki
      // lu
      // mo
      // no
      // pa
      // ignore q, booligan letter
      // ru
      // sa
      // to
      // ignore v, booligan letter
      // wa
      // ignore x, booligan letter
      // yo
      // ignore z, booligan letter
      if (pchar === "b" || pchar === "f" || pchar === "l" || pchar === "r") {
        message_2 += "u";
      } else if (
        pchar === "d" ||
        pchar === "h" ||
        pchar === "p" ||
        pchar === "s" ||
        pchar === "w"
      ) {
        message_2 += "a";
      } else if (
        pchar === "g" ||
        pchar === "m" ||
        pchar === "n" ||
        pchar === "t" ||
        pchar === "y"
      ) {
        message_2 += "o";
      } else if (pchar === "j" || pchar === "k") {
        message_2 += "i";
      }
    }

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
