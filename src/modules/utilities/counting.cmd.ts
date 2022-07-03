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
import type { MGCommand } from "../../types/command";
import { MGEmbed } from "../../lib/flavoured";
import MGStatus from "../../lib/statuses";
import { MGFirebase } from "../../lib/firebase";
import {
  Permissions,
  CommandInteraction,
  Guild,
  TextChannel,
} from "discord.js";
import withChecks from "../../lib/checks";
import { userPermsCheck } from "../../lib/checks/permissions";
import cooldownCheck from "../../lib/checks/cooldown";
import { Counting } from "../../types/firebase";
import { upperCase } from "lodash";

const counting: MGCommand = withChecks(
  [cooldownCheck(2), userPermsCheck(Permissions.FLAGS.ADMINISTRATOR)],
  {
    data: new SlashCommandBuilder()
      .setName("counting")
      .setDescription("configure your server' counting games!")
      .addSubcommand((subcommand) =>
        subcommand
          .setName("addchannel")
          .setDescription("register a channel as a counting channel")
          .addChannelOption((option) =>
            option
              .setName("channel")
              .setDescription("channel to be added")
              .setRequired(true)
          )
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("removechannel")
          .setDescription("unregister a channel as a counting channel")
          .addChannelOption((option) =>
            option
              .setName("channel")
              .setDescription("channel you want to unregister")
              .setRequired(true)
          )
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("currentcount")
          .setDescription("query the current count in a channel")
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("countingprotection")
          .setDescription("Configures a channel for counting protection")
          .addChannelOption((option) =>
            option
              .setName("channel")
              .setDescription("channel you want to protect")
              .setRequired(true)
          )
          .addBooleanOption((option) =>
            option
              .setName("protection")
              .setDescription("Add counting protection for trolls")
              .setRequired(true)
          )
      ),

    // execute command
    async execute(interaction) {
      const subcommand = interaction.options.getSubcommand();
      const guild = interaction.guild;
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
      const guildData = await MGFirebase.getData(`guild/${guild.id}`);
      if (subcommand === "addchannel") {
        await addChannel(interaction, guild, guildData);
      } else if (subcommand === "removechannel") {
        await removeChannel(interaction, guild, guildData);
      } else if (subcommand === "currentcount") {
        await currentCount(interaction, guildData);
      } else if (subcommand === "countingprotection") {
        await protectChannel(interaction, guildData);
      }
    },
  }
);

async function addChannel(
  interaction: CommandInteraction,
  guild: Guild,
  guildData: any
) {
  const oldChannel = interaction.options.getChannel("channel")!;
  let channel: TextChannel;
  try {
    channel = oldChannel as TextChannel;
    channel.setTopic(""); // try to call on a function that only textchannels have
  } catch {
    await interaction.reply({
      embeds: [
        MGEmbed(MGStatus.Error)
          .setTitle("Error!")
          .setDescription(`<#${channel!.id}> is not a text channel!`),
      ],
    });
    return;
  }

  if (guildData["countingChannels"] === 0) {
    guildData["countingChannels"] = {};
  }
  if (guildData["countingChannels"][channel.id] === undefined) {
    guildData["countingChannels"][channel.id] = {
      count: 0,
      id: 0,
      prevmsg: "",
    } as Counting;
    channel.setTopic("Current Count: 0");
    await MGFirebase.setData(`guild/${guild.id}`, guildData).then(async () => {
      await interaction.reply({
        embeds: [
          MGEmbed(MGStatus.Success)
            .setTitle("Success!")
            .setDescription(`<#${channel!.id}> is now a counting channel.`),
        ],
      });
    });
  } else {
    await interaction.reply({
      embeds: [
        MGEmbed(MGStatus.Error)
          .setTitle("That channel is already a counting channel!")
          .setDescription(`<#${channel.id}> was already a counting channel.`),
      ],
    });
  }
}

async function removeChannel(
  interaction: CommandInteraction,
  guild: Guild,
  serverData: any
) {
  const oldChannel = interaction.options.getChannel("channel")!;
  let channel: TextChannel;
  try {
    channel = oldChannel as TextChannel;
    channel.setTopic(""); // try to call on a function that only textchannels have
  } catch {
    await interaction.reply({
      embeds: [
        MGEmbed(MGStatus.Error)
          .setTitle("Error!")
          .setDescription(`<#${channel!.id}> is not a text channel!`),
      ],
    });
    return;
  }

  if (
    serverData["countingChannels"] === 0 ||
    serverData["countingChannels"][channel.id] === undefined
  ) {
    if (channel === null) {
      return;
    }
    await interaction.reply({
      embeds: [
        MGEmbed(MGStatus.Error)
          .setTitle("Error!")
          .setDescription(
            `<#${channel.id}> was not a counting channel in the first place.`
          ),
      ],
    });
  } else {
    delete serverData["countingChannels"][channel.id];
    if (serverData["countingChannels"]) {
      serverData["countingChannels"] = 0;
    }
    await MGFirebase.setData(`guild/${guild.id}`, serverData).then(async () => {
      if (channel === null) {
        return;
      }
      await interaction.reply({
        embeds: [
          MGEmbed(MGStatus.Success)
            .setTitle("Success!")
            .setDescription(
              `<#${channel.id}> is no longer a counting channel.`
            ),
        ],
      });
    });
  }
}

async function currentCount(interaction: CommandInteraction, guildData: any) {
  const channel = interaction.channel;
  if (
    channel == null ||
    guildData["countingChannels"][channel.id] == undefined
  ) {
    await interaction.reply({
      embeds: [
        MGEmbed(MGStatus.Error).setTitle(
          "This channel is not yet a counting channel. Please use /counting addchannel to add this channel."
        ),
      ],
    });
    return;
  }
  if (guildData["countingChannels"][channel.id]["id"] == 0) {
    await interaction.reply({
      embeds: [
        MGEmbed(MGStatus.Success).setTitle(
          "This is a new counting channel! The current count is 0. Enjoy counting :)"
        ),
      ],
    });
    return;
  }
  await interaction.reply({
    embeds: [
      MGEmbed(MGStatus.Info)
        .setTitle(
          `The current count is: ${
            guildData["countingChannels"][channel.id]["count"]
          }`
        )
        .setDescription(
          `It was last counted by <@${
            guildData["countingChannels"][channel.id]["id"]
          }>`
        )
        .setFooter({
          text: "To find out more stats for counting in this server, use /serverprofile",
        }),
    ],
  });
}

async function protectChannel(interaction: CommandInteraction, guildData: any) {
  const channel = interaction.options.getChannel("channel"),
    protection = interaction.options.getBoolean("protection")!;
  if (
    channel == null ||
    guildData["countingChannels"][channel.id] == undefined
  ) {
    await interaction.reply({
      embeds: [
        MGEmbed(MGStatus.Error).setTitle(
          "This channel is not yet a counting channel. Please use /counting addchannel to add this channel."
        ),
      ],
    });
    return;
  }
  guildData["countingChannels"][channel.id]["protect"] = {
    protection: protection,
  };
  await MGFirebase.setData(`guild/${interaction.guild!.id}`, guildData);

  await interaction.reply({
    embeds: [
      MGEmbed(MGStatus.Success)
        .setTitle(`The following configs have been applied to ${channel.name}`)
        .setFields([
          {
            name: "Counting Troll Protection",
            value: `${upperCase(`${protection}`)}`,
          },
        ]),
    ],
  });
}

export default counting;
