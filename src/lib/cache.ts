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

let cache: Map<string, { locked: boolean; data: unknown }> = new Map();
const reqs = [];

function setCache(path: string, data: unknown) {
  // simple stuff without locking
}

function getCache(path: string) {
  // simple stuff without locking
}

async function cacheTrans(deps: [string], trans: () => void) {}

// fn a locks b,c,d
// fn w locks b,y,z
