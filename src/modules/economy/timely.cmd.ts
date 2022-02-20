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
import { MGCommand } from "../../types/command";
import { MGFirebase } from "../../lib/firebase";
import cooldownTest, { convertSecondsToDay } from "../../lib/checks/cooldown";
import withChecks from "../../lib/checks";
import commandLog from "../../lib/comamndlog";

const timely: MGCommand = withChecks([cooldownTest(5)], {
  data: new SlashCommandBuilder()
    .setName("timely")
    .setDescription(
      "Time and time again :)...you'll get to get richer and richer!!!"
    )
    .addStringOption((option) =>
      option
        .setName("category")
        .setDescription("Which timely rewards?")
        .addChoice("hourly", "hourly")
        .addChoice("daily", "daily")
        .addChoice("weekly", "weekly")
        .addChoice("monthly", "monthly")
        .addChoice("yearly", "yearly")
        .setRequired(true)
    ),

  async execute(interaction) {
    const subCommand = interaction.options.getString("category")!;
    let moneyAdd: number;

    if (subCommand === "hourly") {
      moneyAdd = 30 + Math.ceil(Math.random() * 30);
    } else if (subCommand === "daily") {
      moneyAdd = 50 + Math.ceil(Math.random() * 50);
    } else if (subCommand === "weekly") {
      moneyAdd = 250 + Math.ceil(Math.random() * 250);
    } else if (subCommand === "monthly") {
      moneyAdd = 1000 + Math.ceil(Math.random() * 1000);
    } else {
      moneyAdd = 5000 + Math.ceil(Math.random() * 5000);
    }

    const data = await MGFirebase.getData(`user/${interaction.user.id}`);
    if (data === undefined) {
      return;
    }

    let interval: number;
    const date = Math.ceil(new Date().getTime() / 1000);

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
      data["money"] += moneyAdd;
      data["timelyClaims"][subCommand] = date;

      embed = MGEmbed(MGStatus.Success)
        .setTitle(`Claimed ${subCommand}!`)
        .setDescription(`Yay! You claimed your ${subCommand}!`)
        .addFields(
          { name: "Added:", value: `${moneyAdd}` },
          { name: "Current Balance:", value: `${data["money"]}` }
        );
      await MGFirebase.setData(`user/${interaction.user.id}`, data);
      commandLog(
        "timely",
        `${interaction.user.id}`,
        `Claimed ${subCommand}! Earned: ${moneyAdd}`
      );
    } else {
      embed = MGEmbed(MGStatus.Error)
        .setTitle(`You can't claim ${subCommand} yet!`)
        .setDescription("Be patient :)")
        .addFields({
          name: "Time left:",
          value: `${convertSecondsToDay(
            Math.floor(data["timelyClaims"][subCommand] + interval - date)
          )}`,
        });
      commandLog(
        "timely",
        `${interaction.user.id}`,
        `Can't claim timely yet! Time left: ${convertSecondsToDay(
          Math.floor(data["timelyClaims"][subCommand] + interval - date)
        )}`
      );
    }

    await interaction.reply({ embeds: [embed] });
  },
});

export default timely;
