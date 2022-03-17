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

import { ColorResolvable } from "discord.js";
import MGStatus from "./statuses";

const COLOR_PALETTE: { [k in MGStatus]: ColorResolvable } = {
  [MGStatus.Info]: "#0288D1",
  [MGStatus.Default]: "#6E6E7A",
  [MGStatus.Warn]: "#EB9C45",
  [MGStatus.Success]: "#65D48C",
  [MGStatus.Error]: "#FF0000",
};

export default COLOR_PALETTE;
