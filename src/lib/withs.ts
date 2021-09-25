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

import { CommandInteraction } from "discord.js";
import type MGCommand from "../types/command";
import type MGCmdTest from "../types/checks";

function tail<a>(l: a[]) {
  // prettier-disable
  if (l.length > 1) {
    return l.slice(1);
  } else {
    return [];
  }
}

export default function withChecks(
  tests: MGCmdTest[],
  command: MGCommand
): MGCommand {
  let ret: MGCommand = {
    data: command.data,
    async execute(interaction: CommandInteraction) {
      await chain(command, interaction, tests, command.execute);
    },
  };

  return ret;
}

async function chain(
  command: MGCommand,
  interaction: CommandInteraction,
  tests: MGCmdTest[],
  goal: (interaction: CommandInteraction) => Promise<void>
): Promise<boolean> {
  async function iter(tests: MGCmdTest[]): Promise<boolean> {
    if (tests.length === 0) {
      // Finally passed all tests!
      await goal(interaction);
      return true;
    }

    if (await tests[0].check(command, interaction)) {
      await tests[0].succ(command, interaction);
      return await iter(tail(tests));
    } else {
      await tests[0].fail(command, interaction);
      return false;
    }
  }

  return await iter(tests);
}
