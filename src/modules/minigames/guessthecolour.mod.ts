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
import {
  ButtonInteraction,
  Interaction,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
  MessageInteraction,
} from "discord.js";
import { MGEmbed } from "../../lib/flavoured";
import type { MGModule } from "../../types/command";
import { MGFirebase } from "../../lib/firebase";

const guessTheColour: MGModule = {
  command: {
    data: new SlashCommandBuilder()
      .setName("guessthecolour")
      .setDescription(
        "With a colour in the embed, choose which button has the right hex value!"
      ),
    async execute(interaction) {
      const colour = getRandomColor();
      const components = new MessageActionRow();
      const correct = Math.round(Math.random() * 3);
      for (let i = 0; i < 4; i++) {
        if (i === correct) {
          components.addComponents([
            new MessageButton()
              .setCustomId("CORRECT-guessthecolour")
              .setStyle("PRIMARY")
              .setLabel(colour.toLowerCase()),
          ]);
        }
        const button = new MessageButton();
        let newColour = parseInt(colour.slice(1, 7), 16);
        newColour += Math.ceil(Math.random() * 16777215);
        if (newColour > 16777215) {
          newColour -= 16777215;
        }
        const convertedColour = newColour.toString(16);
        button.setStyle("PRIMARY");
        button.setLabel(`#${convertedColour}`);
        button.setCustomId(`${convertedColour}-${i}-guessthecolour`);
        components.addComponents([button]);
      }
      const embed = MGEmbed()
        .setTitle("Guess The Colour!")
        .setFooter("Time given to see colour: 3 seconds")
        .setDescription("<--- Guess embed's colour!")
        .addFields({
          name: "User ID:",
          value: `${interaction.user.id}`,
        })
        .setColor(`#${colour.slice(1, 7)}`);
      await interaction.reply({
        embeds: [embed],
        components: [components],
      });
      setTimeout(async () => {
        const newMessage = await interaction.fetchReply();
        if (newMessage.embeds[0].description !== "<--- Guess embed's colour!") {
          return;
        }
        embed.setFooter("Time is up! You can no longer see the colour!");
        embed.setDescription(
          "The colour has been removed. You still have infinite time to guess it tho..."
        );
        embed.setColor("DARK_BUT_NOT_BLACK");
        await interaction.editReply({
          embeds: [embed],
          components: [components],
        });
      }, 3000);
    },
  },

  events: [
    {
      name: "interactionCreate",
      async execute(interaction: Interaction) {
        if (!interaction.isButton()) {
          return;
        }

        if (
          interaction.customId.endsWith("guessthecolour") &&
          interaction.message.embeds[0].fields![0].value === interaction.user.id
        ) {
          const won = interaction.customId.startsWith("CORRECT");
          const valueChange = await changeRating(interaction, won);
          const embed = interaction.message.embeds[0] as MessageEmbed;
          const components = interaction.message.components![0];
          embed.setDescription(`${won === true ? "Correct!" : "Wrong!"}`);
          embed.addFields([
            {
              name: "Rating Change:",
              value: `${valueChange > 0 ? "+" : ""}${valueChange}`,
            },
          ]);
          const newComponents = new MessageActionRow();
          for (const i of components.components) {
            const button = i as MessageButton;
            if (button.customId?.startsWith("CORRECT")) {
              button.setStyle("SUCCESS");
            } else if (button.customId === interaction.customId) {
              button.setStyle("PRIMARY");
            } else {
              button.setStyle("DANGER");
            }
            button.setDisabled(true);
            newComponents.addComponents([button]);
          }
          await interaction.update({
            embeds: [embed],
            components: [newComponents],
          });
        }
      },
    },
  ],
};

export async function changeRating(
  interaction: MessageInteraction | ButtonInteraction,
  won: boolean
) {
  let colourRating = await MGFirebase.getData(
    `user/${interaction.user.id}/minigames/guessthecolour`
  );
  let toChange: number;
  if (won) {
    toChange = Math.ceil(colourRating * 0.05 * Math.random() * 3);
    colourRating += toChange;
  } else {
    toChange = -Math.ceil(colourRating * 0.02 * Math.random() * 3);
    colourRating += toChange;
  }
  await MGFirebase.setData(
    `user/${interaction.user.id}/minigames/guessthecolour`,
    colourRating
  );
  return toChange;
}

function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

export default guessTheColour;
