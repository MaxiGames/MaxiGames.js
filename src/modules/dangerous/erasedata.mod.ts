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
import { MGFirebase } from "../../lib/firebase";
import { MGModule } from "../../types/command";
import { MessageActionRow, MessageButton } from "discord.js";

function generateWarning(no: number, userid: string) {
  return {
    embeds: [
      MGEmbed(MGStatus.Warn)
        .setTitle("⚠️⚠️⚠️ WARNING! ⚠️⚠️⚠️")
        .setDescription(
          "This action is very dangerous, and will lead to the following consequences:\n" +
            "1. ALL your minigames data lost.\n" +
            "2. ALL your counting data lost.\n" +
            "3. ALL your accumulated MaxiCoins lost.\n" +
            "4. Your general progress and data in this bot deleted.\n\n" +
            "**ONLY PRESS CONFIRM IF YOU ARE VERY SURE YOU WANT TO DELETE YOUR DATA**.\n" +
            "*3 Presses of the confirm button are needed.*"
        )
        .setFooter({ text: `USER-ID: ${userid}` }),
    ],
    components: [
      new MessageActionRow().addComponents([
        new MessageButton()
          .setLabel(`CONFIRM(${no})`)
          .setCustomId(`deleteconfirmationly-${no}`) // weird name so that nothing will conflict with it and accidentally delete the user's acc
          .setStyle("DANGER")
          .setEmoji("⚠️"),
      ]),
    ],
  };
}

const erasedata: MGModule = {
  command: {
    data: new SlashCommandBuilder()
      .setName("erasedata")
      .setDescription("Erase data associated with your discord ID."),

    async execute(interaction) {
      interaction.reply(generateWarning(1, interaction.user.id));
    },
  },
  events: [
    {
      name: "interactionCreate",
      async execute(interaction) {
        if (
          !interaction.isButton() ||
          !interaction.customId.startsWith("deleteconfirmationly")
        ) {
          return;
        }
        if (!interaction.customId.endsWith("3")) {
          if (
            interaction.message.embeds[0].footer!.text.split(": ")[1] !=
            interaction.user.id
          ) {
            return;
          }
          const lastInt = parseInt(interaction.customId.split("-")[1]);
          const content = generateWarning(lastInt + 1, interaction.user.id);

          await interaction.update(content);
        } else {
          const content = generateWarning(3, interaction.user.id);
          content.components[0].components[0].setDisabled(true);
          await interaction.update(content);
          await interaction.channel!.sendTyping();
          await MGFirebase.setData(`user/${interaction.user.id}`, {});
          await interaction.channel!.send({
            embeds: [
              MGEmbed(MGStatus.Success)
                .setTitle("Data Deleted")
                .setDescription(
                  "All your user data has been deleted, and will be initialised" +
                    "only when you decide next run a command that involves storing of data."
                ),
            ],
          });
        }
      },
    },
  ],
};

export default erasedata;
