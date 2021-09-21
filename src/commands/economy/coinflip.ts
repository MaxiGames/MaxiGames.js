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
 * File: src/commands/economy/coinflip.ts
 * Description:
 */

import { SlashCommandBuilder } from "@discordjs/builders";
import withcooldown from "../../lib/cooldown";
import { MGEmbed } from "../../lib/flavoured";
import MGStatus from "../../lib/statuses";
import MyCommand from "../../types/command";
import { MGfirebase } from "../../utils/firebase";

const Discord = require("discord.js");

function otherOption(name: string) {
  if (name === "heads") return "tails";
  else return "heads";
}

const gamble = withcooldown(
  {
    data: new SlashCommandBuilder()
      .setName("coinflip")
      .setDescription(
        "Would you like to try your luck and see if the coins are in your favour?"
      )
      .addStringOption((option) =>
        option
          .setName("option")
          .setDescription("Heads or Tails?")
          .setRequired(true)
          .addChoice("heads", "heads")
          .addChoice("tails", "tails")
      )
      .addIntegerOption((option) =>
        option
          .setName("amount")
          .setDescription("How much money are ya going to gamble?")
          .setRequired(true)
      ),

    async execute(interaction) {
      const amt = interaction.options.getInteger("amount"); // read bet amt
      const option = interaction.options.getString("option"); // read bet on which coin side
      if (amt === null || option === null) return;

      await MGfirebase.initialisePerson(interaction.user.id); // init firebase

      let data = MGfirebase.getData(`user/${interaction.user.id}`); // get user balance

      if (data["money"] < amt) {
        // not enough mony
        interaction.reply({
          embeds: [
            MGEmbed(MGStatus.Success)
              .setTitle("Oops! Not enough money!!")
              .addFields(
                { name: "Balance", value: `${data["money"]}` },
                { name: "Amount required:", value: `${amt}` }
              ),
          ],
        });
      }

      const compOption = Math.ceil(Math.random() * 2);

      // confusing indentation ahead!
      if (
        (option === "heads" && compOption === 1) ||
        (option === "tails" && compOption === 2)
      ) {
        data["money"] += amt;
        MGfirebase.setData(`user/${interaction.user.id}`, data); // update user balance

        interaction.reply({
          embeds: [
            MGEmbed(MGStatus.Success)
              .setTitle("You won!")
              .setDescription(
                `You guessed the coin flip right! :) it flipped on **${option}**`
              )
              .addFields(
                { name: "Balance", value: `${data["money"]}` },
                { name: "Amount earned:", value: `${amt}` }
              ),
          ],
        });
      } else {
        data["money"] -= amt;
        MGfirebase.setData(`user/${interaction.user.id}`, data);
        interaction.reply({
          embeds: [
            MGEmbed(MGStatus.Success)
              .setTitle("You lost!")
              .setDescription(
                `You guessed the coin flip wrong! :( it flipped on **${otherOption(
                  option
                )}**`
              )
              .addFields(
                { name: "Balance", value: `${data["money"]}` },
                { name: "Amount earned:", value: `${amt}` }
              ),
          ],
        });
      }
    },
  },
  10
);

export default gamble;
