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
 * File: <src root>/commands/index.ts
 * Description: indexes all commands in this directory.
 */

import fs from "fs";
import path from "path";
import type MGCommand from "../types/command";

const commands: Map<string, MGCommand> = new Map();

// NOTE: The directory "commands" should contain subdirectories to organise commands.
// get command files
const commandFiles: Array<Array<string>> = fs
	.readdirSync("./dist/src/commands")
	.map((file: string) => path.join("./dist/src/commands", file))
	.filter((file: string) => fs.lstatSync(file).isDirectory())
	.map((dir: string) =>
		fs
			.readdirSync(dir)
			.filter((file: string) => file.endsWith(".js"))
			.map((file: string) => path.join(dir, file))
	);

// load 'em in!
for (const filecol of commandFiles) {
	for (const name of filecol) {
		const command = require(`../../../${name}`);
		commands.set(command.default.data.name, command.default);
	}
}

export default commands;
