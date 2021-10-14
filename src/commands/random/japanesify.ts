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
    let prevmsg = msg;
    let message_2 = prevmsg;
    for (let i = 0; i < 26; i++) {
      message_2 = prevmsg.replace(alphabet[i] + alphabet[i], alphabet[i]);
      let message_2_storage = message_2;
      while (prevmsg != message_2) {
        message_2_storage = message_2;
        message_2 = message_2.replace(alphabet[i] + alphabet[i], alphabet[i]);
        prevmsg = message_2_storage;
        console.log(prevmsg);
        console.log(message_2);
      }
    }
    let number_of_chars_added = 0;
    for (let i = 0; i < message_2.length; i++) {
      let pchar = message_2[i];
      let nchar = message_2[i + 1];
      if (i === message_2.length - 1) {
        let nchar = "z";
      }
      console.log(pchar);
      // ok im tired someone else replace this :D
      if (
        !(
          pchar === "a" ||
          pchar === "o" ||
          pchar === "u" ||
          pchar === "i" ||
          pchar === "e" ||
          nchar === "a" ||
          nchar === "e" ||
          nchar === "i" ||
          nchar === "o" ||
          nchar === "u"
        )
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
        } else if (
          pchar === "d" ||
          pchar === "h" ||
          pchar === "p" ||
          pchar === "s" ||
          pchar === "w"
        ) {
          message_2 =
            message_2.substring(0, i + 1 + number_of_chars_added) +
            "a" +
            message_2.substring(
              i + 1 + number_of_chars_added,
              message_2.length
            );
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
        number_of_chars_added += 1;
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
