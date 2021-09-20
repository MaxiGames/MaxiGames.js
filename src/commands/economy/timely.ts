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
import givecooldown from "../../lib/cooldown";

function convertSecondsToDay(n: number) {
  let day = Math.floor(n / (24 * 60 * 60));
  n -= day * 24 * 60 * 60;

  let hour = Math.floor(n / (60 * 60));
  n -= hour * 60 * 60;

  let minutes = Math.floor(n / 60);
  n -= minutes * 60;

  let seconds = Math.floor(n);

  return (
    day +
    " " +
    "days " +
    hour +
    " " +
    "hours " +
    minutes.toFixed() +
    " " +
    "minutes " +
    seconds.toFixed() +
    " " +
    "seconds "
  );
}

const timely: MyCommand = givecooldown(
  {
    data: new SlashCommandBuilder()
      .setName("timely")
      .setDescription(
        "Time and time again...you'll get to get richer and richer!!!"
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName(`hourly`)
          .setDescription(
            "Claim some $$$ hourly!! (30-60 MaxiCoins every hour)"
          )
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName(`daily`)
          .setDescription(
            "Claim some $$$ daily!! (100-200 MaxiCoins every day)"
          )
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName(`weekly`)
          .setDescription(
            "Claim some $$$ weekly!! (250-500 MaxiCoins every week)"
          )
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName(`monthly`)
          .setDescription(
            "Claim some $$$ monthly!! (1000-2000 MaxiCoins every hour)"
          )
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName(`yearly`)
          .setDescription(
            "Claim some $$$ yearly!! (5000-10000 MaxiCoins every year)"
          )
      ),

    async execute(interaction) {
      let subCommand = interaction.options.getSubcommand();
      let moneyAdd: number;

      if (subCommand === "hourly")
        moneyAdd = 30 + Math.ceil(Math.random() * 30);
      else if (subCommand === "daily")
        moneyAdd = 50 + Math.ceil(Math.random() * 50);
      else if (subCommand === "weekly")
        moneyAdd = 250 + Math.ceil(Math.random() * 250);
      else if (subCommand === "monthly")
        moneyAdd = 1000 + Math.ceil(Math.random() * 1000);
      else moneyAdd = 5000 + Math.ceil(Math.random() * 5000);

      MGfirebase.initialisePerson(`${interaction.user.id}`);

      let data = MGfirebase.getData(`user/${interaction.user.id}`);

      let interval: number;
      let date = Math.ceil(new Date().getTime() / 1000);

      switch (subCommand) {
        case "hourly":
          interval = 3600;
          break;
        case "daily":
          interval = 86400;
          break;
        case "weekly":
          interval = 604800;
          break;
        case "monthly":
          interval = 2592000;
          break;
        default:
          interval = 31536000;
          break;
      }

      let embed;

      if (
        date - data["timelyClaims"][subCommand] > interval ||
        data["timelyClaims"][subCommand] === 0
      ) {
        embed = MGEmbed(MGStatus.Success)
          .setTitle(`Claimed ${subCommand}!`)
          .setDescription(`Yay! You claimed your ${subCommand}!`)
          .addFields(
            { name: "Added:", value: `${moneyAdd}` },
            { name: "Balance", value: `${data["money"]}` }
          );

        data["money"] += moneyAdd;
        data["timelyClaims"][subCommand] = date;
        await MGfirebase.setData(`user/${interaction.user.id}`, data);
      } else {
        embed = MGEmbed(MGStatus.Error)
          .setTitle(`You can't claim ${subCommand} yet!`)
          .setDescription(`Be patient :)`)
          .addFields({
            name: "Time left:",
            value: `${convertSecondsToDay(
              Math.floor(data["timelyClaims"][subCommand] + interval - date)
            )}`,
          });
      }

      await interaction.reply({ embeds: [embed] });
    },
  },
  5
);

export default timely;
