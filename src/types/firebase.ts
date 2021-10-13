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
    suggestons: {
      [id: string]: Suggestions;
    };
  };
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
  countingChannels: { [id: string]: { count: number; id: number } } | number;
  starboardChannel: { id: string; thresh: number } | number;
  starboardMsgs: { [id: string]: { stars: number; rxnid: string } } | number;
}

export let initialGuild: Guild = {
  countingChannels: 0,
  starboardChannel: 0,
  starboardMsgs: 0,
  statistics: {
    highestCount: 0,
    totalCount: 0,
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
  };
  count: {
    totalCount: number;
    highestCount: number;
  };
}

export let initialUser: User = {
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
  },
  count: {
    totalCount: 0,
    highestCount: 0,
  },
};

export let initialSuggestion: Suggestions = {
  suggestion: "Example Suggestion",
  status: "denied",
  user: 123,
};

export let initialBugReport: BugReports = {
  bug: "Example Bug Report",
  status: "denied",
  user: 123,
};

export let initialAdmin = {
  bugreports: {
    123: initialBugReport,
  },
  suggestons: {
    123: initialSuggestion,
  },
};

export let initialData: DataModel = {
  user: {
    1234: initialUser,
  },
  guild: {
    1234: initialGuild,
  },
  announcement: "",
  admin: initialAdmin,
};
