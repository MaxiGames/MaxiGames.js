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
  CommandInteraction,
  Interaction,
  MessageActionRow,
  MessageButton,
} from "discord.js";
import { MGEmbed } from "../../lib/flavoured";
import MGStatus from "../../lib/statuses";
import MGCommand from "../../types/command";
import { MGFirebase } from "../../utils/firebase";

export async function generateTTT(
  board: string[][],
  player1: string,
  player2: string,
  player1Turn: boolean
) {
  let embed = MGEmbed(MGStatus.Success)
    .setTitle("Tic Tac Toe")
    .setDescription(`**Player 1**: ${player1}, **Player 2**: ${player2}`)
    .addFields([
      { name: "Player's Turn:", value: `${player1Turn ? player1 : player2}` },
    ]);

  let components = [];
  let count1 = 0;
  for (let i of board) {
    let row = new MessageActionRow();
    count1++;
    let count2 = 0;
    for (let j of i) {
      count2++;
      row.addComponents(
        new MessageButton()
          .setLabel(j)
          .setDisabled(j === "_" ? false : true)
          .setStyle(j === "X" ? "DANGER" : j === "O" ? "SUCCESS" : "PRIMARY")
          .setCustomId(`tictactoe-${count1}-${count2}-${j}`)
      );
    }
    components.push(row);
  }
  return { embeds: [embed], components: components };
}

const tictactoe: MGCommand = {
  data: new SlashCommandBuilder()
    .setName("tictactoe")
    .setDescription("Want to play a tic tac toe game with someone?")
    .addUserOption((option) =>
      option
        .setRequired(true)
        .setName("player2")
        .setDescription("Who else do you want to play with")
    ),
  async execute(interaction) {
    let player1 = interaction.user;
    let player2 = interaction.options.getUser("player2", true);

    //disallow playing against yourself
    if (player1 === player2) {
      await interaction.reply({
        embeds: [
          MGEmbed(MGStatus.Error).setTitle(
            "Hey you can't play against yourself!"
          ),
        ],
      });
      return;
    } else if (player1.bot || player2.bot) {
      //no bots!
      await interaction.reply({
        embeds: [
          MGEmbed(MGStatus.Error).setTitle("Hey you can't play against bots!"),
        ],
      });
      return;
    }
    await MGFirebase.initUser(player1.id);
    await MGFirebase.initUser(player2.id);

    let board = [
      ["_", "_", "_"],
      ["_", "_", "_"],
      ["_", "_", "_"],
    ];

    let ttt = await generateTTT(
      board,
      player1.username,
      player2.username,
      true
    );
    await interaction.reply(ttt);
  },
};

export default tictactoe;
