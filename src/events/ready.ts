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

import type MGEvent from "../types/event";
import { Client } from "discord.js";

const ready: MGEvent = {
  name: "ready",
  once: true,
  execute(client) {
    if (client.user === null) return;
    console.log(`Ready! Logged in as ${client.user.tag}`);
    // client.application.commands.set([])
    // client.guilds.cache.map(guild => guild.commands.set([]));
    // console.log(
    //   client.application.commands.cache.map((command) => command.name)
    // );
  },
};

export default ready;
