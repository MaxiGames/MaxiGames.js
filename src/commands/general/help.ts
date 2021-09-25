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
  MessageSelectMenu,
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

async function mainHelp(interaction: CommandInteraction) {
  const commandFiles = getDirectories("./dist/src/commands");

  let options: { label: string; description: string; value: string }[] = [];
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

  await interaction.reply({ content: "Pong!", components: [row] });
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
        await mainHelp(interaction);
    }
  },
};

export default help;
