import { Client } from "discord.js";
import { ActivityTypes } from "discord.js/typings/enums";
import { MGFirebase } from "../lib/firebase";
import { defaultData } from "../types/firebase";

interface ActivityFormat {
  name: string;
  type: "COMPETING" | "WATCHING" | "PLAYING" | "STREAMING" | "LISTENING";
}

export default class ActivityDetails {
  currentGuildCount: number = 0;
  version: string = defaultData.version;
  news: string = defaultData.news;
  current: number = 0;

  constructor(currentGuildCount: number) {
    this.currentGuildCount = currentGuildCount;
    MGFirebase.getData(`version`).then((data) => {
      this.version = data as string;
    });
    MGFirebase.getData(`news`).then((data) => {
      this.news = data as string;
    });
  }

  generateActivity() {
    return [
      {
        name: `/help on ${this.currentGuildCount} servers!`,
        type: "WATCHING",
      },
      { name: `News: ${this.news}`, type: "PLAYING" },
      { name: `Version: ${this.version}`, type: "PLAYING" },
    ] as ActivityFormat[];
  }

  updateActivity(client: Client) {
    let user = client.user!;
    let activity = this.generateActivity();
    user.setActivity(activity[this.current].name, {
      type: activity[this.current].type,
    });
    this.current++;
    if (this.current >= activity.length) this.current = 0;
    setTimeout(() => {
      this.updateActivity(client);
    }, 15000);
  }
}
