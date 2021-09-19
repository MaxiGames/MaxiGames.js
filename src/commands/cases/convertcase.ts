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
 * File: src/commands/cases/convercase.ts
 * Description: Handles command for converting text to another case
 */

import { SlashCommandBuilder } from "@discordjs/builders";
import type MGCommand from "../../types/command";
import { MGEmbed } from "../../lib/flavoured";
import MGStatus from "../../lib/statuses";



const tocamel = require("lodash/camelCase") as (param: string) => string;

const tolisp = require("lodash/kebabCase") as (param: string) => string;

const topascal = function (string: string) {
  return `${string}`
    .replace(new RegExp(/[-_]+/, "g"), " ")
    .replace(new RegExp(/[^\w\s]/, "g"), "")
    .replace(
      new RegExp(/\s+(.)(\w+)/, "g"),
      ($1, $2, $3) => `${$2.toUpperCase() + $3.toLowerCase()}`
    )
    .replace(new RegExp(/\s/, "g"), "")
    .replace(new RegExp(/\w/), (s) => s.toUpperCase());
};

const tosnake = require("lodash/snakeCase") as (param: string) => string;

const toupper = require("lodash/upperCase") as (param: string) => string;

const tolower = require("lodash/lowerCase") as (param: string) => string;


const convertCase: MGCommand = {
  // exports (self explanatory)
  data: new SlashCommandBuilder()
    .setName("convertcase")
    .setDescription("Convert some text another case")
    .addSubcommand((subcommand) => subcommand
        .setName("camel")
        .setDescription("Convert text to camelCase")
        .addStringOption((option) => option
            .setName("string")
            .setDescription("Text that you want to convert")
            .setRequired(true)
        )
    )
  
    .addSubcommand((subcommand) => subcommand
        .setName("lisp")
        .setDescription("Convert text to lisp-case")
        .addStringOption((option) => option
            .setName("string")
            .setDescription("Text that you want to convert")
            .setRequired(true)
        )
    )
  
    .addSubcommand((subcommand) => subcommand
        .setName("pascal")
        .setDescription("Convert text to PascalCase")
        .addStringOption((option) => option
            .setName("string")
            .setDescription("Text that you want to convert")
            .setRequired(true)
        )
    )
  
    .addSubcommand((subcommand) => subcommand
        .setName("snake")
        .setDescription("Convert text to snake_case")
        .addStringOption((option) =>
          option
            .setName("string")
            .setDescription("Text that you want to convert")
            .setRequired(true)
        )
    )
  
    .addSubcommand((subcommand) => subcommand
        .setName("lower")
        .setDescription("Convert text to lower case")
        .addStringOption((option) => option
            .setName("string")
            .setDescription("Text that you want to convert")
            .setRequired(true)
        )
    )
  
    .addSubcommand((subcommand) => subcommand
        .setName("upper")
        .setDescription("Convert text to UPPER CASE")
        .addStringOption((option) => option
            .setName("string")
            .setDescription("Text that you want to convert")
            .setRequired(true)
        )
    ),

  // execute command
  async execute(interaction) {
    const toConvert = interaction.options.getString("string")!; // what's this ! doing here?

    let subcommand = interaction.options.getSubcommand()!;

    let modifier = (a: string) => a;
    
    // switch through subcommands
    switch ( subcommand ) { // put it INLINE
      case "camel":
        modifier = tocamel;
        break;
        
      case "lisp":
        modifier = tolisp;
        break;
        
      case "pascal":
        modifier = topascal;
        break;
        
      case "snake":
        modifier = tosnake;
        break;
        
      case "upper":
        modifier = toupper;
        break;
        
      case "lower":
        modifier = tolower;
        break;
    }

    let embed = MGEmbed(MGStatus.Success)
      .setTitle(`Converted case to: ${subcommand}`)
      .setDescription( modifier(toConvert) ); // apply converter to text and embed

    await interaction.reply({ embeds: [embed] });
  },
};

export default convertCase;
