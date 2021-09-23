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
 * File: src/commands/cases/counting.ts
 * Description: Handles command for converting text to another case
 */

import { SlashCommandBuilder } from "@discordjs/builders";
import type MGCommand from "../../types/command";
import { MGEmbed } from "../../lib/flavoured";
import MGStatus from "../../lib/statuses";
import { MGfirebase } from "../../utils/firebase";
import { CommandInteraction, Guild } from "discord.js";

async function addChannel(
  interaction: CommandInteraction,
  guild: Guild,
  serverData: any
) {
  let channel = interaction.options.getChannel("channel");

  if (channel === null) {
    await interaction.reply({
      embeds: [MGEmbed(MGStatus.Error).setTitle("Unable to detect channel!")],
    });
    return;
  }

  if (serverData["countingChannels"] === 0) {
    serverData["countingChannels"] = {};
  }
  if (serverData["countingChannels"][channel.id] === undefined) {
    serverData["countingChannels"][channel.id] = 0;
    await MGfirebase.setData(`server/${guild.id}`, serverData).then(
      async () => {
        if (channel === null) return;
        await interaction.reply({
          embeds: [
            MGEmbed(MGStatus.Success)
              .setTitle("Success!")
              .setDescription(
                `**${channel.name}** is now a counting channel! You can further configure it to fit your needs :)`
              ),
          ],
        });
      }
    );
  } else {
    await interaction.reply({
      embeds: [
        MGEmbed(MGStatus.Error)
          .setTitle("That channel is already a counting channel!")
          .setDescription(
            `**${channel.name}** already a counting channel. You can further configure it to fit your needs :)`
          ),
      ],
    });
  }
}

const counting: MGCommand = {
  // exports (self explanatory)
  data: new SlashCommandBuilder()
    .setName("counting")
    .setDescription("configure your servers' counting games!")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("addchannel")
        .setDescription("register a channel as a counting channel!")
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("Channel you want to add")
            .setRequired(true)
        )
    ),

  // execute command
  async execute(interaction) {
    let subcommand = interaction.options.getSubcommand();
    let guild = interaction.guild;
    if (guild === null) {
      interaction.reply({
        embeds: [
          MGEmbed(MGStatus.Error).setTitle(
            "This command is not usable in a channel!"
          ),
        ],
      });
      return;
    }
    let serverData = MGfirebase.getData(`server/${guild.id}`);
    if (subcommand === "addchannel") {
      addChannel(interaction, guild, serverData);
    }
  },
};

export default counting;
