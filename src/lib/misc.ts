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
 * A bunch of mostly quite simple functions that aren't really big enough for
 * their own files
 */

import {
  User,
  Channel,
  GuildMember,
  Message,
  MessageReaction,
  Partialize,
} from "discord.js";
import moan from "./moan";
import MGS from "./statuses";

/* Partial handling */

// Should rewrite this monster once TS _finally_ gets HKTs...
type _p =
  | Partialize<User>
  | Partialize<Channel>
  | Partialize<GuildMember>
  | Partialize<Message>
  | Partialize<MessageReaction>
  | User
  | Channel
  | GuildMember
  | Message
  | MessageReaction;

async function partial_res<T extends _p>(obj: T): Promise<T | undefined> {
  if (obj.partial) {
    try {
      return (await obj.fetch()) as T;
    } catch {
      moan(
        MGS.Warn,
        `Failed to fetch full structure from partial for ${obj.id}.`
      );
      return undefined;
    }
  } else {
    return obj;
  }
}

export { partial_res };
