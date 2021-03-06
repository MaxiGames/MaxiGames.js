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

import moan from "../../lib/moan";
import MGS from "../../lib/statuses";

const ready = [
  {
    name: "ready",
    once: true,
    async execute(client: any) {
      if (client.user === null) {
        return;
      }
      moan(MGS.Success, "Ready.");
      moan(MGS.Info, `Logged in as ${client.user.tag}.`);
    },
  },
];

export default ready;
