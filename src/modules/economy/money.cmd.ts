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
import type { MGCommand } from "../../types/command";
import { MGEmbed } from "../../lib/flavoured";
import MGStatus from "../../lib/statuses";
import { MGFirebase } from "../../lib/firebase";
import cooldownCheck from "../../lib/checks/cooldown";
import withChecks from "../../lib/checks";
import commandLog from "../../lib/comamndlog";

const money: MGCommand = withChecks([cooldownCheck(20)], {
  data: new SlashCommandBuilder()
    .setName("money")
    .setDescription("Get more money!!!"),

  async execute(interaction) {
    const data = await MGFirebase.getData(`user/${interaction.user.id}`);
    const toAdd = Math.ceil(Math.random() * 30);
    if (data === undefined) {
      return;
    }

    data.money += toAdd;

    await MGFirebase.setData(`user/${interaction.user.id}`, data);

    const embed = MGEmbed(MGStatus.Success)
      .setTitle("You have successfully earned MaxiCoins!")
      .setDescription("Yay!")
      .addFields(
        { name: "Added:", value: `${toAdd}`, inline: true },
        { name: "Balance:", value: `${data.money}`, inline: true }
      );
    await interaction.reply({ embeds: [embed] });
    commandLog(
      "money",
      `${interaction.user.id}`,
      `Used money and won ${toAdd}, balance: ${data["money"]}`
    );
  },
});

export default money;
