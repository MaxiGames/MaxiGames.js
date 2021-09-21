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
import withcooldown from "../../lib/cooldown";
import { MGEmbed } from "../../lib/flavoured";
import MGStatus from "../../lib/statuses";
import MGCommand from "../../types/command";
import { MGfirebase } from "../../utils/firebase";
import cooldownTest from "../../lib/cooldown";
import withChecks from "../../lib/withs";

const gamble: MGCommand = withChecks([cooldownTest(20)], {
  data: new SlashCommandBuilder()
    .setName("gamble")
    .setDescription("gamble some money :O")
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("How much money are you going to gamble [default = 5]")
        .setRequired(false)
    ),
  async execute(interaction) {
    const amt: number = interaction.options.getInteger("amount") || 5;
    if (amt < 5) {
      interaction.reply({
        content: "You need to gamble at least 5 :(",
        ephemeral: true,
      });
      return;
    }
    if (amt > 10000) {
      interaction.reply({
        content: "You can't gamble more than 10000 :(",
        ephemeral: true,
      });
      return;
    }

    await MGfirebase.initialisePerson(interaction.user.id);
    //check if player has enough money to pay for what they are gambling
    let data = MGfirebase.getData(`user/${interaction.user.id}`);
    if (data["money"] < amt) {
      interaction.reply({
        embeds: [
          MGEmbed(MGStatus.Error)
            .setTitle("You do not have enough money to gamble!!")
            .addFields(
              { name: "Gambling:", value: `${amt}` },
              { name: "Balance", value: `${data["money"]}` }
            ),
        ],
      });
      return;
    }

    let bot_roll = Math.ceil(Math.random() * 12);
    if (bot_roll < 3) {
      bot_roll = Math.ceil(Math.random() * 12);
    }
    let player_roll = Math.ceil(Math.random() * 12);

    if (player_roll > bot_roll) {
      let gain = ((player_roll - bot_roll) / bot_roll) * 1.5;
      gain *= amt;
      gain = Math.ceil(gain);
      data["money"] += gain;
      const Embed = MGEmbed(MGStatus.Success)
        .setTitle(
          `You won! You rolled ${player_roll} and the bot rolled ${bot_roll}`
        )
        .setDescription(`You bet ${amt} money and won ${gain} money!`)
        .addField("Your balance:", `${data["money"]}`);
      await interaction.reply({
        embeds: [Embed],
      });

      MGfirebase.setData(`user/${interaction.user.id}`, data);
    } else if (player_roll < bot_roll) {
      data["money"] -= amt;
      const Embed = MGEmbed(MGStatus.Success)
        .setTitle(
          `You lost! You rolled ${player_roll} and the bot rolled ${bot_roll}`
        )
        .setDescription(`You bet ${amt} money and lost all of it!`)
        .addField("Your balance:", `${data["money"]}`);
      await interaction.reply({
        embeds: [Embed],
      });

      MGfirebase.setData(`user/${interaction.user.id}`, data);
    } else {
      const Embed = MGEmbed(MGStatus.Success)
        .setTitle(
          `You drawed! You rolled ${player_roll} and the bot also rolled ${bot_roll}`
        )
        .setDescription(
          `You bet ${amt} money and didn't win or lose any money!`
        )
        .addField("Your balance:", `${data["money"]}`);
      await interaction.reply({
        embeds: [Embed],
      });
    }
  },
});

export default gamble;
