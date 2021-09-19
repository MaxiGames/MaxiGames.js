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
import MyCommand from "../../types/command";
import { MGfirebase } from "../../utils/firebase";

const gamble: MyCommand = {
  data: new SlashCommandBuilder()
    .setName("share")
    .setDescription(
      "Be kind! Share your money with another member of the server! :D"
    )
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Who do you want to share your money to?")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("How much money are you going to share?")
        .setRequired(true)
    ),

  async execute(interaction) {
    const amt = interaction.options.getInteger("amount");
    const usr = interaction.options.getUser("user");

    if (amt === null || usr === null) return;

    await MGfirebase.initialisePerson(interaction.user.id);
    await MGfirebase.initialisePerson(usr.id);

    let data = MGfirebase.getData(`user/${interaction.user.id}`);

    if (data["money"] < amt) {
      interaction.reply({
        embeds: [
          MGEmbed(MGStatus.Error)
            .setTitle("Not enough money!!")
            .addFields(
              { name: "Balance", value: `${data["money"]}` },
              { name: "Amount required:", value: `${amt}` }
            ),
        ],
      });
      return;
    }

    if (usr.id === interaction.user.id) {
      interaction.reply({
        embeds: [
          MGEmbed(MGStatus.Error)
            .setTitle("Cannot share to yourself >:(!")
            .setDescription("Stop trying to exploit the system!!!!"),
        ],
      });
      return;
    }

    let otherUserData = MGfirebase.getData(`user/${usr.id}`);
    data["money"] -= amt;
    otherUserData["money"] += amt;
    MGfirebase.setData(`user/${usr.id}`, otherUserData);
    MGfirebase.setData(`user/${interaction.user.id}`, data);

    interaction.reply({
      embeds: [
        MGEmbed(MGStatus.Success)
          .setTitle("Success!")
          .setDescription(
            `Thanks for the donation, I\'m sure <@!${usr.id}> will appreciate it! `
          )
          .addFields(
            { name: "Shared:", value: `${amt}`, inline: false },
            { name: "Your balance:", value: `${data["money"]}`, inline: false },
            {
              name: `${usr.username}'s' balance`,
              value: `${otherUserData["money"]}`,
              inline: false,
            }
          ),
      ],
    });
  },
};

export default gamble;