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
import {
  CommandInteraction,
  MessageActionRow,
  MessageButton,
  MessageSelectMenu,
  SelectMenuInteraction,
} from "discord.js";
import { MGEmbed } from "../../lib/flavoured";
import MGStatus from "../../lib/statuses";
import MGCommand from "../../types/command";
import fs from "fs";
import { startCase } from "lodash";

function getDirectories(path: string) {
  return fs.readdirSync(path).filter(function (file) {
    return fs.statSync(path + "/" + file).isDirectory();
  });
}

export function getLinks() {
  const inviteButton = new MessageButton()
    .setLabel("Invite the bot!")
    .setStyle("LINK")
    .setURL(
      "https://discord.com/api/oauth2/authorize?client_id=863419048041381920&permissions=261188091120&scope=bot%20applications.commands"
    );
  const topGGVote = new MessageButton()
    .setLabel("Vote (Top.gg)")
    .setStyle("LINK")
    .setURL("https://tinyurl.com/votemaxigamesTopgg");
  const discordsVote = new MessageButton()
    .setLabel("Vote (discords.com)")
    .setStyle("LINK")
    .setURL("https://tinyurl.com/votemaxigamesDiscordcom");
  const supportServer = new MessageButton()
    .setLabel("Support Server")
    .setStyle("LINK")
    .setURL("https://discord.gg/BNm87Cvdx3");
  return [inviteButton, topGGVote, discordsVote, supportServer];
}

export async function mainHelp(
  interaction: SelectMenuInteraction | CommandInteraction,
  page: string
) {
  const commandFiles = getDirectories("./dist/src/commands");

  let options: { label: string; description: string; value: string }[] = [];

  // forming the select menus
  for (let dir of commandFiles) {
    dir = startCase(dir);
    options.push({
      label: dir,
      description: `Find out what commands there is for the category: ${dir}`,
      value: dir,
    });
  }

  const row = new MessageActionRow().addComponents(
    new MessageSelectMenu()
      .setCustomId("help-main")
      .setPlaceholder("Initial landing page")
      .addOptions(options)
  );

  //making the buttons
  let [inviteButton, topGGVote, discordsVote, supportServer] = getLinks();

  let row2 = new MessageActionRow().addComponents(
    inviteButton,
    topGGVote,
    discordsVote,
    supportServer
  );

  if (page === "main") {
    return {
      embeds: [
        MGEmbed(MGStatus.Success)
          .setTitle("Help!")
          .setDescription(
            "Hallo! Thank you for using Maxigames, a fun, random, cheerful bot to fill everyones' lives with bad puns, minigames and happiness!!!"
          ),
      ],
      components: [row, row2],
    };
  }

  return {
    embeds: [
      MGEmbed(MGStatus.Success)
        .setTitle("Help!")
        .setDescription(`Category: ${page}`),
    ],
    components: [row, row2],
  };
}

const help: MGCommand = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Find out the details of certain commands")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("main")
        .setDescription("Provides a list for all commands of the bot")
    ),

  async execute(interaction) {
    let subcommand = interaction.options.getSubcommand();
    switch (subcommand) {
      case "main":
        await interaction.reply(await mainHelp(interaction, "main"));
    }
  },
};

export default help;
