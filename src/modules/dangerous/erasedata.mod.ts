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
import { MGCommand, MGModule } from "../../types/command";
import { MessageActionRow, MessageButton, ThreadChannel } from "discord.js";
import { BugReports } from "../../types/firebase";
import withChecks from "../../lib/checks";
import cooldownTest from "../../lib/checks/cooldown";

function generateWarning(no: number, userid: string) {
  return {
    embeds: [
      MGEmbed(MGStatus.Warn)
        .setTitle("⚠️⚠️⚠️ WARNING! ⚠️⚠️⚠️")
        .setDescription(
          "This action is very dangerous, and will potentially lead to the following consequences:\n" +
            "1. ALL of your minigames data lost.\n" +
            "2. ALL your counting data lost.\n" +
            "3. ALL your accumulate MaxiCoins lost.\n" +
            "4. Your general progress and data in this bot deleted.\n\n" +
            "**ONLY PRESS CONFIRM IF YOU ARE VERY SURE YOU WANT TO DELETE YOUR DATA**.\n" +
            "*3 Presses of the confirm button is needed."
        )
        .setFooter(`USER-ID: ${userid}`),
    ],
    components: [
      new MessageActionRow().addComponents([
        new MessageButton()
          .setLabel(`CONFIRM(${no})`)
          .setCustomId(`deleteconfirmationly-${no}`) //weird name so that nothing will conflict with it and accidentally delete the user's acc
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
      .setDescription("Erase your account's data :("),

    async execute(interaction) {
      interaction.reply(generateWarning(1, interaction.user.id));
    },
  },
  events: [
    {
      name: "interactionCreate",
      async execute(interaction) {
        if (!interaction.isButton()) {
          return;
        }
        if (
          interaction.customId.startsWith("deleteconfirmationly") &&
          !interaction.customId.endsWith("3")
        ) {
          if (
            interaction.message.embeds[0].footer!.text.split(": ")[1] !=
            interaction.user.id
          )
            return;
          const lastInt = parseInt(interaction.customId.split("-")[1]),
            content = generateWarning(lastInt + 1, interaction.user.id);
          await interaction.update(content);
        } else {
          let content = generateWarning(3, interaction.user.id);
          content.components[0].components[0].setDisabled(true);
          await interaction.update(content);
          await interaction.channel!.sendTyping();
          await MGFirebase.setData(`user/${interaction.user.id}`, {});
          await interaction.channel!.send({
            embeds: [
              MGEmbed(MGStatus.Success)
                .setTitle("Data Deleted")
                .setDescription(
                  "We are sorry to see you go :(. All your data has been deleted, and will be initialised when u do decide to " +
                    "run a command that involves storing of data. Please feel free to drop us a message at " +
                    "https://discord.gg/hkkkTqhGAz to let us know why you decided to leave. (if you did decide to)"
                ),
            ],
          });
        }
      },
    },
  ],
};

export default erasedata;
