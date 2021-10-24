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

import configProd from '../../config-prod.json';
import configDev from '../../config-dev.json';
import api from '../../api-token.json';

export const config =
	process.env.NODE_ENV == 'production' ? configProd : configDev;

export const firebaseConfig =
	process.env.NODE_ENV == 'production'
		? 'https://maxgmaesbeta-default-rtdb.firebaseio.com'
		: 'https://maxigamesbeta-default-rtdb.firebaseio.com';

export const apiConfig = api;
