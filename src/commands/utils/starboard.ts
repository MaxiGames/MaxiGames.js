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
import type MGCommand from "../../types/command";
import { MGEmbed } from "../../lib/flavoured";
import MGStatus from "../../lib/statuses";
import { MGfirebase } from "../../utils/firebase";
import { CommandInteraction, Guild } from "discord.js";

async function addchannel(
  interaction: CommandInteraction,
  guild: Guild,
  guildData: any
) {
  let channel = interaction.options.getChannel("channel")!;
  let oldc = guildData["starboardChannel"];
  guildData["starboardChannel"] = { id: channel.id, thresh: 1 };

  await MGfirebase.setData(`guild/${guild.id}`, guildData).then(async () => {
    let embed;
    if (!oldc) {
      embed = MGEmbed(MGStatus.Success)
        .setTitle("Success!")
        .setDescription(`**<#${channel.id}>** is now the starboard channel.`);
    } else {
      embed = MGEmbed(MGStatus.Success)
        .setTitle("Success!")
        .setDescription(
          `**<#${channel.id}>** is now the starboard channel ` +
            `(from <#${oldc.id}>).`
        );
    }
    await interaction.reply({ embeds: [embed] });
  });
}

const starboard: MGCommand = {
  data: new SlashCommandBuilder()
    .setName("starboard")
    .setDescription("configure your server's starboards")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("addchannel")
        .setDescription("register a channel as a starboard channel")
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("channel you want to register")
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    let subcommand = interaction.options.getSubcommand();
    let guild = interaction.guild;
    if (guild === null) {
      interaction.reply({
        embeds: [
          MGEmbed(MGStatus.Error).setTitle(
            "This command is not usable outside of a server channel."
          ),
        ],
      });
      return;
    }

    let guildData = MGfirebase.getData(`guild/${guild.id}`);
    switch (subcommand) {
      case "addchannel":
        addchannel(interaction, guild, guildData);
        break;
    }
  },
};

export default starboard;
