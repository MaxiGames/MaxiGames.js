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

import fs from "fs";
import path from "path";
import type { MGCommand } from "../types/command";
import type MGEvent from "../types/event";

const commands: Map<string, MGCommand> = new Map();
const events: MGEvent[] = [];

/*
 * NOTE: The directory "modules" should contain subdirectories to organise modules.
 * There are a few ways you can split a module.
 * 1. all in a *.mod.js. Then the file must default-export one MGModule.
 * 2. one *.cmd.js and one *.evt.js. Then the cmd.js file must default-export an MGCommand,
 *    and the evt.js file must default-export a list of events.
 */

const moddir: string[] = fs
  .readdirSync("./dist/src/modules")
  .map((file: string) => path.join("./dist/src/modules", file))
  .filter((file: string) => fs.lstatSync(file).isDirectory());

function grabext(listing: string[], ext: string): string[][] {
  return listing.map((dir: string) =>
    fs
      .readdirSync(dir)
      .filter((file: string) => file.endsWith(ext))
      .map((file: string) => path.join(dir, file))
  );
}

const modfiles: string[][] = grabext(moddir, ".mod.js");
const cmdfiles: string[][] = grabext(moddir, ".cmd.js");
const evtfiles: string[][] = grabext(moddir, ".evt.js");

for (const filecol of modfiles) {
  for (const name of filecol) {
    const mod = require(`../../../${name}`); // eslint-disable-line @typescript-eslint/no-var-requires
    commands.set(mod.default.command.data.name, mod.default.command);
    for (const e of mod.default.events) {
      events.push(e);
    }
  }
}

for (const filecol of cmdfiles) {
  for (const name of filecol) {
    const cmd = require(`../../../${name}`); // eslint-disable-line @typescript-eslint/no-var-requires
    commands.set(cmd.default.data.name, cmd.default);
  }
}

for (const filecol of evtfiles) {
  for (const name of filecol) {
    const evt = require(`../../../${name}`); // eslint-disable-line @typescript-eslint/no-var-requires
    for (const e of evt.default) {
      events.push(e);
    }
  }
}

export { commands, events };
