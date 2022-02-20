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
 * File: src/commands/minigames/escapethehouse.ts
 * Description: Logic for Escape The House minigame **HAS ISSUES**
 */

import { SlashCommandBuilder } from "@discordjs/builders";
import {
  ButtonInteraction,
  Interaction,
  MessageActionRow,
  MessageButton,
  MessageInteraction,
} from "discord.js";
import { MGEmbed } from "../../lib/flavoured";
import MGStatus from "../../lib/statuses";
import type { MGModule } from "../../types/command";
import { MGFirebase } from "../../lib/firebase";

const escapethehouse: MGModule = {
  command: {
    data: new SlashCommandBuilder()
      .setName("escapethehouse")
      .setDescription("Guess which door leads to the right place!"),

    async execute(interaction) {
      const doorNumber = Math.ceil(Math.random() * 2);
      await interaction.reply({
        embeds: [
          MGEmbed(MGStatus.Default)
            .setTitle("Escape the house!")
            .setDescription("Select which door leads to the right location")
            .setFields([
              {
                name: "Player-ID",
                value: `${interaction.user.id}`,
              },
            ]),
        ],
        components: [
          new MessageActionRow().addComponents([
            new MessageButton()
              .setLabel("1")
              .setEmoji("🚪")
              .setStyle("PRIMARY")
              .setCustomId(
                `${doorNumber === 1 ? "Correct" : "Wrong"}1escapethehouse`
              ),
            new MessageButton()
              .setLabel("2")
              .setEmoji("🚪")
              .setStyle("PRIMARY")
              .setCustomId(
                `${doorNumber === 2 ? "Correct" : "Wrong"}2escapethehouse`
              ),
            new MessageButton()
              .setLabel("3")
              .setEmoji("🚪")
              .setStyle("PRIMARY")
              .setCustomId(
                `${doorNumber === 3 ? "Correct" : "Wrong"}3escapethehouse`
              ),
          ]),
        ],
      });
    },
  },

  events: [
    {
      name: "interactionCreate",
      async execute(interaction: Interaction) {
        if (!interaction.isButton()) {
          return;
        }

        const fmsg =
          Math.random() === 0
            ? "You step inside the door fall into lava, losing"
            : "You step inside the door and get locked inside, losing";

        if (
          interaction.customId.endsWith("escapethehouse") &&
          interaction.message.embeds[0].fields![0].value === interaction.user.id
        ) {
          const correct = interaction.customId.startsWith("Correct");
          if (correct) {
            await interaction.update({
              embeds: [
                MGEmbed(MGStatus.Success)
                  .setTitle("You guessed correctly!")
                  .setDescription(
                    "You step inside the door and discover a pot of" +
                      `${await changeRating(interaction, correct)} rating`
                  ),
              ],
              components: [],
            });
          } else {
            await interaction.update({
              embeds: [
                MGEmbed(MGStatus.Error)
                  .setTitle("You guessed wrongly!")
                  .setDescription(
                    `${fmsg} ${await changeRating(
                      interaction,
                      correct
                    )} rating.`
                  ),
              ],
              components: [],
            });
          }
        }
      },
    },
  ],
};

export async function changeRating(
  interaction: MessageInteraction | ButtonInteraction,
  won: boolean
) {
  let escapeRating = await MGFirebase.getData(
    `user/${interaction.user.id}/minigames/escapethehouse`
  ); // get current escapeTheHouse rating
  let toChange = 0; // rating change
  if (escapeRating == 0) {
    toChange = Math.ceil(Math.random() * 10);
  }
  if (won) {
    toChange += Math.ceil(escapeRating * Math.random());
    escapeRating += toChange;
  } else {
    // lost :(
    toChange += -Math.ceil(escapeRating * 0.5 * Math.random());
    escapeRating += toChange;
  }
  await MGFirebase.setData(
    `user/${interaction.user.id}/minigames/escapethehouse`,
    escapeRating
  ); // set new rating
  return toChange;
}

export default escapethehouse;
