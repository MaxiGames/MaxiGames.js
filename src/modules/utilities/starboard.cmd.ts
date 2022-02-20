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
import { Permissions, CommandInteraction, Guild } from "discord.js";
import withChecks from "../../lib/checks";
import cooldownTest from "../../lib/checks/cooldown";
import { userPermsTest } from "../../lib/checks/permissions";

const starboard: MGCommand = withChecks(
  [cooldownTest(5), userPermsTest(Permissions.FLAGS.ADMINISTRATOR)],
  {
    data: new SlashCommandBuilder()
      .setName("starboard")
      .setDescription("configure your server's starboard")
      .addSubcommand((subcommand) =>
        subcommand
          .setName("addchannel")
          .setDescription("register a channel as the starboard channel")
          .addChannelOption((option) =>
            option
              .setName("channel")
              .setDescription("channel you want to register")
              .setRequired(true)
          )
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("rmchannel")
          .setDescription("remove a channel as the starboard channel")
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("threshold")
          .setDescription("set the starboard threshold")
          .addIntegerOption((option) =>
            option
              .setName("threshold")
              .setDescription("desired threshold")
              .setRequired(true)
          )
      ),

    async execute(interaction) {
      const subcommand = interaction.options.getSubcommand();
      const guild = interaction.guild;
      if (guild === null) {
        await interaction.reply({
          embeds: [
            MGEmbed(MGStatus.Error).setTitle(
              "This command is not usable outside of a server channel."
            ),
          ],
        });
        return;
      }

      const guildData = await MGFirebase.getData(`guild/${guild.id}`);
      if (guildData === undefined) {
        return;
      }

      switch (subcommand) {
        case "addchannel": {
          addchannel(interaction, guild, guildData);
          break;
        }
        case "rmchannel": {
          rmchannel(interaction, guild, guildData);
          break;
        }
        case "threshold": {
          const newthresh = interaction.options.getInteger("threshold")!;
          let embed;

          if (newthresh < 1) {
            embed = MGEmbed(MGStatus.Error).setTitle(
              "Error: threshold must be greater than zero!"
            );
          } else {
            embed = MGEmbed(MGStatus.Success).setTitle(
              `Starboard threshold set to ${newthresh}.`
            );
            guildData["starboardChannel"]["thresh"] = newthresh;
            await MGFirebase.setData(`guild/${guild.id}`, guildData);
          }

          await interaction.reply({ embeds: [embed] });
          break;
        }
      }
    },
  }
);

async function addchannel(
  interaction: CommandInteraction,
  guild: Guild,
  guildData: any
) {
  const channel = interaction.options.getChannel("channel")!;
  const oldc = guildData["starboardChannel"];
  guildData["starboardChannel"] = { id: channel.id, thresh: 1 };

  await MGFirebase.setData(`guild/${guild.id}`, guildData).then(async () => {
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

async function rmchannel(
  interaction: CommandInteraction,
  guild: Guild,
  guildData: any
) {
  let embed;
  if (guildData["starboardChannel"]) {
    embed = MGEmbed(MGStatus.Success)
      .setTitle("Success!")
      .setDescription(
        "The starboard channel is no longer a starboard channel."
      );

    guildData["starboardChannel"] = 0;
    await MGFirebase.setData(`guild/${guild.id}`, guildData);
  } else {
    embed = MGEmbed(MGStatus.Error).setTitle(
      "This server had no starboard channel in the first place."
    );
  }
  await interaction.reply({ embeds: [embed] });
}

export default starboard;
