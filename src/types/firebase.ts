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

export interface DataModel {
  user: { [id: string]: User };
  guild: { [id: string]: Guild };
  announcement: string;
  admin: {
    bugreports: {
      [id: string]: BugReports;
    };
    suggestions: {
      [id: string]: Suggestions;
    };
  };
  version: string;
  news: string;
}

export interface BugReports {
  bug: string;
  status: "denied" | "in-progress";
  user: number;
}

export interface Suggestions {
  suggestion: string;
  status: "denied" | "in-progress";
  user: number;
}

export interface Guild {
  statistics: {
    highestCount: number;
    totalCount: number;
  };
  countingChannels: { [id: string]: Counting } | number;
  starboardChannel: { id: string; thresh: number } | number;
  starboardMsgs: { [id: string]: { stars: number; rxnid: string } } | number;
  autoresponse: { [trigger: string]: string };
}

export interface Counting {
  count: number;
  id: number;
  prevmsg: string;
}
export const defaultGuild: Guild = {
  countingChannels: 0,
  starboardChannel: 0,
  starboardMsgs: 0,
  statistics: {
    highestCount: 0,
    totalCount: 0,
  },
  autoresponse: {
    maxigames:
      "Hello there! Did you call me? (This is a default autoresponse for every guild. You can remove or add more autoresponses using the /autoresponse commands, but only admins can do it!)",
  },
};

interface User {
  money: number;
  timelyClaims: {
    hourly: number;
    daily: number;
    weekly: number;
    monthly: number;
    yearly: number;
  };
  cooldowns: {
    timely: number;
    coinflip: number;
    gamble: number;
    money: number;
    share: number;
    counting: number;
    starboard: number;
    bugreport: number;
    suggestion: number;
    trivia: number;
  };
  count: {
    totalCount: number;
    highestCount: number;
  };
  minigames: {
    tictactoe: number;
    trivia: number;
    guessthecolour: number;
    escapethehouse: number;
  };
}

export const defaultUser: User = {
  money: 0,
  timelyClaims: {
    hourly: 0,
    daily: 0,
    weekly: 0,
    monthly: 0,
    yearly: 0,
  },
  cooldowns: {
    timely: 0,
    coinflip: 0,
    gamble: 0,
    money: 0,
    share: 0,
    counting: 0,
    starboard: 0,
    bugreport: 0,
    suggestion: 0,
    trivia: 0,
  },
  count: {
    totalCount: 0,
    highestCount: 0,
  },
  minigames: {
    tictactoe: 1000,
    trivia: 1000,
    guessthecolour: 1000,
    escapethehouse: 1000,
  },
};

export const defaultSuggestion: Suggestions = {
  suggestion: "Example Suggestion",
  status: "denied",
  user: 123,
};

export const defaultBugReport: BugReports = {
  bug: "Example Bug Report",
  status: "denied",
  user: 123,
};

export const defaultAdmin = {
  bugreports: {
    123: defaultBugReport,
  },
  suggestions: {
    123: defaultSuggestion,
  },
};

export const defaultData: DataModel = {
  user: {
    1234: defaultUser,
  },
  guild: {
    1234: defaultGuild,
  },
  announcement: "",
  admin: defaultAdmin,
  version: "1.0.0",
  news: ":)",
};
