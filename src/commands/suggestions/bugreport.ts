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
import { MGFirebase } from "../../utils/firebase";
import MGCommand from "../../types/command";
import { ThreadChannel } from "discord.js";
import { BugReports } from "../../types/firebase";
import withChecks from "../../lib/withs";
import cooldownTest from "../../lib/cooldown";

const bug: MGCommand = withChecks([cooldownTest(10)], {
  data: new SlashCommandBuilder()
    .setName("bugreport")
    .setDescription("Report a bug!")
    .addStringOption((option) =>
      option
        .setName("bug")
        .setDescription("What bug do you want to report?")
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.reply({
      embeds: [MGEmbed(MGStatus.Info).setTitle("Working on it...")],
    });
    let bug = interaction.options.getString("bug")!;
    let data = MGFirebase.getData("admin/bugreports");

    //check if its a repeated bug report
    for (let i in data) {
      if (data[i]["bug"] === bug) {
        await interaction.editReply({
          embeds: [
            MGEmbed(MGStatus.Error)
              .setTitle("A bug report with that title already exists!")
              .setDescription(
                "Check open bugs at https://discord.gg/hkkkTqhGAz."
              ),
          ],
        });
        return;
      }
    }

    // send it to the MG server
    let channel = interaction.client.guilds.cache
      .get(`837522963389349909`)
      ?.channels.cache.get("869960880631218196") as ThreadChannel;
    let msg = await channel.send({
      embeds: [
        MGEmbed(MGStatus.Success)
          .setTitle(
            `Bug report from ${interaction.user.username}#${interaction.user.discriminator}`
          )
          .setThumbnail(`${interaction.user.avatarURL()}`)
          .setDescription(bug),
      ],
    });

    let bugReport: BugReports = {
      bug: bug,
      status: "in-progress",
      user: parseInt(interaction.user.id),
    };
    data[msg.id] = bugReport;
    await MGFirebase.setData(`admin/bugreports`, data);
    await interaction.editReply({
      embeds: [
        MGEmbed(MGStatus.Success)
          .setTitle("Submitted Bug Report!")
          .setDescription(
            "Your bug report has been submitted to the MaxiGames Official server: https://discord.gg/hkkkTqhGAz. You will be notified once it has been addressed! Thanks :D"
          ),
      ],
    });
    await msg.react(`⬆️`);
    await msg.react(`🤷`);
    await msg.react(`⬇️`);
  },
});

export default bug;
