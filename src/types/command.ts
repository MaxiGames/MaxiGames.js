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

import type { CommandInteraction, Interaction } from "discord.js";

import type {
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from "@discordjs/builders";

interface MGCommand {
  data: Partial<SlashCommandBuilder> | SlashCommandSubcommandsOnlyBuilder;
  execute(interaction: CommandInteraction): Promise<void>;
}

interface MGEvent {
  name: string;
  execute(interaction: Interaction): Promise<void>;
}

// A container for holding together (ostensibly) related events and commands.
interface MGModule {
  command: MGCommand;
  events: {
    name: string;
    execute(interaction: Interaction): Promise<void>;
  }[];
}

export { MGCommand, MGEvent, MGModule };
